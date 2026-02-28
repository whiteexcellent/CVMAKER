'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, X, Check, Globe } from 'lucide-react';
import { useTranslation } from '@/components/I18nProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useChat, UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
// @ts-ignore
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';

interface AIChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    step: number;
    formData: any;
    setFormData: (data: any) => void;
}

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    fieldSuggestion?: {
        field: string;
        value: string;
    };
};

export function AIChatSidebar({ isOpen, onClose, step, formData, setFormData }: AIChatSidebarProps) {
    const { t, locale } = useTranslation();
    const [aiLanguage, setAiLanguage] = useState<string>(locale === 'tr' ? 'Turkish' : 'English');
    const [input, setInput] = useState('');

    const { messages, setMessages, status, sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/wizard/chat',
        }),
        messages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: String(t('wizard.aiWelcome') || 'Hi! I am your AI Assistant. Tell me a bit about yourself and I will help you fill out your CV. What are you studying or what is your current role?')
            } as any
        ],
        onError: (err) => {
            console.error('Chat error:', err);
            toast.error(t('wizard.aiError') || 'Sorry, I encountered an error. Please try again.');
        }
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const messageText = input;
        setInput('');

        await sendMessage(
            { text: messageText },
            {
                body: { step, formData, locale: aiLanguage }
            }
        );
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleImport = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: prev[field] ? prev[field] + '\n\n' + value : value
        }));
        toast.success(t('wizard.importSuccess') || 'Successfully imported to form!', {
            icon: <Check className="w-4 h-4 text-green-500" />
        });
    };

    return (
        <div className={`w-80 md:w-96 h-[calc(100vh-73px)] border-l border-black/10 dark:border-white/10 bg-slate-50 dark:bg-black/50 flex flex-col fixed right-0 top-[73px] z-40 transition-transform duration-300 transform shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-3 border-b border-black/10 dark:border-white/10 flex flex-col gap-3 bg-white dark:bg-black">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-black/5 dark:bg-white/10 rounded-full">
                            <Bot className="w-5 h-5" />
                        </div>
                        <span className="font-bold whitespace-nowrap">{t('wizard.aiAssistant') || 'AI Assistant'}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-lg">
                    <Globe className="w-4 h-4 text-muted-foreground ml-1" />
                    <Select value={aiLanguage} onValueChange={setAiLanguage}>
                        <SelectTrigger className="h-8 border-none bg-transparent shadow-none focus-visible:ring-0 px-2 py-0">
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

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth">
                {messages.map((msg) => {
                    const msgAny = msg as any;
                    return (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {msgAny.content && (
                                <div className={`max-w-[85%] rounded-2xl p-3 mb-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 shadow-sm'}`}>
                                    <div className="text-sm overflow-hidden prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 break-words">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msgAny.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {msgAny.toolInvocations?.map((toolInvocation: any, index: number) => {
                                const isSuggestContentTool = toolInvocation.toolName === 'suggest_cv_content';
                                if (isSuggestContentTool) {
                                    // @ts-ignore
                                    if (toolInvocation.state === 'result' || toolInvocation.state === 'call' || 'result' in toolInvocation) {
                                        const { field, value } = toolInvocation.args as { field: string, value: string };
                                        if (!field || !value) return null; // Wait until fully streamed
                                        return (
                                            <div key={toolInvocation.toolCallId || index} className="mt-2 ml-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl w-[85%] shadow-sm">
                                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                                    {t('wizard.suggestedFor') || 'Suggested for'}: {field}
                                                </div>
                                                <div className="text-xs text-muted-foreground mb-3 italic bg-white/50 dark:bg-black/50 p-2 rounded prose prose-sm dark:prose-invert">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold"
                                                    onClick={() => handleImport(field, value)}
                                                >
                                                    {t('wizard.importToField') || 'Import to Form'}
                                                </Button>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={toolInvocation.toolCallId || index} className="mt-2 ml-2 p-2 bg-muted/30 border border-black/5 dark:border-white/5 rounded-xl w-[85%] animate-pulse">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    {t('wizard.aiThinking') || 'AI is thinking...'}
                                                </div>
                                            </div>
                                        );
                                    }
                                }
                                return null;
                            })}

                            {/* Fallback for the hardcoded welcome message which uses parts */}
                            {!msgAny.content && msgAny.parts?.map((part: any, index: number) => {
                                if (part.type === 'text' && part.text) {
                                    return (
                                        <div key={index} className={`max-w-[85%] rounded-2xl p-3 mb-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 shadow-sm'}`}>
                                            <div className="text-sm overflow-hidden prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 break-words">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {part.text}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground self-start bg-white dark:bg-[#111] border p-3 rounded-2xl shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('wizard.aiThinking') || 'AI is thinking...'}
                    </div>
                )}
                <div ref={messagesEndRef} className="h-1 w-full flex-shrink-0" />
            </div>

            <div className="p-4 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder={t('wizard.chatPlaceholder') || 'Type a message...'}
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
