import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/openai';
import { checkRateLimit, getRemainingRequests } from '@/lib/rate-limiter';
import { getMockResponse } from '@/lib/mock-data';

/**
 * チャットAPI
 * POST /api/chat
 *
 * 3つのモード:
 * - mock: サンプルデータを返す（API課金なし）
 * - demo: 実際のAI応答（レート制限あり）
 * - production: 完全な機能（認証・DB連携）
 */
export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'メッセージが必要です', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // 環境変数から改行などを除去
    const demoMode = (process.env.DEMO_MODE || 'demo').trim();

    // Mockモード: サンプルデータを返す
    if (demoMode === 'mock') {
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      const mockResponse = getMockResponse(lastUserMessage?.content || '');

      return NextResponse.json({
        message: mockResponse,
        mode: 'mock',
        remainingRequests: null,
      });
    }

    // Demoモード: レート制限チェック
    if (demoMode === 'demo') {
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

      const isAllowed = await checkRateLimit(ip);

      if (!isAllowed) {
        return NextResponse.json(
          {
            error: '本日のリクエスト上限に達しました。明日再度お試しください。',
            code: 'RATE_LIMIT_EXCEEDED',
          },
          { status: 429 }
        );
      }

      const response = await generateChatResponse(messages);
      const remaining = await getRemainingRequests(ip);

      return NextResponse.json({
        message: response,
        mode: 'demo',
        remainingRequests: remaining,
      });
    }

    // Productionモード（将来実装）
    return NextResponse.json(
      { error: 'Productionモードは未実装です', code: 'NOT_IMPLEMENTED' },
      { status: 501 }
    );
  } catch (error) {
    console.error('チャットAPIエラー:', error);
    return NextResponse.json(
      {
        error: 'メッセージ送信に失敗しました',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
