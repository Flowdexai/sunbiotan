// lib/pro/session.ts
// Cookie `pro_access`: acceso temporal a la presentación profesional.
//
// Formato: base64url(JSON del payload) + "." + base64url(HMAC-SHA256).
// Payload mínimo: id del lead, idioma, flag de prueba y expiración (segundos
// UNIX, fija desde el envío, sin renovación). No guarda datos personales.
//
// Secreto: PRO_ACCESS_SECRET (mínimo 32 caracteres). Si falta o es corto,
// FALLA CERRADO: no se firma ninguna cookie y ninguna se acepta.
import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { normalizeLocale, type AppLocale } from '@/lib/auth/links';
import { proSessionMinutes, type ProFlow } from './config';

export const PRO_COOKIE = 'pro_access';
export const PRO_SECRET_MIN_LENGTH = 32;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const B64URL_RE = /^[A-Za-z0-9_-]+$/;

export interface ProSession {
  leadId: string;
  locale: AppLocale;
  isTest: boolean;
  /** Expiración en segundos UNIX. */
  exp: number;
}

interface WirePayload {
  l: string;
  c: string;
  t: 0 | 1;
  e: number;
}

let warnedSecret = false;

/** Secreto desde el entorno, o null si falta o es demasiado corto (sin loguear el valor). */
export function getProSecret(): string | null {
  const secret = process.env.PRO_ACCESS_SECRET;
  if (!secret || secret.length < PRO_SECRET_MIN_LENGTH) {
    if (!warnedSecret) {
      console.error(
        `[pro-session] PRO_ACCESS_SECRET ${secret ? 'es demasiado corta' : 'no está definida'}: acceso a la presentación deshabilitado`
      );
      warnedSecret = true;
    }
    return null;
  }
  return secret;
}

function mac(data: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(data).digest();
}

/** Firma un payload con el secreto dado. */
export function encodeProSession(session: ProSession, secret: string): string {
  const wire: WirePayload = { l: session.leadId, c: session.locale, t: session.isTest ? 1 : 0, e: session.exp };
  const body = Buffer.from(JSON.stringify(wire), 'utf8').toString('base64url');
  const sig = mac(body, secret).toString('base64url');
  return `${body}.${sig}`;
}

/** Verifica firma, forma y expiración. Cualquier problema → null. */
export function decodeProSession(token: string | null | undefined, secret: string | null, nowMs = Date.now()): ProSession | null {
  if (!secret || !token || token.length > 512) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!B64URL_RE.test(body) || !B64URL_RE.test(sig)) return null;

  const expected = mac(body, secret);
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  let wire: unknown;
  try {
    wire = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!wire || typeof wire !== 'object') return null;
  const w = wire as Partial<WirePayload>;
  if (typeof w.l !== 'string' || !UUID_RE.test(w.l)) return null;
  if (typeof w.c !== 'string') return null;
  if (w.t !== 0 && w.t !== 1) return null;
  if (typeof w.e !== 'number' || !Number.isFinite(w.e)) return null;
  if (w.e * 1000 <= nowMs) return null;

  return { leadId: w.l, locale: normalizeLocale(w.c), isTest: w.t === 1, exp: w.e };
}

/**
 * Nueva sesión: expira proSessionMinutes(flow) después de `nowMs` (live 30 min;
 * test 30 días, temporal). El Max-Age de la cookie sale de este exp (proCookieOptions).
 */
export function newProSession(leadId: string, locale: AppLocale, flow: ProFlow, nowMs = Date.now()): ProSession {
  return {
    leadId,
    locale,
    isTest: flow === 'test',
    exp: Math.floor(nowMs / 1000) + proSessionMinutes(flow) * 60,
  };
}

/** Lee y verifica la cookie con el secreto del entorno. */
export function readProSession(token: string | null | undefined): ProSession | null {
  return decodeProSession(token, getProSecret());
}

/** Atributos de la cookie para NextResponse.cookies.set. */
export function proCookieOptions(session: ProSession, nowMs = Date.now()) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.max(0, session.exp - Math.floor(nowMs / 1000)),
  };
}

export function sessionFlow(session: ProSession): ProFlow {
  return session.isTest ? 'test' : 'live';
}
