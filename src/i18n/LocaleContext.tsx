import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { interpolate, LOCALE_STORAGE_KEY, translations, type Locale } from './translations';

type TParams = Record<string, string | number>;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: TParams) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const s = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (s === 'en' || s === 'es') return s;
  } catch {
    /* ignore */
  }
  return 'es';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l === 'en' ? 'en' : 'es';
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'es';
  }, [locale]);

  const t = useCallback(
    (key: string, params?: TParams) => {
      const raw = translations[locale][key] ?? translations.es[key] ?? key;
      return params ? interpolate(raw, params) : raw;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
