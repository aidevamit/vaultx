import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;
  
  const payload = await verifyJWT(token);
  // We can enforce that only admin (id=1) can modify things, but for now we'll allow any authenticated user or specifically check ID
  if (!payload || !payload.id) return false;
  return true;
}

export async function GET() {
  try {
    const isAuth = await verifyAdmin();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await initDb();
    
    const telegrams = await sql`
      SELECT id, title, link, phone, username, ad_post_code, ad_start_date, status, created_at 
      FROM telegrams 
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(telegrams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await verifyAdmin();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone, username, ad_post_code, ad_start_date } = await request.json();

    if (!phone || !username || !ad_post_code || !ad_start_date) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await initDb();

    // Use username as the title for backward compatibility or display purposes
    const result = await sql`
      INSERT INTO telegrams (title, phone, username, ad_post_code, ad_start_date) 
      VALUES (${username}, ${phone}, ${username}, ${ad_post_code}, ${ad_start_date}) 
      RETURNING id, title, phone, username, ad_post_code, ad_start_date, created_at
    `;

    return NextResponse.json({ success: true, telegram: result[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAuth = await verifyAdmin();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await initDb();

    await sql`DELETE FROM telegrams WHERE id = ${id}`;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
