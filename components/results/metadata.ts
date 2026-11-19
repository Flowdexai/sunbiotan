// Metadata de la página de resultados: noindex/nofollow y SIN canonical/hreflang
// (el layout pone los de la home; `alternates: {}` los reemplaza por nada).
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { OG_IMAGE } from '@/lib/seo';

export async function resultsMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ResultsPage' });
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    alternates: {},
    openGraph: { title, description, images: [OG_IMAGE] },
    twitter: { title, description, card: 'summary', images: [OG_IMAGE.url] },
  };
}
