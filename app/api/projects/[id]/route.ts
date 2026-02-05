import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get project
    const project = await queryOne<any>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get money in (income)
    const moneyIn = await query<any>(
      'SELECT * FROM money_in WHERE project_id = ? ORDER BY date DESC',
      [id]
    );

    // Get expenses
    const expenses = await query<any>(
      'SELECT * FROM expenses WHERE project_id = ? ORDER BY date DESC',
      [id]
    );

    // Get steps
    const steps = await query<any>(
      'SELECT * FROM project_steps WHERE project_id = ? ORDER BY `order`',
      [id]
    );

    // Get materials
    const materials = await query<any>(
      'SELECT * FROM materials WHERE project_id = ? ORDER BY created_at DESC',
      [id]
    );

    // Calculate totals
    const totalIncome = moneyIn.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);
    const totalSpent = expenses.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);
    const profit = totalIncome * 0.1; // 10% of total income

    return NextResponse.json({
      project,
      moneyIn,
      expenses,
      steps,
      materials,
      totals: {
        totalIncome,
        totalSpent,
        profit,
        remaining: project.total_budget - totalSpent,
      },
    });
  } catch (error) {
    console.error('[v0] Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
