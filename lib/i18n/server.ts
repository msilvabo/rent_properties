import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME, DEFAULT_LOCALE, isValidLocale, Locale } from '@/locales/config';
import { getDictionary, translate } from './get-dictionary';
import { TranslationKey } from '@/locales/types';

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    if (localeCookie && isValidLocale(localeCookie)) {
      return localeCookie;
    }
  } catch {
    // In case cookies() is called in a context where headers aren't available
  }
  return DEFAULT_LOCALE;
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  const dictionary = getDictionary(locale);

  const t = (key: TranslationKey | string, variables?: Record<string, string | number>) => {
    return translate(dictionary, key, variables);
  };

  return {
    locale,
    dictionary,
    t,
  };
}
