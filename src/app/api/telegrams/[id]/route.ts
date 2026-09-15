import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;
  
  const payload = await verifyJWT(token);
  return payload && !!payload.id;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDb();
    const isAuth = await verifyAuth();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    if (!id || id === 'undefined' || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid or missing Telegram ID' }, { status: 400 });
    }

    const telegrams = await sql`
      SELECT id, title, link, phone, username, ad_post_code, ad_start_date, status, created_at 
      FROM telegrams 
      WHERE id = ${id}
    `;

    if (telegrams.length === 0) {
      return NextResponse.json({ error: 'Telegram account not found' }, { status: 404 });
    }

    const history = await sql`
      SELECT id, username, ad_post_code, ad_start_date, ad_end_date, status, created_at
      FROM telegram_ads_history
      WHERE telegram_id = ${id}
      ORDER BY created_at DESC
    `;

    const result = {
      ...telegrams[0],
      history: history
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDb();
    const isAuth = await verifyAuth();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id || id === 'undefined' || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid or missing Telegram ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || (status !== 'active' && status !== 'expired')) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const result = await sql`
      UPDATE telegrams 
      SET status = ${status} 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDb();
    const isAuth = await verifyAuth();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id || id === 'undefined' || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid or missing Telegram ID' }, { status: 400 });
    }

    const body = await request.json();
    const { username, ad_post_code, ad_start_date } = body;

    if (!username || !ad_post_code || !ad_start_date) {
      return NextResponse.json({ error: 'Username, Post Code, and Start Date are required' }, { status: 400 });
    }

    // 1. Fetch current data
    const currentData = await sql`SELECT username, ad_post_code, ad_start_date FROM telegrams WHERE id = ${id}`;
    if (currentData.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const old = currentData[0];
    
    // Capture date and time in UK Timezone (Europe/London)
    const now = new Date();
    const ukTimeStr = now.toLocaleString('sv-SE', { timeZone: 'Europe/London' });
    const endDateTime = ukTimeStr;

    // 2. Insert into history if it had previous ad data
    if (old.ad_post_code) {
      await sql`
        INSERT INTO telegram_ads_history (telegram_id, username, ad_post_code, ad_start_date, ad_end_date, status)
        VALUES (${id}, ${old.username}, ${old.ad_post_code}, ${old.ad_start_date}, ${endDateTime}, 'expired')
      `;
    }

    // 3. Update the main table
    await sql`
      UPDATE telegrams
      SET username = ${username}, ad_post_code = ${ad_post_code}, ad_start_date = ${ad_start_date}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
