'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from '@/i18n/navigation';
import { normalizeLocale } from '@/lib/auth/links';

// Los archivos 'use server' solo pueden exportar funciones async.
const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 72; // límite de bcrypt en Supabase Auth

export type SetPasswordState = {
  error: null | 'too_short' | 'too_long' | 'mismatch' | 'same_password' | 'weak' | 'session' | 'generic';
};

export async function setPassword(_prev: SetPasswordState, formData: FormData): Promise<SetPasswordState> {
  const password = formData.get('password');
  const confirm = formData.get('confirm');
  const locale = normalizeLocale(formData.get('locale'));

  if (typeof password !== 'string' || typeof confirm !== 'string') return { error: 'generic' };
  if (password.length < MIN_PASSWORD_LENGTH) return { error: 'too_short' };
  if (password.length > MAX_PASSWORD_LENGTH) return { error: 'too_long' };
  if (password !== confirm) return { error: 'mismatch' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'session' };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    if (updateError.code === 'same_password') return { error: 'same_password' };
    if (updateError.code === 'weak_password') return { error: 'weak' };
    console.error('[definir-senha] updateUser falló:', updateError.code ?? 'unknown');
    return { error: 'generic' };
  }

  // password_set lo marca el servidor con el id de la sesión (no el cliente).
  let profile: { role: string | null; approved: boolean | null } | null = null;
  try {
    const admin = createAdminClient();
    await admin.from('profiles').update({ password_set: true }).eq('id', user.id);
    const { data } = await admin.from('profiles').select('role, approved').eq('id', user.id).maybeSingle();
    profile = data;
  } catch {
    console.error('[definir-senha] no se pudo actualizar password_set');
  }

  if (profile?.role === 'admin') {
    redirect({ href: '/dashboard', locale });
  }
  if (profile?.role === 'professional' && profile.approved) {
    redirect({ href: '/portal', locale });
  }

  // No aprobado: se cierra la sesión y se avisa en /login.
  await supabase.auth.signOut();
  redirect({ href: '/login?aviso=inactive', locale });
  return { error: null };
}
