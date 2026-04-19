import "./style.css";
import HavokPhysics from "@babylonjs/havok";
import envFile from "./assets/university_workshop_8k.env?url";
import concreteFloorDiffuse from "./assets/concrete_floor_worn_001_2k.gltf/textures/concrete_floor_worn_001_diff_2k.jpg?url";
import concreteFloorNormal from "./assets/concrete_floor_worn_001_2k.gltf/textures/concrete_floor_worn_001_nor_gl_2k.jpg?url";
import concreteFloorRoughness from "./assets/concrete_floor_worn_001_2k.gltf/textures/concrete_floor_worn_001_rough_2k.jpg?url";
import hammerSound from "./assets/universfield-hammer-steel-impact-454390.mp3?url";
import {
    AbstractEngine,
    ArcRotateCamera,
    Color3,
    CubeTexture,
    PBRMaterial,
    Engine,
    HavokPlugin,
    HemisphericLight,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
    PointerEventTypes,
    Scene,
    StandardMaterial,
    Vector3,
    WebGPUEngine,
    Texture,
    PBRMetallicRoughnessMaterial,
    CreateAudioEngineAsync,
} from "@babylonjs/core";

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

    const scene = new Scene(engine);
    const audioEngine = await CreateAudioEngineAsync();
    const hammerImpactSound = await audioEngine.createSoundAsync("hammerImpact", hammerSound);

    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(envFile, scene);

    const skybox = MeshBuilder.CreateBox("skybox", { size: 1000 }, scene);
    const skyboxMat = new StandardMaterial("skyboxMat", scene);
    skyboxMat.backFaceCulling = false;
    skyboxMat.disableLighting = true;
    skyboxMat.reflectionTexture = scene.environmentTexture;
    skyboxMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skybox.material = skyboxMat;

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

    // Hemispheric light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Initialize Havok physics engine
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

    // Ground plane — static rigid body (mass = 0)
    const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    const groundMat = new PBRMetallicRoughnessMaterial("groundMat", scene);
    groundMat.baseTexture = new Texture(concreteFloorDiffuse, scene, false);
    groundMat.normalTexture = new Texture(concreteFloorNormal, scene, false);
    groundMat.metallicRoughnessTexture = new Texture(concreteFloorRoughness, scene, false);
    ground.material = groundMat;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0, restitution: 0.4 }, scene);

    // Shared material for all spawned spheres
    const sphereMat = new PBRMaterial("sphereMat", scene);
    sphereMat.albedoColor = new Color3(0.8, 0.2, 0.2);

    const MAX_SPHERES = 20;
    const spheres: ReturnType<typeof MeshBuilder.CreateSphere>[] = [];
    let sphereCount = 0;

    // Spawn a Sphere rigid body on mouse click or touch tap
    scene.onPointerObservable.add(async (pointerInfo) => {
        await audioEngine.unlockAsync();
        if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return;

        hammerImpactSound.pitch = (0.5 + Math.random()) * 200 - 100; // Randomize pitch for variety
        hammerImpactSound.setVolume(0.7);
        hammerImpactSound.play();

        // Remove the oldest sphere when the cap is reached
        if (spheres.length >= MAX_SPHERES) {
            spheres.shift()?.dispose();
        }

        const pickInfo = pointerInfo.pickInfo;
        const spawnPosition =
            pickInfo?.hit && pickInfo.pickedPoint
                ? new Vector3(
                      pickInfo.pickedPoint.x,
                      pickInfo.pickedPoint.y + 5,
                      pickInfo.pickedPoint.z,
                  )
                : new Vector3(0, 6, 0);

        const sphere = MeshBuilder.CreateSphere(
            `sphere${sphereCount++}`,
            { diameter: 1, segments: 16 },
            scene,
        );
        sphere.position = spawnPosition;
        sphere.material = sphereMat;
        new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.9 }, scene);
        spheres.push(sphere);
    });

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}

void main();
