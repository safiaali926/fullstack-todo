/**
 * Authentication Middleware
 * Checks JWT token cookie and redirects unauthenticated users to login
 * Redirects authenticated users away from auth pages
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple JWT validation - checks if token is properly formatted and not expired
 */
function isValidJWT(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode payload (base64url)
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get JWT token from cookies
  const authTokenCookie = request.cookies.get('auth_token');
  const authToken = authTokenCookie?.value;

  // Validate token if it exists
  const isAuthenticated = authToken ? isValidJWT(authToken) : false;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/tasks'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - login and signup pages (always accessible)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public|login|signup).*)',
  ],
};
