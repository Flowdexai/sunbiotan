// Metadata de las rutas del flujo profesional.
//   · test: noindex/nofollow y SIN canonical/hreflang (el layout pone los de
//     la home; `alternates: {}` los reemplaza por nada).
//   · live: página pública indexable con canonical/hreflang propios.
//   · presentación: siempre noindex, sin alternates.
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildAlternates, localizedHref, OG_IMAGE } from '@/lib/seo';
import { proBase, type ProFlow } from '@/lib/pro/config';

const NOINDEX: Metadata['robots'] = { index: false, follow: false, nocache: true };

export async function proLandingMetadata(locale: string, flow: ProFlow): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ProLanding' });
  const title = t('metaTitle');
  const description = t('metaDescription');

  if (flow === 'test') {
    return {
      title,
      description,
      robots: NOINDEX,
      alternates: {},
      openGraph: { title, description, images: [OG_IMAGE] },
      twitter: { title, description, card: 'summary', images: [OG_IMAGE.url] },
    };
  }

  const path = proBase(flow);
  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: { title, description, url: localizedHref(locale, path), images: [OG_IMAGE] },
    twitter: { title, description, card: 'summary', images: [OG_IMAGE.url] },
  };
}

export async function proPresentationMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ProPresentation' });
  const title = t('metaTitle');
  return {
    title,
    robots: NOINDEX,
    alternates: {},
    openGraph: { title, images: [OG_IMAGE] },
    twitter: { title, card: 'summary', images: [OG_IMAGE.url] },
  };
}
