// lib/http/request.ts
// Utilidades de request para route handlers: IP, hash de IP y same-origin.
import 'server-only';
import { createHash } from 'crypto';
import { getAppBaseUrl } from '@/lib/auth/links';

/** Primer valor de x-forwarded-for (proxy de Hostinger), o x-real-ip. */
export function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || null;
}

let warnedSalt = false;

/** sha256(IP + IP_HASH_SALT). Sin salt: warning una vez y null. */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    if (!warnedSalt) {
      console.warn('[ip-hash] IP_HASH_SALT no está definida: se guarda ip_hash = null');
      warnedSalt = true;
    }
    return null;
  }
  return createHash('sha256').update(`${ip}${salt}`).digest('hex');
}

function allowedOrigins(): string[] {
  const origins = new Set<string>();
  try {
    origins.add(new URL(getAppBaseUrl()).origin);
    // Variante con/sin www del dominio configurado.
    const u = new URL(getAppBaseUrl());
    const alt = u.hostname.startsWith('www.') ? u.hostname.slice(4) : `www.${u.hostname}`;
    origins.add(`${u.protocol}//${alt}${u.port ? `:${u.port}` : ''}`);
  } catch {
    /* URL inválida en env: solo se aceptará localhost en desarrollo */
  }
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }
  return [...origins];
}

function originOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Same-origin estricto: exige header Origin igual a la app.
 * Para mutaciones de admin (POST).
 */
export function isSameOriginStrict(req: Request): boolean {
  const origin = originOf(req.headers.get('origin'));
  return !!origin && allowedOrigins().includes(origin);
}

/**
 * Same-origin flexible: Origin válido, o sin Origin pero con Referer válido
 * (los GET same-origin a veces no mandan Origin).
 */
export function isSameOriginLoose(req: Request): boolean {
  const allowed = allowedOrigins();
  const origin = originOf(req.headers.get('origin'));
  if (origin) return allowed.includes(origin);
  const referer = originOf(req.headers.get('referer'));
  return !!referer && allowed.includes(referer);
}
