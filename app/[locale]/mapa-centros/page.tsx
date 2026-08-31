import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { buildAlternates, localizedHref } from '@/lib/seo';
import { CentrosContent } from './CentrosContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CentrosPage' });
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: buildAlternates(locale, '/mapa-centros'),
    openGraph: { title, description, url: localizedHref(locale, '/mapa-centros') },
    twitter: { title, description },
  };
}

export default function CentrosPage() {
  return (
    <>
      <Navbar forceOpaque />
      <CentrosContent />
      <Footer />
    </>
  );
}
