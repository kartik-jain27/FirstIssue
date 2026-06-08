import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Runs a PostgreSQL query through the shared connection pool.
 * @param {string} text SQL query text.
 * @param {Array<unknown>} [params] Query parameters.
 * @returns {Promise<import('pg').QueryResult>}
 */
export function query(text, params = []) {
  return pool.query(text, params);
}

/**
 * Verifies PostgreSQL connectivity.
 * @returns {Promise<boolean>}
 */
export async function checkDbConnection() {
  await query('SELECT 1');
  return true;
}
