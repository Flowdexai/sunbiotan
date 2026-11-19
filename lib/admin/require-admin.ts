// lib/admin/require-admin.ts
// Barrera común de los route handlers de admin: Origin same-origin, sesión
// válida (getUser revalida contra Supabase Auth) y profiles.role = 'admin'
// leído desde el servidor. Solo después de esto se usa el cliente admin.
import 'server-only';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSameOriginLoose, isSameOriginStrict } from '@/lib/http/request';

export type RequireAdminResult =
  | { ok: true; adminId: string }
  | { ok: false; response: NextResponse };

interface RequireAdminOptions {
  /**
   * `strict` (por defecto): exige Origin. `loose`: acepta Origin o Referer
   * same-origin; solo para GET de solo lectura (descargas), porque el navegador
   * no manda Origin en una navegación GET same-origin.
   */
  origin?: 'strict' | 'loose';
}

export async function requireAdmin(req: Request, options: RequireAdminOptions = {}): Promise<RequireAdminResult> {
  const sameOrigin = options.origin === 'loose' ? isSameOriginLoose(req) : isSameOriginStrict(req);
  if (!sameOrigin) {
    return { ok: false, response: NextResponse.json({ error: 'forbidden_origin' }, { status: 403 }) };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'unauthenticated' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }

  return { ok: true, adminId: user.id };
}
