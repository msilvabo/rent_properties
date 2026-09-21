import es from './es.json';

export type Dictionary = typeof es;

// Helper to access nested keys like "hero.searchPlaceholder" or "nav.buy"
export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

export type TranslationKey = Leaves<Dictionary>;
