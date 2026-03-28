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

function mergeDictionaries(requested: unknown, fallback: unknown): unknown {
  if (Array.isArray(requested)) {
    return requested.slice();
  }

  if (Array.isArray(fallback)) {
    return Array.isArray(requested) ? requested.slice() : fallback.slice();
  }

  const requestedIsObject = !!requested && typeof requested === 'object';
  const fallbackIsObject = !!fallback && typeof fallback === 'object';

  if (!requestedIsObject && !fallbackIsObject) {
    return requested ?? fallback;
  }

  const requestedRecord = requestedIsObject ? (requested as Record<string, unknown>) : {};
  const fallbackRecord = fallbackIsObject ? (fallback as Record<string, unknown>) : {};
  const merged: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(fallbackRecord), ...Object.keys(requestedRecord)])) {
    merged[key] = mergeDictionaries(requestedRecord[key], fallbackRecord[key]);
  }

  return merged;
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const requestedLoader = dictionaryLoaders[locale] || dictionaryLoaders[defaultLocale];
  const [requestedDictionary, fallbackDictionary] = await Promise.all([
    requestedLoader(),
    dictionaryLoaders[defaultLocale](),
  ]);

  return mergeDictionaries(requestedDictionary, fallbackDictionary) as Dictionary;
}

export function resolveLocale(rawLanguage: string | undefined | null): Locale {
  if (!rawLanguage) return defaultLocale;

  const shortCode = rawLanguage.toLowerCase().substring(0, 2);
  if (knownLocales.has(shortCode)) {
    return shortCode as Locale;
  }

  return defaultLocale;
}
