// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res = NextResponse.next({ request: req });
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith('/portal')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approved')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'professional' || !profile?.approved) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (req.nextUrl.pathname === '/login' && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (profile?.role === 'professional') {
      return NextResponse.redirect(new URL('/portal', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*', '/login'],
};