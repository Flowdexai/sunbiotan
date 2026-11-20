// lib/pro/config.ts
// Configuración del flujo profesional (formulario → presentación reservada).
// Sin 'server-only': lo usan también los componentes de cliente.

/** Minutos que dura el acceso a la presentación desde el envío (sin renovación), flow live. */
export const PRO_SESSION_MINUTES = 30;

/**
 * TEMPORAL, solo para la fase de prueba: en el flow 'test' el acceso dura 30 días,
 * así se puede revisar la presentación sin volver a llenar el formulario.
 * El flow live NO cambia: sigue en PRO_SESSION_MINUTES (30 min).
 */
export const PRO_SESSION_MINUTES_TEST = 60 * 24 * 30;

/** Duración del acceso según el flow (fuente única para el exp de la cookie). */
export function proSessionMinutes(flow: ProFlow): number {
  return flow === 'test' ? PRO_SESSION_MINUTES_TEST : PRO_SESSION_MINUTES;
}

/**
 * Temporal, solo fase de prueba. Con true, /profissionais-test/apresentacao se abre sin cookie.
 * Poner en false para volver a proteger. No afecta al flow live.
 */
export const PRO_PRESENTATION_OPEN_TEST = true;

/**
 * ¿Se muestra la presentación (sin lead) cuando NO hay sesión válida? Solo en 'test' y con
 * el interruptor en true; en cualquier otro caso se redirige al formulario como siempre.
 */
export function proPresentationOpenWithoutSession(flow: ProFlow, openTest: boolean = PRO_PRESENTATION_OPEN_TEST): boolean {
  return flow === 'test' && openTest;
}

/** Versión de los textos de consentimiento que se guarda con cada lead. Cambiarla al editar los textos. */
export const PRO_CONSENT_VERSION = '2026-11-18';

export type ProFlow = 'test' | 'live';

/**
 * Ruta base de cada flow (sin prefijo de idioma). La presentación vive en
 * `${base}/apresentacao`. Si cambian, actualizar también PRO_BASES en
 * next.config.mjs (headers de noindex / no-store).
 */
export const PRO_BASES: Record<ProFlow, string> = {
  test: '/profissionais-test',
  live: '/profissionais',
};

export const PRO_PRESENTATION_SEGMENT = '/apresentacao';

export function proBase(flow: ProFlow): string {
  return PRO_BASES[flow];
}

export function proPresentationPath(flow: ProFlow): string {
  return `${PRO_BASES[flow]}${PRO_PRESENTATION_SEGMENT}`;
}

/** Envíos del formulario por hora y por IP (hash). Las pruebas tienen más margen. */
export const PRO_RATE_LIMIT_PER_HOUR: Record<ProFlow, number> = {
  test: 20,
  live: 3,
};

/** Tiempo mínimo con el formulario abierto antes de enviar (anti-bots). */
export const PRO_MIN_ELAPSED_MS = 3_000;

/** Tamaño máximo del body del formulario. */
export const PRO_MAX_BODY_BYTES = 10 * 1024;

/** Un lead que vuelve solo genera aviso si el último fue hace más de esto. */
export const PRO_RENOTIFY_DAYS = 7;

/** Una visita a la presentación cuenta solo si la anterior fue hace más de esto. */
export const PRO_VIEW_MIN_INTERVAL_MINUTES = 5;

/** Clics de WhatsApp registrados por lead y por hora (tope contra inflado). */
export const PRO_WHATSAPP_CLICKS_PER_HOUR = 30;

/**
 * Conversión de Google Ads del formulario profesional. Hoy es la misma
 * etiqueta que el formulario de contacto; se cambia acá si se crea una propia.
 */
export const PRO_ADS_SEND_TO = 'AW-18244892935/zmTLCNSP_8AcEIfy6_tD';

/** Evento de GA4 del envío del formulario profesional (solo flow live). */
export const PRO_GA4_EVENT = 'pro_form_submit';
