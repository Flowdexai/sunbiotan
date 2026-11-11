import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAccessLink } from '@/lib/admin/send-access-link';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "Reenviar acceso" desde /dashboard/profissionais (perfiles con password_set = false).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, role, full_name, email, locale')
    .eq('id', id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'load_failed' }, { status: 500 });
  if (!profile) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (profile.role !== 'professional') return NextResponse.json({ error: 'not_professional' }, { status: 409 });

  let email = profile.email as string | null;
  if (!email) {
    const { data: authUser } = await admin.auth.admin.getUserById(id);
    email = authUser?.user?.email ?? null;
  }
  if (!email) return NextResponse.json({ error: 'no_email' }, { status: 409 });

  const result = await sendAccessLink({
    email,
    name: profile.full_name ?? '',
    locale: profile.locale,
    updateProfile: false,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ ok: true, emailSent: result.emailSent });
}
