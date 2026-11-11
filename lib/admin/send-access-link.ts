// lib/admin/send-access-link.ts
// Genera un link de acceso (invite si el usuario es nuevo o nunca confirmó;
// recovery si ya existe) y lo manda con Resend en el idioma del profesional.
// El link apunta SIEMPRE a nuestra página /acesso con token_hash; nunca se
// expone el action_link de Supabase.
//
// Lo usan: aprobar candidatura, "Reenviar acceso" (candidaturas y
// profesionales) y, con kind forzado a recovery, /api/auth/recover.
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { absoluteLink, normalizeLocale, type AppLocale } from '@/lib/auth/links';
import { sendEmail } from '@/lib/email/send';
import { inviteEmail } from '@/lib/email/templates/invite';
import { recoveryEmail } from '@/lib/email/templates/recovery';

export interface SendAccessLinkArgs {
  email: string;
  name: string;
  locale: string | null | undefined;
  /** Solo aplica si updateProfile = true. undefined = no tocar el centro. */
  centerId?: string | null;
  /**
   * true  = aprobación: deja el perfil como professional aprobado.
   * false = reenvío: solo genera un link nuevo y lo manda.
   */
  updateProfile: boolean;
  /**
   * 'auto' (default): invite y, si el usuario ya existe, recovery.
   * 'recovery': solo recovery (flujo "olvidé mi contraseña"; nunca crea usuarios).
   */
  mode?: 'auto' | 'recovery';
}

export type SendAccessLinkResult =
  | { ok: true; userId: string; kind: 'invite' | 'recovery'; isNewUser: boolean; emailSent: boolean }
  | { ok: false; status: number; error: string };

function isAlreadyRegistered(err: { code?: string; status?: number; message?: string }): boolean {
  return (
    err.code === 'email_exists' ||
    err.code === 'user_already_exists' ||
    /already (been )?registered/i.test(err.message ?? '')
  );
}

export async function sendAccessLink(args: SendAccessLinkArgs): Promise<SendAccessLinkResult> {
  const admin = createAdminClient();
  const email = args.email.trim().toLowerCase();
  const name = args.name.trim();
  const locale: AppLocale = normalizeLocale(args.locale);

  // a) El email no puede pertenecer a un perfil que no sea professional (p. ej. un admin).
  const { data: byEmail, error: byEmailErr } = await admin
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .limit(5);
  if (byEmailErr) return { ok: false, status: 500, error: 'profile_lookup_failed' };
  if (byEmail?.some((p) => p.role !== 'professional')) {
    return { ok: false, status: 409, error: 'email_belongs_to_non_professional' };
  }

  // b) invite (crea el usuario o re-invita a uno que nunca confirmó) → si ya existe, recovery.
  const redirectTo = absoluteLink('/acesso', locale);
  let kind: 'invite' | 'recovery' = args.mode === 'recovery' ? 'recovery' : 'invite';
  let link = kind === 'invite'
    ? await admin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: { data: { full_name: name, locale }, redirectTo },
      })
    : await admin.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } });

  if (link.error && kind === 'recovery') {
    console.error('[access-link] generateLink(recovery) falló:', link.error.code ?? link.error.status ?? 'unknown');
    return { ok: false, status: 502, error: 'generate_link_failed' };
  }

  if (link.error) {
    if (!isAlreadyRegistered(link.error)) {
      console.error('[access-link] generateLink(invite) falló:', link.error.code ?? link.error.status ?? 'unknown');
      return { ok: false, status: 502, error: 'generate_link_failed' };
    }
    kind = 'recovery';
    link = await admin.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } });
    if (link.error) {
      console.error('[access-link] generateLink(recovery) falló:', link.error.code ?? link.error.status ?? 'unknown');
      return { ok: false, status: 502, error: 'generate_link_failed' };
    }
  }

  const user = link.data.user;
  const hashedToken = link.data.properties?.hashed_token;
  if (!user?.id || !hashedToken) return { ok: false, status: 502, error: 'generate_link_incomplete' };
  const isNewUser = kind === 'invite';

  // Segunda barrera por id (por si profiles.email estuviera vacío o desfasado).
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();
  if (existingProfile && existingProfile.role !== 'professional') {
    return { ok: false, status: 409, error: 'email_belongs_to_non_professional' };
  }

  // c) Perfil (solo en aprobación). handle_new_user ya creó la fila; upsert por si no.
  if (args.updateProfile) {
    const row: Record<string, unknown> = {
      id: user.id,
      role: 'professional',
      approved: true,
      full_name: name,
      email,
      locale,
      updated_at: new Date().toISOString(),
    };
    if (args.centerId !== undefined) row.center_id = args.centerId;
    if (isNewUser) row.password_set = false;

    const { error: upsertErr } = await admin.from('profiles').upsert(row, { onConflict: 'id' });
    if (upsertErr) {
      console.error('[access-link] upsert de profile falló:', upsertErr.code ?? 'unknown');
      return { ok: false, status: 500, error: 'profile_update_failed' };
    }
  }

  // e) Email con link propio a /acesso (con prefijo de idioma).
  const accessUrl = absoluteLink('/acesso', locale, { token_hash: hashedToken, type: kind });
  const rendered = kind === 'invite'
    ? inviteEmail(locale, name, accessUrl)
    : recoveryEmail(locale, name, accessUrl);

  const sent = await sendEmail({ to: email, subject: rendered.subject, html: rendered.html, text: rendered.text });

  return { ok: true, userId: user.id, kind, isNewUser, emailSent: sent.ok };
}
