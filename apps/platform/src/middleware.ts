import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Simplified middleware for Gospel Kit template
 *
 * This middleware handles basic authentication checks.
 * You can extend it with custom permission logic as needed.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths (API routes, signin, home, error pages)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/signin' ||
    pathname === '/' ||
    pathname === '/403' ||
    pathname === '/404' ||
    pathname === '/500' ||
    pathname === '/error'
  ) {
    return NextResponse.next();
  }

  try {
    // Check for authentication token
    let token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: '__Secure-next-auth.session-token',
    });

    // Fallback to non-secure cookie for development
    if (!token) {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: 'next-auth.session-token',
      });
    }

    // Redirect unauthenticated users to sign in
    if (!token) {
      console.log(`Middleware: No token, redirecting to signin from ${pathname}`);
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // User is authenticated, allow access
    // You can add custom permission checks here based on:
    // - token.roles (user roles from MinistryPlatform)
    // - token.email (user email)
    // - pathname (current route)

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware: Error checking auth:', error);
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|manifest.json|favicon.ico|icon.svg|assets/).*)'],
};
