import "./style.css";
import HavokPhysics from "@babylonjs/havok";
import envFile from "./assets/university_workshop_8k.env?url";
import concreteFloorDiffuse from "./assets/concrete_floor_worn_001_2k.gltf/textures/concrete_floor_worn_001_diff_2k.jpg?url";
import concreteFloorNormal from "./assets/concrete_floor_worn_001_2k.gltf/textures/concrete_floor_worn_001_nor_gl_2k.jpg?url";
import concreteFloorRoughness from "./assets/concrete_floor_worn_001_2k.gltf/textures/concrete_floor_worn_001_rough_2k.jpg?url";
import hammerSound from "./assets/universfield-hammer-steel-impact-454390.mp3?url";
import metalColor from "./assets/Metal023_4K_Color.jpg?url";
import metalNormal from "./assets/Metal023_4K_NormalGL.jpg?url";
import metalDisplacement from "./assets/Metal023_4K_Displacement.jpg?url";
import {
    AbstractEngine,
    ArcRotateCamera,
    Color3,
    CubeTexture,
    Engine,
    HavokPlugin,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
    PointerEventTypes,
    Scene,
    Vector3,
    WebGPUEngine,
    Texture,
    PBRMetallicRoughnessMaterial,
    CreateAudioEngineAsync,
    Mesh,
    SpotLight,
    ShadowGenerator,
    Color4,
    DefaultRenderingPipeline,
} from "@babylonjs/core";

import "@babylonjs/inspector";

/**
 * 歯車モデルをプリミティブから作成する
 */
async function createGear(scene: Scene): Promise<Mesh> {
    const numTeeth = 8;
    const innerRadius = 0.8;
    const outerRadius = 1.5;
    const thickness = 1.0;
    const meshes = [];

    const material = new PBRMetallicRoughnessMaterial("gearMat", scene);
    material.baseTexture = new Texture(metalColor, scene, false);
    material.normalTexture = new Texture(metalNormal, scene, false);
    material.metallicRoughnessTexture = new Texture(metalDisplacement, scene, false);

    for (let i = 0; i < numTeeth; i++) {
        const angle = (i / numTeeth) * Math.PI * 2;
        const tooth = MeshBuilder.CreateBox(
            `tooth-${i}`,
            { width: (outerRadius - innerRadius) * 0.8, height: thickness, depth: 0.8 },
            scene,
        );
        tooth.position = new Vector3(
            Math.cos(angle) * ((innerRadius + outerRadius) / 2),
            0,
            Math.sin(angle) * ((innerRadius + outerRadius) / 2),
        );
        tooth.rotation.y = -angle;
        tooth.material = material;
        meshes.push(tooth);
    }

    const hub = MeshBuilder.CreateCylinder(
        "hub",
        { diameter: innerRadius * 2.8, height: thickness, tessellation: 8 },
        scene,
    );
    hub.material = material;
    meshes.push(hub);

    return Mesh.MergeMeshesAsync(meshes, true, false);
}

async function createEngineAsync(canvas: HTMLCanvasElement): Promise<AbstractEngine> {
    if (await WebGPUEngine.IsSupportedAsync) {
        const webgpuEngine = new WebGPUEngine(canvas);
        await webgpuEngine.initAsync();
        return webgpuEngine;
    }

    return new Engine(canvas, true);
}

