import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL, localizedHref, hreflangLanguages } from '@/lib/seo';

// Indexable, public routes (without locale prefix). Auth areas and noindex
// pages (login, dashboard, portal, video, cookies, privacidade) are excluded.
const ROUTES = ['', '/profissionais', '/mapa-centros'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localizedHref(locale, path)}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
      alternates: { languages: hreflangLanguages(path, true) },
    })),
  );
}
