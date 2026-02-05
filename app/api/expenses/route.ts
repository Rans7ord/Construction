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
    const projectId = searchParams.get('projectId');
    const stepId = searchParams.get('stepId');

    let sql = 'SELECT * FROM expenses';
    let params: any[] = [];

    if (projectId) {
      sql += ' WHERE project_id = ?';
      params.push(projectId);
    }

    if (stepId) {
      sql += projectId ? ' AND step_id = ?' : ' WHERE step_id = ?';
      params.push(stepId);
    }

    sql += ' ORDER BY date DESC';

    const expenses = await query<any>(sql, params);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
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
      projectId,
      stepId,
      date,
      description,
      category,
      vendor,
      receipt,
      amount
    } = body;

    // Validate required fields
    if (!projectId || !date || !description || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique expense ID
    const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await execute(
      `INSERT INTO expenses (
        id, project_id, step_id, date, description, category, vendor, receipt, amount, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expenseId,
        projectId,
        stepId || null,
        date,
        description,
        category || '',
        vendor || '',
        receipt || '',
        amount,
        session.user.id
      ]
    );

    // Get the created expense
    const expense = await queryOne<any>(
      'SELECT * FROM expenses WHERE id = ?',
      [expenseId]
    );

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
async function getLocalServerSession() {
  // Example implementation for retrieving a session
  const session = await getServerSession();
  return session || null;
}

