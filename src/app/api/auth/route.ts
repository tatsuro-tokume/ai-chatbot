import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 認証API
 * POST /api/auth
 *
 * Demoモード用のシンプルなパスワード認証
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'パスワードが必要です', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const demoMode = process.env.DEMO_MODE || 'mock';

    // Mockモード: 認証不要
    if (demoMode === 'mock') {
      return NextResponse.json({
        success: true,
        mode: 'mock',
        message: 'Mockモードでは認証は不要です',
      });
    }

    // Demoモード: パスワードチェック
    if (demoMode === 'demo') {
      const correctPassword = process.env.DEMO_PASSWORD;

      if (!correctPassword) {
        return NextResponse.json(
          { error: 'DEMO_PASSWORDが設定されていません', code: 'CONFIG_ERROR' },
          { status: 500 }
        );
      }

      if (password !== correctPassword) {
        return NextResponse.json(
          { error: 'パスワードが正しくありません', code: 'INVALID_PASSWORD' },
          { status: 401 }
        );
      }

      // クッキーに認証トークンをセット（24時間有効）
      const cookieStore = await cookies();
      cookieStore.set('demo_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400, // 24時間
        sameSite: 'lax',
      });

      return NextResponse.json({
        success: true,
        mode: 'demo',
        message: '認証に成功しました',
      });
    }

    // Productionモード（将来実装）
    return NextResponse.json(
      { error: 'Productionモードは未実装です', code: 'NOT_IMPLEMENTED' },
      { status: 501 }
    );
  } catch (error) {
    console.error('認証APIエラー:', error);
    return NextResponse.json(
      {
        error: '認証に失敗しました',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

/**
 * 認証状態確認
 * GET /api/auth
 */
export async function GET() {
  try {
    const demoMode = process.env.DEMO_MODE || 'mock';

    // Mockモード: 常に認証済み
    if (demoMode === 'mock') {
      return NextResponse.json({
        authenticated: true,
        mode: 'mock',
      });
    }

    // Demoモード: クッキーチェック
    if (demoMode === 'demo') {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('demo_auth');

      return NextResponse.json({
        authenticated: authCookie?.value === 'authenticated',
        mode: 'demo',
      });
    }

    return NextResponse.json({
      authenticated: false,
      mode: demoMode,
    });
  } catch (error) {
    console.error('認証状態確認エラー:', error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : '不明なエラー',
    });
  }
}
