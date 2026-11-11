// lib/partners/website.ts
// Convierte lo que escribió el candidato en "Website ou Instagram" en una URL
// segura (solo http/https) o null si no se puede interpretar.

const INSTAGRAM_HANDLE = /^@([A-Za-z0-9._]{1,30})$/;
const BARE_DOMAIN = /^([a-z0-9-]+\.)+[a-z]{2,}(:\d{1,5})?(\/\S*)?$/i;

export function websiteHref(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim();
  if (!value || /\s/.test(value)) return null;

  const handle = value.match(INSTAGRAM_HANDLE);
  if (handle) return `https://www.instagram.com/${encodeURIComponent(handle[1])}/`;

  let candidate = value;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    if (!BARE_DOMAIN.test(candidate)) return null;
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

const BARE_HANDLE = /^[A-Za-z0-9._]{1,30}$/;

/** Campo instagram de centers: "@handle", "handle" o URL completa → URL segura o null. */
export function instagramHref(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim();
  const handle = value.replace(/^@/, '');
  return websiteHref(BARE_HANDLE.test(handle) ? `@${handle}` : value);
}

/** Teléfono → "tel:" solo con dígitos y "+", o null si no queda ningún dígito. */
export function telHref(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/[^0-9+]/g, '');
  return /\d/.test(digits) ? `tel:${digits}` : null;
}
