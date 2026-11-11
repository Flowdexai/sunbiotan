// lib/email/escape.ts
// Todo dato que venga de un usuario o de la base pasa por escapeHtml antes de
// entrar en el HTML de un email. sanitizeHeader se usa para asuntos.

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** Quita saltos de línea y caracteres de control; colapsa espacios; recorta a `max`. */
export function sanitizeHeader(value: unknown, max = 200): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

/** href mailto: seguro. Solo para emails que ya pasaron isValidEmail. */
export function mailtoHref(email: string): string {
  return `mailto:${encodeURIComponent(email).replace(/%40/g, '@')}`;
}
