import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import bcryptjs from 'bcryptjs';

export async function GET() {
  try {
    await initDb();
    
    // Do not return passwords
    const users = await sql`
      SELECT id, name, email, status, created_at 
      FROM users 
      ORDER BY id ASC
    `;
    
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await sql`
      INSERT INTO users (name, email, password, status)
      VALUES (${name}, ${email}, ${hashedPassword}, 'active')
      RETURNING id, name, email, status, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initDb();
    
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'User ID and status are required' }, { status: 400 });
    }

    if (id === 1) { // Basic protection to prevent modifying the main admin
      return NextResponse.json({ error: 'Cannot modify the main administrator account' }, { status: 403 });
    }

    const result = await sql`
      UPDATE users 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, name, email, status, created_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initDb();
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (parseInt(id) === 1) { // Prevent deleting main admin
      return NextResponse.json({ error: 'Cannot delete the main administrator account' }, { status: 403 });
    }

    const result = await sql`
      DELETE FROM users WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
