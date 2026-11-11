// lib/email/send.ts
// Wrapper de Resend. Nunca loguea valores de variables de entorno ni datos
// personales: solo el tipo de fallo.
import 'server-only';
import { Resend } from 'resend';
import { sanitizeHeader, isValidEmail } from './escape';

export const PARTNER_NOTIFY_EMAIL = process.env.PARTNER_NOTIFY_EMAIL || 'info@sunbiotan.pt';

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Si no se pasa, reply-to = PARTNER_NOTIFY_EMAIL. */
  replyTo?: string;
}

export type SendResult = { ok: true } | { ok: false; reason: string };

export async function sendEmail({ to, subject, html, text, replyTo }: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;
  if (!apiKey || !fromAddress) {
    console.error('[email] Resend no configurado (faltan RESEND_API_KEY o RESEND_FROM)');
    return { ok: false, reason: 'not_configured' };
  }

  const reply = replyTo && isValidEmail(replyTo) ? replyTo : PARTNER_NOTIFY_EMAIL;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Sun BioTan <${fromAddress}>`,
      to,
      subject: sanitizeHeader(subject, 250),
      html,
      text,
      replyTo: reply,
    });
    if (error) {
      console.error('[email] Resend devolvió error:', error.name ?? 'unknown');
      return { ok: false, reason: error.name ?? 'resend_error' };
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] Excepción al enviar:', err instanceof Error ? err.name : 'unknown');
    return { ok: false, reason: 'exception' };
  }
}
