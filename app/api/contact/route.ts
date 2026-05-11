import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, phone, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: process.env.RESEND_TO!,
    subject: `Novo contacto de ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a130a;">
        <h2 style="color: #c19a5b; border-bottom: 1px solid #e8d9c0; padding-bottom: 12px;">
          Novo contacto — Sunbiotan
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 120px; color: #7d5d2e;">Nome</td>
            <td style="padding: 8px 0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #c19a5b;">${email}</a></td>
          </tr>
          ${phone ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e;">Telefone</td>
            <td style="padding: 8px 0;">${phone}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e; vertical-align: top;">Mensagem</td>
            <td style="padding: 8px 0; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}