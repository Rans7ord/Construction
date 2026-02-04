import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get petty cash transactions with filters
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    jwt.verify(token, JWT_SECRET);

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const vendor = searchParams.get('vendor');
    const type = searchParams.get('type');

    let query = 'SELECT * FROM petty_cash WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (vendor) {
      query += ' AND vendor = ?';
      params.push(vendor);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY date DESC';

    const connection = await pool.getConnection();
    const [transactions] = await connection.execute(query, params);
    connection.release();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[v0] Petty cash GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch petty cash transactions' },
      { status: 500 }
    );
  }
}

// Add new petty cash transaction
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { amount, description, category, vendor, type, date } = await request.json();

    if (!amount || !description || !type || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['inflow', 'outflow'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be inflow or outflow' },
        { status: 400 }
      );
    }

    const id = `petty_${Date.now()}`;
    const connection = await pool.getConnection();

    const query = `
      INSERT INTO petty_cash (id, amount, description, category, vendor, type, date, added_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(query, [
      id,
      amount,
      description,
      category || null,
      vendor || null,
      type,
      date,
      decoded.id,
    ]);

    connection.release();

    return NextResponse.json(
      { id, message: 'Transaction added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Petty cash POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add petty cash transaction' },
      { status: 500 }
    );
  }
}

// Delete petty cash transaction
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    jwt.verify(token, JWT_SECRET);

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM petty_cash WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('[v0] Petty cash DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete petty cash transaction' },
      { status: 500 }
    );
  }
}
