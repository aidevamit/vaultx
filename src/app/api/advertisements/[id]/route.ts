import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    const ads = await sql`SELECT * FROM advertisements WHERE id = ${id}`;
    
    if (ads.length === 0) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json(ads[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    await sql`UPDATE advertisements SET status = 'expired' WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const body = await request.json();
    
    // Using 'status' column to save extra details for now if we don't have a details column. 
    // Or we can alter the table to add a details column if needed. Let's just update the title/description or add a column on the fly.
    // Wait, the table doesn't have a 'details' column. Let's add one if it doesn't exist just in case.
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS details TEXT`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS location VARCHAR(255)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS username VARCHAR(255)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS account_create_date VARCHAR(255)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS last_payment_date VARCHAR(255)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS payment_amount VARCHAR(255)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS phone VARCHAR(255)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS ads_count VARCHAR(50)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS sub_ads_json TEXT`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS cards_count VARCHAR(50)`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS cards_json TEXT`);
    await sql.unsafe(`ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`);
    
    if (
      body.title !== undefined ||
      body.description !== undefined ||
      body.details !== undefined || 
      body.location !== undefined || 
      body.username !== undefined || 
      body.full_name !== undefined ||
      body.account_create_date !== undefined ||
      body.last_payment_date !== undefined ||
      body.payment_amount !== undefined ||
      body.phone !== undefined ||
      body.ads_count !== undefined ||
      body.sub_ads_json !== undefined ||
      body.cards_count !== undefined ||
      body.cards_json !== undefined ||
      body.credentials_history_json !== undefined ||
      body.status !== undefined
    ) {
      await sql`
        UPDATE advertisements 
        SET 
          title = COALESCE(${body.title ?? null}, title),
          description = COALESCE(${body.description ?? null}, description),
          details = COALESCE(${body.details ?? null}, details),
          location = COALESCE(${body.location ?? null}, location),
          username = COALESCE(${body.username ?? null}, username),
          full_name = COALESCE(${body.full_name ?? null}, full_name),
          account_create_date = COALESCE(${body.account_create_date ?? null}, account_create_date),
          last_payment_date = COALESCE(${body.last_payment_date ?? null}, last_payment_date),
          payment_amount = COALESCE(${body.payment_amount ?? null}, payment_amount),
          phone = COALESCE(${body.phone ?? null}, phone),
          ads_count = COALESCE(${body.ads_count ?? null}, ads_count),
          sub_ads_json = COALESCE(${body.sub_ads_json ?? null}, sub_ads_json),
          cards_count = COALESCE(${body.cards_count ?? null}, cards_count),
          cards_json = COALESCE(${body.cards_json ?? null}, cards_json),
          credentials_history_json = COALESCE(${body.credentials_history_json ?? null}, credentials_history_json),
          status = COALESCE(${body.status ?? null}, status)
        WHERE id = ${id}
      `;
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
