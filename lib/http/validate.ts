// lib/http/validate.ts
// Lectura defensiva de bodies JSON: cualquier tipo inesperado es un 400,
// nunca un 500.

export class ValidationError extends Error {
  constructor(public field: string, public reason: string) {
    super(`${field}: ${reason}`);
  }
}

export async function readJsonObject(req: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('body', 'invalid_json');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('body', 'not_object');
  }
  return body as Record<string, unknown>;
}

interface StrOpts {
  required?: boolean;
  max: number;
}

/** String recortado. Ausente/null en opcional → ''. Tipo distinto de string → 400. */
export function readString(body: Record<string, unknown>, key: string, opts: StrOpts): string {
  const raw = body[key];
  if (raw === undefined || raw === null) {
    if (opts.required) throw new ValidationError(key, 'required');
    return '';
  }
  if (typeof raw !== 'string') throw new ValidationError(key, 'type');
  const value = raw.trim();
  if (opts.required && value.length === 0) throw new ValidationError(key, 'required');
  if (value.length > opts.max) throw new ValidationError(key, 'too_long');
  return value;
}

/** Honeypot: lleno (o de tipo raro) = bot. */
export function honeypotTripped(body: Record<string, unknown>, key = 'hp_url'): boolean {
  const v = body[key];
  if (v === undefined || v === null) return false;
  if (typeof v !== 'string') return true;
  return v.trim().length > 0;
}

/**
 * Milisegundos que el formulario estuvo abierto, medidos en el cliente
 * (Date.now() al enviar − Date.now() al montar, ambos con el mismo reloj, así
 * que no hay desfase entre reloj del cliente y del servidor).
 */
export function readElapsedMs(body: Record<string, unknown>, key = 'elapsed_ms'): number {
  const v = body[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new ValidationError(key, 'type');
  return v;
}

export const PHONE_RE = /^[0-9+()\-.\s/]{6,40}$/;
