# PHYSICS FACTORY — Project Overview

## Concept

**PHYSICS FACTORY** is a 3D browser-based clicker/idle factory game built with [Babylon.js](https://www.babylonjs.com/) and the [Havok](https://www.havok.com/) physics engine.

Players click to trigger physical actions — turning cranks, pressing pistons, dropping gears — that produce resources and gradually automate an ever-growing steampunk factory. The game runs in the browser with no installation required and supports PWA offline play.

## Theme: MACHINES

Every element of the game is a machine:

- Production units are gears, pistons, boilers, and conveyor belts.
- Upgrades are mechanical modifications (larger flywheel, lubricated bearings).
- The factory floor is a living, physically simulated environment.

## Core Loop

```
Click → produce resources
Resources → buy machines
Machines → automate clicks
Automate → unlock new machine tiers
New tiers → more satisfying physics spectacle
```

## Evaluation Axes (GameDevJS Jam)

| Axis | Approach | Target |
|---|---|---|
| **Innovation** | Real-time Havok physics in an idle/clicker genre | Visible physics reactions on every click and automation tick |
| **Theme** | Every mechanic is literally a machine | Factory setting, mechanical upgrades, gear-driven visuals |
| **Gameplay** | Satisfying feedback loop with clear milestones | First upgrade within 30 s; factory self-runs within 3 min |
| **Graphics** | Babylon.js PBR + IBL, bloom post-process | Metallic steampunk aesthetic, consistent quality on all tiers |
| **Audio** | Physics-event-driven SFX (clicks, ticks, clanks) | Every action has a distinct, satisfying sound |

## Platform Targets

| Platform | Target | Notes |
|---|---|---|
| Desktop Chrome/Edge | 60 fps | Primary development target |
| Desktop Firefox | 60 fps | Secondary |
| iOS Safari (16.4+) | 30 fps | Touch input, reduced physics fidelity |
| Android Chrome | 30 fps | Touch input, reduced physics fidelity |
| PWA | Offline capable | `manifest.json` + Service Worker |

## Submission Timeline

- **Day 12**: All content implemented and debugged
- **Day 13**: Final polish (VFX, SFX, UI)
- **Day 14**: Build, deploy, submit, create trailer
