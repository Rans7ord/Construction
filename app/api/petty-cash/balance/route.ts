import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get petty cash balance
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    jwt.verify(token, JWT_SECRET);

    const connection = await pool.getConnection();

    // Calculate total inflows
    const [inflowResult] = await connection.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM petty_cash WHERE type = "inflow"'
    );

    // Calculate total outflows
    const [outflowResult] = await connection.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM petty_cash WHERE type = "outflow"'
    );

    connection.release();

    const inflow = (inflowResult as any)[0]?.total || 0;
    const outflow = (outflowResult as any)[0]?.total || 0;
    const balance = inflow - outflow;

    return NextResponse.json({
      balance,
      totalInflow: inflow,
      totalOutflow: outflow,
    });
  } catch (error) {
    console.error('[v0] Balance GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
