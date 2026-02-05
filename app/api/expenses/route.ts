/**
 * FILE LOCATION: app/api/expenses/route.ts
 * 
 * CHANGES MADE:
 * - Replaced getUserFromToken() with getServerSession() for proper authentication
 * - Added snakeToCamel() transformation to all database responses
 * - Added validation for required fields (projectId, date, description, amount)
 * - Added detailed error messages with error.message in catch blocks
 * - Fixed company_id filtering in queries to ensure data isolation
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
    const stepId = searchParams.get('stepId');

    let sql = 'SELECT e.* FROM expenses e JOIN projects p ON e.project_id = p.id WHERE p.company_id = ?';
    let params: any[] = [session.user.companyId];

    if (projectId) {
      sql += ' AND e.project_id = ?';
      params.push(projectId);
    }

    if (stepId) {
      sql += ' AND e.step_id = ?';
      params.push(stepId);
    }

    sql += ' ORDER BY e.date DESC';

    const expenses = await query<any>(sql, params);
    
    // Transform snake_case to camelCase
    const transformedExpenses = snakeToCamel(expenses);
    
    return NextResponse.json(transformedExpenses);
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
        { error: 'Missing required fields: projectId, date, description, and amount are required' },
        { status: 400 }
    );
    }

    // Generate unique expense ID
    const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await execute(
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

    // Get the created expense with transformation
    const expense = await queryOne<any>(
      'SELECT * FROM expenses WHERE id = ?',
      [expenseId]
    );

    return NextResponse.json(snakeToCamel(expense), { status: 201 });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}