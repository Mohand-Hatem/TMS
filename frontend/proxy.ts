import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Fast first line of defense for protected workspace paths.
 * In Next.js 16+, middleware is deprecated in favor of proxy.ts.
 * Checks for the presence of the httpOnly JWT token cookie.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/projects/:path*',
    '/tasks/:path*',
    '/team/:path*',
    '/settings/:path*'
  ],
};
