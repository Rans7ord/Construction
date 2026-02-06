import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { snakeToCamel } from '@/lib/transform';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
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

    return NextResponse.json(snakeToCamel(expense));
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
    const session = await getServerSession();
    if (!session?.user) {
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

    return NextResponse.json(snakeToCamel(updatedExpense));
  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
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