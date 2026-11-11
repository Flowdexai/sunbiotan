// lib/auth/links.ts
// Links absolutos con el prefijo de idioma correcto según la config de
// next-intl (localePrefix 'as-needed': pt sin prefijo, el resto con /xx).
import { routing } from '@/i18n/routing';

export type AppLocale = (typeof routing.locales)[number];

export const APP_LOCALES = routing.locales as readonly AppLocale[];

export function normalizeLocale(value: unknown): AppLocale {
  return typeof value === 'string' && (APP_LOCALES as readonly string[]).includes(value)
    ? (value as AppLocale)
    : routing.defaultLocale;
}

export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://sunbiotan.pt';
  return raw.replace(/\/+$/, '');
}

/** Ruta relativa con prefijo de idioma: ('/acesso', 'es') -> '/es/acesso'. */
export function localizedPath(path: string, locale: AppLocale | string): string {
  const loc = normalizeLocale(locale);
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (loc === routing.defaultLocale) return clean;
  return clean === '/' ? `/${loc}` : `/${loc}${clean}`;
}

/** URL absoluta con prefijo de idioma y query opcional. */
export function absoluteLink(
  path: string,
  locale: AppLocale | string,
  query?: Record<string, string>
): string {
  const url = new URL(localizedPath(path, locale), getAppBaseUrl());
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }
  return url.toString();
}
