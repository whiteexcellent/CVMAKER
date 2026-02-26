'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, X, Check, Globe } from 'lucide-react';
import { useTranslation } from '@/components/I18nProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: t('wizard.aiWelcome') || 'Hi! I am your AI Assistant. Tell me a bit about yourself and I will help you fill out your CV. What are you studying or what is your current role?',
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('/api/wizard/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages, step, formData, locale: aiLanguage }),
            });

            if (!response.ok) throw new Error('Network error');

            const data = await response.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
                fieldSuggestion: data.suggestion,
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: t('wizard.aiError') || 'Sorry, I encountered an error. Please try again.',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

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
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 shadow-sm'}`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>

                        {msg.fieldSuggestion && (
                            <div className="mt-2 ml-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl w-[85%] shadow-sm">
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                    {t('wizard.suggestedFor') || 'Suggested for'}: {msg.fieldSuggestion.field}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-3 mb-3 italic bg-white/50 dark:bg-black/50 p-2 rounded">
                                    "{msg.fieldSuggestion.value}"
                                </p>
                                <Button
                                    size="sm"
                                    className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold"
                                    onClick={() => handleImport(msg.fieldSuggestion!.field, msg.fieldSuggestion!.value)}
                                >
                                    {t('wizard.importToField') || 'Import to Form'}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
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
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
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
