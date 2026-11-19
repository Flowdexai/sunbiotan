'use client';

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Loader2, Info } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { ACTIVITY_TYPES } from '@/lib/partners/activity';
import { collectProFormErrors, type ProField } from '@/lib/pro/validate';
import { PRO_ADS_SEND_TO, PRO_GA4_EVENT, proPresentationPath, type ProFlow } from '@/lib/pro/config';
import { getGtag } from './track';
import { PRIMARY_BUTTON } from './ui';

interface Fields {
  name: string;
  business_name: string;
  city: string;
  phone: string;
  email: string;
  activity_type: string;
  instagram: string;
  website: string;
}

const EMPTY: Fields = {
  name: '',
  business_name: '',
  city: '',
  phone: '',
  email: '',
  activity_type: '',
  instagram: '',
  website: '',
};

type Status = 'idle' | 'sending' | 'redirecting';

// Inputs como el formulario de Contact: borde 600 en reposo, 800 en foco.
const INPUT =
  'w-full px-4 py-3 bg-white border border-sunbiotan-600 rounded-xl text-sm text-sunbiotan-900 placeholder:text-sunbiotan-700 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400/30 focus:border-sunbiotan-800 transition-all aria-[invalid=true]:border-red-700';
const LABEL = 'block text-xs tracking-[0.15em] uppercase text-sunbiotan-800 font-medium mb-1.5';
const ERROR = 'mt-1.5 text-xs text-red-800';

/** Línea discreta cuando se llega redirigido desde la presentación (?acesso=1). */
function AccessHint({ text }: { text: string }) {
  const params = useSearchParams();
  if (params.get('acesso') !== '1') return null;
  return (
    <p role="status" className="flex items-center justify-center gap-2 mb-6 text-sm text-sunbiotan-800">
      <Info className="h-4 w-4 shrink-0 text-sunbiotan-700" strokeWidth={1.75} />
      {text}
    </p>
  );
}

