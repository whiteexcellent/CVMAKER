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
// @ts-ignore — react-markdown types mismatch ile React 19
import ReactMarkdown from 'react-markdown';
// @ts-ignore — remark-gfm types mismatch ile React 19
import remarkGfm from 'remark-gfm';

// ─── Tipler ──────────────────────────────────────────────────────────────────

interface SuggestionEvent {
    type: 'suggestion';
    field: 'experience' | 'education' | 'skills' | 'targetRole' | 'profileType';
    value: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    suggestion?: SuggestionEvent;
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

export interface AIChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    step: number;
    formData: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

// ─── JSON öneri satırı ayrıştırıcı ──────────────────────────────────────────

const SUGGESTION_REGEX = /\{"type":"suggestion"[^}]*\}/g;

function parseSuggestion(text: string): SuggestionEvent | null {
    const matches = text.match(SUGGESTION_REGEX);
    if (!matches) return null;
    try {
        const parsed = JSON.parse(matches[matches.length - 1]) as unknown;
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'type' in parsed &&
            'field' in parsed &&
            'value' in parsed &&
            (parsed as SuggestionEvent).type === 'suggestion'
        ) {
            return parsed as SuggestionEvent;
        }
        return null;
    } catch {
        return null;
    }
}

/** Kullanıcıya gösterilen içerikten öneri JSON blokunu kaldırır */
function stripSuggestionJson(text: string): string {
    return text.replace(SUGGESTION_REGEX, '').trim();
}

// ─── Custom hook — kendi stream reader ───────────────────────────────────────

