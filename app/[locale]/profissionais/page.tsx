import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { buildAlternates, localizedHref } from '@/lib/seo';
import { ProfissionaisContent } from './ProfissionaisContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ProfissionaisPage' });
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: buildAlternates(locale, '/profissionais'),
    openGraph: { title, description, url: localizedHref(locale, '/profissionais') },
    twitter: { title, description },
  };
}

export default function ProfissionaisPage() {
  return (
    <>
      <Navbar forceOpaque />
      <ProfissionaisContent />
      <Footer />
    </>
  );
}
