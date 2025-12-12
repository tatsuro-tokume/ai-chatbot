import OpenAI from 'openai';

// OpenAI クライアントの初期化（遅延初期化でMockモードでもエラーを防ぐ）
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY が設定されていません');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * OpenAI GPT-4oを使用してチャット応答を生成
 *
 * @param messages - 会話履歴
 * @returns AI応答
 */
export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): Promise<string> {
  try {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `あなたはカスタマーサポートAIです。
以下のガイドラインに従って回答してください：

1. 丁寧で親切な対応を心がける
2. 質問に対して正確かつ簡潔に回答する
3. 不明な点があれば人間のサポートスタッフへの連絡を勧める
4. 営業時間: 平日9:00-18:00
5. 返品: 購入後14日以内、未開封・未使用に限る
6. 送料: 全国一律500円、5,000円以上で送料無料
7. 支払い: クレジットカード、銀行振込、代金引換、コンビニ決済

できる限り具体的で有用な情報を提供してください。`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'すみません、応答生成に失敗しました。';
  } catch (error) {
    console.error('OpenAI APIエラー:', error);
    throw new Error('AI応答の生成に失敗しました。しばらく経ってから再度お試しください。');
  }
}