export function ProForm({ flow }: { flow: ProFlow }) {
  const t = useTranslations('ProLanding');
  const locale = useLocale();
  const router = useRouter();

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [noInstagram, setNoInstagram] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<ProField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [hpUrl, setHpUrl] = useState('');
  const mountedAt = useRef(0);
  useEffect(() => { mountedAt.current = Date.now(); }, []);

  function set(field: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  }

  function messageFor(field: ProField, reason: string): string {
    switch (field) {
      case 'email': return reason === 'required' ? t('errorRequired') : t('errorEmail');
      case 'phone': return reason === 'required' ? t('errorRequired') : t('errorPhone');
      case 'activity_type': return t('errorActivity');
      case 'instagram': return t('errorInstagram');
      case 'website': return t('errorWebsite');
      case 'privacy_consent': return t('errorPrivacy');
      default: return t('errorRequired');
    }
  }

  function payload() {
    return {
      ...fields,
      no_instagram: noInstagram,
      privacy_consent: privacy,
      marketing_consent: marketing,
    };
  }

  /** Valida en el cliente todos los campos (el servidor vuelve a validar). */
  function validateAll(): boolean {
    const found: Partial<Record<ProField, string>> = {};
    for (const { field, reason } of collectProFormErrors(payload()).errors) {
      found[field] ??= messageFor(field, reason);
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== 'idle') return;
    setFormError(null);
    if (!validateAll()) {
      setFormError(t('errorFix'));
      return;
    }

    setStatus('sending');
    let res: Response;
    try {
      res = await fetch('/api/profissionais/acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...payload(),
          hp_url: hpUrl,
          elapsed_ms: Date.now() - mountedAt.current,
          locale,
          flow,
        }),
      });
    } catch {
      setStatus('idle');
      setFormError(t('errorSubmit'));
      return;
    }

    const data = (await res.json().catch(() => ({}))) as { isNew?: boolean; field?: string };
    if (!res.ok) {
      setStatus('idle');
      if (res.status === 429) {
        setFormError(t('errorRateLimit'));
      } else if (res.status === 400 && data.field) {
        const field = data.field as ProField;
        setErrors({ [field]: messageFor(field, 'format') });
        setFormError(t('errorFix'));
      } else {
        setFormError(t('errorSubmit'));
      }
      return;
    }

    setStatus('redirecting');

    // Conversión: solo leads nuevos y solo en el flujo real. Antes de navegar.
    if (flow === 'live' && data.isNew === true) {
      const gtag = getGtag();
      if (gtag) {
        gtag('event', PRO_GA4_EVENT, { transport_type: 'beacon' });
        gtag('event', 'conversion', { send_to: PRO_ADS_SEND_TO, transport_type: 'beacon' });
      }
    }

    router.push(proPresentationPath(flow));
  }

  const busy = status !== 'idle';
  const err = (f: ProField) => errors[f];
  const describedBy = (f: ProField) => (errors[f] ? `pro-${f}-error` : undefined);

  const field = (
    key: keyof Fields & ProField,
    label: string,
    input: ReactNode,
    hint?: string
  ) => (
    <div>
      <label htmlFor={`pro-${key}`} className={LABEL}>
        {label} <span aria-hidden="true" className="text-sunbiotan-700">*</span>
      </label>
      {input}
      {hint && !err(key) && <p className="mt-1.5 text-xs text-sunbiotan-700">{hint}</p>}
      {err(key) && <p id={`pro-${key}-error`} className={ERROR}>{err(key)}</p>}
    </div>
  );

  const textInput = (key: keyof Fields & ProField, type: string, placeholder: string, autoComplete: string, maxLength: number) => (
    <input
      id={`pro-${key}`}
      name={key}
      type={type}
      value={fields[key]}
      onChange={(e) => set(key, e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      maxLength={maxLength}
      required
      aria-required="true"
      aria-invalid={!!err(key)}
      aria-describedby={describedBy(key)}
      className={INPUT}
    />
  );

  return (
    <div>
      <Suspense fallback={null}>
        <AccessHint text={t('accessHint')} />
      </Suspense>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Honeypot: invisible para personas, tentador para bots. */}
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
          <label>
            Website
            <input type="text" name="hp_url" tabIndex={-1} autoComplete="off" value={hpUrl} onChange={(e) => setHpUrl(e.target.value)} />
          </label>
        </div>

        {field('name', t('labelName'), textInput('name', 'text', t('placeholderName'), 'name', 120))}
        {field('business_name', t('labelBusiness'), textInput('business_name', 'text', t('placeholderBusiness'), 'organization', 160))}
        {field('city', t('labelCity'), textInput('city', 'text', t('placeholderCity'), 'address-level2', 120))}
        {field('phone', t('labelPhone'), textInput('phone', 'tel', t('placeholderPhone'), 'tel', 40))}
        {field('email', t('labelEmail'), textInput('email', 'email', t('placeholderEmail'), 'email', 254))}

        {field(
          'activity_type',
          t('labelActivity'),
          <select
            id="pro-activity_type"
            name="activity_type"
            value={fields.activity_type}
            onChange={(e) => set('activity_type', e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!err('activity_type')}
            aria-describedby={describedBy('activity_type')}
            className={`${INPUT} appearance-none`}
          >
            <option value="" disabled>{t('activityPlaceholder')}</option>
            {ACTIVITY_TYPES.map((a) => (
              <option key={a} value={a}>{t(`activityOptions.${a}`)}</option>
            ))}
          </select>
        )}

        {noInstagram
          ? field('website', t('labelWebsite'), textInput('website', 'url', t('placeholderWebsite'), 'url', 300))
          : field('instagram', t('labelInstagram'), textInput('instagram', 'text', t('placeholderInstagram'), 'off', 300), t('instagramHint'))}

        <label className="flex items-start gap-3 text-sm text-sunbiotan-900 cursor-pointer">
          <input
            type="checkbox"
            checked={noInstagram}
            onChange={(e) => {
              setNoInstagram(e.target.checked);
              setErrors((prev) => ({ ...prev, instagram: undefined, website: undefined }));
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-sunbiotan-700"
          />
          {t('noInstagram')}
        </label>

        <div className="pt-2 space-y-3 border-t border-sunbiotan-300">
          <label className="flex items-start gap-3 pt-4 text-sm leading-relaxed text-sunbiotan-900 cursor-pointer">
            <input
              type="checkbox"
              checked={privacy}
              onChange={(e) => {
                setPrivacy(e.target.checked);
                setErrors((prev) => ({ ...prev, privacy_consent: undefined }));
              }}
              required
              aria-required="true"
              aria-invalid={!!err('privacy_consent')}
              aria-describedby={describedBy('privacy_consent')}
              className="mt-1 h-4 w-4 shrink-0 accent-sunbiotan-700"
            />
            <span>
              {t.rich('consentPrivacy', {
                link: (chunks) => (
                  <Link href="/privacidade" target="_blank" className="font-medium text-sunbiotan-900 underline underline-offset-2 hover:text-sunbiotan-700">
                    {chunks}
                  </Link>
                ),
              })}{' '}
              <span aria-hidden="true" className="text-sunbiotan-700">*</span>
            </span>
          </label>
          {err('privacy_consent') && <p id="pro-privacy_consent-error" className={ERROR}>{err('privacy_consent')}</p>}

          <label className="flex items-start gap-3 text-sm leading-relaxed text-sunbiotan-900 cursor-pointer">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-sunbiotan-700"
            />
            <span>{t('consentMarketing')}</span>
          </label>
        </div>

        <p className="text-xs text-sunbiotan-700">{t('requiredNote')}</p>

        {formError && (
          <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
            {formError}
          </p>
        )}

        <button type="submit" disabled={!privacy || busy} className={`${PRIMARY_BUTTON} w-full`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>{status === 'redirecting' ? t('preparing') : status === 'sending' ? t('sending') : t('submit')}</span>
          {!busy && <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />}
        </button>

        <p className="sr-only" aria-live="polite">{status === 'redirecting' ? t('preparing') : ''}</p>
      </form>
    </div>
  );
}
