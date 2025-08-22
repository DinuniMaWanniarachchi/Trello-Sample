import type { Pool } from 'pg';

let pool: Pool;

export const getDbPool = async () => {
  if (!pool) {
    const { Pool: PgPool } = await import('pg');
    pool = new PgPool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
};