async function main(): Promise<void> {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }
    const engine = await createEngineAsync(canvas);

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
    const audioEngine = await CreateAudioEngineAsync();
    const hammerImpactSound = await audioEngine.createSoundAsync("hammerImpact", hammerSound);

    // scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(envFile, scene);
    // scene.debugLayer.show();

    // const skybox = MeshBuilder.CreateBox("skybox", { size: 1000 }, scene);
    // const skyboxMat = new StandardMaterial("skyboxMat", scene);
    // skyboxMat.backFaceCulling = false;
    // skyboxMat.disableLighting = true;
    // skyboxMat.reflectionTexture = scene.environmentTexture;
    // skyboxMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    // skybox.material = skyboxMat;

    // ArcRotateCamera
    const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 3,
        12,
        new Vector3(0, 2, 0),
        scene,
    );
    // camera.attachControl(canvas, true);

    const light = new SpotLight(
        "light",
        new Vector3(0, 4, 0),
        Vector3.Down(),
        Math.PI / 2,
        50,
        scene,
    );
    light.diffuse = new Color3(0.8, 0.5, 0.5);
    light.intensity = 300;

    // Initialize Havok physics engine
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

    const renderingPipeline = new DefaultRenderingPipeline(
        "defaultPipeline",
        true,
        scene,
        [camera],
        true,
    );
    renderingPipeline.fxaaEnabled = true;
    renderingPipeline.imageProcessingEnabled = true;
    // renderingPipeline.depthOfFieldEnabled = true;
    renderingPipeline.bloomEnabled = true;
    renderingPipeline.chromaticAberrationEnabled = true;
    renderingPipeline.grainEnabled = true;
    renderingPipeline.grain.intensity = 0.1;

    const shadowGenerator = new ShadowGenerator(1024, light, true, camera, false, false);
    // shadowGenerator.useBlurCloseExponentialShadowMap = true;
    shadowGenerator.useContactHardeningShadow = true;

    const gearBase = await createGear(scene);
    gearBase.isVisible = false;

    // Ground plane — static rigid body (mass = 0)
    const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    ground.receiveShadows = true;
    const groundMat = new PBRMetallicRoughnessMaterial("groundMat", scene);
    groundMat.baseTexture = new Texture(concreteFloorDiffuse, scene, false);
    groundMat.normalTexture = new Texture(concreteFloorNormal, scene, false);
    groundMat.metallicRoughnessTexture = new Texture(concreteFloorRoughness, scene, false);
    ground.material = groundMat;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0, restitution: 0.4 }, scene);

    const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    box.position = new Vector3(0, 0.5, 0);
    const boxMat = new PBRMetallicRoughnessMaterial("boxMat", scene);
    boxMat.baseTexture = new Texture(metalColor, scene, false);
    boxMat.normalTexture = new Texture(metalNormal, scene, false);
    boxMat.metallicRoughnessTexture = new Texture(metalDisplacement, scene, false);
    box.material = boxMat;
    new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 0, restitution: 0.4 }, scene);

    const MAX_GEARS = 30;
    const gears: Mesh[] = [];

    // Spawn a Sphere rigid body on mouse click or touch tap
    scene.onPointerObservable.add(async (pointerInfo) => {
        await audioEngine.unlockAsync();
        if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return;

        hammerImpactSound.pitch = (0.5 + Math.random()) * 400 - 200; // Randomize pitch for variety
        hammerImpactSound.setVolume(0.7);
        hammerImpactSound.play();

        // Remove the oldest sphere when the cap is reached
        if (gears.length >= MAX_GEARS) {
            const oldGear = gears.shift();
            if (oldGear) {
                oldGear.dispose();
            }
        }

        const gearInstance = gearBase.clone(
            `gear-${globalThis.crypto.randomUUID()}`,
            null,
            false,
            false,
        );
        gearInstance.isVisible = true;
        shadowGenerator.addShadowCaster(gearInstance);
        gearInstance.position = new Vector3(0, 1, 0);
        gearInstance.scaling = new Vector3(0.1, 0.1, 0.1);
        const physics = new PhysicsAggregate(
            gearInstance,
            PhysicsShapeType.CYLINDER,
            {
                mass: 1,
                restitution: 0.4,
                radius: 0.15,
                pointA: new Vector3(0, -0.15, 0),
                pointB: new Vector3(0, 0.15, 0),
            },
            scene,
        );
        physics.body.applyImpulse(
            new Vector3((Math.random() - 0.5) * 5, 5, (Math.random() - 0.5) * 5),
            gearInstance.getAbsolutePosition(),
        );
        gears.push(gearInstance);
    });

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}

void main();
