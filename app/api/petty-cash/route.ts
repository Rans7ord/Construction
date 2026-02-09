import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

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

    // Check if petty_cash table exists
    let tableExists = true;
    try {
      await query('SELECT 1 FROM petty_cash LIMIT 1');
    } catch (error: any) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        tableExists = false;
      } else {
        throw error;
      }
    }

    if (!tableExists) {
      // Table doesn't exist, return empty data
      return NextResponse.json({
        transactions: [],
        balance: 0,
        inflows: 0,
        outflows: 0
      });
    }

    let sql = 'SELECT pc.*, u.name as added_by_name FROM petty_cash pc LEFT JOIN users u ON pc.added_by = u.id';
    let params: any[] = [];
    let conditions: string[] = [];

    // Always filter by company_id
    conditions.push('pc.company_id = ?');
    params.push(session.user.companyId);

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
    console.log('[PETTY CASH] Starting POST request');

    const session = await getServerSession();
    console.log('[PETTY CASH] Session:', session);

    if (!session?.user) {
      console.log('[PETTY CASH] No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[PETTY CASH] Request body:', body);

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
      console.log('[PETTY CASH] Missing required fields:', { amount, description, type, date });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['inflow', 'outflow'].includes(type)) {
      console.log('[PETTY CASH] Invalid transaction type:', type);
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    console.log('[PETTY CASH] Validation passed, proceeding with insert');

    // Generate unique ID for the transaction
    const transactionId = `petty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if petty_cash table exists, create it if it doesn't
    try {
      await execute(
        `INSERT INTO petty_cash (
          id, amount, description, category, vendor, type, date, added_by, company_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          amount,
          description,
          category || null,
          vendor || null,
          type,
          date,
          session.user.id,
          session.user.companyId
        ]
      );
    } catch (tableError: any) {
      // If table doesn't exist, create it and retry
      if (tableError.code === 'ER_NO_SUCH_TABLE') {
        console.log('Petty cash table not found, creating it...');

        // Create petty_cash table
        await execute(`
          CREATE TABLE IF NOT EXISTS petty_cash (
            id VARCHAR(50) PRIMARY KEY,
            amount DECIMAL(15, 2) NOT NULL,
            description VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            vendor VARCHAR(255),
            type ENUM('inflow', 'outflow') NOT NULL,
            date DATE NOT NULL,
            added_by VARCHAR(50) NOT NULL,
            company_id VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE RESTRICT,
            INDEX idx_date (date),
            INDEX idx_type (type),
            INDEX idx_category (category),
            INDEX idx_vendor (vendor),
            INDEX idx_added_by (added_by),
            INDEX idx_petty_cash_company (company_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Now try the insert again
        await execute(
          `INSERT INTO petty_cash (
            id, amount, description, category, vendor, type, date, added_by, company_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionId,
            amount,
            description,
            category || null,
            vendor || null,
            type,
            date,
            session.user.id,
            session.user.companyId
          ]
        );
      } else {
        throw tableError;
      }
    }

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
