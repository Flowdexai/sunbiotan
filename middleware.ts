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

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const locale = getLocaleFromPath(pathname);
  const canonical = stripLocalePrefix(pathname);

  const isDashboard = canonical.startsWith('/dashboard');
  const isPortal = canonical.startsWith('/portal');
  const isLogin = canonical === '/login';

  if (isDashboard || isPortal || isLogin) {
    const res = NextResponse.next({ request: { headers: req.headers } });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (isDashboard) {
      if (!session) {
        return NextResponse.redirect(new URL(localizedPath('/login', locale), req.url));
      }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL(localizedPath('/login', locale), req.url));
      }
    }

    if (isPortal) {
      if (!session) {
        return NextResponse.redirect(new URL(localizedPath('/login', locale), req.url));
      }
      const { data: profile } = await supabase
        .from('profiles').select('role, approved').eq('id', session.user.id).single();
      if (profile?.role !== 'professional' || !profile?.approved) {
        return NextResponse.redirect(new URL(localizedPath('/login', locale), req.url));
      }
    }

    if (isLogin && session) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL(localizedPath('/dashboard', locale), req.url));
      }
      if (profile?.role === 'professional') {
        return NextResponse.redirect(new URL(localizedPath('/portal', locale), req.url));
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
