# Schedule — RAGDOLL MECHANIC (14-Day Sprint)

Jam window: **14 days**. Solo developer + AI pair. Estimated active hours: ~80–100 h.

## Phases

| Phase | Days | Goal |
|---|---|---|
| 0 — Foundation | 1–2 | Engine + physics + ragdoll prototype |
| 1 — Core Loop | 3–5 | Hand grab, carry, snap into socket |
| 2 — Content | 6–9 | Machines 1–3, repair tasks, camera, basic UI |
| 3 — Polish | 10–12 | Audio, particles, PBR materials, post-process |
| 4 — Ship | 13–14 | PWA, performance, cross-browser QA, submission |

## Day-by-Day Milestones

### Phase 0 — Foundation

| Day | Deliverable | Go/No-Go Gate |
|---|---|---|
| 1 | Vite + TypeScript project runs; Babylon.js scene with Havok initialised; single physics sphere falls and bounces | Engine boots in browser ✓ |
| 2 | Ragdoll skeleton (15 segments, full constraints) falls under gravity and lies on floor naturally | Ragdoll stable at rest, no constraint explosions ✓ |

### Phase 1 — Core Loop

| Day | Deliverable | Go/No-Go Gate |
|---|---|---|
| 3 | Input system maps keyboard + mouse + touch to hand targets; hands follow input via motor targets | Hands visibly track mouse without tunnelling ✓ |
| 4 | Grab logic: hand within 0.4 m of a tagged rigid body → PointConstraint attaches; release detaches | Can pick up and drop a box reliably ✓ |
| 5 | SnapSocket: carry box within 0.2 m of socket at low velocity → snaps; `repairManager` event fires; score screen renders with time + falls | Full loop playable end-to-end (even with placeholder assets) ✓ |

### Phase 2 — Content

| Day | Deliverable | Go/No-Go Gate |
|---|---|---|
| 6 | Clock Tower machine: placeholder blockout geometry loaded; 5 parts positioned; ragdoll can repair all 5 | Machine 1 completable ✓ |
| 7 | Steam Locomotive machine: same pipeline; 4 parts | Machine 2 completable ✓ |
| 8 | Factory Robot machine: 5 parts; machine-select screen with unlock logic; localStorage save/load | Machine 3 completable; save persists across page reloads ✓ |
| 9 | Camera follow with lag; out-of-bounds reset; fall counter; HUD (timer + progress bar) | Game is playable without frustration ✓ |

### Phase 3 — Polish

| Day | Deliverable | Go/No-Go Gate |
|---|---|---|
| 10 | PBR materials applied to all meshes; IBL environment texture; directional shadow | Scene looks industrial and intentional ✓ |
| 11 | Steam particles on activated machine segments; gear animations (AnimationGroup); bloom + vignette post-process | Visual polish matches target art direction ✓ |
| 12 | Collision-driven SFX bank wired; layered BGM system with gain cross-fade; title screen music | Audio reacts to physics events in real time ✓ |

### Phase 4 — Ship

| Day | Deliverable | Go/No-Go Gate |
|---|---|---|
| 13 | PWA manifest + service worker; Havok WASM pre-cached; test offline; mobile touch controls tuned | Installs on Android/iOS; offline play confirmed ✓ |
| 14 | Performance profiling (desktop 60 fps, mobile 30 fps); final cross-browser run (Chrome/Firefox/Edge/Safari); submission build uploaded | No regressions; builds under 5 MB gzip ✓ |

## Go/No-Go Checkpoints

| Checkpoint | Day | Criteria | Action if NO |
|---|---|---|---|
| Physics stability | 2 | Ragdoll rests without exploding in 100% of test runs | Reduce constraint counts; switch to simpler 7-segment ragdoll |
| Loop playability | 5 | Testers can complete repair loop unaided | Increase snap threshold (0.2 → 0.35 m); simplify grab radius |
| Content completeness | 9 | All 3 machines completable | Drop Factory Robot; deliver 2 machines at full polish |
| Performance | 13 | 60 fps desktop sustained; 30 fps mobile sustained | Disable post-process on mobile; reduce particle count |

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Ragdoll constraint explosions under player input | High | High | Cap motor torques; add `maxLinearVelocity` limit; test each segment in isolation before assembly |
| R2 | Mobile performance below 30 fps | High | Medium | Strip post-process pipeline on mobile; halve particle budget; use lower-resolution physics (fewer sub-steps) |
| R3 | Hand grab UI frustrating on touch screens | Medium | High | Increase grab radius to 0.6 m on touch; add visual pull-toward animation; allow tap-to-grab in addition to drag |
| R4 | Havok WASM load time delays start | Medium | Low | Show animated loading screen; pre-cache WASM in service worker; target ≤ 3 s on 4G |
| R5 | Content (3 machines) scope too large | Medium | Medium | Cut Factory Robot (Machine 3); deliver 2 polished machines rather than 3 rough ones |
| R6 | Audio licensing issues | Low | Medium | Use royalty-free / CC0 sources only; document all sources in `docs/assets.md` |
| R7 | Safari WebGPU incompatibility | Low | Low | Babylon.js falls back to WebGL 2 automatically; test WebGL 2 path on Safari |
