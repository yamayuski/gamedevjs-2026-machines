# Assets — RAGDOLL MECHANIC

## Art Direction

**Style:** Victorian steampunk industrial — riveted iron, brass fittings, copper pipes, worn leather, glowing furnaces.  
**Palette:** Dark iron grey (#3A3A3A), aged brass (#B5893A), rust orange (#C0522A), steam white (#E8EEF0), furnace amber (#FF8C1A).  
**Lighting mood:** High-contrast; strong side key light (warm amber), cool fill from a skylight or open window, volumetric steam catching the light.  
**Reference feel:** Dishonored / Bioshock Infinite environment art — tactile, believable machinery with readable silhouettes.

## Asset List

### 3D Meshes

| Asset ID | Description | Poly Budget | Format | Notes |
|---|---|---|---|---|
| `ragdoll_body` | Player ragdoll (15 segments, rigged) | 800 tris total | glTF | Low-poly; detail via texture |
| `clock_tower_base` | Clock tower environment | 3,000 tris | glTF | Static merged mesh |
| `clock_pendulum` | Pendulum (broken part 1) | 200 tris | glTF | Physics-active rigid body |
| `clock_mainspring` | Main spring (broken part 2) | 300 tris | glTF | |
| `clock_escapement` | Escapement mechanism (part 3) | 400 tris | glTF | |
| `clock_hand_hour` | Hour hand (part 4) | 100 tris | glTF | |
| `clock_hand_minute` | Minute hand (part 5) | 100 tris | glTF | |
| `steam_loco_base` | Locomotive environment | 4,000 tris | glTF | |
| `loco_piston_rod` | Piston rod (part 1) | 250 tris | glTF | |
| `loco_valve` | Steam valve (part 2) | 200 tris | glTF | |
| `loco_coupling_rod` | Coupling rod (part 3) | 300 tris | glTF | |
| `loco_chimney_cap` | Chimney cap (part 4) | 150 tris | glTF | |
| `robot_base` | Factory robot environment | 3,500 tris | glTF | |
| `robot_shoulder` | Shoulder joint (part 1) | 350 tris | glTF | |
| `robot_elbow` | Elbow joint (part 2) | 300 tris | glTF | |
| `robot_claw_l` | Left claw (part 3) | 400 tris | glTF | |
| `robot_claw_r` | Right claw (part 4) | 400 tris | glTF | |
| `robot_power_cell` | Power cell (part 5) | 200 tris | glTF | Glowing emissive material |

**Total estimated tris on screen at once:** ~6,000–8,000 (well within WebGL 2 budget)

### Textures

| Asset | Resolution | Format | Channels |
|---|---|---|---|
| `metal_albedo` | 512×512 | KTX2 (BC7) | RGB |
| `metal_orm` | 512×512 | KTX2 (BC5) | Occlusion / Roughness / Metalness |
| `metal_normal` | 512×512 | KTX2 (BC5) | Normal XY |
| `brass_albedo` | 512×512 | KTX2 (BC7) | RGB |
| `brass_orm` | 512×512 | KTX2 (BC5) | ORM |
| `rust_detail` | 256×256 | KTX2 (BC7) | RGB (tiled overlay) |
| `steam_sprite` | 128×128 | PNG (alpha) | RGBA |
| `ibl_env` | 1K HDR | `.env` (Babylon format) | RGBE |

**Compression target:** All KTX2 textures served with GPU-native compression via Basis Universal. PNG fallback for unsupported browsers.

### Environment / UI

| Asset | Format | Notes |
|---|---|---|
| `icons/icon-192.png` | PNG | PWA icon |
| `icons/icon-512.png` | PNG | PWA icon |
| `icons/maskable-512.png` | PNG | PWA maskable icon |
| `ui/font_main.woff2` | WOFF2 | Steampunk-style display font (CC0) |
| `ui/font_mono.woff2` | WOFF2 | Timer / score display |

## Audio

### SFX Bank

| ID | Description | Target Length | Source |
|---|---|---|---|
| `metal_light_1..4` | Light metal clink (4 variations) | 0.2–0.4 s | Freesound (CC0) |
| `metal_heavy_1..3` | Heavy metal clang (3 variations) | 0.3–0.7 s | Freesound (CC0) |
| `snap` | Part snapping into socket | 0.5 s | Freesound (CC0) |
| `steam_hiss` | Looping steam hiss | 2–4 s loop | Freesound (CC0) |
| `gear_spin` | Looping gear rotation | 1–2 s loop | Freesound (CC0) |
| `creak` | Ragdoll limb strain creak | 0.3–0.5 s | Freesound (CC0) |
| `repair_complete` | Machine fully repaired fanfare | 1.5 s | Original / CC0 |

**Format:** OGG Vorbis (primary) + MP3 (Safari fallback). All clips normalised to −12 dBFS.

### BGM

| Layer | Description | Length | Source |
|---|---|---|---|
| Layer 0 — Ambient | Industrial drone, subtle mechanical undertone | 60 s loop | Original / CC0 |
| Layer 1 — Rhythm | Mechanical percussion (pistons, hammers) | 60 s loop | Original / CC0 |
| Layer 2 — Melody | Brass melody, steampunk motif | 60 s loop | Original / CC0 |
| Layer 3 — Climax | Full arrangement (all instruments) | 60 s loop | Original / CC0 |

All BGM layers must be **exactly the same length** and start offset to enable seamless cross-fade mixing.

### Licensing Notes

- All Freesound assets must be verified CC0 (public domain) or CC BY with attribution tracked in `CREDITS.md`.
- Original compositions owned by the developer; released under the same Apache 2.0 license as the codebase, or a separate CC BY 4.0 at developer discretion.
- No proprietary sample libraries. No assets from marketplaces with "game jam only" restrictions.

## Asset Budget Summary

| Category | Compressed Size Target |
|---|---|
| 3D meshes (glTF, all machines) | ≤ 1.5 MB |
| Textures (KTX2) | ≤ 1.0 MB |
| Audio (OGG) | ≤ 2.0 MB |
| Havok WASM | ≈ 2.0 MB |
| JS bundle (gzip) | ≤ 0.5 MB |
| **Total** | **≤ 7.0 MB** |
