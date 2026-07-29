import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/accounts') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/budgets') ||
    pathname.startsWith('/goals') ||
    pathname.startsWith('/recurring') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/insights') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/onboarding');

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthRoute =
    pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/transactions',
    '/transactions/:path*',
    '/accounts',
    '/accounts/:path*',
    '/categories',
    '/categories/:path*',
    '/budgets',
    '/budgets/:path*',
    '/goals',
    '/goals/:path*',
    '/recurring',
    '/recurring/:path*',
    '/analytics',
    '/analytics/:path*',
    '/reports',
    '/reports/:path*',
    '/insights',
    '/insights/:path*',
    '/notifications',
    '/notifications/:path*',
    '/settings',
    '/settings/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
