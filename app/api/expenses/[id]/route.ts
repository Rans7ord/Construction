import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const expense = await queryOne<any>(
      'SELECT * FROM expenses WHERE id = ?',
      [id]
    );

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

    // Check if expense exists
    const existingExpense = await queryOne<any>(
      'SELECT * FROM expenses WHERE id = ?',
      [id]
    );

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    await execute(
      `UPDATE expenses SET
        project_id = ?, step_id = ?, date = ?, description = ?,
        category = ?, vendor = ?, receipt = ?, amount = ?
      WHERE id = ?`,
      [
        projectId || existingExpense.project_id,
        stepId || existingExpense.step_id,
        date || existingExpense.date,
        description || existingExpense.description,
        category || existingExpense.category,
        vendor || existingExpense.vendor,
        receipt || existingExpense.receipt,
        amount || existingExpense.amount,
        id
      ]
    );

    // Get updated expense
    const updatedExpense = await queryOne<any>(
      'SELECT * FROM expenses WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if expense exists
    const expense = await queryOne<any>(
      'SELECT * FROM expenses WHERE id = ?',
      [id]
    );

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    await execute('DELETE FROM expenses WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
