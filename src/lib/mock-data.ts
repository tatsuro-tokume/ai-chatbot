/**
 * モックデータ
 * Mockモードで使用する事前定義の質問と回答
 */

export interface MockMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * FAQ用のモックデータ
 */
export const MOCK_FAQ = {
  営業時間: {
    question: '営業時間を教えてください',
    answer:
      '弊社の営業時間は平日9:00-18:00です。土日祝日は休業となっております。お問い合わせは24時間受け付けておりますが、回答は営業時間内となります。',
  },
  返品: {
    question: '返品はできますか？',
    answer:
      'ご購入後14日以内であれば返品可能です。商品が未開封・未使用の状態であることが条件となります。返品をご希望の場合は、まずカスタマーサポートまでご連絡ください。',
  },
  送料: {
    question: '送料はいくらですか？',
    answer:
      '全国一律500円です。ただし、5,000円以上のご購入で送料無料となります。お急ぎの場合は速達便（+1,000円）もご利用いただけます。',
  },
  支払い: {
    question: '支払い方法は何がありますか？',
    answer:
      'クレジットカード（Visa、Mastercard、JCB、AmEx）、銀行振込、代金引換、コンビニ決済がご利用いただけます。クレジットカード決済が最も早く発送可能です。',
  },
  会員登録: {
    question: '会員登録は必要ですか？',
    answer:
      '会員登録なしでもご購入いただけますが、会員登録をしていただくとポイントが貯まり、次回以降のお買い物でご利用いただけます。また、購入履歴の確認も簡単になります。',
  },
};

/**
 * キーワードマッチングで適切な回答を返す
 * @param userMessage - ユーザーのメッセージ
 * @returns マッチした回答、なければデフォルト回答
 */
export function getMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  // キーワードマッチング
  if (message.includes('営業時間') || message.includes('何時')) {
    return MOCK_FAQ['営業時間'].answer;
  }
  if (message.includes('返品') || message.includes('キャンセル')) {
    return MOCK_FAQ['返品'].answer;
  }
  if (message.includes('送料') || message.includes('配送')) {
    return MOCK_FAQ['送料'].answer;
  }
  if (message.includes('支払') || message.includes('決済') || message.includes('カード')) {
    return MOCK_FAQ['支払い'].answer;
  }
  if (message.includes('会員') || message.includes('登録') || message.includes('アカウント')) {
    return MOCK_FAQ['会員登録'].answer;
  }

  // デフォルト回答
  return 'ご質問ありがとうございます。詳しくはカスタマーサポート（support@example.com）までお問い合わせください。よくある質問: 営業時間、返品、送料、支払い方法、会員登録';
}

/**
 * サンプル会話履歴（デモ用）
 */
export const SAMPLE_CONVERSATION: MockMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      'こんにちは！カスタマーサポートAIです。ご質問やお困りごとがございましたら、お気軽にお聞きください。',
    timestamp: new Date(Date.now() - 60000),
  },
];
