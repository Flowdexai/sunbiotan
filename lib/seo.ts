import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

export const SITE_URL = 'https://sunbiotan.pt';

const LOCALE_TAGS: Record<string, string> = {
  pt: 'pt-PT',
  es: 'es-ES',
  en: 'en-US',
  it: 'it-IT',
  fr: 'fr-FR',
};

/** Path of a route for a given locale, honouring the `as-needed` prefix (pt has no prefix). */
export function localizedHref(locale: string, path = ''): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefix}${path}` || '/';
}

/** hreflang map for a route: one entry per locale plus x-default (the default locale). */
export function hreflangLanguages(path = '', absolute = false): Record<string, string> {
  const href = (l: string) => (absolute ? SITE_URL : '') + localizedHref(l, path);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[LOCALE_TAGS[l] ?? l] = href(l);
  }
  languages['x-default'] = href(routing.defaultLocale);
  return languages;
}

/**
 * Canonical + hreflang alternates for a page, per locale and per route.
 * `path` is the route without locale prefix, e.g. '' for the home page or '/profissionais'.
 */
export function buildAlternates(locale: string, path = ''): Metadata['alternates'] {
  return {
    canonical: localizedHref(locale, path),
    languages: hreflangLanguages(path),
  };
}
