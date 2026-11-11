'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { AuthError, authButtonClass } from '@/components/auth/auth-shell';
import { verifyAccessToken, type VerifyState } from './actions';

export function AcessoForm({ tokenHash, type }: { tokenHash: string; type: string }) {
  const t = useTranslations('AuthAcesso');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<VerifyState, FormData>(verifyAccessToken, { error: false });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="locale" value={locale} />

      <p className="text-sm text-sunbiotan-800 text-center leading-relaxed">{t('intro')}</p>

      {state.error && (
        <AuthError>
          {t('invalidLink')}{' '}
          <Link href="/recuperar-senha" className="underline font-medium">{t('requestNewLink')}</Link>
        </AuthError>
      )}

      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" />{t('verifying')}</> : t('continue')}
      </button>
    </form>
  );
}
