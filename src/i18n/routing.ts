import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uy', 'ru', 'kz'],
  defaultLocale: 'uy',
});

export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;

export type Locale = (typeof routing.locales)[number];
