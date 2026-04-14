# RAGDOLL MECHANIC

> A Babylon.js + Havok physics browser game for **GameDev.js Jam 2026** — theme: **MACHINES**

Control a floppy ragdoll engineer with independent left/right hand inputs, climb colossal broken machines, and repair them before time runs out. Every attempt plays out differently thanks to full rigid-body physics.

## Quick Start

All source code lives in the `code/` directory.

```bash
cd code

# Install dependencies (uses pnpm via vite-plus)
vp install

# Start development server
vp dev

# Type-check + production build
vp build

# Preview production build
vp preview
```

> **Requires:** Node.js ≥ 20, pnpm (managed automatically by `vp`), Docker (for DevContainer).

## Tech Stack

| Layer | Technology |
|---|---|
| Renderer | Babylon.js 9 (WebGL 2 / WebGPU) |
| Physics | Havok via `@babylonjs/havok` (WASM + SIMD) |
| Language | TypeScript 6 (strict) |
| Bundler | Vite via `vite-plus` |
| Package manager | pnpm |
| Platform | Browser PWA — PC + mobile |

## Folder Structure

```
.
├── code/               # All source code
│   ├── src/
│   │   ├── core/       # Engine bootstrap, scene, input
│   │   ├── physics/    # Ragdoll, hand grab, world colliders
│   │   ├── machines/   # One folder per repairable machine
│   │   ├── repair/     # Repair state machine, snap sockets
│   │   ├── rendering/  # Camera, lighting, materials, particles, post-process
│   │   ├── audio/      # Collision-driven SFX, layered BGM
│   │   ├── ui/         # HUD, title screen, score screen
│   │   ├── save/       # localStorage persistence
│   │   └── config/     # Tuning constants
│   └── package.json
├── docs/               # Product documentation (see below)
└── LICENSE
```

## Documentation

| Document | Contents |
|---|---|
| [docs/overview.md](docs/overview.md) | Pitch, core loop, key features, jam criteria fit |
| [docs/spec.md](docs/spec.md) | MUST/SHOULD/COULD requirements, controls, machine definitions, save format |
| [docs/architecture.md](docs/architecture.md) | Module layout, physics design, rendering pipeline, audio system |
| [docs/schedule.md](docs/schedule.md) | 14-day sprint plan, Go/No-Go checkpoints, risk register |
| [docs/assets.md](docs/assets.md) | Art direction, asset list with budgets, audio licensing notes |

## DevContainer Setup

A DevContainer configuration is included for reproducible development environments.

### Requirements

**Git on host OS** — credential helper config is shared into the container.

**Docker-compatible engine** — recommended: Docker Engine for Linux in WSL2 (Ubuntu).  
**DO NOT clone inside the Windows filesystem** — it will be very slow.

**VS Code** with the [Remote Development extension pack](https://aka.ms/vscode-remote/download/extension), or a JetBrains IDE with Docker support.

> Docker Buildx is required to build the DevContainer.

**Optional — GPG key sharing** for signed commits: see the [VS Code advanced containers guide](https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials#_sharing-gpg-keys).

## License

Apache License 2.0 — see [LICENSE](LICENSE).
