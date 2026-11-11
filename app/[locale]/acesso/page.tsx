import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AuthShell, AuthError } from '@/components/auth/auth-shell';
import { AcessoForm } from './AcessoForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const ALLOWED_TYPES = ['invite', 'recovery'];

export default async function AcessoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'AuthAcesso' });

  const tokenHash = typeof sp.token_hash === 'string' ? sp.token_hash : '';
  const type = typeof sp.type === 'string' ? sp.type : '';
  const valid = tokenHash.length > 0 && tokenHash.length <= 512 && ALLOWED_TYPES.includes(type);

  return (
    <AuthShell title={type === 'recovery' ? t('titleRecovery') : t('titleInvite')} eyebrow={t('eyebrow')}>
      {valid ? (
        <AcessoForm tokenHash={tokenHash} type={type} />
      ) : (
        <AuthError>
          {t('invalidLink')}{' '}
          <Link href="/recuperar-senha" className="underline font-medium">{t('requestNewLink')}</Link>
        </AuthError>
      )}
    </AuthShell>
  );
}
