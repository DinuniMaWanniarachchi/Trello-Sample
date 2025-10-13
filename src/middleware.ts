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
    return !!(payload && payload.userId);
  } catch (error) {
    console.error('🔒 Middleware: Token verification failed:', error);
    return false;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes entirely
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
  
  console.log('🔒 Middleware check:', { 
    pathname, 
    hasToken: !!token,
    isProtectedPath,
    isAuthPath 
  });
  
  // Handle protected paths
  if (isProtectedPath) {
    if (!token) {
      console.log('🔒 No token found, redirecting to login from:', pathname);
      const loginUrl = new URL('/login', request.url);
      // Save the intended destination
      loginUrl.searchParams.set('returnUrl', pathname);
      const response = NextResponse.redirect(loginUrl);
      return response;
    }
    
    const isTokenValid = await isValidToken(token);
    
    if (!isTokenValid) {
      console.log('🔒 Invalid token, redirecting to login from:', pathname);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid token
      response.cookies.set('token', '', { 
        path: '/', 
        expires: new Date(0),
        sameSite: 'lax' 
      });
      return response;
    }
    
    console.log('🔒 Token valid, allowing access to:', pathname);
  }
  
  // Handle auth paths (login/register)
  if (isAuthPath) {
    if (token) {
      const isTokenValid = await isValidToken(token);
      
      if (isTokenValid) {
        console.log('🔒 Already authenticated, redirecting from', pathname, 'to /home');
        return NextResponse.redirect(new URL('/home', request.url));
      } else {
        // Token exists but is invalid - clear it and allow access to auth pages
        console.log('🔒 Invalid token on auth page, clearing it');
        const response = NextResponse.next();
        response.cookies.set('token', '', { 
          path: '/', 
          expires: new Date(0),
          sameSite: 'lax' 
        });
        return response;
      }
    }
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};