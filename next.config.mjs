// next.config.mjs
//
// JavaScript puro (no .ts) A PROPÓSITO: desde Next 16.3 el binario nativo de
// SWC para Linux exige glibc 2.30 y el contenedor de build de Hostinger tiene
// una más vieja, así que Next cae a SWC WASM. Con WASM, un next.config.ts
// envuelto por Hostinger falla al cargar ("Cannot find module
// '<hash>.next.config'"). Un .mjs se carga sin transpilar y no depende de SWC.
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Origen de Supabase (https + wss) derivado de la variable pública; si no
// está, comodín de Supabase como respaldo. Nunca se hardcodea el proyecto.
/** @returns {{ http: string; ws: string }} */
function supabaseOrigins() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '');
    return { http: url.origin, ws: `wss://${url.host}` };
  } catch {
    return { http: 'https://*.supabase.co', ws: 'wss://*.supabase.co' };
  }
}

const supabase = supabaseOrigins();

// Google Analytics 4 + Google Ads (gtag en app/[locale]/layout.tsx).
// Las conversiones de Ads pueden ir al dominio de Google del país del visitante.
const GOOGLE_TAG = [
  'https://www.googletagmanager.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://www.googleadservices.com',
  'https://googleads.g.doubleclick.net',
  'https://www.google.com',
  'https://www.google.pt',
  'https://www.google.es',
  'https://www.google.fr',
  'https://www.google.it',
];

// Google Maps JavaScript API + Places Autocomplete (mapa-centros).
const GOOGLE_MAPS = ['https://*.googleapis.com', 'https://*.gstatic.com', 'https://*.ggpht.com'];

/*
 * CSP en modo Report-Only A PROPÓSITO: no bloquea nada, solo informa en la
 * consola del navegador. Hostinger ya agrega su propio
 * `upgrade-insecure-requests`; no debe haber ninguna política que bloquee
 * hasta revisar las violaciones reales.
 *
 * `'unsafe-inline'` en script-src es necesario por el script inline de GA
 * (layout) y el JSON-LD. La alternativa (nonces) obligaría a renderizar
 * todas las páginas de forma dinámica y se perderían las estáticas.
 * `'unsafe-eval'` y `blob:` en script-src los pide la guía de CSP de la
 * Maps JavaScript API.
 */
const CSP = [
  "default-src 'self'",
  ["script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:", ...GOOGLE_TAG, ...GOOGLE_MAPS].join(' '),
  ["connect-src 'self'", supabase.http, supabase.ws, ...GOOGLE_TAG, ...GOOGLE_MAPS].join(' '),
  ["img-src 'self' data: blob:", supabase.http, ...GOOGLE_TAG, ...GOOGLE_MAPS, 'https://*.googleusercontent.com'].join(' '),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Supabase: vídeos del bucket público "results" (página de resultados).
  ["media-src 'self'", supabase.http].join(' '),
  [
    'frame-src',
    'https://drive.google.com',
    'https://www.googletagmanager.com',
    'https://td.doubleclick.net',
    'https://bid.g.doubleclick.net',
    'https://www.google.com',
  ].join(' '),
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), geolocation=(self)' },
  { key: 'Content-Security-Policy-Report-Only', value: CSP },
];

/*
 * Flujo profesional (formulario → presentación reservada). Mismas bases que
 * PRO_BASES en lib/pro/config.ts: si cambian en el swap, cambiar las dos.
 *   · test: todo el subárbol noindex/nofollow (la ruta no se publica en ningún lado).
 *   · presentación (test y live): sin caché compartida y noindex.
 * No se agrega Disallow en robots.txt a propósito: publicaría las rutas.
 */
const PRO_BASES = { test: '/profissionais-test', live: '/profissionais' };
const PRO_PRESENTATION = '/apresentacao';
// Prefijos de idioma explícitos (pt va sin prefijo: localePrefix 'as-needed').
const LOCALE_PREFIX = '/:locale(es|en|it|fr)';

const NOINDEX = { key: 'X-Robots-Tag', value: 'noindex, nofollow' };

function proHeaders() {
  const testTree = [`${PRO_BASES.test}/:path*`, `${LOCALE_PREFIX}${PRO_BASES.test}/:path*`].map((source) => ({
    source,
    headers: [NOINDEX],
  }));
  const presentation = Object.values(PRO_BASES).flatMap((base) =>
    [`${base}${PRO_PRESENTATION}`, `${LOCALE_PREFIX}${base}${PRO_PRESENTATION}`].map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }, NOINDEX],
    }))
  );
  return [...testTree, ...presentation];
}

/*
 * Página de resultados (prueba). Misma base que RESULTS_BASE en
 * lib/results/config.ts: si cambia en el swap, cambiar las dos.
 * Todo el subárbol noindex/nofollow (`:path*` también cubre la base sola).
 */
const RESULTS_BASE = '/resultados-test';

function resultsHeaders() {
  return [`${RESULTS_BASE}/:path*`, `${LOCALE_PREFIX}${RESULTS_BASE}/:path*`].map((source) => ({
    source,
    headers: [NOINDEX],
  }));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      // Solo en producción: ahí los chunks llevan hash de contenido. En `next dev` los
      // nombres de chunk no cambian con el código y un "immutable" deja al navegador con
      // JS/CSS viejos (Next también lo advierte para rutas /_next/ con Cache-Control propio).
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/_next/static/:path*',
              headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
          ]
        : []),
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      ...proHeaders(),
      ...resultsHeaders(),
    ];
  },
};

export default withNextIntl(nextConfig);
