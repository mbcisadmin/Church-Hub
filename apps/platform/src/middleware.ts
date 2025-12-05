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
    pathname === '/signin' ||
    pathname === '/' ||
    pathname === '/403'
  ) {
    return NextResponse.next();
  }

  try {
    // Check for authentication token
    let token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: '__Secure-next-auth.session-token'
    });

    // Fallback to non-secure cookie for development
    if (!token) {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: 'next-auth.session-token'
      });
    }

    // Redirect unauthenticated users to home
    if (!token) {
      console.log(`Middleware: No token, redirecting to home from ${pathname}`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // User is authenticated, allow access
    // You can add custom permission checks here based on:
    // - token.roles (user roles from MinistryPlatform)
    // - token.email (user email)
    // - pathname (current route)

    return NextResponse.next();

  } catch (error) {
    console.error('Middleware: Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|manifest.json|favicon.ico|assets/).*)',
  ],
};