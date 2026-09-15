import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await initDb();
    
    const { title, description, status } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title (Email) and Description (Password) are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO advertisements (title, description, status) 
      VALUES (${title}, ${description}, ${status || 'active'})
      RETURNING *
    `;

    return NextResponse.json({ success: true, advertisement: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await initDb();

    const ads = await sql`
      SELECT * FROM advertisements ORDER BY created_at DESC
    `;

    return NextResponse.json(ads);
  } catch (error: any) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
