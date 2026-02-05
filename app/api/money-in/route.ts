import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const moneyIn = await query<any>('SELECT * FROM money_in ORDER BY date DESC');

    return NextResponse.json(moneyIn);
  } catch (error) {
    console.error('Get money-in error:', error);
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
      amount,
      description,
      reference,
      date
    } = body;

    // Validate required fields
    if (!projectId || !amount || !description || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await execute(
      `INSERT INTO money_in (
        project_id, amount, description, reference, date
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        projectId,
        amount,
        description,
        reference || '',
        date
      ]
    );

    const moneyInId = (result as any).insertId;

    // Get the created money-in
    const moneyIn = await query<any>(
      'SELECT * FROM money_in WHERE id = ?',
      [moneyInId]
    );

    return NextResponse.json(moneyIn[0], { status: 201 });
  } catch (error) {
    console.error('Create money-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
