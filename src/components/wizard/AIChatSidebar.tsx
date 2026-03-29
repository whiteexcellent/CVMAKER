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
import { motion, AnimatePresence } from 'framer-motion';

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
  }, [messages, isLoading, isOpen]); // Also scroll when opening

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-50 flex h-[600px] max-h-[85vh] w-[360px] flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 shadow-[0_32px_80px_rgba(249,115,22,0.15)] backdrop-blur-3xl sm:w-[400px] dark:border-white/10 dark:bg-black/60 dark:shadow-[0_32px_80px_rgba(34,197,94,0.1)]"
        >
          {/* Header */}
          <div className="relative flex flex-col gap-1 border-b border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-green-500/10 opacity-50" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-green-500 text-white shadow-sm">
                    <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 dark:text-white">
                    {t('wizard.aiAssistant') || 'AI Assistant'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-green-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-current"></span>
                    </span>
                    Online
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full text-zinc-500 hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative mt-2 flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              <Globe className="h-3.5 w-3.5" />
              <Select value={aiLanguage} onValueChange={setAiLanguage}>
                <SelectTrigger className="h-auto border-none bg-transparent p-0 text-xs shadow-none focus:ring-0">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Turkish">Türkçe</SelectItem>
                  <SelectItem value="German">Deutsch</SelectItem>
                  <SelectItem value="French">Français</SelectItem>
                  <SelectItem value="Spanish">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.content && (
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${
                      msg.isError
                        ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400'
                        : msg.role === 'user'
                          ? 'rounded-br-sm bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-md'
                          : 'rounded-bl-sm border border-black/5 bg-white text-zinc-800 shadow-sm dark:border-white/5 dark:bg-[#1a1a1a] dark:text-zinc-200'
                    }`}
                  >
                    {msg.isError && <AlertCircle className="mb-1 h-4 w-4" />}
                    <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 break-words">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {msg.suggestions?.map((suggestion, index) => (
                  <div
                    key={`${msg.id}-suggestion-${index}`}
                    className="mt-3 ml-2 w-[90%] overflow-hidden rounded-2xl border border-orange-500/20 bg-white/80 shadow-sm dark:border-green-500/20 dark:bg-black/50"
                  >
                    <div className="flex items-center justify-between border-b border-orange-500/10 bg-orange-500/5 px-3 py-2 text-xs font-semibold text-orange-700 dark:border-green-500/10 dark:bg-green-500/5 dark:text-green-400">
                      <span>{t('wizard.suggestedFor') || 'Idea for'}: {suggestion.field}</span>
                      <span className="rounded-full bg-white/50 px-2 py-0.5 dark:bg-black/40">
                        {Math.round(suggestion.confidence * 100)}% Match
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="prose prose-sm dark:prose-invert mb-3 text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {suggestion.proposedValue}
                        </ReactMarkdown>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 w-full rounded-full bg-gradient-to-r from-orange-500 to-green-500 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90"
                        onClick={() => handleImport(suggestion.field, suggestion.proposedValue)}
                      >
                        {t('wizard.importToField') || 'Import'}
                      </Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500/20 to-green-500/20 text-orange-600 dark:from-orange-500/10 dark:to-green-500/10 dark:text-green-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-black/5 bg-white px-4 py-2 text-sm text-zinc-500 shadow-sm dark:border-white/5 dark:bg-[#1a1a1a] dark:text-zinc-400">
                  {t('wizard.aiThinking') || 'Gathering ideas...'}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-2 w-full shrink-0" />
          </div>

          {/* Input Area */}
          <div className="border-t border-black/5 bg-white/80 p-3 dark:border-white/5 dark:bg-white/[0.02]">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('wizard.askAiPlaceholder') || 'Ask AI a question...'}
                disabled={isLoading}
                className="h-12 w-full rounded-full border-black/10 bg-white/50 pl-5 pr-14 text-[15px] shadow-inner focus-visible:ring-orange-500/50 dark:border-white/10 dark:bg-black/50 dark:focus-visible:ring-green-500/50"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="absolute right-1.5 h-9 w-9 rounded-full bg-gradient-to-r from-orange-500 to-green-500 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
