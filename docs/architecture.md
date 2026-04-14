# PHYSICS FACTORY — Technical Architecture

## 1. Technology Stack

```
┌───────────────────────────────────────────────────┐
│                Build & Deploy                      │
│   Vite + TypeScript · GitHub Pages / Cloudflare   │
├───────────────────────────────────────────────────┤
│                Game Engine Layer                   │
│          Babylon.js 7.x (ES Module)               │
├─────────────────────┬─────────────────────────────┤
│     Rendering       │        Physics               │
│  PBR Materials      │  Havok Plugin (WASM+SIMD)   │
│  IBL / HDR Env      │  PhysicsBody                │
│  Post-Process:      │  PhysicsAggregate            │
│   Bloom, Vignette,  │  ConstraintMotor             │
│   SSAO              │  applyImpulse                │
│  Particle System    │  Collision Filtering         │
├─────────────────────┴─────────────────────────────┤
│                  Input Layer                       │
│  PointerEvent unified (Mouse + Touch)             │
│  Camera ArcRotateCamera (drag / pinch-zoom)       │
├───────────────────────────────────────────────────┤
│                  Audio Layer                       │
│   Babylon.js Sound + Web Audio API                │
│   Physics-event-driven SFX trigger                │
├───────────────────────────────────────────────────┤
│                  Persistence Layer                 │
│   localStorage (save state JSON)                  │
│   Auto-save via setInterval (every 30 s)          │
├───────────────────────────────────────────────────┤
│                   PWA Layer                        │
│   manifest.json + Service Worker (Workbox)        │
└───────────────────────────────────────────────────┘
```

## 2. Project Structure

```
physics-factory/
├── public/
│   ├── assets/
│   │   ├── models/          # GLTF/GLB (machines, factory floor)
│   │   ├── textures/        # PBR textures (metallic/roughness)
│   │   ├── audio/
│   │   │   ├── sfx/         # Click, tick, upgrade, prestige
│   │   │   └── bgm/         # Layered BGM stems
│   │   ├── env/             # HDR environment map (.env)
│   │   └── icons/           # PWA icons
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── main.ts              # Entry point
│   ├── core/
│   │   ├── Game.ts          # Lifecycle: init → loop → dispose
│   │   ├── SceneManager.ts  # Scene switching (Title / Factory / Prestige)
│   │   └── SaveManager.ts   # localStorage read/write, auto-save
│   ├── physics/
│   │   ├── PhysicsSetup.ts  # Havok plugin init, gravity config
│   │   ├── MachineBody.ts   # PhysicsBody + mesh per machine tier
│   │   └── ClickImpulse.ts  # applyImpulse on click, collision SFX hook
│   ├── factory/
│   │   ├── ResourceManager.ts  # Cog + Steam counters, delta calc
│   │   ├── MachineRegistry.ts  # Tier definitions (cost, rate, mesh id)
│   │   ├── ProductionLoop.ts   # setInterval / Babylon observer for auto-tick
│   │   └── PrestigeSystem.ts   # Reset logic, blueprint accumulation
│   ├── ui/
│   │   ├── TitleScreen.ts      # Title + start button (Babylon GUI)
│   │   ├── HUD.ts              # Resource counter, rate display
│   │   ├── BuyPanel.ts         # Machine list, costs, buy buttons
│   │   ├── MilestonePopup.ts   # Milestone / unlock notifications
│   │   └── TouchControls.ts    # Mobile HUD buttons
│   ├── audio/
│   │   ├── AudioManager.ts     # SFX / BGM management
│   │   └── DynamicBGM.ts       # Layer fade in/out as machines grow
│   └── utils/
│       ├── AssetLoader.ts      # GLTF + texture preload
│       └── PerformanceMonitor.ts # FPS watch, LOD toggle
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 3. Key Systems

### 3.1 Physics Integration

Each machine tier has an associated `PhysicsBody` / `PhysicsAggregate` that provides visual feedback:

```
MachineRegistry entry
  ├── meshPath: string          // GLTF asset
  ├── physicsShape: ShapeType   // Box | Sphere | Capsule | Mesh
  ├── mass: number              // 0 = kinematic (auto-tick machines)
  ├── clickImpulse: Vector3     // direction + magnitude on click
  └── motorAngularVelocity?: number  // for spinning gears
```

- **Click machines** (Tier 1): dynamic body, `applyImpulse` on click.
- **Auto machines** (Tier 2+): kinematic body with a `ConstraintMotor` driving rotation/translation at a fixed speed proportional to count purchased.

### 3.2 Production Loop

```
ProductionLoop.ts
  ├── Babylon onBeforeRenderObservable (delta time accumulation)
  ├── When accumulated Δt ≥ 1 s → ResourceManager.tick()
  │     └── Adds (rate × count × multiplier) Cogs
  └── Every 30 s → SaveManager.save()
```

### 3.3 Scene Switching

```
SceneManager
  ├── push(scene: IScene)   // activate new scene, pause previous
  ├── pop()                 // dispose top scene, resume previous
  └── replace(scene)        // full transition (Title → Factory)
```

### 3.4 Save Format (localStorage)

```json
{
  "version": 1,
  "cogs": 12345.67,
  "steamPressure": 89.1,
  "machines": { "handCrank": 5, "steamPiston": 2, "gearArray": 0 },
  "blueprints": 3,
  "totalCogsEver": 1234567.89,
  "lastSaved": "2026-04-14T10:00:00Z"
}
```

## 4. Rendering Pipeline

| Stage | Tool | Notes |
|---|---|---|
| Environment | IBL (`.env` HDR) | Steampunk foundry HDRI |
| Base materials | `PBRMetallicRoughnessMaterial` | metallic ≈ 0.9, roughness ≈ 0.3 for metal parts |
| Shadows | `ShadowGenerator` (PCF soft) | Main directional light only |
| Post-process | `DefaultRenderingPipeline` | Bloom (threshold 0.8), Vignette, Chromatic Aberration |
| Particles | `ParticleSystem` | Sparks on click; steam on Tier 4 unlock |
| GUI | `AdvancedDynamicTexture` (fullscreen) | All UI overlaid on canvas |

## 5. Performance Budget

| Resource | Budget |
|---|---|
| Active physics bodies | ≤ 50 |
| Draw calls per frame | ≤ 200 |
| Particle count (peak) | ≤ 500 |
| JS heap (steady state) | ≤ 150 MB |
| GLTF total size | ≤ 8 MB (draco compressed) |
| Audio files total | ≤ 2 MB |
