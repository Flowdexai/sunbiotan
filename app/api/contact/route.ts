import { NextResponse } from 'next/server';
import { escapeHtml, isValidEmail, mailtoHref, sanitizeHeader } from '@/lib/email/escape';
import { sendEmail } from '@/lib/email/send';
import { getClientIp } from '@/lib/http/request';
import { rateLimit } from '@/lib/rate-limit';
import {
  ValidationError,
  readJsonObject,
  readString,
  honeypotTripped,
  readElapsedMs,
  PHONE_RE,
} from '@/lib/http/validate';

const MIN_ELAPSED_MS = 3_000;

export async function POST(req: Request) {
  let fields: { name: string; email: string; phone: string; message: string };

  try {
    const body = await readJsonObject(req);

    if (honeypotTripped(body)) return NextResponse.json({ ok: true, discarded: true });
    if (readElapsedMs(body) < MIN_ELAPSED_MS) return NextResponse.json({ ok: true, discarded: true });

    const email = readString(body, 'email', { required: true, max: 254 });
    if (!isValidEmail(email)) throw new ValidationError('email', 'format');

    // El formulario exige teléfono: el servidor también.
    const phone = readString(body, 'phone', { required: true, max: 40 });
    if (!PHONE_RE.test(phone)) throw new ValidationError('phone', 'format');

    fields = {
      name: readString(body, 'name', { required: true, max: 120 }),
      email,
      phone,
      message: readString(body, 'message', { required: true, max: 3000 }),
    };
  } catch (err) {
    const field = err instanceof ValidationError ? err.field : undefined;
    return NextResponse.json({ error: 'invalid', field }, { status: 400 });
  }

  // 5 por hora por IP (en memoria, mejor esfuerzo por instancia).
  const ip = getClientIp(req);
  if (ip && !rateLimit(`contact:${ip}`, 5, 3_600_000).allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const recipient = process.env.RESEND_TO;
  if (!recipient) {
    console.error('[contact] RESEND_TO no definida');
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  const e = escapeHtml;
  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a130a;">
        <h2 style="color: #7d5d2e; border-bottom: 1px solid #e5d4b5; padding-bottom: 12px;">
          Novo contacto — Sun BioTan
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 120px; color: #7d5d2e;">Nome</td>
            <td style="padding: 8px 0;">${e(fields.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e;">Email</td>
            <td style="padding: 8px 0;"><a href="${e(mailtoHref(fields.email))}" style="color: #7d5d2e;">${e(fields.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e;">Telefone</td>
            <td style="padding: 8px 0;">${e(fields.phone)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e; vertical-align: top;">Mensagem</td>
            <td style="padding: 8px 0; white-space: pre-wrap;">${e(fields.message)}</td>
          </tr>
        </table>
      </div>
    `;

  const text = `Novo contacto — Sun BioTan\n\nNome: ${fields.name}\nEmail: ${fields.email}\nTelefone: ${fields.phone}\n\nMensagem:\n${fields.message}`;

  const sent = await sendEmail({
    to: recipient,
    subject: sanitizeHeader(`Novo contacto de ${fields.name}`),
    html,
    text,
    replyTo: fields.email,
  });

  if (!sent.ok) {
    return NextResponse.json({ error: 'send_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
