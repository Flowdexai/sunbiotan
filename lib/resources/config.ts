// lib/resources/config.ts
// Valores fijos de resources (coinciden con los checks de la base).
export const RESOURCE_CATEGORIES = ['formacao', 'marketing', 'marca', 'sistema'] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_TYPES = ['video', 'image', 'document', 'logo'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_LOCALES = ['pt', 'es', 'en', 'it', 'fr'] as const;

// Bucket privado (lectura: profesional aprobado o admin; escritura: admin).
export const PORTAL_RESOURCES_BUCKET = 'portal-resources';
export const PORTAL_RESOURCES_MAX_MB = 50;
// Coinciden con los mimes permitidos en el bucket: pdf, mp4, png, jpg, webp, pptx.
export const PORTAL_RESOURCES_EXTENSIONS = ['pdf', 'mp4', 'png', 'jpg', 'jpeg', 'webp', 'pptx'];
export const PORTAL_RESOURCES_ACCEPT = '.pdf,.mp4,.png,.jpg,.jpeg,.webp,.pptx';

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
