import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt', 'es', 'en', 'it', 'fr'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
});
