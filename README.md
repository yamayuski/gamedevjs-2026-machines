# PHYSICS FACTORY 🏭⚙️

> **GameDevJS Jam 2026 — Theme: MACHINES**

A 3D browser-based clicker/idle factory game built with **Babylon.js** and the **Havok** physics engine.
Click cranks, buy machines, automate production, and watch a steampunk factory come alive — all with real-time physics simulation, no installation required.

## Play

> _URL will be published here after deployment._

## Documentation

### English

| Doc | Description |
|---|---|
| [Overview](docs/overview.md) | Concept, core loop, platform targets |
| [Spec](docs/spec.md) | Functional & non-functional requirements, game mechanics |
| [Architecture](docs/architecture.md) | Tech stack, project structure, key systems |
| [Schedule](docs/schedule.md) | 14-day development plan with milestones |
| [Assets](docs/assets.md) | 3D models, textures, audio, PWA asset plan |

### 日本語

| ドキュメント | 内容 |
|---|---|
| [概要](docs/overview.ja.md) | コンセプト・コアループ・プラットフォーム目標 |
| [仕様書](docs/spec.ja.md) | 機能要件・非機能要件・ゲームメカニクス |
| [アーキテクチャ](docs/architecture.ja.md) | 技術スタック・プロジェクト構成・主要システム |
| [スケジュール](docs/schedule.ja.md) | 14日間の開発計画とマイルストーン |
| [アセット](docs/assets.ja.md) | 3Dモデル・テクスチャ・オーディオ・PWAアセット計画 |

## Tech Stack

| Layer | Technology |
|---|---|
| Engine | [Babylon.js](https://www.babylonjs.com/) 7.x |
| Physics | [Havok](https://www.havok.com/) (WASM + SIMD) |
| Build | [Vite](https://vite.dev/) + TypeScript |
| Deploy | GitHub Pages / Cloudflare Pages |
| PWA | `manifest.json` + Service Worker (Workbox) |

## Development

```bash
cd code
vp install   # install dependencies
vp dev       # start dev server
vp build     # production build
vp test      # run tests
```

## License

See [LICENSE](LICENSE).
