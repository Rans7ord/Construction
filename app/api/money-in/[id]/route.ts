import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
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

    const moneyIn = await queryOne<any>(
      'SELECT * FROM money_in WHERE id = ?',
      [id]
    );

    if (!moneyIn) {
      return NextResponse.json(
        { error: 'Money-in not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(moneyIn);
  } catch (error) {
    console.error('Get money-in error:', error);
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
      date,
      description,
      reference,
      amount
    } = body;

    // Check if money-in exists
    const existingMoneyIn = await queryOne<any>(
      'SELECT * FROM money_in WHERE id = ?',
      [id]
    );

    if (!existingMoneyIn) {
      return NextResponse.json(
        { error: 'Money-in not found' },
        { status: 404 }
      );
    }

    await execute(
      `UPDATE money_in SET
        project_id = ?, date = ?, description = ?,
        reference = ?, amount = ?
      WHERE id = ?`,
      [
        projectId || existingMoneyIn.project_id,
        date || existingMoneyIn.date,
        description || existingMoneyIn.description,
        reference || existingMoneyIn.reference,
        amount || existingMoneyIn.amount,
        id
      ]
    );

    // Get updated money-in
    const updatedMoneyIn = await queryOne<any>(
      'SELECT * FROM money_in WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedMoneyIn);
  } catch (error) {
    console.error('Update money-in error:', error);
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

    // Check if money-in exists
    const moneyIn = await queryOne<any>(
      'SELECT * FROM money_in WHERE id = ?',
      [id]
    );

    if (!moneyIn) {
      return NextResponse.json(
        { error: 'Money-in not found' },
        { status: 404 }
      );
    }

    await execute('DELETE FROM money_in WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Money-in deleted successfully' });
  } catch (error) {
    console.error('Delete money-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
