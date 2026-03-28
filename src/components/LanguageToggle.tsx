'use client';

import * as React from 'react';
import { Check, Globe } from 'lucide-react';
import { useTranslation } from '@/components/I18nProvider';
import { Locale } from '@/lib/i18n';
import { motion } from 'framer-motion';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/8 bg-white/65 text-zinc-900 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-300 outline-none hover:border-black/14 hover:bg-white/85 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:shadow-[0_8px_30px_rgba(0,0,0,0.22)] dark:hover:border-white/20 dark:hover:bg-white/[0.1]"
        >
          <motion.span
            key={locale}
            initial={{ scale: 0.72, opacity: 0.45 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-black/10 dark:border-white/16"
          />
          <div className="absolute inset-0 translate-x-[-150%] skew-x-[-30deg] rounded-full bg-gradient-to-tr from-transparent via-white/55 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[150%] dark:via-white/12"></div>

          <motion.div
            key={locale}
            initial={{ rotate: -18, scale: 0.84, opacity: 0.6 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative z-10 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.1 }}
            >
              <Globe className="h-4 w-4 drop-shadow-sm transition-opacity group-hover:opacity-100" />
            </motion.div>
          </motion.div>
          <span className="sr-only">Toggle language</span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[220px] rounded-2xl border border-black/8 bg-white/88 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#050505]/88 dark:shadow-[0_18px_60px_rgba(0,0,0,0.32)]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className="group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-800 transition-colors hover:bg-black/[0.04] focus:bg-black/[0.04] dark:text-white/82 dark:hover:bg-white/[0.06] dark:focus:bg-white/[0.08]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg leading-none drop-shadow-sm transition-transform group-hover:scale-110">
                {lang.flag}
              </span>
              <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-black dark:group-hover:text-white">
                {lang.name}
              </span>
            </div>
            {locale === lang.code && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Check className="h-[18px] w-[18px] stroke-[3px] text-zinc-900 dark:text-white" />
              </motion.div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
