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
  if (!token) return false;
  
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    // Additional validation - check if token has required fields
    return !!(payload && payload.userId);
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Define route types
  const protectedPaths = ['/home', '/projects'];
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
  const isTokenValid = token ? await isValidToken(token) : false;
  
  // Handle protected paths
  if (isProtectedPath) {
    if (!isTokenValid) {
      console.log(`Redirecting from protected path ${pathname} to login`);
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (token) {
        response.cookies.set('token', '', { path: '/', expires: new Date(0) });
      }
      return response;
    }
  }
  
  // Handle auth paths (login/register) - redirect if already authenticated
  if (isAuthPath) {
    if (isTokenValid) {
      console.log(`User already authenticated, redirecting from ${pathname} to /home`);
      return NextResponse.redirect(new URL('/home', request.url));
    }
    // If token exists but is invalid, clear it and allow access to auth pages
    if (token && !isTokenValid) {
      console.log(`Clearing invalid token on auth page ${pathname}`);
      const response = NextResponse.next();
      response.cookies.set('token', '', { path: '/', expires: new Date(0) });
      return response;
    }
  }
  
  return NextResponse.next();
}