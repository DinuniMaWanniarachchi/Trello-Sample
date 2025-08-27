// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  console.log("Middleware is running for path:", request.nextUrl.pathname);
  const { pathname } = request.nextUrl;

  // Trim the pathname
  if (pathname !== pathname.trim()) {
    request.nextUrl.pathname = pathname.trim();
    return NextResponse.redirect(request.nextUrl);
  }
  
  // Define protected routes
  const protectedPaths = ['/boards', '/about'];
  const authPaths = ['/login', '/register'];
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Get token from cookies or Authorization header
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // If accessing protected route without token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing protected route, verify token
  if (isProtectedPath && token) {
    const decoded = verifyToken(token);
    if (!decoded) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If accessing auth pages with valid token, redirect to boards
  if (isAuthPath && token) {
    const decoded = verifyToken(token);
    if (decoded) {
      return NextResponse.redirect(new URL('/boards', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}