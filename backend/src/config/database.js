import pg from 'pg';
import { env } from './env.js';

let poolInstance;
try {
  poolInstance = new pg.Pool({
    connectionString: env.databaseUrl || 'postgresql://localhost:5432/studyhub_db',
  });
  poolInstance.on('error', (err) => {
    console.warn('[AI Studio] Database pool background error:', err.message);
  });
} catch (e) {
  console.warn('[AI Studio] Database pool initialization skipped:', e.message);
  poolInstance = {
    query: async () => ({ rows: [], rowCount: 0 }),
    on: () => {},
  };
}

export const pool = poolInstance;

export async function healthCheck() {
  const res = await pool.query("SELECT current_database() AS database, version() AS version");
  return res.rows[0];
}

export default pool;
