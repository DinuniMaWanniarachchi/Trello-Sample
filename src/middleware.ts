// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Helper to get secret key
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
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
  const publicPaths = ['/'];

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.includes(pathname);

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (isProtectedPath) {
    if (!token || !(await isValidToken(token))) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set('token', '', { path: '/', expires: new Date(0) });
      return response;
    }
  }

  if (isAuthPath && token && (await isValidToken(token))) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};