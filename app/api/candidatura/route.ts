import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { escapeHtml, isValidEmail, mailtoHref, sanitizeHeader } from '@/lib/email/escape';
import { sendEmail, PARTNER_NOTIFY_EMAIL } from '@/lib/email/send';
import { getClientIp, hashIp } from '@/lib/http/request';
import { rateLimit } from '@/lib/rate-limit';
import {
  ValidationError,
  readJsonObject,
  readString,
  honeypotTripped,
  readElapsedMs,
  PHONE_RE,
} from '@/lib/http/validate';
import { ACTIVITY_LABELS_PT, isActivityType } from '@/lib/partners/activity';
import { normalizeLocale } from '@/lib/auth/links';

const MIN_ELAPSED_MS = 3_000;
const RATE_LIMIT_PER_HOUR = 3;
const DEDUPE_DAYS = 7;

export async function POST(req: Request) {
  let fields: {
    name: string;
    business_name: string;
    city: string;
    phone: string;
    email: string;
    message: string;
    website_or_instagram: string;
    activity_type: string;
    locale: string;
  };

  try {
    const body = await readJsonObject(req);

    // Bots: se responde éxito sin guardar ni enviar nada.
    if (honeypotTripped(body)) {
      return NextResponse.json({ ok: true, discarded: true });
    }
    const elapsed = readElapsedMs(body);
    if (elapsed < MIN_ELAPSED_MS) {
      return NextResponse.json({ ok: true, discarded: true });
    }

    const email = readString(body, 'email', { required: true, max: 254 }).toLowerCase();
    if (!isValidEmail(email)) throw new ValidationError('email', 'format');

    const phone = readString(body, 'phone', { required: true, max: 40 });
    if (!PHONE_RE.test(phone)) throw new ValidationError('phone', 'format');

    const activity = readString(body, 'activity_type', { required: true, max: 20 });
    if (!isActivityType(activity)) throw new ValidationError('activity_type', 'invalid');

    const rawLocale = body.locale;
    if (rawLocale !== undefined && rawLocale !== null && typeof rawLocale !== 'string') {
      throw new ValidationError('locale', 'type');
    }

    fields = {
      name: readString(body, 'name', { required: true, max: 120 }),
      business_name: readString(body, 'business_name', { required: true, max: 160 }),
      city: readString(body, 'city', { required: true, max: 120 }),
      phone,
      email,
      message: readString(body, 'message', { max: 3000 }),
      website_or_instagram: readString(body, 'website_or_instagram', { max: 300 }),
      activity_type: activity,
      locale: normalizeLocale(rawLocale),
    };
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: 'invalid', field: err.field }, { status: 400 });
    }
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    console.error('[candidatura] cliente admin no configurado');
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  // Rate limit: 3 por hora por ip_hash, contado en la tabla.
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);
  if (ipHash) {
    const since = new Date(Date.now() - 3_600_000).toISOString();
    const { count, error } = await supabase
      .from('partner_requests')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);
    if (!error && (count ?? 0) >= RATE_LIMIT_PER_HOUR) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
  } else if (ip) {
    // Sin salt no hay hash en la tabla: fallback en memoria (mejor esfuerzo).
    if (!rateLimit(`candidatura:${ip}`, RATE_LIMIT_PER_HOUR, 3_600_000).allowed) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
  }

  // Dedupe: mismo email en los últimos 7 días → éxito sin insertar ni avisar.
  {
    const since = new Date(Date.now() - DEDUPE_DAYS * 86_400_000).toISOString();
    const { count, error } = await supabase
      .from('partner_requests')
      .select('id', { count: 'exact', head: true })
      // Los emails se guardan en minúscula (fase3_extra.sql normaliza los viejos).
      .eq('email', fields.email)
      .gte('created_at', since);
    if (!error && (count ?? 0) > 0) {
      return NextResponse.json({ ok: true });
    }
  }

  const { error: dbError } = await supabase.from('partner_requests').insert({
    name: fields.name,
    business_name: fields.business_name,
    city: fields.city,
    phone: fields.phone,
    email: fields.email,
    message: fields.message || null,
    website_or_instagram: fields.website_or_instagram || null,
    activity_type: fields.activity_type,
    locale: fields.locale,
    ip_hash: ipHash,
    status: 'pending',
  });

  if (dbError) {
    console.error('[candidatura] insert falló:', dbError.code ?? 'unknown');
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  // Aviso interno. Si falla, la candidatura ya está guardada: igual éxito.
  const e = escapeHtml;
  const activityLabel = ACTIVITY_LABELS_PT[fields.activity_type as keyof typeof ACTIVITY_LABELS_PT];
  const row = (label: string, value: string, extraStyle = '') =>
    value
      ? `<tr>
            <td style="padding: 8px 0; font-weight: bold; width: 160px; color: #7d5d2e; vertical-align: top;">${e(label)}</td>
            <td style="padding: 8px 0;${extraStyle}">${e(value)}</td>
          </tr>`
      : '';

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a130a;">
        <h2 style="color: #7d5d2e; border-bottom: 1px solid #e5d4b5; padding-bottom: 12px;">
          Nova candidatura de parceiro — Sun BioTan
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${row('Nome', fields.name)}
          ${row('Espaço', fields.business_name)}
          ${row('Tipo de atividade', activityLabel)}
          ${row('Cidade', fields.city)}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e;">Email</td>
            <td style="padding: 8px 0;"><a href="${e(mailtoHref(fields.email))}" style="color: #7d5d2e;">${e(fields.email)}</a></td>
          </tr>
          ${row('Telefone', fields.phone)}
          ${row('Website / Instagram', fields.website_or_instagram)}
          ${row('Idioma', fields.locale.toUpperCase())}
          ${row('Mensagem', fields.message, ' white-space: pre-wrap;')}
        </table>
        <p style="margin-top: 24px; font-size: 12px; color: #5a4321;">Gerir em Dashboard → Candidaturas.</p>
      </div>
    `;

  const text = [
    'Nova candidatura de parceiro — Sun BioTan',
    '',
    `Nome: ${fields.name}`,
    `Espaço: ${fields.business_name}`,
    `Tipo de atividade: ${activityLabel}`,
    `Cidade: ${fields.city}`,
    `Email: ${fields.email}`,
    `Telefone: ${fields.phone}`,
    fields.website_or_instagram ? `Website / Instagram: ${fields.website_or_instagram}` : '',
    `Idioma: ${fields.locale.toUpperCase()}`,
    fields.message ? `\nMensagem:\n${fields.message}` : '',
  ].filter(Boolean).join('\n');

  const sent = await sendEmail({
    to: PARTNER_NOTIFY_EMAIL,
    subject: sanitizeHeader(`Nova candidatura de parceiro — ${fields.name} (${fields.business_name})`),
    html,
    text,
    replyTo: fields.email,
  });
  if (!sent.ok) {
    console.error('[candidatura] guardada, pero el aviso por email falló');
  }

  return NextResponse.json({ ok: true });
}