function useAIChat(step: number, formData: CVFormData, locale: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(
        async (userText: string) => {
            if (!userText.trim() || isStreaming) return;

            const userMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: userText,
            };

            // Geçmiş mesajları API formatına dönüştür (welcome hariç)
            const apiHistory = messages
                .filter((m) => !m.isError)
                .map((m) => ({
                    role: m.role as 'user' | 'assistant',
                    content: stripSuggestionJson(m.content),
                }));

            const assistantId = crypto.randomUUID();
            const assistantPlaceholder: ChatMessage = {
                id: assistantId,
                role: 'assistant',
                content: '',
            };

            setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
            setIsStreaming(true);

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const response = await fetch('/api/wizard/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [
                            ...apiHistory,
                            { role: 'user', content: userText },
                        ],
                        step,
                        formData,
                        locale,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok || !response.body) {
                    let errorCode = 'PROVIDER_ERROR';
                    try {
                        const errJson = (await response.json()) as {
                            error?: { code?: string; message?: string };
                        };
                        errorCode = errJson?.error?.code ?? errorCode;
                    } catch {
                        // JSON parse başarısız — kod zaten set edildi
                    }
                    throw new Error(errorCode);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulated = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    accumulated += chunk;

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantId
                                ? { ...m, content: accumulated }
                                : m,
                        ),
                    );
                }

                // Stream bitti — öneri var mı kontrol et
                const suggestion = parseSuggestion(accumulated);
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? {
                                ...m,
                                content: accumulated,
                                suggestion: suggestion ?? undefined,
                            }
                            : m,
                    ),
                );
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') {
                    // Kullanıcı iptal etti — mesajı sil
                    setMessages((prev) =>
                        prev.filter((m) => m.id !== assistantId),
                    );
                    return;
                }

                const errorMessage =
                    err instanceof Error ? err.message : 'UNKNOWN_ERROR';
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? {
                                ...m,
                                content: errorMessage,
                                isError: true,
                            }
                            : m,
                    ),
                );
            } finally {
                setIsStreaming(false);
                abortRef.current = null;
            }
        },
        [isStreaming, messages, step, formData, locale],
    );

    const cancelStream = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    return { messages, setMessages, isStreaming, sendMessage, cancelStream };
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export function AIChatSidebar({
    isOpen,
    onClose,
    step,
    formData,
    setFormData,
}: AIChatSidebarProps) {
    const { t, locale } = useTranslation();
    const [aiLanguage, setAiLanguage] = useState<string>(
        locale === 'tr' ? 'Turkish' : 'English',
    );
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, setMessages, isStreaming, sendMessage, cancelStream } =
        useAIChat(step, formData, aiLanguage);

    // Karşılama mesajı — sadece bir kez
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: String(
                        t('wizard.aiWelcome') ||
                        'Hi! I am your AI Assistant. Tell me about yourself and I will help you write a great CV. What is your current role or what are you studying?',
                    ),
                },
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Otomatik scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isStreaming]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text || isStreaming) return;
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
            className={`fixed right-0 top-[73px] z-40 flex h-[calc(100vh-73px)] w-80 flex-col border-l border-black/10 bg-slate-50 shadow-2xl transition-transform duration-300 dark:border-white/10 dark:bg-black/50 md:w-96 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
        >
            {/* ── Header ── */}
            <div className="flex flex-col gap-3 border-b border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-black/5 p-2 dark:bg-white/10">
                            <Bot className="h-5 w-5" />
                        </div>
                        <span className="whitespace-nowrap font-bold">
                            {t('wizard.aiAssistant') || 'AI Assistant'}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close AI sidebar">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Dil seçimi */}
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-sm">
                    <Globe className="ml-1 h-4 w-4 text-muted-foreground" />
                    <Select value={aiLanguage} onValueChange={setAiLanguage}>
                        <SelectTrigger
                            className="h-8 border-none bg-transparent px-2 py-0 shadow-none focus-visible:ring-0"
                            aria-label="Select AI response language"
                        >
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Turkish">Türkçe</SelectItem>
                            <SelectItem value="German">Deutsch</SelectItem>
                            <SelectItem value="French">Français</SelectItem>
                            <SelectItem value="Spanish">Español</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── Mesajlar ── */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto scroll-smooth p-4">
                {messages.map((msg) => {
                    const displayContent = stripSuggestionJson(msg.content);

                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            {/* Mesaj baloncuğu */}
                            {displayContent && (
                                <div
                                    className={`max-w-[85%] rounded-2xl p-3 ${msg.isError
                                        ? 'flex items-start gap-2 border border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/10 dark:text-red-400'
                                        : msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#111]'
                                        }`}
                                >
                                    {msg.isError && (
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    )}
                                    <div className="prose prose-sm break-words overflow-hidden dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 text-sm">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {displayContent}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Öneri kartı */}
                            {msg.suggestion && (
                                <div className="ml-2 mt-2 w-[85%] rounded-xl border border-blue-200 bg-blue-50/50 p-3 shadow-sm dark:border-blue-800/50 dark:bg-blue-900/10">
                                    <div className="mb-1 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                        {t('wizard.suggestedFor') || 'Suggested for'}:{' '}
                                        {msg.suggestion.field}
                                    </div>
                                    <div className="prose prose-sm mb-3 rounded bg-white/50 p-2 text-xs italic text-muted-foreground dark:bg-black/50 dark:prose-invert">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.suggestion.value}
                                        </ReactMarkdown>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="h-8 w-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                        onClick={() =>
                                            handleImport(
                                                msg.suggestion!.field,
                                                msg.suggestion!.value,
                                            )
                                        }
                                    >
                                        {t('wizard.importToField') || 'Import to Form'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Yükleniyor göstergesi */}
                {isStreaming && (
                    <div className="flex items-center gap-2 self-start rounded-2xl border bg-white p-3 text-sm text-muted-foreground shadow-sm dark:bg-[#111]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('wizard.aiThinking') || 'AI is thinking...'}
                    </div>
                )}

                <div ref={messagesEndRef} className="h-1 w-full shrink-0" />
            </div>

            {/* ── Input ── */}
            <div className="border-t border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        id="ai-chat-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t('wizard.chatPlaceholder') || 'Type a message...'}
                        className="flex-1"
                        disabled={isStreaming}
                        aria-label="Chat message input"
                    />
                    {isStreaming ? (
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={cancelStream}
                            aria-label="Cancel AI response"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!inputValue.trim()}
                            aria-label="Send message"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
}
