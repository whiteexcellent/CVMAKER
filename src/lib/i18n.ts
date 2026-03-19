export type Dictionary = Record<string, any>;

type DictionaryLoader = () => Promise<any>;

const dictionaryLoaders = {
    tr: () => import('./dictionaries/tr').then((module) => module.tr),
    en: () => import('./dictionaries/en').then((module) => module.en),
    de: () => import('./dictionaries/de').then((module) => module.de),
    ar: () => import('./dictionaries/ar').then((module) => module.ar),
    ru: () => import('./dictionaries/ru').then((module) => module.ru),
    es: () => import('./dictionaries/es').then((module) => module.es),
    pt: () => import('./dictionaries/pt').then((module) => module.pt),
    ja: () => import('./dictionaries/ja').then((module) => module.ja),
    zh: () => import('./dictionaries/zh').then((module) => module.zh),
    hi: () => import('./dictionaries/hi').then((module) => module.hi),
    fr: () => import('./dictionaries/fr').then((module) => module.fr),
    it: () => import('./dictionaries/it').then((module) => module.it),
    ko: () => import('./dictionaries/ko').then((module) => module.ko),
    id: () => import('./dictionaries/id').then((module) => module.id),
    vi: () => import('./dictionaries/vi').then((module) => module.vi),
} satisfies Record<string, DictionaryLoader>;

export type Locale = keyof typeof dictionaryLoaders;
export const defaultLocale: Locale = 'en';
const knownLocales = new Set(Object.keys(dictionaryLoaders));

function createFallbackProxy(requested: Dictionary, fallback: Dictionary): Dictionary {
    return new Proxy(requested, {
        get(target, prop: string) {
            const value = (target as any)[prop];

            if (value === undefined) {
                return (fallback as any)[prop];
            }

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return new Proxy(value, {
                    get(subTarget, subProp: string) {
                        return subProp in subTarget ? (subTarget as any)[subProp] : (fallback as any)[prop]?.[subProp];
                    }
                });
            }

            return value;
        }
    }) as Dictionary;
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
    const requestedLoader = dictionaryLoaders[locale] || dictionaryLoaders[defaultLocale];
    const [requestedDictionary, fallbackDictionary] = await Promise.all([
        requestedLoader(),
        dictionaryLoaders[defaultLocale](),
    ]);

    return createFallbackProxy(requestedDictionary, fallbackDictionary);
}

export function resolveLocale(rawLanguage: string | undefined | null): Locale {
    if (!rawLanguage) return defaultLocale;

    const shortCode = rawLanguage.toLowerCase().substring(0, 2);
    if (knownLocales.has(shortCode)) {
        return shortCode as Locale;
    }

    return defaultLocale;
}
