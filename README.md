# 🏌️ ゴルフコンペアプリ

リアルタイムでスコアを共有・管理するゴルフコンペ専用アプリケーションです。

## ✨ 機能

### 👥 プレイヤー管理
- 組の作成・削除（4人組）
- プレイヤーの追加・削除
- 統計情報表示（組数、プレイヤー数、満員の組、空き枠）

### 🏌️ 18ホールスコア入力
- 各ホールのスコア入力
- パー設定（一般的なゴルフコース）
- スコア確定・リセット機能
- 進捗状況表示
- 組別プレイヤー表示

### 📊 ランキング表示
- リアルタイムランキング
- オリンピック形式（ネットスコア）計算
- グロススコアランキング
- 組別ランキング
- 組別統計情報
- 詳細スコア表示

### 🔗 データ共有
- ローカルストレージ（オフライン対応）
- Supabase連携（リアルタイム共有）
- 複数デバイス間での同期

## 🚀 技術スタック

- **フロントエンド**: Next.js 15.4.6, React, TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel
- **状態管理**: React Hooks (useState, useEffect)

## 📦 インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## ⚙️ 環境変数設定

Supabaseを使用する場合は、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 使用方法

### 1. プレイヤー登録
1. 「プレイヤー管理」セクションで組を作成
2. 各組にプレイヤーを追加（最大4人）

### 2. スコア入力
1. 「スコア入力」セクションでホールを選択
2. 各プレイヤーのスコアを入力
3. 「スコア確定」ボタンで保存

### 3. ランキング確認
1. 「ランキング」セクションでリアルタイムランキングを確認
2. ランキングタイプを変更して表示を切り替え

## 📱 レスポンシブ対応

- デスクトップ、タブレット、スマートフォンに対応
- モバイルファーストデザイン

## 🔄 データ同期

- **ローカルモード**: ローカルストレージを使用（オフライン対応）
- **リアルタイムモード**: Supabaseを使用（複数デバイス間で同期）

## 🚀 デプロイ

### Vercelでのデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. 自動デプロイが実行されます

### 手動デプロイ

```bash
# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 📊 プロジェクト構造

```
src/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx           # メインページ
│   └── globals.css        # グローバルスタイル
├── components/
│   ├── PlayerManager.tsx  # プレイヤー管理
│   ├── ScoreInput.tsx     # スコア入力
│   └── RankingDisplay.tsx # ランキング表示
├── types/
│   └── index.ts          # 型定義
├── utils/
│   ├── localStorage.ts   # ローカルストレージ
│   └── supabase.ts      # Supabase連携
└── lib/
    └── supabase.ts      # Supabaseクライアント
```

## 🎨 カスタマイズ

### パー設定の変更

`src/components/ScoreInput.tsx`の`HOLE_PARS`配列を編集：

```typescript
const HOLE_PARS = [4, 4, 3, 4, 5, 4, 3, 4, 4, 4, 3, 4, 5, 4, 3, 4, 4, 4];
```

### スタイルの変更

Tailwind CSSクラスを編集してデザインをカスタマイズできます。

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 サポート

問題や質問がある場合は、GitHubのIssuesでお知らせください。

---

**開発者**: AI Assistant  
**バージョン**: 1.0.0  
**最終更新**: 2024年12月
