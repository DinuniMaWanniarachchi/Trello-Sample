import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/about'];
  const isPublicPath = publicPaths.includes(pathname);

  // API auth routes are public
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Get token from cookie - just check if it exists
  const token = request.cookies.get('token')?.value;
  const hasToken = Boolean(token);

  // Redirect users with tokens away from auth pages
  if (hasToken && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/boards', request.url));
  }

  // Redirect users without tokens to login from protected pages
  if (!hasToken && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// Note: This approach only checks if a token exists, not if it's valid.
// JWT validation will happen in your API routes and server components where Node.js runtime is available.