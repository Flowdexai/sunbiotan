import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

function getLocaleFromPath(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return routing.defaultLocale;
}

function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length);
    if (pathname === `/${locale}`) return '/';
  }
  return pathname;
}

function localizedPath(path: string, locale: string): string {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path}`;
}

/** ¿Hay cookie de sesión de Supabase? (evita llamar a Auth en visitas anónimas). */
function hasAuthCookie(req: NextRequest): boolean {
  return req.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const locale = getLocaleFromPath(pathname);
  const canonical = stripLocalePrefix(pathname);

  const isDashboard = canonical === '/dashboard' || canonical.startsWith('/dashboard/');
  const isPortal = canonical === '/portal' || canonical.startsWith('/portal/');
  const isLogin = canonical === '/login';
  const isDefinirSenha = canonical === '/definir-senha';
  // Rutas de auth: accesibles sin sesión y también para quien todavía no
  // definió contraseña.
  const isAuthRoute = canonical === '/acesso' || canonical === '/recuperar-senha' || isDefinirSenha;

  const mustCheck = isDashboard || isPortal || isLogin || isDefinirSenha || hasAuthCookie(req);
  if (!mustCheck) return intlMiddleware(req);

  // Cookies que Supabase refresca durante getUser(); se copian a la respuesta final.
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            pendingCookies.push({ name, value, options: options as Record<string, unknown> });
          });
        },
      },
    }
  );

  const withCookies = (res: NextResponse) => {
    pendingCookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  };
  const redirectTo = (path: string) =>
    withCookies(NextResponse.redirect(new URL(localizedPath(path, locale), req.url)));

  // getUser() revalida el token contra Supabase Auth en cada request,
  // a diferencia de getSession(), que confía en la cookie.
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { role: string | null; approved: boolean | null; password_set: boolean | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, approved, password_set')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  }

  const isProfessional = profile?.role === 'professional';
  const isApprovedPro = isProfessional && profile?.approved === true;
  const mustSetPassword = isApprovedPro && profile?.password_set === false;

  // Profesional aprobado sin contraseña: solo puede estar en las rutas de auth.
  if (mustSetPassword && !isAuthRoute) {
    return redirectTo('/definir-senha');
  }

  if (isDefinirSenha && !user) {
    return redirectTo('/login');
  }

  if (isDashboard) {
    if (!user || profile?.role !== 'admin') return redirectTo('/login');
  }

  if (isPortal) {
    if (!user || !isProfessional) return redirectTo('/login');
    if (!isApprovedPro) return redirectTo('/login?aviso=inactive');
  }

  if (isLogin && user) {
    if (profile?.role === 'admin') return redirectTo('/dashboard');
    // Solo un profesional aprobado y con contraseña va al portal. El resto
    // (no aprobado, sin perfil) ve /login: así no hay bucle /login ↔ /portal.
    if (isApprovedPro && profile?.password_set !== false) return redirectTo('/portal');
  }

  return withCookies(intlMiddleware(req));
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
};
