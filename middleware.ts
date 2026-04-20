import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  const isAuthRoute = path.startsWith('/auth');
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/jobs') ||
    path.startsWith('/applications') ||
    path.startsWith('/recommended-jobs') ||
    path.startsWith('/resume-match') ||
    path.startsWith('/resume-builder') ||
    path.startsWith('/messages') ||
    path.startsWith('/profile') ||
    path.startsWith('/onboarding') ||
    path.startsWith('/recruiter');

  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (!session) {
    return res;
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  const role = profileData?.role || null;

  const getHomeForRole = () => {
    if (role === 'recruiter') return '/recruiter/dashboard';
    if (role === 'candidate') return '/dashboard';
    return '/onboarding';
  };

  if (path === '/auth/login' || path === '/auth/signup') {
    return NextResponse.redirect(new URL(getHomeForRole(), req.url));
  }

  if (path.startsWith('/onboarding')) {
    if (!role) {
      return res;
    }

    return NextResponse.redirect(new URL(getHomeForRole(), req.url));
  }

  if (!role) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  const isCandidateRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/jobs') ||
    path.startsWith('/applications') ||
    path.startsWith('/recommended-jobs') ||
    path.startsWith('/resume-match') ||
    path.startsWith('/resume-builder');

  const isRecruiterRoute =
    path.startsWith('/recruiter');

  if (isCandidateRoute && role !== 'candidate') {
    return NextResponse.redirect(new URL(getHomeForRole(), req.url));
  }

  if (isRecruiterRoute && role !== 'recruiter') {
    return NextResponse.redirect(new URL(getHomeForRole(), req.url));
  }

  if (isAuthRoute && role) {
    return NextResponse.redirect(new URL(getHomeForRole(), req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/jobs/:path*',
    '/applications/:path*',
    '/recommended-jobs/:path*',
    '/resume-match/:path*',
    '/resume-builder/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/recruiter/:path*',
    '/auth/:path*',
  ],
};
