import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { RecuperarForm } from './RecuperarForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function RecuperarSenhaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AuthRecuperar' });

  return (
    <AuthShell title={t('title')} eyebrow={t('eyebrow')}>
      <RecuperarForm />
    </AuthShell>
  );
}
