import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

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

    // Fetch counts
    const usersCountRes = await sql`SELECT COUNT(*) FROM users`;
    const adsCountRes = await sql`SELECT COUNT(*) FROM advertisements`;
    const telegramsCountRes = await sql`SELECT COUNT(*) FROM telegrams`;

    const usersCount = parseInt(usersCountRes[0].count, 10);
    const adsCount = parseInt(adsCountRes[0].count, 10);
    const telegramsCount = parseInt(telegramsCountRes[0].count, 10);

    // Fetch latest 5
    const latestAds = await sql`
      SELECT id, title, description, status, created_at 
      FROM advertisements 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    const latestTelegrams = await sql`
      SELECT id, title, link, created_at 
      FROM telegrams 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    return NextResponse.json({
      counts: {
        users: usersCount,
        advertisements: adsCount,
        telegrams: telegramsCount
      },
      latest: {
        advertisements: latestAds,
        telegrams: latestTelegrams
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
