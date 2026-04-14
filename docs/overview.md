# Overview — RAGDOLL MECHANIC

> A Babylon.js + Havok physics browser game for GameDev.js Jam 2026 (theme: **MACHINES**).

## One-Sentence Pitch

Control a floppy ragdoll engineer with independent hand inputs, climb and cling to colossal broken machines, and repair them before time runs out — every attempt plays out differently thanks to full rigid-body physics.

## Key Features

| Feature | Detail |
|---|---|
| Ragdoll protagonist | Full-body physics (Havok constraints: Hinge, BallAndSocket, Slider) |
| Independent hand controls | Left hand / Right hand mapped to two inputs each; grab, release, push |
| Procedural chaos | Physics simulation produces unique outcomes every run |
| Repair loop | Find broken part → carry it → snap it into place → machine activates |
| Steampunk art | Industrial Victorian aesthetic; gears, pistons, rivets, steam |
| PWA | Installable on PC and mobile; offline playable after first load |
| Jam-ready scope | 3–5 machines, each 3–5 repair tasks, completable in 14 days |

## Target Platforms

- **Primary:** Desktop browser (Chrome, Firefox, Edge) — keyboard + mouse
- **Secondary:** Mobile browser (iOS Safari, Android Chrome) — dual-thumb touch
- **Distribution:** Progressive Web App (service worker + Web App Manifest)

## Tech Stack

- **Renderer:** Babylon.js 9 (WebGL 2 / WebGPU fallback)
- **Physics:** Havok via `@babylonjs/havok` (WASM + SIMD, up to ~20× faster than Ammo.js)
- **Language:** TypeScript 6 (strict mode)
- **Bundler:** Vite (via `vite-plus`)

## Core Game Loop

```
Title Screen
  └─ Select Machine (clock tower / steam locomotive / factory robot)
       └─ Repair Phase
            ├─ Player grabs broken part with left / right hand
            ├─ Ragdoll physics: body weight shifts, momentum carries
            ├─ Player carries part to repair socket
            ├─ Part snaps in → machine segment activates (visual + audio)
            └─ All parts repaired → Machine fully activated → Score screen
                 ├─ Time elapsed, falls, parts repaired
                 └─ Retry or Next Machine
```

Offline earnings are **not** part of this game (it is a session-based skill game, not an idle game).

## Why It Fits the Jam Criteria

| Criterion | How it is addressed |
|---|---|
| **Innovation** | Ragdoll-as-protagonist repair mechanic has no direct browser-game precedent; physics produces emergent, unrepeatable moments |
| **Theme (MACHINES)** | The setting, the characters, and the gameplay objects are all machines — the player *is* a machine, repairing other machines |
| **Gameplay** | Simple two-button input depth; skill ceiling is physics mastery; each attempt is meaningfully different |
| **Graphics** | PBR + IBL lighting, steam particles, gear animations, post-process bloom — all driven by Babylon.js |
| **Audio** | Collision-driven SFX (metal clang intensity ∝ impact speed), layered steampunk BGM that intensifies as repairs complete |
