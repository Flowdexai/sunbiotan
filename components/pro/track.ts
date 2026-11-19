// components/pro/track.ts
// Registro de interés (clic en WhatsApp) desde la presentación. Usa
// sendBeacon para no frenar la navegación; si no está disponible, fetch con
// keepalive. Nunca bloquea ni rompe el enlace real.

export const PRO_INTEREST_URL = '/api/profissionais/interesse';
export const PRO_VISIT_URL = '/api/profissionais/visita';

export function trackWhatsappInterest(): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon(PRO_INTEREST_URL)) return;
    }
    void fetch(PRO_INTEREST_URL, { method: 'POST', keepalive: true, credentials: 'same-origin' }).catch(() => {});
  } catch {
    /* el enlace de WhatsApp funciona igual */
  }
}

type Gtag = (...args: unknown[]) => void;

/** gtag de la página (GA4 + Ads), si está cargado. */
export function getGtag(): Gtag | null {
  if (typeof window === 'undefined') return null;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof g === 'function' ? g : null;
}
