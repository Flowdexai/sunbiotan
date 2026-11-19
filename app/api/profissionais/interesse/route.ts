// POST /api/profissionais/interesse
// Clic en un CTA de WhatsApp de la presentación. Pensado para
// navigator.sendBeacon: el body se ignora y la respuesta no se lee.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, hashIp } from '@/lib/http/request';
import { rateLimit } from '@/lib/rate-limit';
import { PRO_COOKIE, readProSession } from '@/lib/pro/session';
import { PRO_WHATSAPP_CLICKS_PER_HOUR } from '@/lib/pro/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const store = await cookies();
  const session = readProSession(store.get(PRO_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Tope por lead para que nadie infle el contador (mejor esfuerzo, en memoria).
  if (!rateLimit(`pro-wa:${session.leadId}`, PRO_WHATSAPP_CLICKS_PER_HOUR, 3_600_000).allowed) {
    return NextResponse.json({ ok: true, counted: false });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  const { data, error } = await supabase.rpc('pro_register_whatsapp', {
    p_lead_id: session.leadId,
    p_ip_hash: hashIp(getClientIp(req)),
  });
  if (error) {
    console.error('[pro-interesse] registro falló:', error.code ?? 'unknown');
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, counted: data === true });
}
