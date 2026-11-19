// POST /api/admin/contactos/[id]
// Acciones sobre un lead profesional: reenviar_aviso (reintenta email y
// Telegram y guarda el estado) y borrar (los eventos caen en cascada).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { ValidationError, readJsonObject, readString } from '@/lib/http/validate';
import { notifyColumns, notifyProLead } from '@/lib/pro/notify';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = ['reenviar_aviso', 'borrar'] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  let action: Action;
  try {
    const body = await readJsonObject(req);
    const a = readString(body, 'action', { required: true, max: 20 });
    if (!(ACTIONS as readonly string[]).includes(a)) throw new ValidationError('action', 'invalid');
    action = a as Action;
  } catch (err) {
    const field = err instanceof ValidationError ? err.field : undefined;
    return NextResponse.json({ error: 'invalid', field }, { status: 400 });
  }

  const admin = createAdminClient();

  if (action === 'borrar') {
    const { error, count } = await admin.from('pro_leads').delete({ count: 'exact' }).eq('id', id);
    if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
    if (!count) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const { data: lead, error: loadErr } = await admin
    .from('pro_leads')
    .select('name, business_name, city, activity_type, phone, email, website_or_instagram, no_instagram, locale, marketing_consent, is_test, access_count')
    .eq('id', id)
    .maybeSingle();
  if (loadErr) return NextResponse.json({ error: 'load_failed' }, { status: 500 });
  if (!lead) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const outcome = await notifyProLead(lead);
  const { error: updErr } = await admin.from('pro_leads').update(notifyColumns(outcome)).eq('id', id);
  if (updErr) return NextResponse.json({ error: 'update_failed' }, { status: 500 });

  return NextResponse.json({ ok: true, email: outcome.email.status, telegram: outcome.telegram.status });
}
