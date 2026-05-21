import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, business_name, city, phone, email, message } = await req.json();

  if (!name || !business_name || !city || !email || !message) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: dbError } = await supabase.from('partner_requests').insert({
    name: name.trim(),
    business_name: business_name.trim(),
    city: city.trim(),
    phone: phone?.trim() || null,
    email: email.trim(),
    message: message.trim(),
    status: 'pending',
  });

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao guardar candidatura.' }, { status: 500 });
  }

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: 'info@sunbiotan.pt',
    subject: `Nova candidatura de parceiro — ${name} (${business_name})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a130a;">
        <h2 style="color: #c19a5b; border-bottom: 1px solid #e8d9c0; padding-bottom: 12px;">
          Nova candidatura de parceiro — Sunbiotan
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #7d5d2e;">Nome</td>
            <td style="padding: 8px 0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e;">Espaço</td>
            <td style="padding: 8px 0;">${business_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #7d5d2e;">Cidade</td>
            <td style="padding: 8px 0;">${city}</td>
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

  if (emailError) {
    console.error('Candidatura saved but email failed:', emailError);
  }

  return NextResponse.json({ success: true });
}
