'use client';

import React, { createContext, useContext, useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  SupportedLocale,
  Locale,
} from '@/locales/config';
import { Dictionary, TranslationKey } from '@/locales/types';
import { getDictionary, translate } from './get-dictionary';

interface LanguageContextType {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: string) => void;
  t: (key: TranslationKey | string, variables?: Record<string, string | number>) => string;
  supportedLocales: SupportedLocale[];
  currentLocaleMeta: SupportedLocale;
  isChangingLocale: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialDictionary?: Dictionary;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialDictionary,
}: LanguageProviderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const dictionary = useMemo(() => {
    return initialDictionary && locale === initialLocale
      ? initialDictionary
      : getDictionary(locale);
  }, [locale, initialLocale, initialDictionary]);

  const setLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    // Set cookie in browser: expires in 1 year
    const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${maxAge}; SameSite=Lax`;

    setLocaleState(newLocale);

    // Refresh server components to re-read the cookie
    startTransition(() => {
      router.refresh();
    });
  };

  const t = (key: TranslationKey | string, variables?: Record<string, string | number>): string => {
    return translate(dictionary, key, variables);
  };

  const currentLocaleMeta = useMemo(() => {
    return (
      SUPPORTED_LOCALES.find((l) => l.code === locale) ||
      SUPPORTED_LOCALES.find((l) => l.code === DEFAULT_LOCALE) ||
      SUPPORTED_LOCALES[0]
    );
  }, [locale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        dictionary,
        setLocale,
        t,
        supportedLocales: SUPPORTED_LOCALES,
        currentLocaleMeta,
        isChangingLocale: isPending,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
