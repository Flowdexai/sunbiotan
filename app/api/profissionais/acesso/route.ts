// POST /api/profissionais/acesso
// Formulario profesional: guarda/actualiza el lead, avisa internamente y abre
// la presentación con la cookie firmada `pro_access` (30 min, sin renovación).
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, hashIp } from '@/lib/http/request';
import { honeypotTripped } from '@/lib/http/validate';
import { rateLimit } from '@/lib/rate-limit';
import { normalizeLocale } from '@/lib/auth/links';
import {
  PRO_CONSENT_VERSION,
  PRO_MAX_BODY_BYTES,
  PRO_MIN_ELAPSED_MS,
  PRO_RATE_LIMIT_PER_HOUR,
  PRO_RENOTIFY_DAYS,
  type ProFlow,
} from '@/lib/pro/config';
import { validateProForm } from '@/lib/pro/validate';
import { consentTexts } from '@/lib/pro/consent';
import { PRO_COOKIE, encodeProSession, getProSecret, newProSession, proCookieOptions } from '@/lib/pro/session';
import { notifyColumns, notifyProLead } from '@/lib/pro/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HOUR_MS = 3_600_000;

function invalid(field?: string) {
  return NextResponse.json({ error: 'invalid', ...(field ? { field } : {}) }, { status: 400 });
}

interface UpsertRow {
  lead_id: string;
  is_new: boolean;
  access_count: number;
  last_notified_at: string | null;
}

export async function POST(req: Request) {
  // ---- Body acotado --------------------------------------------------------
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > PRO_MAX_BODY_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return invalid();
  }
  if (Buffer.byteLength(raw, 'utf8') > PRO_MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return invalid();
    body = parsed as Record<string, unknown>;
  } catch {
    return invalid();
  }

  // ---- Anti-bots -----------------------------------------------------------
  // Honeypot: éxito aparente, sin guardar ni cookie (el cliente queda sin acceso).
  if (honeypotTripped(body)) return NextResponse.json({ ok: true });
  // Demasiado rápido: error genérico, para que un humano con autocompletado
  // pueda reintentar.
  const elapsed = body.elapsed_ms;
  if (typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed < PRO_MIN_ELAPSED_MS) {
    return invalid();
  }

  const flow: ProFlow = body.flow === 'test' ? 'test' : 'live';
  const isTest = flow === 'test';
  const locale = normalizeLocale(body.locale);

  const result = validateProForm(body);
  if (!result.ok) return invalid(result.field);
  const data = result.data;

  // ---- Falla cerrado sin secreto ----------------------------------------
  const secret = getProSecret();
  if (!secret) {
    console.error('[pro-acesso] rechazado: falta PRO_ACCESS_SECRET');
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    console.error('[pro-acesso] cliente admin no configurado');
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  // ---- Rate limit por ip_hash (eventos 'form' del mismo flow) -------------
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);
  const limit = PRO_RATE_LIMIT_PER_HOUR[flow];
  if (ipHash) {
    const since = new Date(Date.now() - HOUR_MS).toISOString();
    const { count, error } = await supabase
      .from('pro_lead_events')
      .select('id, pro_leads!inner(is_test)', { count: 'exact', head: true })
      .eq('type', 'form')
      .eq('ip_hash', ipHash)
      .eq('pro_leads.is_test', isTest)
      .gte('created_at', since);
    if (!error && (count ?? 0) >= limit) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
  } else if (ip) {
    // Sin IP_HASH_SALT no hay hash en la tabla: fallback en memoria (mejor esfuerzo).
    if (!rateLimit(`pro:${flow}:${ip}`, limit, HOUR_MS).allowed) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
  }

  // ---- Upsert por (email, is_test) + evento 'form' (atómico en SQL) -------
  const consent = consentTexts(locale);
  const { data: rows, error: upsertErr } = await supabase.rpc('pro_upsert_lead', {
    p_is_test: isTest,
    p_name: data.name,
    p_business_name: data.business_name,
    p_city: data.city,
    p_phone: data.phone,
    p_email: data.email,
    p_activity_type: data.activity_type,
    p_website_or_instagram: data.website_or_instagram,
    p_no_instagram: data.no_instagram,
    p_locale: locale,
    p_ip_hash: ipHash,
    p_privacy_version: PRO_CONSENT_VERSION,
    p_privacy_text: consent.privacy,
    p_marketing: data.marketing_consent,
    p_marketing_text: consent.marketing,
  });
  const row = (Array.isArray(rows) ? rows[0] : rows) as UpsertRow | undefined;
  if (upsertErr || !row?.lead_id) {
    console.error('[pro-acesso] upsert falló:', upsertErr?.code ?? 'no_row');
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  // ---- Aviso interno -------------------------------------------------------
  // Nuevo: siempre. Existente: si el último aviso fue hace más de 7 días.
  // Pruebas: siempre. Un fallo de aviso no cambia la respuesta.
  const lastNotified = row.last_notified_at ? Date.parse(row.last_notified_at) : NaN;
  const stale = !Number.isFinite(lastNotified) || Date.now() - lastNotified > PRO_RENOTIFY_DAYS * 86_400_000;
  if (row.is_new || isTest || stale) {
    try {
      const { data: lead } = await supabase
        .from('pro_leads')
        .select('name, business_name, city, activity_type, phone, email, website_or_instagram, no_instagram, locale, marketing_consent, is_test, access_count')
        .eq('id', row.lead_id)
        .maybeSingle();
      if (lead) {
        const outcome = await notifyProLead(lead);
        const { error: updErr } = await supabase.from('pro_leads').update(notifyColumns(outcome)).eq('id', row.lead_id);
        if (updErr) console.error('[pro-acesso] no se pudo guardar el estado del aviso:', updErr.code ?? 'unknown');
      }
    } catch (err) {
      console.error('[pro-acesso] aviso falló:', err instanceof Error ? err.name : 'unknown');
    }
  }

  // ---- Cookie de acceso ----------------------------------------------------
  const session = newProSession(row.lead_id, locale, flow);
  const res = NextResponse.json({ ok: true, isNew: row.is_new });
  res.cookies.set(PRO_COOKIE, encodeProSession(session, secret), proCookieOptions(session));
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
