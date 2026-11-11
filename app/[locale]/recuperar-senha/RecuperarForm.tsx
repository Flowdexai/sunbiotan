'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, MailCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { AuthError, authButtonClass, authInputClass, authLabelClass } from '@/components/auth/auth-shell';

export function RecuperarForm() {
  const t = useTranslations('AuthRecuperar');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) setError(t('errorRateLimit'));
      else if (!res.ok) setError(t('errorInvalid'));
      else setSent(true);
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <MailCheck className="h-10 w-10 mx-auto text-sunbiotan-600" strokeWidth={1.5} />
        <p className="text-sm text-sunbiotan-800 leading-relaxed">{t('sent')}</p>
        <Link href="/login" className="inline-block text-sm text-sunbiotan-700 hover:text-sunbiotan-900 underline">
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-sm text-sunbiotan-800 text-center leading-relaxed">{t('intro')}</p>
      <div>
        <label htmlFor="recover-email" className={authLabelClass}>{t('labelEmail')}</label>
        <input
          id="recover-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className={authInputClass}
        />
      </div>

      {error && <AuthError>{error}</AuthError>}

      <button type="submit" disabled={loading} className={authButtonClass}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />{t('sending')}</> : t('submit')}
      </button>

      <p className="text-center text-xs">
        <Link href="/login" className="text-sunbiotan-700 hover:text-sunbiotan-900 hover:underline">{t('backToLogin')}</Link>
      </p>
    </form>
  );
}
