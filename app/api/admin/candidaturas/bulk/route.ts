import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { readJsonObject } from '@/lib/http/validate';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IDS = 200;

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  let ids: string[];
  let action: 'reject' | 'delete';
  try {
    const body = await readJsonObject(req);
    if (body.action !== 'reject' && body.action !== 'delete') throw new Error('action');
    action = body.action;
    if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > MAX_IDS) throw new Error('ids');
    if (!body.ids.every((v) => typeof v === 'string' && UUID_RE.test(v))) throw new Error('ids');
    ids = [...new Set(body.ids as string[])];
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const admin = createAdminClient();

  if (action === 'delete') {
    // Solo candidaturas: nunca usuarios ni perfiles.
    const { error, count } = await admin
      .from('partner_requests')
      .delete({ count: 'exact' })
      .in('id', ids);
    if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
    return NextResponse.json({ ok: true, affected: count ?? 0 });
  }

  // Rechazo masivo: no toca las ya aprobadas.
  const { error, count } = await admin
    .from('partner_requests')
    .update(
      { status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: gate.adminId },
      { count: 'exact' }
    )
    .in('id', ids)
    .neq('status', 'approved');
  if (error) return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  return NextResponse.json({ ok: true, affected: count ?? 0 });
}
