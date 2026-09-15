import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import bcryptjs from 'bcryptjs';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // 1. IP Rate Limiting (Brute force protection)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = checkRateLimit(ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: rateLimitResult.message }, { status: 429 });
    }

    await initDb();
    
    const { email, password } = await request.json();

    // Query user from database
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length > 0) {
      const user = users[0];
      
      if (user.status === 'revoked') {
        return NextResponse.json({ error: 'Your account has been suspended by the administrator.' }, { status: 403 });
      }

      // Compare passwords
      const isPasswordValid = await bcryptjs.compare(password, user.password);

      if (isPasswordValid) {
        // Reset rate limit on success
        resetRateLimit(ip);

        // Create JWT
        const token = await signJWT({ email: user.email, id: user.id });

        const response = NextResponse.json({ success: true }, { status: 200 });
        
        // Set HttpOnly cookie
        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
      }
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
