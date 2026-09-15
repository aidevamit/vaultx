import { neon } from '@neondatabase/serverless';
import bcryptjs from 'bcryptjs';

// neon() returns a function with .unsafe(), .query(), and .transaction() built-in
function getSql() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(connStr);
}

export const sql = getSql();

// Helper function to initialize our tables
export async function initDb() {
  // Run each statement separately since neon HTTP doesn't support multi-statement in one call
  await sql`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS advertisements (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS telegrams (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      link VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS telegram_ads_history (
      id SERIAL PRIMARY KEY,
      telegram_id INTEGER REFERENCES telegrams(id) ON DELETE CASCADE,
      username VARCHAR(255),
      ad_post_code VARCHAR(255),
      ad_start_date VARCHAR(255),
      ad_end_date VARCHAR(255),
      status VARCHAR(50) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Add columns safely (ignore errors if they already exist)
  const alterStatements = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'Admin User'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`,
    `ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS phone VARCHAR(255)`,
    `ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS username VARCHAR(255)`,
    `ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS ad_post_code VARCHAR(255)`,
    `ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS ad_start_date VARCHAR(255)`,
    `ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`,
  ];

  for (const stmt of alterStatements) {
    try {
      await sql.unsafe(stmt);
    } catch {
      // Column already exists — safe to ignore
    }
  }

  // Seed the admin user if not exists
  const adminEmail = 'dramitsangwan14@gmail.com';
  const adminPassword = 'Aksangwan264@';

  const existingUser = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;

  if (existingUser.length === 0) {
    const hashedPassword = await bcryptjs.hash(adminPassword, 10);
    await sql`
      INSERT INTO users (name, email, password, status) 
      VALUES ('System Admin', ${adminEmail}, ${hashedPassword}, 'active')
    `;
  }
}
