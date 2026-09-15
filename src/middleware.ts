import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  // Exclude static assets, api auth routes, and public files from protection
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Verify the token
  const payload = token ? await verifyJWT(token) : null;

  // If trying to access a protected route without a valid token
  if (!payload && !isAuthPage) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page WITH a valid token
  if (payload && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
