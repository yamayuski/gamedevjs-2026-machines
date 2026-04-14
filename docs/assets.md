# PHYSICS FACTORY — Asset Plan

## 1. Overview

All assets must stay within the total budget constraints defined in `architecture.md`.

| Category | Budget | Format |
|---|---|---|
| 3D models | ≤ 8 MB (Draco compressed) | `.glb` |
| Textures | bundled inside GLB via KTX2 | — |
| Audio SFX | ≤ 1.5 MB | `.ogg` / `.mp3` |
| BGM stems | ≤ 2 MB | `.ogg` / `.mp3` |
| HDR environment | ≤ 512 KB | `.env` (Babylon compressed) |
| PWA icons | ≤ 50 KB | `.png` 192 × 192, 512 × 512 |

---

## 2. 3D Models

### 2.1 Machines (by tier)

| Asset | Poly target | Production method | Time est. |
|---|---|---|---|
| Hand Crank (Tier 1) | ≤ 500 tris | Blender — modular handle + gear | 2 h |
| Steam Piston (Tier 2) | ≤ 800 tris | Blender — cylinder + rod + base | 3 h |
| Gear Array (Tier 3) | ≤ 1 200 tris | Blender — procedural gear add-on | 3 h |
| Boiler Engine (Tier 4) *(SHOULD)* | ≤ 1 500 tris | Blender — tank + pipes + valve | 4 h |
| Ether Condenser (Tier 5) *(COULD)* | ≤ 1 000 tris | Blender — crystal + frame | 3 h |

### 2.2 Environment

| Asset | Poly target | Production method | Time est. |
|---|---|---|---|
| Factory floor tile (modular, ×4 variants) | ≤ 400 tris each | Blender — brick + metal plate | 3 h |
| Wall panel (modular, ×2 variants) | ≤ 300 tris each | Blender — riveted iron plate | 2 h |
| Conveyor belt section | ≤ 600 tris | Blender — belt + rollers | 2 h |
| Pipe cluster (decorative) | ≤ 400 tris | Blender — tubes + flanges | 1 h |

**Environment subtotal**: ≈ 8 h

---

## 3. Textures (PBR)

All textures are packed inside the GLB using **KTX2 + Basis Universal** compression.

| Map | Resolution | Notes |
|---|---|---|
| Base Color | 512 × 512 | Steampunk palette: brass, copper, cast iron |
| Metallic-Roughness | 512 × 512 | Metal parts: metallic=0.9, roughness=0.3 |
| Normal | 512 × 512 | Surface detail without geometry cost |
| Emissive *(optional)* | 256 × 256 | Indicator lights, glowing seams |

Production method: **Substance Painter** (trial) or **AI-generated PBR** (Adobe Firefly / Materialize) + manual touch-up.
Time estimate: ≈ 3 h

---

## 4. HDR Environment Map

- Style: steampunk foundry interior — warm orange point lights, cool blue ambient
- Source: [Poly Haven](https://polyhaven.com/) (CC0) or custom render in Blender HDRI
- Convert to Babylon `.env` format with the Babylon Sandbox or `@babylonjs/tools`
- Time estimate: 1 h

---

## 5. Audio

### 5.1 SFX Matrix

| Trigger Event | SFX Description | Source |
|---|---|---|
| Click machine | Metallic clink (pitch ±5% random) | Free SFX (CC0) — Freesound.org |
| Auto-tick | Soft mechanical tick | Free SFX (CC0) |
| Purchase machine | Satisfying clunk + cash register | Free SFX (CC0) |
| Prestige | Steam whistle fanfare | Free SFX (CC0) / Audacity composite |
| Milestone unlock | Rising chime | Free SFX (CC0) |
| Gear spinning (Tier 3+) | Low rumble loop | Free SFX (CC0), looped |
| Steam burst (Tier 4) | Hiss loop | Free SFX (CC0), looped |

### 5.2 BGM Layers

| Layer | Description | Active when |
|---|---|---|
| Layer 0 | Ambient factory drone (base) | Always |
| Layer 1 | Soft jazz piano + brush drums | ≥ 1 machine purchased |
| Layer 2 | Strings added | ≥ 5 machines total |
| Layer 3 | Brass + full percussion | ≥ 15 machines total |
| Layer 4 | Prestige fanfare | Prestige triggered |

Source: **AI-generated** (Suno / Udio) or royalty-free steampunk jazz (CC0).
Time estimate: 2 h

---

## 6. PWA Assets

| Asset | Size | Notes |
|---|---|---|
| `icon-192.png` | 192 × 192 px | Factory cog logo, PNG |
| `icon-512.png` | 512 × 512 px | Same, larger for splash screen |
| `og-image.png` | 1200 × 630 px | Social share preview |
| `manifest.json` | < 1 KB | Name, theme_color (#8B5E3C), icons |

---

## 7. Asset Production Timeline

| Day | Asset work | Hours |
|---|---|---|
| Day 1 | Environment map sourced; factory floor tile (v1) | 2 h |
| Day 3 | Hand Crank GLB (placeholder primitives OK) | 2 h |
| Day 5 | Steam Piston GLB | 3 h |
| Day 6 | Gear Array GLB | 3 h |
| Day 7 | SFX sourced and integrated | 2 h |
| Day 8 | PBR textures applied to all Tiers 1–3 | 3 h |
| Day 9 | Particle textures (spark atlas, steam sprite) | 1 h |
| Day 10 | BGM stems integrated | 2 h |
| Day 12 | Boiler Engine GLB *(SHOULD)* | 4 h |
| Day 13 | PWA icons; final texture pass | 2 h |
| **Total** | | **≈ 24 h** |

---

## 8. Licensing Checklist

- [ ] All free assets confirmed **CC0** or **MIT** before use
- [ ] AI-generated audio verified against jam license requirements
- [ ] HDR map credited in README / game credits screen
- [ ] No copyrighted material in submitted build
