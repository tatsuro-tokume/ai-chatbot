import { kv } from '@vercel/kv';

/**
 * レート制限チェック
 * IPアドレスごとに1日あたりの利用回数を制限
 *
 * @param ip - ユーザーのIPアドレス
 * @returns 制限内であればtrue、超過していればfalse
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const limit = parseInt(process.env.RATE_LIMIT_PER_DAY || '50', 10);
    const key = `rate_limit:${ip}:${getToday()}`;

    // 現在のリクエスト数を取得
    const current = (await kv.get<number>(key)) || 0;

    if (current >= limit) {
      return false;
    }

    // カウントをインクリメント
    await kv.incr(key);

    // 24時間後に自動削除
    await kv.expire(key, 86400);

    return true;
  } catch (error) {
    console.error('レート制限チェックエラー:', error);
    // エラー時は制限しない（可用性優先）
    return true;
  }
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 残りリクエスト数を取得
 * @param ip - ユーザーのIPアドレス
 * @returns 残りリクエスト数
 */
export async function getRemainingRequests(ip: string): Promise<number> {
  try {
    const limit = parseInt(process.env.RATE_LIMIT_PER_DAY || '50', 10);
    const key = `rate_limit:${ip}:${getToday()}`;
    const current = (await kv.get<number>(key)) || 0;
    return Math.max(0, limit - current);
  } catch (error) {
    console.error('残りリクエスト数取得エラー:', error);
    return 0;
  }
}
