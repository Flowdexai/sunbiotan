import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAccessLink } from '@/lib/admin/send-access-link';
import { isValidEmail } from '@/lib/email/escape';
import { getClientIp } from '@/lib/http/request';
import { rateLimit } from '@/lib/rate-limit';
import { readJsonObject, readString } from '@/lib/http/validate';

// Respuesta SIEMPRE idéntica, exista o no la cuenta (no filtra qué emails existen).
const GENERIC = () => NextResponse.json({ ok: true });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`recover:ip:${ip}`, 5, 3_600_000).allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let email: string;
  try {
    const body = await readJsonObject(req);
    email = readString(body, 'email', { required: true, max: 254 }).toLowerCase();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // 1 por minuto por email: silencioso, misma respuesta genérica.
  if (!rateLimit(`recover:email:${email}`, 1, 60_000).allowed) {
    return GENERIC();
  }

  try {
    const admin = createAdminClient();
    // Sin distinción de mayúsculas. En ilike, \ % y _ son especiales: se
    // escapan para que el email se compare literal. Después se confirma la
    // igualdad exacta (en minúsculas) en JS.
    const pattern = email.replace(/[\\%_]/g, (c) => `\\${c}`);
    const { data: candidates } = await admin
      .from('profiles')
      .select('id, email, full_name, locale, role, approved')
      .ilike('email', pattern)
      .limit(5);
    const profile = (candidates ?? []).find(
      (p) => typeof p.email === 'string' && p.email.toLowerCase() === email.toLowerCase()
    );

    if (profile && profile.role === 'professional' && profile.approved) {
      const result = await sendAccessLink({
        email,
        name: profile.full_name ?? '',
        locale: profile.locale,
        updateProfile: false,
        mode: 'recovery',
      });
      if (!result.ok || !result.emailSent) {
        console.error('[recover] no se pudo enviar el link de recuperación');
      }
    }
  } catch {
    console.error('[recover] error interno');
  }

  return GENERIC();
}
