// lib/supabase/admin.ts
// Cliente con SERVICE ROLE: ignora RLS. Solo servidor (server-only rompe el
// build si algún componente de cliente lo importa). Usar únicamente después de
// haber verificado al llamante (admin, o flujo público acotado).
import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin client is not configured');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
