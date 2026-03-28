'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, X, Globe, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/components/I18nProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
// @ts-ignore
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';

interface Suggestion {
  field: 'experience' | 'education' | 'skills' | 'targetRole' | 'profileType';
  proposedValue: string;
  confidence: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Suggestion[];
  isError?: boolean;
}

interface CVFormData {
  profileType?: string;
  targetRole?: string;
  education?: string;
  experience?: string;
  skills?: string;
  jobDescription?: string;
  [key: string]: unknown;
}

function resolveChatErrorMessage(response: Response, payload: any): string {
  const errorCode = payload?.error?.code;
  const errorMessage = payload?.error?.message;

  if (response.status === 401 || errorCode === 'UNAUTHORIZED') {
    return 'Session expired. Please sign in again.';
  }

  if (response.status === 429 || errorCode === 'RATE_LIMITED') {
    return 'AI chat limit reached. Please try again shortly.';
  }

  if (
    response.status === 502 ||
    response.status === 503 ||
    response.status === 504 ||
    errorCode === 'PROVIDER_ERROR' ||
    errorCode === 'PROVIDER_TIMEOUT' ||
    errorCode === 'NO_PROVIDER'
  ) {
    return 'AI assistant is temporarily unavailable. Please try again.';
  }

  return errorMessage || 'Assistant request failed.';
}

export interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  formData: Record<string, unknown>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

function useAIChat(step: number, formData: CVFormData, locale: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userText,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch('/api/wizard/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages
              .filter((message) => !message.isError)
              .map((message) => ({
                role: message.role,
                content: message.content,
              }))
              .concat({ role: 'user', content: userText }),
            step,
            formData,
            locale,
          }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(resolveChatErrorMessage(response, payload));
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: payload.message,
          suggestions: payload.suggestions || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: errorMessage,
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, isLoading, locale, messages, step]
  );

  return { messages, setMessages, isLoading, sendMessage };
}

export function AIChatSidebar({
  isOpen,
  onClose,
  step,
  formData,
  setFormData,
}: AIChatSidebarProps) {
  const { t, locale } = useTranslation();
  const [aiLanguage, setAiLanguage] = useState<string>(locale === 'tr' ? 'Turkish' : 'English');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, setMessages, isLoading, sendMessage } = useAIChat(step, formData, aiLanguage);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: String(
            t('wizard.aiWelcome') ||
              'Hi! I am your AI Assistant. Tell me about yourself and I will help you write a great CV. What is your current role or what are you studying?'
          ),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    await sendMessage(text);
  };

  const handleImport = (field: string, value: string) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      [field]: prev[field] ? `${String(prev[field])}\n\n${value}` : value,
    }));
    toast.success(t('wizard.importSuccess') || 'Successfully imported to form!', {
      icon: <Check className="h-4 w-4 text-green-500" />,
    });
  };

  return (
    <div
      className={`fixed top-[73px] right-0 z-40 flex h-[calc(100vh-73px)] w-80 flex-col border-l border-black/8 bg-white/72 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-transform duration-300 supports-[backdrop-filter]:bg-white/62 md:w-96 dark:border-white/10 dark:bg-black/60 dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)] dark:supports-[backdrop-filter]:bg-black/45 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col gap-3 border-b border-black/8 bg-black/[0.03] p-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/35">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-black/8 bg-white/72 p-2 text-zinc-950 dark:border-white/10 dark:bg-white/10 dark:text-white">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-bold whitespace-nowrap text-zinc-950 dark:text-white">
              {t('wizard.aiAssistant') || 'AI Assistant'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close AI sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-black/8 bg-white/68 p-2 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
          <Globe className="ml-1 h-4 w-4 text-zinc-500 dark:text-white/45" />
          <Select value={aiLanguage} onValueChange={setAiLanguage}>
            <SelectTrigger
              className="h-8 border-none bg-transparent px-2 py-0 text-zinc-900 shadow-none focus-visible:ring-0 dark:text-white"
              aria-label="Select AI response language"
            >
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Turkish">Turkce</SelectItem>
              <SelectItem value="German">Deutsch</SelectItem>
              <SelectItem value="French">Français</SelectItem>
              <SelectItem value="Spanish">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto scroll-smooth p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.content && (
              <div
                className={`max-w-[85%] rounded-2xl p-3 ${
                  msg.isError
                    ? 'flex items-start gap-2 border border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/10 dark:text-red-400'
                    : msg.role === 'user'
                      ? 'bg-zinc-950 text-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] dark:bg-white dark:text-black dark:shadow-[0_12px_40px_rgba(255,255,255,0.08)]'
                      : 'border border-black/8 bg-white/72 text-zinc-900 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_12px_40px_rgba(0,0,0,0.28)]'
                }`}
              >
                {msg.isError && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 overflow-hidden text-sm break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            )}

            {msg.suggestions?.map((suggestion, index) => (
              <div
                key={`${msg.id}-suggestion-${index}`}
                className="mt-2 ml-2 w-[85%] rounded-2xl border border-black/8 bg-white/72 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold text-zinc-600 dark:text-white/70">
                  <span>
                    {t('wizard.suggestedFor') || 'Suggested for'}: {suggestion.field}
                  </span>
                  <span>{Math.round(suggestion.confidence * 100)}%</span>
                </div>
                <div className="prose prose-sm dark:prose-invert mb-3 rounded-xl border border-black/8 bg-black/[0.03] p-3 text-xs text-zinc-600 italic dark:border-white/10 dark:bg-black/30 dark:text-white/60">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {suggestion.proposedValue}
                  </ReactMarkdown>
                </div>
                <Button
                  size="sm"
                  className="h-8 w-full rounded-full bg-zinc-950 text-xs font-semibold text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  onClick={() => handleImport(suggestion.field, suggestion.proposedValue)}
                >
                  {t('wizard.importToField') || 'Import to Form'}
                </Button>
              </div>
            ))}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 self-start rounded-2xl border border-black/8 bg-white/72 p-3 text-sm text-zinc-600 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('wizard.aiThinking') || 'AI is thinking...'}
          </div>
        )}

        <div ref={messagesEndRef} className="h-1 w-full shrink-0" />
      </div>

      <div className="border-t border-black/8 bg-black/[0.03] p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/35">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            id="ai-chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('wizard.chatPlaceholder') || 'Type a message...'}
            className="flex-1 rounded-2xl border-black/10 bg-white/82 text-zinc-950 placeholder:text-zinc-400 dark:border-white/10 dark:bg-black/35 dark:text-white dark:placeholder:text-white/28"
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isLoading}
            className="rounded-full bg-zinc-950 text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
