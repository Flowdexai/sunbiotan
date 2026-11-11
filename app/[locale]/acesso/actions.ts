'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { normalizeLocale } from '@/lib/auth/links';

export type VerifyState = { error: boolean };

const ALLOWED_TYPES = ['invite', 'recovery'] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

/**
 * Solo se ejecuta al hacer clic en "Continuar": los escáneres de email que
 * abren el link (GET) no consumen el token.
 */
export async function verifyAccessToken(_prev: VerifyState, formData: FormData): Promise<VerifyState> {
  const tokenHash = formData.get('token_hash');
  const type = formData.get('type');
  const locale = normalizeLocale(formData.get('locale'));

  if (
    typeof tokenHash !== 'string' ||
    tokenHash.length === 0 ||
    tokenHash.length > 512 ||
    typeof type !== 'string' ||
    !(ALLOWED_TYPES as readonly string[]).includes(type)
  ) {
    return { error: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as AllowedType });
  if (error) return { error: true };

  redirect({ href: '/definir-senha', locale });
  return { error: false };
}
