import "./style.css";
import HavokPhysics from "@babylonjs/havok";
import {
    AbstractEngine,
    ArcRotateCamera,
    Color3,
    Engine,
    HavokPlugin,
    HemisphericLight,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
    Scene,
    StandardMaterial,
    Vector3,
    WebGPUEngine,
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

    // ArcRotateCamera
    const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 3,
        12,
        new Vector3(0, 2, 0),
        scene,
    );
    camera.attachControl(canvas, true);

    // Hemispheric light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Initialize Havok physics engine
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

    // Ground plane — static rigid body (mass = 0)
    const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new Color3(0.4, 0.6, 0.4);
    ground.material = groundMat;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0, restitution: 0.4 }, scene);

    // Sphere — dynamic rigid body (mass = 1), starts 6 units above the ground
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 16 }, scene);
    sphere.position.y = 6;
    const sphereMat = new StandardMaterial("sphereMat", scene);
    sphereMat.diffuseColor = new Color3(0.8, 0.2, 0.2);
    sphere.material = sphereMat;
    new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.4 }, scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}

void main();
