# AI問い合わせ対応チャットボット

**カスタマーサポート時間を80%削減するデモアプリ**

![Demo](https://via.placeholder.com/800x400?text=AI+Chatbot+Demo)

## 🎯 価値提案

### 課題

- 問い合わせ対応に月間100時間以上かかっている
- よくある質問に毎回同じ回答を繰り返している
- 休日・夜間の問い合わせに対応できない
- カスタマーサポート人件費が高い

### 解決策

このAIチャットボットを導入すると:

- ✅ **よくある質問の80%を自動対応**
- ✅ **対応時間: 月100時間 → 20時間（▲80%）**
- ✅ **24時間365日対応可能**
- ✅ **人件費削減: 年間240万円**

### ROI試算

| 項目                  | 現状      | 導入後   | 削減効果       |
| --------------------- | --------- | -------- | -------------- |
| 月間問い合わせ数      | 200件     | 200件    | -              |
| 1件あたり対応時間     | 30分      | 6分      | ▲80%           |
| 月間対応時間          | 100時間   | 20時間   | **▲80時間**    |
| 人件費（時給2,000円） | 20万円/月 | 4万円/月 | **▲16万円/月** |
| **年間削減効果**      | -         | -        | **▲192万円**   |

**投資回収期間: 約8ヶ月**

---

## 🚀 デモサイト

**Live Demo:** https://ai-chatbot-demo.vercel.app

### デモモード

- パスワード不要
- サンプル応答を返します（API課金なし）
- 動作確認用

### 試してみる質問

```
- 営業時間は？
- 返品方法を教えてください
- 送料はいくらですか？
- 支払い方法は？
```

---

## 📦 機能

### 実装済み

- ✅ チャットUI（法人向けデザイン）
- ✅ OpenAI API連携（GPT-4o）
- ✅ 3モード対応（mock/demo/production）
- ✅ レート制限（Demo: 50回/日）
- ✅ エラーハンドリング
- ✅ レスポンシブデザイン

### 拡張可能な機能

- 📝 FAQ学習機能
- 📝 RAG（社内ドキュメント検索）
- 📝 会話履歴保存
- 📝 分析ダッシュボード
- 📝 Slack/Teams連携

---

## 🛠️ 技術スタック

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui
- **AI:** OpenAI API (GPT-4o)
- **Rate Limiting:** Vercel KV
- **Storage:** Vercel Blob
- **Deploy:** Vercel
- **Code Quality:** Husky, lint-staged, Prettier, ESLint

---

## 📖 セットアップ

### 前提条件

- Node.js 20+
- pnpm 10+
- OpenAI APIキー（productionモード時のみ）
- Vercel KV（demoモード時のみ）

### インストール

```bash
# リポジトリクローン
git clone https://github.com/yourusername/ai-chatbot.git
cd ai-chatbot

# 依存関係インストール
pnpm install

# 環境変数設定
cp .env.example .env.local
```

### 環境変数

```env
# 動作モード（必須）
# mock: サンプル応答のみ（API不要）
# demo: レート制限あり（Vercel KV必要）
# production: 本番環境（OpenAI API必要）
DEMO_MODE=mock

# OpenAI API（productionモード時のみ）
OPENAI_API_KEY=sk-...

# Vercel KV（demo/productionモード時のみ）
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### 開発サーバー起動

```bash
# mockモード（APIキー不要）
pnpm dev

# ブラウザで開く
open http://localhost:3000
```

### ビルド

```bash
pnpm build
```

### 本番起動

```bash
pnpm start
```

---

## 🚀 デプロイ（Vercel）

### 1. Vercelプロジェクト作成

```bash
# Vercel CLIインストール（未インストールの場合）
npm i -g vercel

# デプロイ
vercel
```

### 2. 環境変数設定

Vercel Dashboard → Settings → Environment Variables

```
DEMO_MODE=demo
OPENAI_API_KEY=sk-...
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### 3. 再デプロイ

```bash
vercel --prod
```

---

## 📁 プロジェクト構造

```
ai-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # モード確認API
│   │   │   │   └── route.ts
│   │   │   └── chat/         # チャットAPI
│   │   │       └── route.ts
│   │   ├── globals.css       # Tailwind CSS v4
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/               # shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── badge.tsx
│   │   └── chat-interface.tsx # メインUI
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/
│       ├── mock-data.ts      # Mockレスポンス
│       ├── openai.ts         # OpenAI API
│       ├── rate-limiter.ts   # レート制限
│       └── utils.ts
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 テスト

### 手動テスト

1. **Mockモード確認**

   ```bash
   # .env.local
   DEMO_MODE=mock

   pnpm dev
   # → メッセージ送信 → サンプル応答が返る
   ```

2. **APIエンドポイント確認**
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"営業時間は？"}]}'
   ```

---

## 💼 営業資料

### エレベーターピッチ（30秒）

「御社では問い合わせ対応に月間何時間かかっていますか？

このAIチャットボットを導入すると、よくある質問の80%を自動対応できます。

月間100時間の対応が20時間に削減でき、年間192万円のコスト削減です。

デモをご覧いただけますか？」

### 導入効果（1分）

**Before:**

- 月間200件の問い合わせに手動対応
- 1件30分 × 200件 = 100時間/月
- 人件費: 20万円/月、240万円/年
- 休日・夜間は対応不可

**After:**

- AIが80%自動対応（160件）
- 残り40件のみ人間が対応
- 対応時間: 20時間/月（▲80%）
- 人件費: 4万円/月、48万円/年（▲192万円）
- 24時間365日対応可能

**ROI:**

- 初期費用: 150万円
- 年間削減: 192万円
- 投資回収: 約8ヶ月

---

## 🤝 カスタマイズ・受託開発

このデモアプリをベースに、御社専用のチャットボットを開発します。

### カスタマイズ例

- ✅ 御社のFAQデータを学習
- ✅ 社内ドキュメント検索（RAG）
- ✅ Salesforce/kintone連携
- ✅ Slack/Teams通知
- ✅ 会話履歴分析ダッシュボード
- ✅ 多言語対応

### お問い合わせ

**個人受託開発受付中**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- X (Twitter): [@yourhandle](https://x.com/yourhandle)

---

## 📄 ライセンス

MIT License

---

## 🙏 謝辞

- [OpenAI](https://openai.com/) - GPT-4o API
- [Vercel](https://vercel.com/) - Hosting & KV
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [v0.dev](https://v0.dev/) - UI Design

---

**作成日:** 2025/12/12  
**最終更新:** 2025/12/12
