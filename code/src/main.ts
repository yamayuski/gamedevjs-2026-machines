import "./style.css";
import {
    AbstractEngine,
    ArcRotateCamera,
    BackgroundMaterial,
    Color3,
    Color4,
    Constants,
    Engine,
    GeometryBufferRenderer,
    IblShadowsRenderPipeline,
    ImportMeshAsync,
    Mesh,
    MeshBuilder,
    PBRMaterial,
    RawCubeTexture,
    Scene,
    ShaderMaterial,
    Vector2,
    Vector3,
    WebGPUEngine,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

/** Build a minimal 1-pixel-per-face white cube texture so the IBL pipeline has a valid env texture */
function createFlatEnvTexture(scene: Scene): RawCubeTexture {
    const faceData = new Float32Array([1, 1, 1, 1]);
    const faces = [faceData, faceData, faceData, faceData, faceData, faceData];
    const tex = new RawCubeTexture(
        scene,
        faces,
        1,
        Constants.TEXTUREFORMAT_RGBA,
        Constants.TEXTURETYPE_FLOAT,
    );
    tex.coordinatesMode = Constants.TEXTURE_CUBIC_MODE;
    return tex;
}

async function main(): Promise<void> {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

    let engine: AbstractEngine;
    if (await WebGPUEngine.IsSupportedAsync) {
        const webgpuEngine = new WebGPUEngine(canvas);
        await webgpuEngine.initAsync();
        engine = webgpuEngine;
    } else {
        engine = new Engine(canvas, true);
    }

    engine.setHardwareScalingLevel(1.0 / window.devicePixelRatio);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.149, 0.149, 0.149, 1.0);

    // Camera
    const camera = new ArcRotateCamera("camera1", 1.0, 1.3, 0.3, new Vector3(0, 0.06, 0), scene);
    camera.attachControl(canvas, true);
    camera.fov = (27 / 180) * Math.PI;
    camera.minZ = 0.001;
    camera.maxZ = 120;

    // Minimal white environment texture so the IBL pipeline has a valid env
    const envTexture = createFlatEnvTexture(scene);
    scene.environmentTexture = envTexture;

    // Geometry buffer required by the IBL shadow pipeline
    const textureTypesAndFormats: Record<number, { textureFormat: number; textureType: number }> =
        {};
    textureTypesAndFormats[GeometryBufferRenderer.SCREENSPACE_DEPTH_TEXTURE_TYPE] = {
        textureFormat: Constants.TEXTUREFORMAT_R,
        textureType: Constants.TEXTURETYPE_FLOAT,
    };
    textureTypesAndFormats[GeometryBufferRenderer.VELOCITY_LINEAR_TEXTURE_TYPE] = {
        textureFormat: Constants.TEXTUREFORMAT_RG,
        textureType: Constants.TEXTURETYPE_HALF_FLOAT,
    };
    textureTypesAndFormats[GeometryBufferRenderer.POSITION_TEXTURE_TYPE] = {
        textureFormat: Constants.TEXTUREFORMAT_RGBA,
        textureType: Constants.TEXTURETYPE_HALF_FLOAT,
    };
    textureTypesAndFormats[GeometryBufferRenderer.NORMAL_TEXTURE_TYPE] = {
        textureFormat: Constants.TEXTUREFORMAT_RGBA,
        textureType: Constants.TEXTURETYPE_HALF_FLOAT,
    };
    const geometryBufferRenderer = scene.enableGeometryBufferRenderer(
        undefined,
        Constants.TEXTUREFORMAT_DEPTH32_FLOAT,
        textureTypesAndFormats,
    );
    if (geometryBufferRenderer) {
        geometryBufferRenderer.enableScreenspaceDepth = true;
        geometryBufferRenderer.enableVelocityLinear = true;
        geometryBufferRenderer.enablePosition = true;
        geometryBufferRenderer.enableNormal = true;
        geometryBufferRenderer.generateNormalsInWorldSpace = true;
    }

    // IBL Shadow pipeline
    const iblShadowsPipeline = new IblShadowsRenderPipeline(
        "iblShadowsPipeline",
        scene,
        {
            resolutionExp: 6,
            sampleDirections: 3,
            ssShadowsEnabled: true,
            shadowRemanence: 0.8,
            triPlanarVoxelization: true,
            shadowOpacity: 1.0,
        },
        [camera],
    );
    iblShadowsPipeline.allowDebugPasses = false;

    // Skybox
    const skydome = MeshBuilder.CreateBox(
        "sky",
        { size: 1, sideOrientation: Mesh.BACKSIDE },
        scene,
    );
    skydome.receiveShadows = true;
    const skyMaterial = new BackgroundMaterial("skyMaterial", scene);
    skyMaterial.primaryColor = new Color3(0.2, 0.2, 0.25);
    skydome.material = skyMaterial;
    const skydomeScale = 15 * iblShadowsPipeline.voxelGridSize;
    skydome.scaling.set(skydomeScale, skydomeScale, skydomeScale);
    skydome.position.y = skydomeScale / 2;

    // Ground shadow-catcher with custom shader that fades at edges
    const customGroundVertexShader = `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 worldViewProjection;
        varying vec2 vUV;
        void main(void) {
            gl_Position = worldViewProjection * vec4(position, 1.0);
            vUV = uv;
        }
    `;
    const customGroundFragmentShader = `
        precision highp float;
        uniform sampler2D shadowTexture;
        uniform vec2 renderTargetSize;
        uniform float shadowOpacity;
        varying vec2 vUV;
        void main(void) {
            float uvBasedOpacity = clamp(length(vUV * vec2(2.0) - vec2(1.0)), 0.0, 1.0);
            uvBasedOpacity = uvBasedOpacity * uvBasedOpacity;
            uvBasedOpacity = 1.0 - uvBasedOpacity;
            vec2 screenUv = gl_FragCoord.xy / renderTargetSize;
            vec3 shadowValue = texture2D(shadowTexture, screenUv).rrr;
            float totalOpacity = shadowOpacity * uvBasedOpacity;
            shadowValue = mix(vec3(1.0), shadowValue, totalOpacity);
            gl_FragColor.rgb = shadowValue;
            gl_FragColor.a = 1.0;
        }
    `;
    const groundMat = new ShaderMaterial(
        "customGroundMaterial",
        scene,
        { vertexSource: customGroundVertexShader, fragmentSource: customGroundFragmentShader },
        {
            attributes: ["position", "uv"],
            uniforms: [
                "world",
                "worldView",
                "worldViewProjection",
                "view",
                "projection",
                "renderTargetSize",
                "shadowOpacity",
            ],
            samplers: ["shadowTexture"],
        },
    );
    groundMat.alphaMode = Constants.ALPHA_MULTIPLY;
    groundMat.alpha = 0.99;
    const groundPlane = MeshBuilder.CreateGround("ground", { width: 1, height: 1 }, scene);
    groundPlane.material = groundMat;

    iblShadowsPipeline.onShadowTextureReadyObservable.addOnce(() => {
        groundMat.setTexture("shadowTexture", iblShadowsPipeline._getAccumulatedTexture());
        groundMat.setVector2(
            "renderTargetSize",
            new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
        );
        groundMat.setFloat("shadowOpacity", iblShadowsPipeline.shadowOpacity);
    });

    const groundScale = 5.0 * iblShadowsPipeline.voxelGridSize;
    groundPlane.scaling.set(groundScale, groundScale, groundScale);
    groundPlane.position.y = 0.001 * iblShadowsPipeline.voxelGridSize;

    /**
     * Load the BoomBox from Babylon.js assets. Falls back to a procedural mesh
     * that approximates the BoomBox silhouette when the network is unavailable.
     */
    async function loadBoomBox(): Promise<Mesh[]> {
        try {
            const result = await ImportMeshAsync(
                "https://assets.babylonjs.com/meshes/BoomBox/BoomBox.glb",
                scene,
            );
            return result.meshes.filter((m) => m instanceof Mesh) as Mesh[];
        } catch {
            // Procedural stand-in: rectangular body + two speaker circles
            const mat = new PBRMaterial("boomboxMat", scene);
            mat.albedoColor = new Color3(0.05, 0.05, 0.05);
            mat.metallic = 0.8;
            mat.roughness = 0.3;

            const body = MeshBuilder.CreateBox(
                "boombox_body",
                { width: 0.18, height: 0.1, depth: 0.07 },
                scene,
            );
            body.position.y = 0.05;
            body.material = mat;

            const speakerL = MeshBuilder.CreateCylinder(
                "boombox_spk_l",
                { diameter: 0.07, height: 0.015, tessellation: 32 },
                scene,
            );
            speakerL.rotation.x = Math.PI / 2;
            speakerL.position.set(-0.07, 0.05, 0.035);
            speakerL.material = mat;

            const speakerR = MeshBuilder.CreateCylinder(
                "boombox_spk_r",
                { diameter: 0.07, height: 0.015, tessellation: 32 },
                scene,
            );
            speakerR.rotation.x = Math.PI / 2;
            speakerR.position.set(0.07, 0.05, 0.035);
            speakerR.material = mat;

            return [body, speakerL, speakerR];
        }
    }

    const meshes = await loadBoomBox();

    // Compute bounding box of all loaded meshes
    const bounds = {
        min: new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE),
        max: new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE),
    };
    for (const mesh of meshes) {
        const localBounds = mesh.getHierarchyBoundingVectors(true);
        bounds.min = Vector3.Minimize(bounds.min, localBounds.min);
        bounds.max = Vector3.Maximize(bounds.max, localBounds.max);
    }

    // Lift root mesh off the ground
    const rootMesh = meshes[0];
    if (rootMesh && bounds.min.y !== 0) {
        rootMesh.position.y -= bounds.min.y;
    }

    // Fit camera to the model
    const centre = bounds.max.subtract(bounds.min).scale(0.5).add(bounds.min);
    const sceneSize = bounds.max.subtract(bounds.min).length();
    if (isFinite(centre.x) && isFinite(centre.y) && isFinite(centre.z) && sceneSize > 0) {
        camera.minZ = 0.01 * sceneSize;
        camera.maxZ = 45 * sceneSize;
        camera.speed = sceneSize;
        camera.wheelPrecision = 100 / sceneSize;
        camera.panningSensibility = 5000 / sceneSize;
        camera.target = centre;
        camera.radius = 2.5 * sceneSize;
    }

    // Register meshes and materials with the shadow pipeline
    for (const mesh of meshes) {
        iblShadowsPipeline.addShadowCastingMesh(mesh);
    }
    scene.materials.forEach((mat) => {
        if (mat instanceof PBRMaterial) {
            mat.enableSpecularAntiAliasing = false;
        }
        iblShadowsPipeline.addShadowReceivingMaterial(mat);
    });

    iblShadowsPipeline.updateSceneBounds();
    iblShadowsPipeline.updateVoxelization();

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}

void main();
