/**
 * FILE LOCATION: app/api/money-in/route.ts
 * 
 * CHANGES MADE:
 * - Added snakeToCamel() transformation to all database responses
 * - Added validation for required fields (projectId, amount, description, date)
 * - Added detailed error messages with error.message
 * - Added company_id filtering in GET queries
 * - Fixed query to properly filter by projectId when provided
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { snakeToCamel } from '@/lib/transform';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let sql = 'SELECT mi.* FROM money_in mi JOIN projects p ON mi.project_id = p.id WHERE p.company_id = ?';
    const params: any[] = [session.user.companyId];

    if (projectId) {
      sql += ' AND mi.project_id = ?';
      params.push(projectId);
    }

    sql += ' ORDER BY mi.date DESC';

    const moneyIn = await query<any>(sql, params);

    return NextResponse.json(snakeToCamel(moneyIn));
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
        { error: 'Missing required fields: projectId, amount, description, and date are required' },
        { status: 400 }
      );
    }

    // Generate unique money-in ID
    const moneyInId = `money_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await execute(
      `INSERT INTO money_in (
        id, project_id, amount, description, reference, date
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        moneyInId,
        projectId,
        amount,
        description,
        reference || '',
        date
      ]
    );

    // Get the created money-in
    const moneyIn = await queryOne<any>(
      'SELECT * FROM money_in WHERE id = ?',
      [moneyInId]
    );

    return NextResponse.json(snakeToCamel(moneyIn), { status: 201 });
  } catch (error) {
    console.error('Create money-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}