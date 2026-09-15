import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

// GET all records
export async function GET() {
  try {
    await initDb(); // Ensure table exists
    const records = await sql`SELECT * FROM records ORDER BY created_at DESC`;
    return NextResponse.json(records);
  } catch (error: any) {
    console.error("Database GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new record
export async function POST(request: Request) {
  try {
    await initDb(); // Ensure table exists
    const { title, description } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO records (title, description)
      VALUES (${title}, ${description})
      RETURNING *
    `;
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Database POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM records WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Database DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
