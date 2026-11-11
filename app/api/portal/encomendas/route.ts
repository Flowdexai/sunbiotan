import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { escapeHtml, isValidEmail, mailtoHref, sanitizeHeader } from '@/lib/email/escape';
import { sendEmail, PARTNER_NOTIFY_EMAIL } from '@/lib/email/send';
import { isSameOriginStrict } from '@/lib/http/request';
import { readJsonObject, readString } from '@/lib/http/validate';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 100;
const MAX_QTY = 1000;

export async function POST(req: Request) {
  if (!isSameOriginStrict(req)) return NextResponse.json({ error: 'forbidden_origin' }, { status: 403 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let message: string;
  let items: { product_id: string; quantity: number }[];
  try {
    const body = await readJsonObject(req);
    message = readString(body, 'message', { max: 2000 });
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS) {
      throw new Error('items');
    }
    items = body.items.map((raw) => {
      if (!raw || typeof raw !== 'object') throw new Error('item');
      const { product_id, quantity } = raw as Record<string, unknown>;
      if (typeof product_id !== 'string' || !UUID_RE.test(product_id)) throw new Error('product_id');
      if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
        throw new Error('quantity');
      }
      return { product_id, quantity };
    });
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // Con el cliente de sesión: auth.uid() dentro de create_order es el profesional.
  const { data: orderId, error: rpcError } = await supabase.rpc('create_order', {
    p_message: message || null,
    p_items: items,
  });

  if (rpcError || !orderId) {
    // 42501 = sin permiso (no aprobado); 22023/P0001 = validación en la función.
    const status = rpcError?.code === '42501' ? 403 : 400;
    console.error('[encomendas] create_order falló:', rpcError?.code ?? 'no_id');
    return NextResponse.json({ error: 'order_failed' }, { status });
  }

  // Aviso interno (si falla, el pedido igual queda creado).
  try {
    const [{ data: profile }, { data: lines }] = await Promise.all([
      supabase.from('profiles').select('full_name, email, center_id').eq('id', user.id).maybeSingle(),
      supabase.from('order_items').select('quantity, products ( name )').eq('order_id', orderId as string),
    ]);
    let centerLabel = '';
    if (profile?.center_id) {
      const { data: center } = await supabase.from('centers').select('name, city').eq('id', profile.center_id).maybeSingle();
      if (center) centerLabel = `${center.name} · ${center.city}`;
    }

    const proName = profile?.full_name || user.email || '';
    const proEmail = profile?.email || user.email || '';
    const lineList = (lines ?? []).map((l) => {
      const p = (l as { products: { name: string } | { name: string }[] | null }).products;
      const name = Array.isArray(p) ? p[0]?.name : p?.name;
      return { name: name ?? '—', quantity: (l as { quantity: number }).quantity };
    });

    const e = escapeHtml;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a130a;">
        <h2 style="color: #7d5d2e; border-bottom: 1px solid #e5d4b5; padding-bottom: 12px;">Nova encomenda — Sun BioTan</h2>
        <p><strong>Profissional:</strong> ${e(proName)}${
          isValidEmail(proEmail) ? ` (<a href="${e(mailtoHref(proEmail))}" style="color:#7d5d2e;">${e(proEmail)}</a>)` : ''
        }</p>
        <p><strong>Centro:</strong> ${e(centerLabel || 'Sem centro')}</p>
        <p><strong>Referência:</strong> #${e(String(orderId).slice(0, 8).toUpperCase())}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          ${lineList.map((l) => `<tr><td style="padding: 6px 0; border-bottom: 1px solid #f1e6d3;">${e(l.name)}</td><td style="padding: 6px 0; border-bottom: 1px solid #f1e6d3; text-align: right;">× ${e(l.quantity)}</td></tr>`).join('')}
        </table>
        ${message ? `<p style="margin-top: 16px;"><strong>Mensagem:</strong></p><p style="white-space: pre-wrap;">${e(message)}</p>` : ''}
        <p style="margin-top: 24px; font-size: 12px; color: #5a4321;">Gerir em Dashboard → Encomendas.</p>
      </div>`;
    const text = [
      'Nova encomenda — Sun BioTan',
      `Profissional: ${proName} ${proEmail ? `<${proEmail}>` : ''}`,
      `Centro: ${centerLabel || 'Sem centro'}`,
      `Referência: #${String(orderId).slice(0, 8).toUpperCase()}`,
      '',
      ...lineList.map((l) => `- ${l.name} × ${l.quantity}`),
      message ? `\nMensagem:\n${message}` : '',
    ].join('\n');

    const sent = await sendEmail({
      to: PARTNER_NOTIFY_EMAIL,
      subject: sanitizeHeader(`Nova encomenda — ${proName}`),
      html,
      text,
      replyTo: isValidEmail(proEmail) ? proEmail : undefined,
    });
    if (!sent.ok) console.error('[encomendas] pedido creado, pero el aviso por email falló');
  } catch {
    console.error('[encomendas] pedido creado, error armando el aviso');
  }

  return NextResponse.json({ ok: true, id: orderId });
}
