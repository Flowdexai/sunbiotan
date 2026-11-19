// POST /api/profissionais/visita
// La presentación avisa que se abrió. Suma una visita solo si la anterior fue
// hace más de PRO_VIEW_MIN_INTERVAL_MINUTES (update condicional atómico en SQL).
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, hashIp } from '@/lib/http/request';
import { PRO_COOKIE, readProSession } from '@/lib/pro/session';
import { PRO_VIEW_MIN_INTERVAL_MINUTES } from '@/lib/pro/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const store = await cookies();
  const session = readProSession(store.get(PRO_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  const { data, error } = await supabase.rpc('pro_register_view', {
    p_lead_id: session.leadId,
    p_ip_hash: hashIp(getClientIp(req)),
    p_min_interval: `${PRO_VIEW_MIN_INTERVAL_MINUTES} minutes`,
  });
  if (error) {
    console.error('[pro-visita] registro falló:', error.code ?? 'unknown');
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, counted: data === true });
}
