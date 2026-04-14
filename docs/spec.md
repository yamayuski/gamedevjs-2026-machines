# PHYSICS FACTORY — Game Specification

## 1. Functional Requirements

### 🔴 MUST (required for submission)

| ID | Requirement | Detail |
|---|---|---|
| M-01 | Click-to-produce action | Clicking the crank/piston on screen triggers a Havok impulse and yields resources |
| M-02 | At least 3 machine tiers | Tier 1: Hand Crank → Tier 2: Steam Piston → Tier 3: Gear Array |
| M-03 | Auto-production | Purchased machines produce resources at a fixed rate per second |
| M-04 | Resource display | Running total shown with animated counter |
| M-05 | Buy/upgrade panel | UI sidebar listing available machines with costs and production rates |
| M-06 | Milestone notifications | Pop-up or banner on each major unlock |
| M-07 | Title screen | Game title, start button, credits |
| M-08 | PWA support | `manifest.json` + Service Worker for offline play and home-screen install |
| M-09 | PC + mobile responsive | Touch-friendly UI; canvas scales to viewport |

### 🟡 SHOULD (significantly improves evaluation)

| ID | Requirement | Detail |
|---|---|---|
| S-01 | Physics SFX | Clink on click, whirr during auto-tick, clunk on upgrade |
| S-02 | Prestige / reset loop | Sacrifice resources for a permanent multiplier; resets factory |
| S-03 | Camera pan/zoom | Mouse drag or pinch-to-zoom to inspect factory floor |
| S-04 | Particle effects | Sparks on click, steam jets on boiler unlock |
| S-05 | Layered BGM | Calm at start, builds complexity as more machines are active |
| S-06 | Save/load | `localStorage` persistence; auto-save every 30 s |

### 🟢 COULD (if time allows)

| ID | Requirement | Detail |
|---|---|---|
| C-01 | Online leaderboard | Submit resource total at a fixed playtime to a serverless endpoint |
| C-02 | Dark/light theme | Toggle between day factory and night factory lighting |
| C-03 | Extra machine tiers (4–5) | Electrical generator, Quantum Assembler |
| C-04 | Achievement system | Badges for milestone factory outputs |

## 2. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| Performance | Frame rate | 60 fps (desktop) / 30 fps (mid-range mobile) |
| Physics bodies | Active rigid bodies | ≤ 50 simultaneous (decorative + clickable) |
| Load time | Initial bundle | ≤ 10 MB (GLTF compressed + PBR textures) |
| Browser compatibility | Supported browsers | Chrome/Edge/Firefox latest, Safari iOS 16.4+ |
| Offline | PWA install | Fully playable with no network after first load |

## 3. Game Mechanics Detail

### 3.1 Resources

- **Cogs** — primary currency produced by all machines.
- **Steam Pressure** — secondary resource unlocked at Tier 2; required for tier-3 machines.

### 3.2 Machine Tiers

| Tier | Name | Cost | Cogs/sec | Physics Effect |
|---|---|---|---|---|
| 1 | Hand Crank | 10 | 0.5 | Crank mesh rotates on click; Havok hinge impulse |
| 2 | Steam Piston | 120 | 4 | Piston translates up/down; PhysicsBody kinematic |
| 3 | Gear Array | 1 500 | 25 | Cluster of gears spin; ConstraintMotor angular velocity |
| 4 *(SHOULD)* | Boiler Engine | 20 000 | 150 | Steam particles burst; rigid body emitter |
| 5 *(COULD)* | Ether Condenser | 300 000 | 1 000 | Glowing crystal with force field; shader + physics |

### 3.3 Prestige Loop *(SHOULD)*

1. Unlock prestige when total Cogs ever produced ≥ 1 000 000.
2. Reset all machines and Cogs; earn 1 **Blueprint** per 500 000 Cogs.
3. Each Blueprint provides a +10 % global production multiplier.

### 3.4 Click Feedback Pipeline

```
PointerDown on machine mesh
      │
      ▼
Havok applyImpulse (visual kick)
      │
      ▼
Add resourceDelta to running total
      │
      ▼
Play SFX clip (pitch-randomized ±5%)
      │
      ▼
Emit click particle burst
      │
      ▼
Animate resource counter (+delta float-up)
```

## 4. Input Design

### Desktop

| Input | Action |
|---|---|
| Left-click machine | Produce resources |
| Left-click buy button | Purchase machine |
| Mouse drag (canvas) | Rotate camera around factory |
| Scroll wheel | Zoom camera |
| `R` | Reset camera to default |

### Mobile

| Input | Action |
|---|---|
| Tap machine | Produce resources |
| Tap buy button | Purchase machine |
| One-finger drag (canvas) | Rotate camera |
| Pinch | Zoom camera |
| Dedicated HUD buttons | Buy / prestige |
