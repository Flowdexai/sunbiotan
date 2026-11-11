import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { normalizeLocale } from '@/lib/auth/links';
import { AuthShell } from '@/components/auth/auth-shell';
import { DefinirSenhaForm } from './DefinirSenhaForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DefinirSenhaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Solo con sesión (invitación o recuperación ya verificadas en /acesso).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/login', locale: normalizeLocale(locale) });
  }

  const t = await getTranslations({ locale, namespace: 'AuthDefinirSenha' });

  return (
    <AuthShell title={t('title')} eyebrow={t('eyebrow')}>
      <DefinirSenhaForm />
    </AuthShell>
  );
}
