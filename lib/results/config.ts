// lib/results/config.ts
// Página de resultados (vídeos + fotos). Sin 'server-only': la usan los
// componentes de cliente. Para agregar o quitar medios basta con editar las
// listas de abajo; los componentes no tienen nada fijo.

/**
 * Ruta base (sin prefijo de idioma). Si cambia, actualizar también
 * RESULTS_BASE en next.config.mjs (header X-Robots-Tag).
 */
export const RESULTS_BASE = '/resultados-test';

/** Bucket público de Supabase Storage con los archivos. */
export const RESULTS_BUCKET = 'results';

// NEXT_PUBLIC_*: Next la incrusta en el bundle del cliente al compilar.
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');

/** URL pública de un archivo del bucket. */
export function resultsMediaUrl(file: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${RESULTS_BUCKET}/${encodeURIComponent(file)}`;
}

export interface ResultVideo {
  file: string;
  /** Portada (jpg) del mismo bucket. */
  poster: string;
  width: number;
  height: number;
  /** Duración en segundos (solo para mostrarla en la miniatura). */
  duration: number;
}

export interface ResultPhoto {
  file: string;
  /** Tamaño real en px: el visor nunca la muestra más grande que esto. */
  width: number;
  height: number;
}

const video = (n: number, duration: number): ResultVideo => ({
  file: `video-${n}.mp4`,
  poster: `video-${n}-poster.jpg`,
  width: 720,
  height: 1280,
  duration,
});

export const RESULT_VIDEOS: readonly ResultVideo[] = [
  video(1, 11),
  video(2, 5),
  video(3, 10),
  video(4, 6),
  video(5, 36),
  video(6, 13),
];

export const RESULT_PHOTOS: readonly ResultPhoto[] = [
  { file: 'foto-1.jpg', width: 686, height: 911 },
  { file: 'foto-2.jpg', width: 576, height: 705 },
  { file: 'foto-3.jpg', width: 720, height: 1280 },
  { file: 'foto-4.jpg', width: 1280, height: 720 },
  { file: 'foto-5.jpg', width: 718, height: 1280 },
  { file: 'foto-6.jpg', width: 410, height: 554 },
];

/** 11 → "0:11", 36 → "0:36", 75 → "1:15". */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 1 → "01". */
export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
