# PHYSICS FACTORY — 技術アーキテクチャ

## 1. 技術スタック

```
┌──────────────────────────────────────────────────────┐
│                  ビルド & デプロイ                      │
│   Vite + TypeScript · GitHub Pages / Cloudflare       │
├──────────────────────────────────────────────────────┤
│                  ゲームエンジン層                       │
│           Babylon.js 7.x（ES Module）                 │
├───────────────────────┬──────────────────────────────┤
│      レンダリング       │          物理演算              │
│  PBR マテリアル        │  Havok Plugin（WASM+SIMD）    │
│  IBL / HDR 環境       │  PhysicsBody                  │
│  ポストプロセス:        │  PhysicsAggregate             │
│   Bloom, Vignette,    │  ConstraintMotor               │
│   SSAO               │  applyImpulse                  │
│  パーティクルシステム    │  Collision Filtering           │
├───────────────────────┴──────────────────────────────┤
│                     入力層                            │
│  PointerEvent 統合（マウス + タッチ）                   │
│  カメラ: ArcRotateCamera（ドラッグ / ピンチズーム）      │
├──────────────────────────────────────────────────────┤
│                  オーディオ層                          │
│   Babylon.js Sound + Web Audio API                   │
│   物理イベント駆動 SFX トリガー                         │
├──────────────────────────────────────────────────────┤
│                 パーシステンス層                        │
│   localStorage（セーブ状態 JSON）                      │
│   setInterval による自動セーブ（30秒ごと）               │
├──────────────────────────────────────────────────────┤
│                    PWA 層                             │
│   manifest.json + Service Worker（Workbox）           │
└──────────────────────────────────────────────────────┘
```

## 2. プロジェクト構成

```
physics-factory/
├── public/
│   ├── assets/
│   │   ├── models/          # GLTF/GLB（機械・工場フロア）
│   │   ├── textures/        # PBR テクスチャ（metallic/roughness）
│   │   ├── audio/
│   │   │   ├── sfx/         # クリック・ティック・アップグレード・プレステージ
│   │   │   └── bgm/         # レイヤードBGMのステム
│   │   ├── env/             # HDR 環境マップ（.env）
│   │   └── icons/           # PWA アイコン
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── main.ts              # エントリポイント
│   ├── core/
│   │   ├── Game.ts          # ライフサイクル: init → loop → dispose
│   │   ├── SceneManager.ts  # シーン切り替え（Title / Factory / Prestige）
│   │   └── SaveManager.ts   # localStorage 読み書き・自動セーブ
│   ├── physics/
│   │   ├── PhysicsSetup.ts  # Havok プラグイン初期化・重力設定
│   │   ├── MachineBody.ts   # ティアごとの PhysicsBody + メッシュ
│   │   └── ClickImpulse.ts  # クリック時 applyImpulse・衝突SFXフック
│   ├── factory/
│   │   ├── ResourceManager.ts  # コグ＆スチームプレッシャーのカウンター管理
│   │   ├── MachineRegistry.ts  # ティア定義（コスト・レート・メッシュID）
│   │   ├── ProductionLoop.ts   # setInterval / Babylon オブザーバーで自動ティック
│   │   └── PrestigeSystem.ts   # リセットロジック・ブループリント蓄積
│   ├── ui/
│   │   ├── TitleScreen.ts      # タイトル＋スタートボタン（Babylon GUI）
│   │   ├── HUD.ts              # リソースカウンター・生産レート表示
│   │   ├── BuyPanel.ts         # 機械一覧・コスト・購入ボタン
│   │   ├── MilestonePopup.ts   # マイルストーン/アンロック通知
│   │   └── TouchControls.ts    # モバイル用HUDボタン
│   ├── audio/
│   │   ├── AudioManager.ts     # SFX / BGM 管理
│   │   └── DynamicBGM.ts       # 機械数増加に応じたレイヤーフェード
│   └── utils/
│       ├── AssetLoader.ts      # GLTF + テクスチャプリロード
│       └── PerformanceMonitor.ts # FPS監視・LOD自動切替
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 3. 主要システム

### 3.1 物理インテグレーション

各機械ティアには視覚フィードバックのための `PhysicsBody` / `PhysicsAggregate` が紐付いています。

```
MachineRegistry エントリ
  ├── meshPath: string              // GLTF アセットパス
  ├── physicsShape: ShapeType       // Box | Sphere | Capsule | Mesh
  ├── mass: number                  // 0 = キネマティック（自動ティック機械）
  ├── clickImpulse: Vector3         // クリック時の方向と強度
  └── motorAngularVelocity?: number // ギア回転用
```

- **クリック機械（Tier 1）**: ダイナミックボディ、クリック時に `applyImpulse`。
- **自動機械（Tier 2以降）**: キネマティックボディ + `ConstraintMotor` で購入数に比例した速度で回転/移動。

### 3.2 生産ループ

```
ProductionLoop.ts
  ├── Babylon onBeforeRenderObservable（デルタ時間を累積）
  ├── 累積 Δt ≥ 1秒 → ResourceManager.tick()
  │     └── （レート × 台数 × 乗数）分のコグを加算
  └── 30秒ごと → SaveManager.save()
```

### 3.3 シーン切り替え

```
SceneManager
  ├── push(scene: IScene)   // 新しいシーンを有効化、前のシーンを一時停止
  ├── pop()                 // トップシーンを破棄、前のシーンを再開
  └── replace(scene)        // フル遷移（Title → Factory）
```

### 3.4 セーブデータ形式（localStorage）

```json
{
  "version": 1,
  "cogs": 12345.67,
  "steamPressure": 89.1,
  "machines": { "handCrank": 5, "steamPiston": 2, "gearArray": 0 },
  "blueprints": 3,
  "totalCogsEver": 1234567.89,
  "lastSaved": "2026-04-14T10:00:00Z"
}
```

## 4. レンダリングパイプライン

| ステージ | ツール | 備考 |
|---|---|---|
| 環境 | IBL（`.env` HDR） | スチームパンク鋳造所 HDRI |
| ベースマテリアル | `PBRMetallicRoughnessMaterial` | 金属部は metallic ≈ 0.9、roughness ≈ 0.3 |
| シャドウ | `ShadowGenerator`（PCF ソフト） | メインの平行光のみ |
| ポストプロセス | `DefaultRenderingPipeline` | Bloom（閾値 0.8）、Vignette、Chromatic Aberration |
| パーティクル | `ParticleSystem` | クリック時の火花・Tier 4 解放時の蒸気 |
| GUI | `AdvancedDynamicTexture`（フルスクリーン） | すべてのUIをキャンバス上にオーバーレイ |

## 5. パフォーマンス予算

| リソース | 上限 |
|---|---|
| アクティブ物理剛体 | ≤ 50個 |
| フレームあたりドローコール | ≤ 200 |
| パーティクル数（ピーク） | ≤ 500個 |
| JSヒープ（定常状態） | ≤ 150 MB |
| GLTF 合計サイズ | ≤ 8 MB（Draco 圧縮） |
| オーディオファイル合計 | ≤ 2 MB |
