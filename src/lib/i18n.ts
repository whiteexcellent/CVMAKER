import { tr } from './dictionaries/tr';
import { en } from './dictionaries/en';
import { de } from './dictionaries/de';
import { ar } from './dictionaries/ar';
import { ru } from './dictionaries/ru';
import { es } from './dictionaries/es';
import { pt } from './dictionaries/pt';
import { ja } from './dictionaries/ja';
import { zh } from './dictionaries/zh';
import { hi } from './dictionaries/hi';
import { fr } from './dictionaries/fr';
import { it } from './dictionaries/it';
import { ko } from './dictionaries/ko';
import { id } from './dictionaries/id';
import { vi } from './dictionaries/vi';

export const dictionaries = {
    tr,
    en,
    de,
    ar,
    ru,
    es,
    pt,
    ja,
    zh,
    hi,
    fr,
    it,
    ko,
    id,
    vi
};

export type Locale = keyof typeof dictionaries;
// English is the absolute global default if nothing matches. 
export const defaultLocale: Locale = 'en';

export function getDictionary(locale: Locale) {
    const requestedDict = dictionaries[locale] || dictionaries[defaultLocale];
    const fallbackDict = dictionaries[defaultLocale];

    // Create a proxy that defaults to English (defaultLocale) if a specific key or nested object is missing in the chosen language.
    // This stops the UI from showing empty strings or crashing when new keys (like toast.*) are added but not yet translated in all 15 languages.
    return new Proxy(requestedDict, {
        get(target, prop: string) {
            const hasProp = prop in target;
            if (!hasProp) return (fallbackDict as any)[prop];

            const val = (target as any)[prop];
            // If the value is a nested dictionary section (e.g. { toast: {...} } ), wrap it in another Proxy
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                return new Proxy(val, {
                    get(subTarget, subProp: string) {
                        return subProp in subTarget ? subTarget[subProp] : (fallbackDict as any)[prop]?.[subProp];
                    }
                });
            }
            return val;
        }
    }) as typeof dictionaries['en'];
}

// Helper to reliably cast standard ISO language strings (e.g. 'en-US', 'tr') to our mapped Locale
export function resolveLocale(rawLanguage: string | undefined | null): Locale {
    if (!rawLanguage) return defaultLocale;
    const shortCode = rawLanguage.toLowerCase().substring(0, 2);
    if (Object.keys(dictionaries).includes(shortCode)) {
        return shortCode as Locale;
    }
    return defaultLocale;
}
