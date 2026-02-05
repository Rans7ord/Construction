import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const vendor = searchParams.get('vendor');
    const type = searchParams.get('type');

    let sql = 'SELECT pc.*, u.name as added_by_name FROM petty_cash pc LEFT JOIN users u ON pc.added_by = u.id';
    let params: any[] = [];
    let conditions: string[] = [];

    if (startDate) {
      conditions.push('pc.date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('pc.date <= ?');
      params.push(endDate);
    }

    if (category) {
      conditions.push('pc.category = ?');
      params.push(category);
    }

    if (vendor) {
      conditions.push('pc.vendor = ?');
      params.push(vendor);
    }

    if (type) {
      conditions.push('pc.type = ?');
      params.push(type);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY pc.date DESC, pc.created_at DESC';

    const transactions = await query<any>(sql, params);

    // Calculate balance
    const inflows = transactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const outflows = transactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = inflows - outflows;

    return NextResponse.json({
      transactions,
      balance,
      inflows,
      outflows
    });
  } catch (error) {
    console.error('Get petty cash error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      description,
      category,
      vendor,
      type,
      date
    } = body;

    // Validate required fields
    if (!amount || !description || !type || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['inflow', 'outflow'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    const result = await execute(
      `INSERT INTO petty_cash (
        amount, description, category, vendor, type, date, added_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        amount,
        description,
        category || null,
        vendor || null,
        type,
        date,
        session.user.id
      ]
    );

    const transactionId = (result as any).insertId;

    // Get the created transaction
    const transaction = await queryOne<any>(
      'SELECT pc.*, u.name as added_by_name FROM petty_cash pc LEFT JOIN users u ON pc.added_by = u.id WHERE pc.id = ?',
      [transactionId]
    );

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Create petty cash transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
