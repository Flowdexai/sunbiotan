// lib/pro/consent.ts
// Texto exacto de los consentimientos tal como se mostró en el formulario,
// resuelto en el SERVIDOR desde messages según el idioma. Nunca se toma del
// cliente. Se guarda en pro_leads junto con PRO_CONSENT_VERSION.
import 'server-only';
import pt from '@/messages/pt.json';
import es from '@/messages/es.json';
import en from '@/messages/en.json';
import it from '@/messages/it.json';
import fr from '@/messages/fr.json';
import type { AppLocale } from '@/lib/auth/links';

const MESSAGES: Record<AppLocale, { ProLanding: { consentPrivacy: string; consentMarketing: string } }> = {
  pt,
  es,
  en,
  it,
  fr,
};

/** Quita las etiquetas de rich text de next-intl ("<link>…</link>" → "…"). */
function plain(text: string): string {
  return text.replace(/<\/?[a-zA-Z][\w-]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function consentTexts(locale: AppLocale): { privacy: string; marketing: string } {
  const ns = MESSAGES[locale].ProLanding;
  return { privacy: plain(ns.consentPrivacy), marketing: plain(ns.consentMarketing) };
}
