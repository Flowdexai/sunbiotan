// lib/contact.ts
// Única fuente de verdad del teléfono comercial de Sun BioTan®. Cualquier
// lugar del sitio que muestre o enlace el número (JSON-LD, footer, contacto,
// botón de WhatsApp, política de privacidad, flujo profesional) lo toma de acá.

export const CONTACT_PHONE = {
  /** Para mostrar en pantalla. */
  display: '+351 920 253 796',
  /** E.164, para tel: y JSON-LD. */
  e164: '+351920253796',
  /** Formato de wa.me (sin + ni espacios). */
  wa: '351920253796',
} as const;

export const CONTACT_TEL_HREF = `tel:${CONTACT_PHONE.e164}`;

/** Enlace de WhatsApp con mensaje prearmado opcional. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${CONTACT_PHONE.wa}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
