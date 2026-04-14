# Architecture — RAGDOLL MECHANIC

## TypeScript Module Layout

```
src/
├── config/          # Tuning constants (physics params, timings, asset paths)
│   └── index.ts
├── core/            # Engine bootstrap, scene lifecycle, input manager
│   ├── engine.ts      # Babylon.js Engine / WebGPU fallback creation
│   ├── scene.ts       # Scene factory, physics plugin init
│   └── input.ts       # Unified keyboard + pointer + touch input state
├── physics/         # Havok helpers and ragdoll construction
│   ├── ragdoll.ts     # RagdollController: body segments, constraints
│   ├── hand.ts        # HandController: grab logic, carry limits, snap detect
│   └── world.ts       # Static colliders, trigger volumes, out-of-bounds reset
├── machines/        # One sub-folder per machine
│   ├── clock_tower/
│   │   ├── index.ts   # Machine entry point (loads mesh, places parts/sockets)
│   │   └── parts.ts   # Part definitions (id, mesh path, socket position, mass)
│   ├── steam_loco/
│   │   ├── index.ts
│   │   └── parts.ts
│   └── factory_robot/
│       ├── index.ts
│       └── parts.ts
├── repair/          # Repair-loop state machine
│   ├── repairManager.ts  # Tracks which parts are placed, emits events
│   └── socket.ts         # SnapSocket: proximity check, snap animation, event
├── rendering/       # Visual effects and camera
│   ├── camera.ts      # ArcRotateCamera with ragdoll-follow lag
│   ├── lighting.ts    # IBL (HDR env texture), directional key light
│   ├── materials.ts   # Shared PBR material factory
│   ├── particles.ts   # Steam particle systems (per machine segment)
│   └── postprocess.ts # Bloom + vignette pipeline
├── audio/           # Sound management
│   ├── sfx.ts         # Collision-driven SFX: sample bank, velocity → volume
│   └── bgm.ts         # Layered BGM: AudioBuffer tracks, gain node per layer
├── ui/              # HUD and screens
│   ├── hud.ts         # Timer, fall counter, repair progress bar
│   ├── titleScreen.ts # Title + machine select
│   └── scoreScreen.ts # Results display, retry / next-machine buttons
├── save/            # Persistence
│   └── saveManager.ts # localStorage read/write with schema version check
└── main.ts          # Entry point: bootstrap → title screen → game loop
```

## Physics Design (Havok)

### Ragdoll Construction

The player ragdoll consists of rigid body segments connected by Havok constraints:

| Segment | Shape | Mass (kg) | Parent | Constraint |
|---|---|---|---|---|
| Pelvis (root) | Capsule | 15 | — | — |
| Torso | Capsule | 12 | Pelvis | BallAndSocket (±45°) |
| Head | Sphere | 5 | Torso | BallAndSocket (±30°) |
| Upper Arm L/R | Capsule | 3 | Torso | BallAndSocket (±90°) |
| Lower Arm L/R | Capsule | 2 | Upper Arm | Hinge (0°–150°) |
| Hand L/R | Box | 1 | Lower Arm | BallAndSocket (±60°) |
| Upper Leg L/R | Capsule | 5 | Pelvis | BallAndSocket (±80°) |
| Lower Leg L/R | Capsule | 3 | Upper Leg | Hinge (0°–120°) |
| Foot L/R | Box | 1 | Lower Leg | BallAndSocket (±30°) |

- All constraints use Havok `HingeConstraint` or `BallAndSocketConstraint` APIs.
- Motor targets (angular velocity targets) drive player input — no direct transform manipulation.
- Total rigid bodies per ragdoll: **15**. Maximum scene rigid bodies: **≈ 120** (ragdoll + machine parts + environment colliders).

### Hand Grab Mechanics

```
Every physics tick (60 Hz):
  for each hand in [leftHand, rightHand]:
    if input.isGrabbing(hand):
      nearest = findNearestGrabbable(hand.position, radius=0.4)
      if nearest and not nearest.isHeld:
        hand.attach(nearest)          // PointConstraint at contact point
    else:
      hand.release()                  // Remove PointConstraint

    if hand.carryDistance > 1.5m:
      hand.release()                  // Over-extension safety
```

### Snap Socket Detection

```
Every physics tick:
  for each unplaced part:
    for each socket matching part.id:
      if distance(part, socket) < 0.2m and part.velocity.length < 2 m/s:
        part.setEnabled(false)        // Remove physics body
        playSnapAnimation(part, socket)
        repairManager.markPlaced(part.id)
        sfx.play("snap")
        break
```

### Performance Caps

| Budget | Target |
|---|---|
| Max rigid bodies | 120 |
| Max particle instances | 2,000 (across all steam emitters) |
| Max draw calls | 150 |
| Physics sub-steps | 2 per frame at 60 fps |
| Target frame time | ≤ 16.7 ms desktop / ≤ 33 ms mobile |

Machine part meshes use `InstancedMesh` where multiple identical parts exist (e.g., bolts). Static environment geometry uses merged meshes with a single physics aggregate.

### Rigid Body Lifecycle

```
Part (broken, physics active)
  → Held by hand (PointConstraint active)
    → Snapped to socket (physics body disposed, mesh parented to socket)
      → Machine segment activates (animation + particles start)
```

## Rendering

### Pipeline

- **PBR materials** (`PBRMaterial`) for all machine surfaces: metalness 0.8–1.0, roughness 0.2–0.5, rust/patina via roughness maps.
- **IBL** environment texture: 1K HDR industrial interior (pre-baked).
- **Directional key light** with cascaded shadow maps (2 cascades, 512 px each — mobile-friendly).
- **Post-process stack:** `DefaultRenderingPipeline` with bloom (threshold 0.8, weight 0.3) + subtle vignette. Disabled automatically on mobile if frame time exceeds budget.
- **Steam particles:** `ParticleSystem` per active machine segment; billboard sprites, additive blending.
- **Gear animations:** skeletal animation on machine meshes; driven by `AnimationGroup` speed proportional to repair count.

## Audio

### SFX — Collision-Driven

```typescript
// Havok collision observable fires per contact pair per frame
physicsPlugin.onCollisionObservable.add((event) => {
  const speed = event.impulse;           // Approximation of impact energy
  if (speed < MIN_IMPACT_THRESHOLD) return;
  const volume = clamp(speed / MAX_IMPACT_SPEED, 0, 1);
  sfx.playOneShot(selectSample(event.bodyA, event.bodyB), volume);
});
```

Sample categories:
- `metal_light` — small parts, low velocity
- `metal_heavy` — large parts, high velocity
- `snap` — part snapped into socket
- `steam_hiss` — looped; plays when steam particle system activates
- `creak` — ragdoll limb under strain (if motor torque exceeds 80% of limit)

### BGM — Layered Tracks

| Layer | Content | Trigger |
|---|---|---|
| 0 — Base | Ambient industrial drone | Always playing |
| 1 — Rhythm | Mechanical percussion loop | First part placed |
| 2 — Melody | Steampunk brass melody | 50% of parts placed |
| 3 — Climax | Full orchestration | Last part placed (fade in) |

Each layer is a looping `AudioBuffer` node with its own `GainNode`. Layers cross-fade over 2 seconds.
