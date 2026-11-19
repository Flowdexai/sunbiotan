// lib/pro/validate.ts
// Validación del formulario profesional. Sin dependencias de servidor: el
// cliente usa las mismas funciones para mostrar errores antes de enviar, y la
// API las vuelve a aplicar (la del servidor es la que cuenta).
import { isValidEmail } from '@/lib/email/escape';
import { PHONE_RE } from '@/lib/http/validate';
import { isActivityType, type ActivityType } from '@/lib/partners/activity';

export const PRO_FIELD_MAX = {
  name: 120,
  business_name: 160,
  city: 120,
  phone: 40,
  email: 254,
  instagram: 300,
  website: 300,
} as const;

export type ProField =
  | 'name'
  | 'business_name'
  | 'city'
  | 'phone'
  | 'email'
  | 'activity_type'
  | 'instagram'
  | 'website'
  | 'privacy_consent'
  | 'marketing_consent'
  | 'no_instagram';

export interface ProFormData {
  name: string;
  business_name: string;
  city: string;
  phone: string;
  /** En minúsculas. */
  email: string;
  activity_type: ActivityType;
  no_instagram: boolean;
  /** "@usuario" si tiene Instagram; URL http/https normalizada si no. */
  website_or_instagram: string;
  privacy_consent: true;
  marketing_consent: boolean;
}

export type ProValidation =
  | { ok: true; data: ProFormData }
  | { ok: false; field: ProField; reason: ProErrorReason };

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;
const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com', 'instagr.am']);
// Rutas de instagram.com que no son perfiles.
const INSTAGRAM_RESERVED = new Set(['p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'tv', 'direct']);
const BARE_DOMAIN_RE = /^([a-z0-9-]+\.)+[a-z]{2,}(:\d{1,5})?(\/\S*)?$/i;

/**
 * Instagram: acepta "@usuario", "usuario", "instagram.com/usuario" o la URL
 * completa. Devuelve "@usuario" o null si no se puede interpretar.
 */
export function normalizeInstagram(raw: string): string | null {
  const value = raw.trim();
  if (!value || /\s/.test(value)) return null;

  const bare = value.replace(/^@/, '');
  if (HANDLE_RE.test(bare) && !bare.includes('/')) {
    // "usuario.pt" sin @ podría ser un dominio: solo se acepta como handle si
    // vino con @ o si no parece un dominio.
    if (value.startsWith('@') || !BARE_DOMAIN_RE.test(bare)) return `@${bare}`;
  }

  let candidate = value;
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const url = new URL(candidate);
    if (!INSTAGRAM_HOSTS.has(url.hostname.toLowerCase())) return null;
    const first = url.pathname.split('/').filter(Boolean)[0] ?? '';
    if (!HANDLE_RE.test(first) || INSTAGRAM_RESERVED.has(first.toLowerCase())) return null;
    return `@${first}`;
  } catch {
    return null;
  }
}

/** Web: URL http/https válida (un dominio sin esquema se completa con https://). */
export function normalizeWebsite(raw: string): string | null {
  const value = raw.trim();
  if (!value || /\s/.test(value)) return null;
  let candidate = value;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    if (!BARE_DOMAIN_RE.test(candidate)) return null;
    candidate = `https://${candidate}`;
  }
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.') || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isValidPhone(raw: string): boolean {
  const value = raw.trim();
  return PHONE_RE.test(value) && (value.match(/\d/g)?.length ?? 0) >= 6;
}

function str(body: Record<string, unknown>, key: string): string | null {
  const v = body[key];
  if (v === undefined || v === null) return '';
  if (typeof v !== 'string') return null;
  return v.trim();
}

export type ProErrorReason = 'required' | 'format' | 'too_long' | 'type';
export interface ProFieldError {
  field: ProField;
  reason: ProErrorReason;
}

/**
 * Valida todos los campos y devuelve TODOS los errores (en orden de
 * formulario) junto con los valores normalizados de los que pasaron.
 */
export function collectProFormErrors(body: Record<string, unknown>): {
  errors: ProFieldError[];
  values: Partial<ProFormData>;
} {
  const errors: ProFieldError[] = [];
  const values: Partial<ProFormData> = {};
  const fail = (field: ProField, reason: ProErrorReason) => errors.push({ field, reason });

  const text: Partial<Record<'name' | 'business_name' | 'city' | 'phone' | 'email', string>> = {};
  for (const key of ['name', 'business_name', 'city', 'phone', 'email'] as const) {
    const v = str(body, key);
    if (v === null) fail(key, 'type');
    else if (!v) fail(key, 'required');
    else if (v.length > PRO_FIELD_MAX[key]) fail(key, 'too_long');
    else text[key] = v;
  }
  if (text.name) values.name = text.name;
  if (text.business_name) values.business_name = text.business_name;
  if (text.city) values.city = text.city;
  if (text.phone !== undefined) {
    if (isValidPhone(text.phone)) values.phone = text.phone;
    else fail('phone', 'format');
  }
  if (text.email !== undefined) {
    const email = text.email.toLowerCase();
    if (isValidEmail(email)) values.email = email;
    else fail('email', 'format');
  }

  const activity = str(body, 'activity_type');
  if (activity === null) fail('activity_type', 'type');
  else if (!activity) fail('activity_type', 'required');
  else if (!isActivityType(activity)) fail('activity_type', 'format');
  else values.activity_type = activity;

  const noInstagram = body.no_instagram ?? false;
  if (typeof noInstagram !== 'boolean') {
    fail('no_instagram', 'type');
  } else {
    values.no_instagram = noInstagram;
    const key = noInstagram ? 'website' : 'instagram';
    const raw = str(body, key);
    if (raw === null) fail(key, 'type');
    else if (!raw) fail(key, 'required');
    else if (raw.length > PRO_FIELD_MAX[key]) fail(key, 'too_long');
    else {
      const link = noInstagram ? normalizeWebsite(raw) : normalizeInstagram(raw);
      if (link) values.website_or_instagram = link;
      else fail(key, 'format');
    }
  }

  if (body.privacy_consent !== true) fail('privacy_consent', 'required');
  else values.privacy_consent = true;

  const marketing = body.marketing_consent ?? false;
  if (typeof marketing !== 'boolean') fail('marketing_consent', 'type');
  else values.marketing_consent = marketing;

  return { errors, values };
}

/** Valida y normaliza el body del formulario. Si hay errores, devuelve el primero. */
export function validateProForm(body: Record<string, unknown>): ProValidation {
  const { errors, values } = collectProFormErrors(body);
  if (errors.length > 0) return { ok: false, ...errors[0] };
  return { ok: true, data: values as ProFormData };
}
