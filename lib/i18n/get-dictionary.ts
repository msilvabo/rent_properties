import es from '@/locales/es.json';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import { Dictionary } from '@/locales/types';
import { DEFAULT_LOCALE } from '@/locales/config';

const dictionaries: Record<string, Dictionary> = {
  es,
  en,
  fr,
};

export function getDictionary(locale: string = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

// Deep key resolver (e.g. "nav.buy" or "hero.sanctuary")
export function translate(
  dict: Dictionary,
  path: string,
  variables?: Record<string, string | number>
): string {
  const parts = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback: search in default locale if missing in current dictionary
      let fallbackCurrent: any = dictionaries[DEFAULT_LOCALE];
      for (const fPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fPart];
        } else {
          return path;
        }
      }
      current = fallbackCurrent;
      break;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  if (variables) {
    return Object.entries(variables).reduce((str, [key, val]) => {
      return str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }, current);
  }

  return current;
}
