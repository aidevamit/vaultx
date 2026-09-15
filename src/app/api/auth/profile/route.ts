import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sql, initDb } from '@/lib/db';
import bcryptjs from 'bcryptjs';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await initDb();

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    const userId = Number(payload.id);

    // Fetch current user
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = users[0];

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      }
      const isValid = await bcryptjs.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
      }
      if (!/[A-Z]/.test(newPassword)) {
        return NextResponse.json({ error: 'New password must contain at least 1 capital letter.' }, { status: 400 });
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        return NextResponse.json({ error: 'New password must contain at least 1 special character.' }, { status: 400 });
      }

      const hashed = await bcryptjs.hash(newPassword, 10);
      await sql`UPDATE users SET password = ${hashed} WHERE id = ${userId}`;
    }

    // Update name
    if (name && name !== user.name) {
      const nameStr = String(name);
      await sql`UPDATE users SET name = ${nameStr} WHERE id = ${userId}`;
    }

    // Update email — requires current password
    if (email && email !== user.email) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change email.' }, { status: 400 });
      }
      const isPwdValid = await bcryptjs.compare(currentPassword, user.password);
      if (!isPwdValid) {
        return NextResponse.json({ error: 'Incorrect password. Email not updated.' }, { status: 400 });
      }
      const emailStr = String(email);
      const existing = await sql`SELECT id FROM users WHERE email = ${emailStr} AND id != ${userId}`;
      if (existing.length > 0) {
        return NextResponse.json({ error: 'This email is already in use.' }, { status: 400 });
      }
      await sql`UPDATE users SET email = ${emailStr} WHERE id = ${userId}`;
    }

    const updated = await sql`SELECT id, name, email, status FROM users WHERE id = ${userId}`;
    return NextResponse.json({ success: true, user: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
