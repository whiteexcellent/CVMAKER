'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getDictionary, Locale, dictionaries, defaultLocale, resolveLocale } from '@/lib/i18n'
import Cookies from 'js-cookie'

type Dictionary = typeof dictionaries['en']

interface I18nContextType {
    locale: Locale;
    dictionary: Dictionary;
    setLocale: (loc: Locale) => void;
    t: (keyPath: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children, initialLocale = defaultLocale }: { children: React.ReactNode, initialLocale?: Locale }) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale)
    const [dictionary, setDictionary] = useState<Dictionary>(getDictionary(initialLocale))

    // Initialization: Check cookie or browser language if no explicit locale was passed down
    useEffect(() => {
        const savedLocale = Cookies.get('NEXT_LOCALE')
        if (savedLocale) {
            const valid = resolveLocale(savedLocale)
            if (valid !== locale) {
                setLocaleState(valid)
                setDictionary(getDictionary(valid))
            }
        }
    }, [locale])

    const setLocale = (newLocale: Locale) => {
        Cookies.set('NEXT_LOCALE', newLocale, { expires: 365, path: '/' })
        setLocaleState(newLocale)
        setDictionary(getDictionary(newLocale))
    }

    // A helper to traverse the dictionary using dot notation (e.g. `t('dashboard.title')`)
    const t = (keyPath: string): string => {
        const keys = keyPath.split('.')
        let current: any = dictionary
        for (const key of keys) {
            if (current === undefined || current[key] === undefined) {
                // Fallback to English
                let enCurrent: any = dictionaries['en']
                for (const enKey of keys) {
                    if (enCurrent === undefined || enCurrent[enKey] === undefined) return keyPath
                    enCurrent = enCurrent[enKey]
                }
                return typeof enCurrent === 'string' ? enCurrent : keyPath
            }
            current = current[key]
        }
        return typeof current === 'string' ? current : keyPath
    }

    return (
        <I18nContext.Provider value={{ locale, dictionary, setLocale, t }}>
            <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen">
                {children}
            </div>
        </I18nContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(I18nContext)
    if (context === undefined) {
        throw new Error('useTranslation must be used within an I18nProvider')
    }
    return context
}
