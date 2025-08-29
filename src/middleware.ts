// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Helper to get secret key
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
  return new TextEncoder().encode(secret);
};

// Helper function to verify token
const isValidToken = async (token: string): Promise<boolean> => {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define route types
  const protectedPaths = ['/home', '/boards'];
  const authPaths = ['/login', '/register'];
  const publicPaths = ['/', '/about', '/contact', '/terms', '/privacy'];
  
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path));
  
  // Allow public paths without any checks
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('token')?.value;
  
  // Handle protected paths
  if (isProtectedPath) {
    if (!token || !(await isValidToken(token))) {
      console.log(`Redirecting from protected path ${pathname} to landing page`);
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set('token', '', { path: '/', expires: new Date(0) });
      return response;
    }
  }
  
  // Handle auth paths (login/register) - redirect if already authenticated
  if (isAuthPath) {
    if (token && (await isValidToken(token))) {
      console.log(`User already authenticated, redirecting from ${pathname} to /home`);
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};