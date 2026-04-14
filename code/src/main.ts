import "./style.css";
import {
    AbstractEngine,
    ArcRotateCamera,
    Engine,
    HemisphericLight,
    MeshBuilder,
    Scene,
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
        10,
        Vector3.Zero(),
        scene,
    );
    camera.attachControl(canvas, true);

    // Hemispheric light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Plane mesh
    MeshBuilder.CreatePlane("plane", { size: 5 }, scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}

void main();
