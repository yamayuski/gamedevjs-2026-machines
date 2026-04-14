# Specification — RAGDOLL MECHANIC

## Requirements

### MUST (MVP)

- [ ] Ragdoll character with independent left-hand / right-hand physics controls
- [ ] At least 2 playable machines to repair (clock tower, steam locomotive)
- [ ] Each machine has 3–5 broken parts to locate and carry to repair sockets
- [ ] Part snaps into socket when within threshold distance and velocity is below limit
- [ ] Repair socket provides visual + audio feedback on success
- [ ] Machine partially activates (gears turn, pistons move, steam vents) as each part is repaired
- [ ] Timer visible on-screen; session ends when all parts repaired or time expires
- [ ] Score screen: time elapsed, fall count, parts repaired
- [ ] Restart and machine-select from score screen
- [ ] PWA manifest + service worker for offline play after first load
- [ ] Playable on desktop (keyboard + mouse) and mobile (dual-thumb touch)
- [ ] 60 fps on mid-range desktop; 30 fps target on mid-range mobile

### SHOULD

- [ ] 3 machines total (add factory robot)
- [ ] Streaming BGM with volume layers that increase as repairs complete
- [ ] Collision-based SFX (intensity proportional to impact velocity)
- [ ] Particle steam emitters that activate on machine segments
- [ ] Simple title / loading screen with game name and controls hint
- [ ] LocalStorage high-score (fastest completion time per machine)
- [ ] Camera smoothly follows ragdoll with configurable lag
- [ ] Anti-frustration: parts respawn at original position if they fall out of bounds

### COULD

- [ ] 4th machine (giant mechanical spider)
- [ ] Leaderboard via a lightweight backend or external service
- [ ] Optional "chaos mode" with stronger physics forces
- [ ] Unlockable cosmetic ragdoll skins
- [ ] Mobile gyroscope lean assist

## Controls

### Desktop

| Input | Action |
|---|---|
| `W / A / S / D` | Lean body (apply force to torso) |
| `Left Mouse Button` (hold/drag) | Move left hand; release to let go |
| `Right Mouse Button` (hold/drag) | Move right hand; release to let go |
| `Space` | Push off nearest surface (impulse) |
| `R` | Respawn ragdoll at last checkpoint |
| `Escape` | Pause / settings |

### Mobile

| Input | Action |
|---|---|
| Left thumb hold + drag | Move left hand |
| Right thumb hold + drag | Move right hand |
| Double-tap | Push-off impulse |
| Long-press empty area | Respawn |

### UX Rules

- Hand grab radius: **0.4 m** (world units). Visual indicator (glow ring) appears when a grabbable object is within radius.
- Maximum carry distance: **1.5 m** from hand anchor. Part detaches if exceeded.
- Snap threshold: part must be within **0.2 m** of socket centre and moving slower than **2 m/s**.
- Ragdoll never fully "dies"; it can always be respawned at the last checkpoint (adds +1 fall count).

## Machine Definitions

| ID | Name | Parts to Repair | Estimated Play Time |
|---|---|---|---|
| `clock_tower` | Victorian Clock Tower | 5 (pendulum, main spring, escapement, hands ×2) | 3–6 min |
| `steam_loco` | Steam Locomotive | 4 (piston rod, valve, coupling rod, chimney cap) | 2–4 min |
| `factory_robot` | Factory Assembly Robot | 5 (shoulder joint, elbow, claw ×2, power cell) | 4–7 min |

## Economy / Progression

This is not an idle game. Progression is skill-based:

- Completing a machine unlocks the next machine (linear unlock, stored in `localStorage`).
- Each machine stores a **fastest-time record** in `localStorage`.
- No in-game currency, upgrade trees, or monetisation.

## Save / Load

```
localStorage key: "ragdoll-mechanic-save"
Schema (JSON):
{
  "version": 1,
  "machines": {
    "clock_tower":    { "unlocked": true,  "bestTimeMs": 185000 },
    "steam_loco":     { "unlocked": true,  "bestTimeMs": null },
    "factory_robot":  { "unlocked": false, "bestTimeMs": null }
  }
}
```

- Save is written on score screen display and on page hide (`visibilitychange`).
- Schema version checked on load; if mismatched, data is reset with a console warning.
- No server-side persistence in MVP.

## Offline / PWA

- Service worker caches all static assets on first install (cache-first strategy).
- Havok WASM binary (≈ 2 MB) is pre-cached.
- No network requests during gameplay.
