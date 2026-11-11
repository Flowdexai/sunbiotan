// lib/email/templates/layout.ts
// Layout común de los emails transaccionales (invitación / recuperación).
// Puro (sin server-only) para poder probarlo con un script de Node.
import { escapeHtml } from '../escape';

export interface EmailCopy {
  subject: string;
  heading: string;
  greeting: string; // ya con el nombre insertado (texto plano, se escapa aquí)
  body: string;
  button: string;
  fallback: string; // "Si el botón no funciona, copia este enlace:"
  footer: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderTransactionalEmail(lang: string, copy: EmailCopy, link: string): RenderedEmail {
  const e = escapeHtml;
  const safeLink = e(link);

  const html = `<!doctype html>
<html lang="${e(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#fdfbf7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fdfbf7;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td align="center" style="padding:0 0 32px 0;font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:0.45em;color:#1a130a;">
            SUNBIOTAN
          </td>
        </tr>
        <tr>
          <td style="padding:0 8px;">
            <h1 style="margin:0 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.25;color:#1a130a;text-align:center;">${e(copy.heading)}</h1>
            <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3d2e17;">${e(copy.greeting)}</p>
            <p style="margin:0 0 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3d2e17;">${e(copy.body)}</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 0 28px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="#c19a5b" style="border-radius:999px;border:1px solid #7d5d2e;">
                  <a href="${safeLink}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.06em;color:#1a130a;text-decoration:none;border-radius:999px;">${e(copy.button)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 8px 28px 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#5a4321;">
            ${e(copy.fallback)}<br>
            <a href="${safeLink}" target="_blank" rel="noopener" style="color:#7d5d2e;word-break:break-all;">${safeLink}</a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e5d4b5;padding:20px 8px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#5a4321;text-align:center;">
            ${e(copy.footer)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    'SUNBIOTAN',
    '',
    copy.heading,
    '',
    copy.greeting,
    '',
    copy.body,
    '',
    `${copy.button}: ${link}`,
    '',
    '—',
    copy.footer,
  ].join('\n');

  return { subject: copy.subject, html, text };
}
