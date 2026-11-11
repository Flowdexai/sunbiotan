import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAccessLink } from '@/lib/admin/send-access-link';
import { ValidationError, readJsonObject, readString } from '@/lib/http/validate';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = ['approve', 'reject', 'resend', 'delete', 'notes'] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  let action: Action;
  let centerId: string | null | undefined;
  let notes: string | undefined;
  try {
    const body = await readJsonObject(req);
    const a = readString(body, 'action', { required: true, max: 20 });
    if (!(ACTIONS as readonly string[]).includes(a)) throw new ValidationError('action', 'invalid');
    action = a as Action;

    if (body.center_id !== undefined) {
      if (body.center_id === null || body.center_id === '') centerId = null;
      else if (typeof body.center_id === 'string' && UUID_RE.test(body.center_id)) centerId = body.center_id;
      else throw new ValidationError('center_id', 'invalid');
    }
    if (body.notes !== undefined && body.notes !== null) {
      notes = readString(body, 'notes', { max: 3000 });
    }
  } catch (err) {
    const field = err instanceof ValidationError ? err.field : undefined;
    return NextResponse.json({ error: 'invalid', field }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: request, error: loadErr } = await admin
    .from('partner_requests')
    .select('id, name, email, locale, status, center_id')
    .eq('id', id)
    .maybeSingle();
  if (loadErr) return NextResponse.json({ error: 'load_failed' }, { status: 500 });
  if (!request) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const now = new Date().toISOString();

  if (action === 'delete') {
    // Solo la candidatura: nunca usuarios ni perfiles.
    const { error } = await admin.from('partner_requests').delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'notes') {
    const { error } = await admin.from('partner_requests').update({ admin_notes: notes || null }).eq('id', id);
    if (error) return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'reject') {
    const update: Record<string, unknown> = { status: 'rejected', reviewed_at: now, reviewed_by: gate.adminId };
    if (notes !== undefined) update.admin_notes = notes || null;
    const { error } = await admin.from('partner_requests').update(update).eq('id', id);
    if (error) return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'resend') {
    if (request.status !== 'approved') {
      return NextResponse.json({ error: 'not_approved' }, { status: 409 });
    }
    const result = await sendAccessLink({
      email: request.email,
      name: request.name,
      locale: request.locale,
      updateProfile: false,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    if (result.emailSent) {
      await admin.from('partner_requests').update({ invited_at: now }).eq('id', id);
    }
    return NextResponse.json({ ok: true, emailSent: result.emailSent });
  }

  // approve
  if (request.status === 'approved') {
    return NextResponse.json({ error: 'already_approved' }, { status: 409 });
  }

  const result = await sendAccessLink({
    email: request.email,
    name: request.name,
    locale: request.locale,
    centerId,
    updateProfile: true,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const update: Record<string, unknown> = {
    status: 'approved',
    reviewed_at: now,
    reviewed_by: gate.adminId,
    user_id: result.userId,
  };
  if (centerId !== undefined) update.center_id = centerId;
  if (result.emailSent) update.invited_at = now;
  if (notes !== undefined) update.admin_notes = notes || null;

  const { error: updErr } = await admin.from('partner_requests').update(update).eq('id', id);
  if (updErr) {
    // El usuario y el perfil ya quedaron aprobados; se informa para reintentar.
    console.error('[candidaturas] perfil aprobado pero no se pudo actualizar la candidatura:', updErr.code ?? 'unknown');
    return NextResponse.json({ ok: true, emailSent: result.emailSent, requestUpdated: false });
  }

  return NextResponse.json({ ok: true, emailSent: result.emailSent });
}
