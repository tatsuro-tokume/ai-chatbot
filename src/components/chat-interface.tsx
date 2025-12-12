'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    content:
      'こんにちは！カスタマーサポートAIです。ご質問やお困りごとがございましたら、お気軽にお聞きください。',
    role: 'assistant',
    timestamp: new Date('2025-12-12T00:00:00'),
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground text-center mb-2">
            AIカスタマーサポートチャットボット
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            問い合わせ対応時間を80%削減するデモアプリ
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <Card className="m-4 flex-1 flex flex-col shadow-sm border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div>
                <h2 className="text-lg font-semibold text-foreground">AIカスタマーサポート</h2>
                <p className="text-sm text-muted-foreground mt-0.5">質問にお答えします</p>
              </div>
              <Badge
                variant="outline"
                className="bg-secondary text-secondary-foreground border-border"
              >
                デモモード
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex gap-4', message.role === 'user' && 'justify-end')}
                >
                  {message.role === 'assistant' && (
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        AI
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex flex-col gap-1.5',
                      message.role === 'user' ? 'items-end' : 'flex-1'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-lg px-4 py-3 max-w-2xl',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-card-foreground'
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground px-1">
                      {message.timestamp.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      AI
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="size-2 bg-muted-foreground rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border bg-card p-6">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="メッセージを入力..."
                  className="flex-1 h-11 bg-background border-border focus-visible:ring-primary text-base"
                />
                <Button
                  onClick={handleSend}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                  disabled={!input.trim()}
                >
                  <Send className="size-4 mr-2" />
                  送信
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                デモモード: サンプル応答を返します（API接続なし）
              </p>
            </div>
          </Card>

          <div className="px-4 pb-4">
            <p className="text-xs text-center text-muted-foreground">
              このデモは{' '}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub
              </a>{' '}
              で公開されています
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
