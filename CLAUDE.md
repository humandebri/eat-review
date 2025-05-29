# eat-review プロジェクトルール

## 🎯 プロジェクト概要
- **名称**: eat-review (飲食店レビューdApp)
- **プラットフォーム**: Internet Computer Protocol (ICP)
- **言語**: 日本語対応

## 🛠 技術スタック
- **フロントエンド**: Next.js 15 + React 19 + TypeScript
- **スタイリング**: Tailwind CSS v4
- **バックエンド**: Rust (ICP Canister)
- **インフラ**: Juno Satellite
- **パッケージマネージャー**: pnpm

## 📋 開発ルール

### 1. コーディング規約
- **関数名**: わかりやすい日本語または英語の名前を使用
  - 良い例: `createReview()`, `fetchRestaurantData()`
  - 悪い例: `func1()`, `doStuff()`
- **変数名**: 意味が明確な名前を使用
- **TypeScript**: Strict modeを維持
- **コメント**: 日本語でOK

### 2. ファイル構成
```
src/
├── app/          # Next.js App Router
├── components/   # UIコンポーネント
└── satellite/    # Rust Canister実装
```

### 3. スタイリング
- Tailwind CSSクラスを使用
- カスタムフォント: JetBrains Mono
- レスポンシブデザイン必須

### 4. Git規約
- コミットメッセージ: 日本語OK
- ブランチ名: `feature/機能名` or `fix/バグ名`

### 5. テスト・品質管理
- TypeScript型チェック: `pnpm typecheck`
- Linter: `pnpm lint`
- フォーマット: `pnpm format`

### 6. Web3/ICP関連
- DFINITY SDKを使用したICP統合
- Juno CLIでのデプロイ
- 認証はWeb Workers経由

### 7. 開発コマンド
```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 型チェック
pnpm typecheck

# Linter実行
pnpm lint

# フォーマット
pnpm format

# Junoデプロイ
pnpm deploy
```

### 8. セキュリティ
- 環境変数は.env.localに保存
- シークレットキーは絶対にコミットしない
- ICP関連の認証情報は慎重に扱う

### 9. パフォーマンス
- 画像最適化を使用
- コード分割を適切に実装
- Web Vitalsを意識した開発

### 10. アクセシビリティ
- セマンティックHTMLを使用
- ARIA属性を適切に設定
- キーボードナビゲーション対応