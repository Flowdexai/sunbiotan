// lib/pro/notify.ts
// Aviso interno de un lead profesional: email (Resend) + Telegram.
// Cada canal devuelve su resultado por separado y ninguno lanza: un fallo de
// aviso nunca rompe la respuesta al usuario.
import 'server-only';
import { escapeHtml, isValidEmail, mailtoHref, sanitizeHeader } from '@/lib/email/escape';
import { sendEmail, PARTNER_NOTIFY_EMAIL } from '@/lib/email/send';
import { ACTIVITY_LABELS_PT, isActivityType } from '@/lib/partners/activity';
import { instagramHref, telHref, websiteHref } from '@/lib/partners/website';
import { sendTelegramMessage, type ChannelResult } from './telegram';

export type { ChannelResult } from './telegram';

/** Columnas de pro_leads que usa el aviso. */
export interface ProLeadForNotify {
  name: string;
  business_name: string;
  city: string;
  activity_type: string;
  phone: string;
  email: string;
  website_or_instagram: string | null;
  no_instagram: boolean;
  locale: string;
  marketing_consent: boolean;
  is_test: boolean;
  access_count: number;
}

export interface NotifyResult {
  email: ChannelResult;
  telegram: ChannelResult;
}

/** Columnas a actualizar en pro_leads con el resultado del aviso. */
export function notifyColumns(result: NotifyResult, now = new Date()) {
  const anySent = result.email.status === 'sent' || result.telegram.status === 'sent';
  return {
    notify_email_status: result.email.status,
    notify_email_error: result.email.error ?? null,
    notify_telegram_status: result.telegram.status,
    notify_telegram_error: result.telegram.error ?? null,
    // Solo cuenta como avisado si salió por algún canal: si los dos fallan, el
    // próximo envío del mismo email vuelve a intentar.
    ...(anySent ? { last_notified_at: now.toISOString() } : {}),
  };
}

function shortError(reason: string | undefined): string {
  return (reason ?? 'error').replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 60);
}

function activityLabel(value: string): string {
  return isActivityType(value) ? ACTIVITY_LABELS_PT[value] : value;
}

function linkFor(lead: ProLeadForNotify): string | null {
  if (!lead.website_or_instagram) return null;
  return lead.no_instagram ? websiteHref(lead.website_or_instagram) : instagramHref(lead.website_or_instagram);
}

export async function notifyProLead(lead: ProLeadForNotify): Promise<NotifyResult> {
  const testTag = lead.is_test ? '[TESTE] ' : '';
  const returning = lead.access_count > 1;
  const headline = returning ? 'Contacto profissional voltou' : 'Novo contacto profissional';
  const linkLabel = lead.no_instagram ? 'Website' : 'Instagram';
  const marketing = lead.marketing_consent ? 'Sim' : 'Não';
  const activity = activityLabel(lead.activity_type);

  // ---- Email ---------------------------------------------------------------
  const e = escapeHtml;
  const tel = telHref(lead.phone);
  const link = linkFor(lead);
  const row = (label: string, valueHtml: string) =>
    `<tr>
      <td style="padding: 8px 0; font-weight: bold; width: 170px; color: #7d5d2e; vertical-align: top;">${e(label)}</td>
      <td style="padding: 8px 0;">${valueHtml}</td>
    </tr>`;
  const a = (href: string, text: string) => `<a href="${e(href)}" style="color: #7d5d2e;">${e(text)}</a>`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a130a;">
      ${lead.is_test ? '<p style="display: inline-block; padding: 4px 10px; background: #f1e6d3; color: #5a4321; font-weight: bold; font-size: 12px; letter-spacing: 0.1em;">TESTE</p>' : ''}
      <h2 style="color: #7d5d2e; border-bottom: 1px solid #e5d4b5; padding-bottom: 12px;">
        ${e(headline)} — Sun BioTan
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        ${row('Nome', e(lead.name))}
        ${row('Centro', e(lead.business_name))}
        ${row('Localidade', e(lead.city))}
        ${row('Tipo de atividade', e(activity))}
        ${row('Telefone', tel ? a(tel, lead.phone) : e(lead.phone))}
        ${row('Email', isValidEmail(lead.email) ? a(mailtoHref(lead.email), lead.email) : e(lead.email))}
        ${lead.website_or_instagram ? row(linkLabel, link ? a(link, lead.website_or_instagram) : e(lead.website_or_instagram)) : ''}
        ${row('Idioma', e(lead.locale.toUpperCase()))}
        ${row('Aceitou novidades', e(marketing))}
        ${returning ? row('Acessos', e(String(lead.access_count))) : ''}
      </table>
      <p style="margin-top: 24px; font-size: 12px; color: #5a4321;">Ver em Dashboard → Contactos.</p>
    </div>
  `;

  const textLines = [
    `${testTag}${headline} — Sun BioTan`,
    '',
    `Nome: ${lead.name}`,
    `Centro: ${lead.business_name}`,
    `Localidade: ${lead.city}`,
    `Tipo de atividade: ${activity}`,
    `Telefone: ${lead.phone}`,
    `Email: ${lead.email}`,
    lead.website_or_instagram ? `${linkLabel}: ${lead.website_or_instagram}` : null,
    `Idioma: ${lead.locale.toUpperCase()}`,
    `Aceitou novidades: ${marketing}`,
    returning ? `Acessos: ${lead.access_count}` : null,
  ];
  const text = textLines.filter((l) => l !== null).join('\n');

  const emailPromise: Promise<ChannelResult> = sendEmail({
    to: PARTNER_NOTIFY_EMAIL,
    subject: sanitizeHeader(`${testTag}${headline} — ${lead.name} (${lead.business_name})`),
    html,
    text,
    replyTo: lead.email,
  })
    .then((r): ChannelResult => {
      if (r.ok) return { status: 'sent' };
      if (r.reason === 'not_configured') return { status: 'skipped', error: 'not_configured' };
      return { status: 'error', error: shortError(r.reason) };
    })
    .catch((): ChannelResult => ({ status: 'error', error: 'exception' }));

  // ---- Telegram (texto plano) ---------------------------------------------
  const telegramText = [
    `${testTag}${headline}`,
    '',
    `${lead.name} · ${lead.business_name}`,
    `${lead.city} · ${activity}`,
    `Tel: ${lead.phone}`,
    `Email: ${lead.email}`,
    lead.website_or_instagram ? `${linkLabel}: ${lead.website_or_instagram}` : null,
    `Idioma: ${lead.locale.toUpperCase()}`,
    returning ? `Acessos: ${lead.access_count}` : null,
  ].filter((l) => l !== null).join('\n');

  const telegramPromise = sendTelegramMessage(telegramText)
    .then((r) => (r.error ? { ...r, error: shortError(r.error) } : r))
    .catch((): ChannelResult => ({ status: 'error', error: 'exception' }));

  const [email, telegram] = await Promise.all([emailPromise, telegramPromise]);
  return { email, telegram };
}
