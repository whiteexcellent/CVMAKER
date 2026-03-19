'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getDictionary, type Dictionary, Locale, defaultLocale, resolveLocale } from '@/lib/i18n'
import Cookies from 'js-cookie'

interface I18nContextType {
    locale: Locale;
    dictionary: Dictionary;
    setLocale: (loc: Locale) => void;
    t: (keyPath: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({
    children,
    initialLocale = defaultLocale,
    initialDictionary,
}: {
    children: React.ReactNode,
    initialLocale?: Locale,
    initialDictionary: Dictionary,
}) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale)
    const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary)

    // Initialization: Check cookie or browser language if no explicit locale was passed down
    useEffect(() => {
        let isMounted = true

        const savedLocale = Cookies.get('NEXT_LOCALE')
        if (savedLocale) {
            const valid = resolveLocale(savedLocale)
            if (valid !== locale) {
                getDictionary(valid).then((loadedDictionary) => {
                    if (!isMounted) return
                    setLocaleState(valid)
                    setDictionary(loadedDictionary)
                })
            }
        }

        return () => {
            isMounted = false
        }
    }, [locale])

    const setLocale = (newLocale: Locale) => {
        Cookies.set('NEXT_LOCALE', newLocale, { expires: 365, path: '/' })
        getDictionary(newLocale).then((loadedDictionary) => {
            setLocaleState(newLocale)
            setDictionary(loadedDictionary)
        })
    }

    // A helper to traverse the dictionary using dot notation (e.g. `t('dashboard.title')`)
    const t = (keyPath: string): string => {
        const keys = keyPath.split('.')
        let current: any = dictionary
        for (const key of keys) {
            if (current === undefined || current[key] === undefined) {
                return keyPath
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
