import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/openai';
import { checkRateLimit, getRemainingRequests } from '@/lib/rate-limiter';
import { getMockResponse } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  console.log('[LOG-1] API /api/chat called');

  try {
    console.log('[LOG-2] Parsing request body');
    const { messages } = await request.json();
    console.log('[LOG-3] Request body parsed, messages count:', messages?.length);

    if (!messages || !Array.isArray(messages)) {
      console.log('[LOG-4] Invalid messages, returning 400');
      return NextResponse.json(
        { error: 'メッセージが必要です', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const demoMode = (process.env.DEMO_MODE || 'demo').trim();
    console.log('[LOG-5] DEMO_MODE:', {
      raw: process.env.DEMO_MODE,
      demoMode,
      type: typeof demoMode,
      strictEqual_mock: demoMode === 'mock',
      strictEqual_demo: demoMode === 'demo',
      strictEqual_production: demoMode === 'production',
    });

    if (demoMode === 'mock') {
      console.log('[LOG-6] Entering MOCK mode block');
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      const mockResponse = getMockResponse(lastUserMessage?.content || '');
      console.log('[LOG-7] Mock response generated, returning');

      return NextResponse.json({
        message: mockResponse,
        mode: 'mock',
        remainingRequests: null,
      });
    }

    console.log('[LOG-8] Not mock mode, checking demo mode');

    if (demoMode === 'demo') {
      console.log('[LOG-9] Entering DEMO mode block');

      try {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
        console.log('[LOG-10] IP address:', ip);

        console.log('[LOG-11] Calling checkRateLimit');
        const isAllowed = await checkRateLimit(ip);
        console.log('[LOG-12] Rate limit result:', isAllowed);

        if (!isAllowed) {
          console.log('[LOG-13] Rate limit exceeded, returning 429');
          return NextResponse.json(
            {
              error: '本日のリクエスト上限に達しました。明日再度お試しください。',
              code: 'RATE_LIMIT_EXCEEDED',
            },
            { status: 429 }
          );
        }

        console.log('[LOG-14] Calling generateChatResponse');
        const response = await generateChatResponse(messages);
        console.log('[LOG-15] AI response generated:', response?.substring(0, 50));

        console.log('[LOG-16] Getting remaining requests');
        const remaining = await getRemainingRequests(ip);
        console.log('[LOG-17] Remaining requests:', remaining);

        console.log('[LOG-18] Returning demo mode response');
        return NextResponse.json({
          message: response,
          mode: 'demo',
          remainingRequests: remaining,
        });
      } catch (demoError) {
        console.error('[ERROR-DEMO] Error in demo mode block:', demoError);
        console.error('[ERROR-DEMO] Error details:', {
          message: demoError instanceof Error ? demoError.message : 'Unknown',
          stack: demoError instanceof Error ? demoError.stack : 'No stack',
          name: demoError instanceof Error ? demoError.name : 'Unknown',
        });
        throw demoError;
      }
    }

    console.log('[LOG-19] Not demo mode, falling through to production error');
    console.log('[LOG-20] Returning production not implemented');
    return NextResponse.json(
      { error: 'Productionモードは未実装です', code: 'NOT_IMPLEMENTED' },
      { status: 501 }
    );
  } catch (error) {
    console.error('[ERROR-MAIN] チャットAPIエラー:', error);
    console.error('[ERROR-MAIN] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack',
      name: error instanceof Error ? error.name : 'Unknown',
      type: typeof error,
    });
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
