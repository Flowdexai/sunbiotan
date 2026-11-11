// lib/supabase/server.ts
// Cliente Supabase para Server Components, Route Handlers y Server Actions.
// Usa la anon key + cookies de sesión: respeta RLS y auth.uid() es el usuario
// que hace la request. Mismo patrón @supabase/ssr que middleware.ts.
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Llamado desde un Server Component (cookies de solo lectura).
            // El middleware refresca la sesión, así que se puede ignorar.
          }
        },
      },
    }
  );
}
