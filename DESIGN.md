# AIカスタマーサポートチャットボット - 設計書

## 📋 目次

1. [概要](#概要)
2. [機能要件](#機能要件)
3. [非機能要件](#非機能要件)
4. [技術スタック](#技術スタック)
5. [アーキテクチャ](#アーキテクチャ)
6. [3モード設計](#3モード設計)
7. [API仕様](#api仕様)
8. [データモデル](#データモデル)
9. [セキュリティ](#セキュリティ)
10. [デプロイ戦略](#デプロイ戦略)

---

## 概要

### 目的
カスタマーサポート業務の自動化を実現するAIチャットボットのデモアプリケーション。
営業活動において、実際に動くプロダクトを提示することで技術力を証明する。

### ターゲット
- 中小企業（カスタマーサポート業務がある全企業）
- ECサイト運営企業
- SaaS企業
- BtoB企業

### 価値提案
- カスタマーサポート時間を80%削減
- 年間200万円のコスト削減
- 24時間365日対応
- ヒューマンエラーゼロ

---

## 機能要件

### 必須機能（MVP）

#### 1. チャット機能
- ユーザーがテキストメッセージを入力
- AIが自然な日本語で応答
- 会話履歴の表示
- リアルタイム応答（ストリーミング対応）

#### 2. FAQ対応
- よくある質問への自動応答
- 営業時間、返品方法、送料などの基本情報
- カテゴリ別の質問対応

#### 3. 3つのモード
- **Mockモード**: API課金なし、デモ用の事前定義応答
- **Demoモード**: 本物のAI、パスワード保護、レート制限
- **Productionモード**: 完全な認証、顧客用

#### 4. 認証機能（Demoモード）
- シンプルなパスワード認証
- Cookie/LocalStorageでセッション管理
- 初回アクセス時のみパスワード入力

#### 5. レート制限（Demoモード）
- 1日50回までの利用制限
- IPアドレスベースまたはCookieベース
- 制限超過時のエラー表示

### オプション機能（将来拡張）
- 会話履歴の保存
- ユーザー満足度評価
- 管理画面（FAQ編集、統計表示）
- 多言語対応
- ファイルアップロード（画像による問い合わせ）

---

## 非機能要件

### パフォーマンス
- 初回レスポンス: 2秒以内
- ストリーミングレスポンス: 100ms以内に開始
- ページ読み込み: 1秒以内（Lighthouse 90点以上）

### セキュリティ
- API Keyの環境変数管理（絶対にコミットしない）
- レート制限によるコスト管理
- XSS対策（入力のサニタイズ）
- CSRF対策（Next.jsのデフォルト機能）

### スケーラビリティ
- Vercelのオートスケーリング
- Serverless Functions（API Routes）
- エッジキャッシング

### 可用性
- Vercel 99.99% SLA
- エラーハンドリング（APIエラー時のフォールバック）

### 保守性
- TypeScript厳格モード
- ESLint + Prettier
- コメントは日本語
- 設計書の充実

---

## 技術スタック

### フロントエンド
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **State Management**: React Hooks (useState, useContext)
- **Form Handling**: React Hook Form + Zod

### バックエンド
- **Runtime**: Next.js API Routes (Serverless Functions)
- **AI**: OpenAI GPT-4o
- **KV Store**: Vercel KV (Redis互換) - レート制限用

### インフラ
- **Hosting**: Vercel
- **DNS**: Vercel提供ドメイン
- **Analytics**: Vercel Analytics

### 開発ツール
- **Package Manager**: pnpm
- **Linter**: ESLint
- **Formatter**: Prettier
- **Pre-commit**: Husky + lint-staged
- **Task Runner**: Makefile

---

## アーキテクチャ

### システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel Edge                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   Browser    │────────▶│  Next.js App │                │
│  │  (Client)    │◀────────│  (SSR/SSG)   │                │
│  └──────────────┘         └──────────────┘                │
│                                 │                           │
│                                 │                           │
│                                 ▼                           │
│                      ┌──────────────────┐                  │
│                      │  Middleware      │                  │
│                      │  - 認証チェック   │                  │
│                      │  - モード判定     │                  │
│                      └──────────────────┘                  │
│                                 │                           │
│                    ┌────────────┼────────────┐            │
│                    │            │            │            │
│                    ▼            ▼            ▼            │
│           ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│           │ Page     │  │ API      │  │ Auth     │      │
│           │ Routes   │  │ Routes   │  │ API      │      │
│           └──────────┘  └──────────┘  └──────────┘      │
│                              │                            │
│                              │                            │
│                    ┌─────────┼─────────┐                │
│                    │         │         │                │
│                    ▼         ▼         ▼                │
│              ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│              │ Mock AI │ │ OpenAI  │ │ Vercel  │       │
│              │ Client  │ │ API     │ │ KV      │       │
│              └─────────┘ └─────────┘ └─────────┘       │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### データフロー

#### 1. Mockモード
```
User Input
  ↓
チャット画面 (app/page.tsx)
  ↓
API Route (app/api/chat/route.ts)
  ↓
モード判定 (DEMO_MODE === 'mock')
  ↓
Mock AI Client (lib/mock-responses.ts)
  ↓
事前定義の応答を返す
  ↓
チャット画面に表示
```

#### 2. Demoモード
```
User Input
  ↓
Middleware (middleware.ts) → 認証チェック
  ↓
チャット画面 (app/page.tsx)
  ↓
API Route (app/api/chat/route.ts)
  ↓
レート制限チェック (lib/rate-limiter.ts) → Vercel KV
  ↓
モード判定 (DEMO_MODE === 'demo')
  ↓
OpenAI API Client (lib/openai.ts)
  ↓
OpenAI GPT-4o に送信
  ↓
ストリーミングレスポンス
  ↓
チャット画面に逐次表示
```

---

## 3モード設計

### Mode 1: Mock（営業初期段階）

**目的**: 誰でも触れるデモ、API課金リスクゼロ

**特徴**:
- ✅ 認証なし
- ✅ モックAI（事前定義の応答）
- ✅ レート制限なし
- ✅ API課金ゼロ

**環境変数**:
```env
DEMO_MODE=mock
```

**実装**:
```typescript
// lib/ai-client.ts
export async function getChatResponse(message: string): Promise<string> {
  if (process.env.DEMO_MODE === 'mock') {
    // モック応答を返す
    return getMockResponse(message);
  }
  // ...
}

// lib/mock-responses.ts
const MOCK_RESPONSES: Record<string, string> = {
  営業時間: '平日9:00-18:00、土日祝日は休業です',
  返品: '購入後30日以内であれば返品可能です',
  送料: '全国一律550円、5,000円以上で送料無料です',
};

export function getMockResponse(message: string): string {
  // キーワードマッチング
  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (message.includes(keyword)) {
      return response;
    }
  }
  return '申し訳ございません。担当者が確認いたします';
}
```

**Vercelデプロイ**:
- Preview環境に設定
- URL: `https://ai-chatbot-git-main-tatsuro-tokume.vercel.app`

---

### Mode 2: Demo（本営業段階）

**目的**: 実際のAIを見せる、コスト管理

**特徴**:
- ✅ 簡易認証（パスワード）
- ✅ 本物のAI（OpenAI GPT-4o）
- ✅ レート制限（50回/日）
- ✅ コスト管理

**環境変数**:
```env
DEMO_MODE=demo
DEMO_PASSWORD=your-secure-password-123
OPENAI_API_KEY=sk-xxx
RATE_LIMIT_PER_DAY=50
```

**実装**:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Demoモードの場合のみ認証チェック
  if (process.env.DEMO_MODE === 'demo') {
    const password = request.cookies.get('demo_password')?.value;
    
    // パスワードが一致しない場合は認証ページへリダイレクト
    if (password !== process.env.DEMO_PASSWORD) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!auth|api|_next/static|_next/image|favicon.ico).*)'],
};
```

```typescript
// lib/rate-limiter.ts
import { kv } from '@vercel/kv';

/**
 * レート制限チェック
 * @param identifier - IP アドレスまたはCookie ID
 * @returns 制限内ならtrue、超過ならfalse
 */
export async function checkRateLimit(identifier: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `rate_limit:${identifier}:${today}`;
  
  // カウントをインクリメント
  const count = await kv.incr(key);
  
  // 初回の場合は有効期限を24時間に設定
  if (count === 1) {
    await kv.expire(key, 86400); // 24時間
  }
  
  const limit = parseInt(process.env.RATE_LIMIT_PER_DAY || '50', 10);
  return count <= limit;
}

/**
 * 現在の使用回数を取得
 */
export async function getRateLimitCount(identifier: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const key = `rate_limit:${identifier}:${today}`;
  const count = await kv.get<number>(key);
  return count || 0;
}
```

```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * OpenAI APIを使用してチャット応答を取得
 * @param message - ユーザーのメッセージ
 * @returns AI の応答テキスト
 */
export async function getChatResponseFromOpenAI(
  message: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `あなたはカスタマーサポート担当AIです。
丁寧で親切な対応を心がけてください。
以下の情報をもとに回答してください：

【営業時間】平日9:00-18:00、土日祝日は休業
【返品ポリシー】購入後30日以内、未使用品のみ
【送料】全国一律550円、5,000円以上で送料無料
【支払い方法】クレジットカード、銀行振込、代引き`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API エラー:', error);
    throw new Error('AIの応答取得に失敗しました');
  }
}
```

**Vercelデプロイ**:
- Production環境に設定
- URL: `https://ai-chatbot.vercel.app`
- 環境変数を設定

---

### Mode 3: Production（受注後）

**目的**: 実際の納品物

**特徴**:
- ✅ 完全な認証（NextAuth.js等）
- ✅ データベース連携
- ✅ ユーザー管理
- ✅ 会話履歴保存

**環境変数**:
```env
DEMO_MODE=production
AUTH_SECRET=xxx
DATABASE_URL=xxx
OPENAI_API_KEY=sk-xxx
```

**実装**: 案件ごとにカスタマイズ

---

## API仕様

### POST /api/chat

チャットメッセージを送信し、AI応答を取得

**Request**:
```typescript
{
  message: string;  // ユーザーのメッセージ
}
```

**Response**:
```typescript
{
  response: string;  // AIの応答
  mode: 'mock' | 'demo' | 'production';  // 現在のモード
  rateLimitRemaining?: number;  // 残り利用可能回数（demoモードのみ）
}
```

**エラー**:
```typescript
{
  error: string;  // エラーメッセージ
  code: 'RATE_LIMIT_EXCEEDED' | 'API_ERROR' | 'INVALID_REQUEST';
}
```

**実装例**:
```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/ai-client';
import { checkRateLimit, getRateLimitCount } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // バリデーション
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'メッセージが必要です', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Demoモードの場合はレート制限チェック
    if (process.env.DEMO_MODE === 'demo') {
      const ip = request.ip || 'unknown';
      const isAllowed = await checkRateLimit(ip);

      if (!isAllowed) {
        return NextResponse.json(
          {
            error: '本日の利用上限に達しました。明日再度お試しください',
            code: 'RATE_LIMIT_EXCEEDED',
          },
          { status: 429 }
        );
      }
    }

    // AI応答を取得
    const response = await getChatResponse(message);

    // レスポンス
    const result: any = {
      response,
      mode: process.env.DEMO_MODE || 'mock',
    };

    // Demoモードの場合は残り回数を返す
    if (process.env.DEMO_MODE === 'demo') {
      const ip = request.ip || 'unknown';
      const count = await getRateLimitCount(ip);
      const limit = parseInt(process.env.RATE_LIMIT_PER_DAY || '50', 10);
      result.rateLimitRemaining = limit - count;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('チャットAPIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', code: 'API_ERROR' },
      { status: 500 }
    );
  }
}
```

---

### POST /api/auth

Demoモード用の認証

**Request**:
```typescript
{
  password: string;  // パスワード
}
```

**Response**:
```typescript
{
  success: boolean;
}
```

**実装例**:
```typescript
// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === process.env.DEMO_PASSWORD) {
    const response = NextResponse.json({ success: true });
    
    // Cookieにパスワードを保存（7日間）
    response.cookies.set('demo_password', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7日
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
```

---

## データモデル

### Vercel KV（Redis）

#### レート制限
```
Key: rate_limit:{identifier}:{YYYY-MM-DD}
Value: number (カウント)
TTL: 86400秒（24時間）

例:
rate_limit:192.168.1.1:2025-12-12 = 25
```

---

## セキュリティ

### 1. API Key管理
- `.env.local` で管理（絶対にコミットしない）
- Vercelの環境変数で設定
- `.env.example` のみコミット

### 2. レート制限
- IP アドレスベース
- 1日50回まで
- Vercel KV で管理

### 3. 認証
- Demoモード: 簡易パスワード（Cookie）
- Productionモード: NextAuth.js等

### 4. XSS対策
- ユーザー入力のサニタイズ
- React の自動エスケープ

### 5. CSRF対策
- Next.js のデフォルト機能

---

## デプロイ戦略

### Vercel設定

#### Preview環境（Mockモード）
```env
DEMO_MODE=mock
```

- 全ブランチのプッシュで自動デプロイ
- URL: `https://ai-chatbot-git-{branch}.vercel.app`

#### Production環境（Demoモード）
```env
DEMO_MODE=demo
DEMO_PASSWORD=your-secure-password
OPENAI_API_KEY=sk-xxx
RATE_LIMIT_PER_DAY=50
```

- `main` ブランチのマージで自動デプロイ
- URL: `https://ai-chatbot.vercel.app`

---

## 開発ワークフロー

### ローカル開発
```bash
# インストール
make install

# 開発サーバー起動（mockモード）
make dev

# Demoモードでテスト
DEMO_MODE=demo DEMO_PASSWORD=test123 OPENAI_API_KEY=sk-xxx make dev
```

### コミット
```bash
# pre-commitフックが自動実行
# - ESLint
# - Prettier
# - TypeScript type check

git add .
git commit -m "feat: チャット機能を追加"
```

### デプロイ
```bash
# 自動デプロイ（Vercel）
git push origin main
```

---

## 今後の拡張案

1. **会話履歴の保存**（Vercel Postgres）
2. **ユーザー満足度評価**（👍/👎）
3. **管理画面**（FAQ編集、統計表示）
4. **多言語対応**（i18n）
5. **音声入力対応**（Web Speech API）
6. **画像認識**（GPT-4o Vision）
7. **Slack/LINE連携**

---

## 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
