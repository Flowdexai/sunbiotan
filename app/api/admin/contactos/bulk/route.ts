// POST /api/admin/contactos/bulk
// Acción masiva: borrar_pruebas (borra todos los leads con is_test = true).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { readJsonObject } from '@/lib/http/validate';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  try {
    const body = await readJsonObject(req);
    if (body.action !== 'borrar_pruebas') throw new Error('action');
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const admin = createAdminClient();
  // Solo pruebas: nunca leads reales.
  const { error, count } = await admin.from('pro_leads').delete({ count: 'exact' }).eq('is_test', true);
  if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  return NextResponse.json({ ok: true, affected: count ?? 0 });
}
