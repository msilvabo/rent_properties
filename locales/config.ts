export interface SupportedLocale {
  code: string;
  name: string;
  flag: string;
  short: string;
}

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸', short: 'ES' },
  { code: 'en', name: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', short: 'FR' },
];

export type Locale = 'es' | 'en' | 'fr' | string;

export const DEFAULT_LOCALE = 'es';
export const LOCALE_COOKIE_NAME = 'luxe_locale';

export function isValidLocale(code: string): boolean {
  return SUPPORTED_LOCALES.some((l) => l.code === code);
}
