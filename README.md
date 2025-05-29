# 🍽️ Eat Review - ICP上の飲食店レビューdApp

Internet Computer Protocol (ICP) 上で動作する分散型飲食店レビューアプリケーション。Junoを使用してデプロイされています。

## 🚀 機能

- 🏪 レストラン情報の登録・管理
- ⭐ レビュー投稿機能
- 📍 Google Maps統合による位置情報表示
- 📱 モバイル対応レスポンシブデザイン
- 🔒 ICP認証による安全なデータ管理

## 🛠 技術スタック

- **フロントエンド**: Next.js 15 + React 19 + TypeScript
- **スタイリング**: Tailwind CSS v4
- **バックエンド**: Rust (ICP Canister)
- **インフラ**: Juno Satellite
- **ブロックチェーン**: Internet Computer Protocol

## 📋 環境構築

### 前提条件

- Node.js 18以上
- pnpm
- Docker (ローカル開発用)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (オプション)

### セットアップ

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd eat-review
```

2. **依存関係のインストール**
```bash
pnpm install
```

3. **環境変数の設定**
```bash
cp .env.local.example .env.local
```

`.env.local`を編集してGoogle Maps APIキーを設定：
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Google Maps APIキーは[Google Cloud Console](https://console.cloud.google.com/)で取得できます。

### 開発サーバーの起動

```bash
# フロントエンド開発サーバー
pnpm dev

# ローカルJunoエミュレータ（要Docker）
juno dev start
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 🎯 使い方

### 初回セットアップ

1. `/setup`ページにアクセスしてコレクションを初期化
2. デモデータを追加（ヘッダーの「デモデータ追加」ボタン）

### レストラン登録

1. 「✨ レストランを追加」ボタンをクリック
2. 必要情報を入力
   - 店舗名、カテゴリー、住所
   - 位置情報（Google Mapsで右クリックして緯度・経度を取得）
   - 営業時間、電話番号など

### レビュー投稿

1. レストランカードをクリックして詳細ページへ
2. レビューを投稿（実装予定）

## 🚀 デプロイ

### Juno Satelliteへのデプロイ

```bash
# ビルド
pnpm build

# Junoにデプロイ
juno deploy
```

詳細は[Junoドキュメント](https://juno.build/docs/add-juno-to-an-app/create-a-satellite)を参照してください。

## 📁 プロジェクト構造

```
eat-review/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # UIコンポーネント
│   ├── services/         # データサービス層
│   ├── types/           # TypeScript型定義
│   ├── utils/           # ユーティリティ関数
│   └── satellite/       # Rust Canister実装
├── public/              # 静的ファイル
├── juno.config.mjs      # Juno設定
└── package.json
```

## 🧞 開発コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm lint` | ESLintチェック |
| `pnpm typecheck` | TypeScript型チェック |
| `pnpm format` | Prettierフォーマット |
| `juno deploy` | Junoにデプロイ |

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

[MIT License](LICENSE)

## 🔗 リンク

- [Juno](https://juno.build)
- [Internet Computer](https://internetcomputer.org)
- [Next.js](https://nextjs.org)