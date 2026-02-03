// /api/test-route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DB FAIL:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
