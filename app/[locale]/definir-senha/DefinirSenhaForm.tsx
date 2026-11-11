'use client';

import { useActionState, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthError, authButtonClass, authInputClass, authLabelClass } from '@/components/auth/auth-shell';
import { setPassword, type SetPasswordState } from './actions';

const MIN = 10;

export function DefinirSenhaForm() {
  const t = useTranslations('AuthDefinirSenha');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<SetPasswordState, FormData>(setPassword, { error: null });
  const [password, setPasswordValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const errorKey = clientError ?? state.error;
  const errorText = errorKey
    ? {
        too_short: t('errorTooShort', { min: MIN }),
        too_long: t('errorTooLong'),
        mismatch: t('errorMismatch'),
        same_password: t('errorSamePassword'),
        weak: t('errorWeak'),
        session: t('errorSession'),
        generic: t('errorGeneric'),
      }[errorKey] ?? t('errorGeneric')
    : null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (password.length < MIN) {
      e.preventDefault();
      setClientError('too_short');
      return;
    }
    if (password !== confirm) {
      e.preventDefault();
      setClientError('mismatch');
      return;
    }
    setClientError(null);
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-sunbiotan-800 text-center leading-relaxed">{t('intro', { min: MIN })}</p>

      <div>
        <label htmlFor="new-password" className={authLabelClass}>{t('labelPassword')}</label>
        <div className="relative">
          <input
            id="new-password"
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            minLength={MIN}
            maxLength={72}
            required
            value={password}
            onChange={(e) => { setPasswordValue(e.target.value); setClientError(null); }}
            className={`${authInputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? t('hidePassword') : t('showPassword')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sunbiotan-600 hover:text-sunbiotan-800 transition-colors"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className={authLabelClass}>{t('labelConfirm')}</label>
        <input
          id="confirm-password"
          name="confirm"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          minLength={MIN}
          maxLength={72}
          required
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setClientError(null); }}
          className={authInputClass}
        />
      </div>

      {errorText && <AuthError>{errorText}</AuthError>}

      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" />{t('saving')}</> : t('submit')}
      </button>
    </form>
  );
}
