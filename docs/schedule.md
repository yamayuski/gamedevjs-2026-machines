# PHYSICS FACTORY — Development Schedule (14 Days)

> **Assumption**: ~6–8 productive hours per day (excluding sleep and personal time).

## Phase 1 — Foundation (Days 1–3) 🏗️

| Day | Tasks | Deliverable | Est. |
|---|---|---|---|
| **Day 1** | Project setup: Vite + TS + Babylon.js + Havok | Empty scene with ground, camera, lights; Havok gravity confirmed | 6 h |
| | GitHub repo + GitHub Pages / Cloudflare CI/CD | Deployed placeholder at live URL | |
| **Day 2** | Havok physics init; test sphere drop & bounce | Stable physics simulation at 60 fps | 6 h |
| | `PhysicsSetup.ts` — gravity, material properties | | |
| | `AssetLoader.ts` — GLTF preload pipeline | | |
| **Day 3** | **Hand Crank (Tier 1) — click + physics impulse** | Clicking the crank produces 1 Cog with visible kick | 7 h |
| | `MachineBody.ts`, `ClickImpulse.ts` | | |
| | `ResourceManager.ts` — Cog counter | | |
| | Basic HUD (Cog total, rate per second) | | |

> 📌 **Day 3 Milestone**: Clicking produces resources with a satisfying physics reaction.

---

## Phase 2 — Core Gameplay (Days 4–7) 🎮

| Day | Tasks | Deliverable | Est. |
|---|---|---|---|
| **Day 4** | `MachineRegistry.ts` — tier definitions | Tier data drives all cost/rate/mesh lookups | 6 h |
| | `BuyPanel.ts` — purchase UI | Can buy machines; Cog total decreases correctly | |
| **Day 5** | `ProductionLoop.ts` — auto-tick per second | Purchased machines add Cogs automatically | 7 h |
| | Steam Piston (Tier 2): kinematic body oscillation | | |
| **Day 6** | Gear Array (Tier 3): `ConstraintMotor` rotation | All three base tiers playable | 7 h |
| | Steam Pressure (secondary resource) introduced | | |
| **Day 7** | `SaveManager.ts` — localStorage + auto-save | Progress survives browser refresh | 6 h |
| | `MilestonePopup.ts` — unlock notifications | | |

> 📌 **Day 7 Milestone**: Three machine tiers, auto-production, and save/load = **MVP complete**.

---

## Phase 3 — Content & Polish (Days 8–11) ✨

| Day | Tasks | Deliverable | Est. |
|---|---|---|---|
| **Day 8** | PBR materials + IBL environment | Steampunk metallic look across all machines | 7 h |
| | Shadows (`ShadowGenerator`), post-process pipeline | Bloom, vignette active | |
| **Day 9** | Particle effects: click sparks, steam bursts | Every click has visible feedback | 6 h |
| | `AudioManager.ts` — SFX clips per event | | |
| **Day 10** | `DynamicBGM.ts` — layered BGM stems | Music grows with factory size | 7 h |
| | `PrestigeSystem.ts` *(SHOULD)* — reset + blueprint | Prestige loop functional | |
| **Day 11** | Camera orbit (`ArcRotateCamera`) + pinch zoom | Players can explore factory | 6 h |
| | Mobile touch controls + responsive layout | Playable on iOS Safari / Android Chrome | |

> 📌 **Day 11 Milestone**: Feature-complete with audio, visuals, and mobile support.

---

## Phase 4 — Stabilisation (Days 12–13) 🔧

| Day | Tasks | Deliverable | Est. |
|---|---|---|---|
| **Day 12** | Bug fixing + performance optimisation | Stable 60 fps desktop / 30 fps mobile | 7 h |
| | Mobile device testing (iOS Safari, Android Chrome) | | |
| | Physics instability fixes (tunnelling, jitter) | | |
| | PWA: `manifest.json` + Service Worker (Workbox) | Installable and offline-capable | |
| **Day 13** | Final polish buffer | Submission-ready build | 6 h |
| | Remaining bugs, onboarding UX | | |
| | SHOULD / COULD items if time permits | | |

> 📌 **Day 12 Milestone**: Stable build ready for submission on all platforms.

---

## Phase 5 — Submission (Day 14) 🚀

| Task | Deliverable | Est. |
|---|---|---|
| Production build + deploy | Live URL confirmed working | 1 h |
| Game jam submission form | Submitted with description and screenshots | 1 h |
| Trailer GIF / video (30–60 s) | Visual showcase for jam page | 2 h |

---

## Risk & Contingency

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Physics feel unsatisfying | Medium | High | Day 3 is a go/no-go gate; simplify impulse model if needed |
| Performance < 30 fps mobile | Medium | High | Reduce physics bodies; use kinematic-only on mobile |
| Asset production too slow | Medium | Medium | Use primitive meshes (Box/Sphere) as placeholders |
| Tier 4/5 not finished | Low | Low | Only SHOULD/COULD — submission viable with Tiers 1–3 |
| PWA Service Worker issues | Low | Low | Workbox handles edge cases; degrade gracefully |

### Go / No-Go Checklist (end of Day 7)

```
□ Clicking produces Cogs with visible physics reaction
□ Machines auto-produce Cogs per second
□ Buy panel costs and balances are correct
□ Save / load works across browser refresh
□ Frame rate ≥ 55 fps on desktop Chrome
```
