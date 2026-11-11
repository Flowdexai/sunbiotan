import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Origen de Supabase (https + wss) derivado de la variable pública; si no
// está, comodín de Supabase como respaldo. Nunca se hardcodea el proyecto.
function supabaseOrigins(): { http: string; ws: string } {
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
  "media-src 'self'",
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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
