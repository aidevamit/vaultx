import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing');
}

const globalForSql = globalThis as unknown as {
  sql: postgres.Sql | undefined;
  isInitialized: boolean | undefined;
};

export const sql = globalForSql.sql ?? postgres(process.env.DATABASE_URL, { ssl: 'require' });

if (process.env.NODE_ENV !== 'production') globalForSql.sql = sql;

import bcryptjs from 'bcryptjs';

// Helper function to initialize our table
export async function initDb() {
  if (globalForSql.isInitialized) return;
  globalForSql.isInitialized = true;
  
  // Execute all table creation and column addition in a single round-trip to speed up load times
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS advertisements (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS telegrams (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      link VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS telegram_ads_history (
      id SERIAL PRIMARY KEY,
      telegram_id INTEGER REFERENCES telegrams(id) ON DELETE CASCADE,
      username VARCHAR(255),
      ad_post_code VARCHAR(255),
      ad_start_date VARCHAR(255),
      ad_end_date VARCHAR(255),
      status VARCHAR(50) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'Admin User';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    
    ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS phone VARCHAR(255);
    ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS username VARCHAR(255);
    ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS ad_post_code VARCHAR(255);
    ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS ad_start_date VARCHAR(255);
    ALTER TABLE telegrams ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
  `);

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

