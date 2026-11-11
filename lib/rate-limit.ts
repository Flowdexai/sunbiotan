// lib/rate-limit.ts
// Limitador en memoria con ventana deslizante.
//
// MEJOR ESFUERZO, POR INSTANCIA: el estado vive en el proceso de Node. Si
// Hostinger reinicia la app o levanta varias instancias, cada una cuenta por
// su lado y los contadores se pierden al reiniciar. Sirve para frenar abuso
// casual; para límites que tienen que ser exactos se cuenta en la base (como
// hace /api/candidatura con partner_requests).
import 'server-only';

const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(now: number, maxWindowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < maxWindowMs);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

/**
 * Registra un intento para `key` y devuelve si está permitido.
 * Si no está permitido, el intento NO se registra.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  sweep(now, Math.max(windowMs, 3_600_000));
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000));
    return { allowed: false, retryAfterSec };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, retryAfterSec: 0 };
}
