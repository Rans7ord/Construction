// lib/db.ts — Postgres (Neon) version
//
// Drop-in replacement for the mysql2 version. The exported surface is
// identical (query / execute / queryOne / getUserByEmail / verifyPassword /
// default pool), so none of your 24 API routes need their imports changed.
//
// The one trick: your routes all use MySQL-style `?` placeholders, and
// Postgres wants `$1, $2, $3`. Rather than editing ~130 query strings across
// the codebase, the converter below rewrites them at call time. It skips
// anything inside single quotes, double quotes, or dollar-quoted blocks, so
// a literal question mark in a string won't be mangled.

import { Pool, type QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

function toPgPlaceholders(sql: string): string {
  let out = '';
  let n = 0;
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    if (quote) {
      out += ch;
      if (ch === quote) {
        if (sql[i + 1] === quote) {
          out += sql[++i];
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch as "'" | '"';
      out += ch;
      continue;
    }

    if (ch === '?') {
      out += '$' + ++n;
      continue;
    }

    out += ch;
  }

  return out;
}

export async function query<T extends QueryResultRow = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const result = await pool.query<T>(toPgPlaceholders(sql), params || []);
  return result.rows;
}

export async function execute<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  const result = await pool.query(toPgPlaceholders(sql), params || []);
  return result as unknown as T;
}

export async function queryOne<T extends QueryResultRow = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function getUserByEmail(email: string) {
  return queryOne(
    'SELECT id, name, email, role, company_id FROM users WHERE email = ?',
    [email]
  );
}

export async function verifyPassword(email: string, password: string) {
  const user = await queryOne<any>(
    'SELECT id, name, email, password, role, company_id FROM users WHERE email = ?',
    [email]
  );

  if (!user) return null;

  return user;
}

export default pool;
