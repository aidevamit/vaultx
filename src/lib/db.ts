import { neon } from '@neondatabase/serverless';
import bcryptjs from 'bcryptjs';

const globalForSql = globalThis as unknown as {
  sql: any | undefined;
  isInitialized: boolean | undefined;
};

function getSql() {
  if (!globalForSql.sql) {
    const connStr = process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy';
    const queryClient = neon(connStr);

    const proxyClient = function (strings: TemplateStringsArray, ...values: any[]) {
      return queryClient(strings, ...values);
    };

    proxyClient.unsafe = function (queryStr: string) {
      return queryClient.query(queryStr);
    };

    globalForSql.sql = proxyClient;
  }
  return globalForSql.sql;
}

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  const instance = getSql();
  return instance(strings, ...values);
}

(sql as any).unsafe = function (queryStr: string) {
  const instance = getSql();
  return instance.unsafe(queryStr);
};

// Helper function to initialize our table
export async function initDb() {
  if (globalForSql.isInitialized) return;
  globalForSql.isInitialized = true;
  
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
