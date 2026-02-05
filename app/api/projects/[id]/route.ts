/**
 * FILE LOCATION: app/api/projects/[id]/route.ts
 * 
 * CHANGES MADE:
 * - Added complete PUT endpoint for updating projects (was missing)
 * - Added complete DELETE endpoint for deleting projects (was missing)
 * - Added snakeToCamel() transformation to all responses
 * - Added proper authentication checks using getServerSession()
 * - Added company_id validation to prevent cross-company data access
 * - Added detailed error messages with error.message
 * - Fixed GET to return all related data (moneyIn, expenses, steps, materials)
 */

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

    // Get project
    const project = await queryOne<any>(
      'SELECT * FROM projects WHERE id = ? AND company_id = ?',
      [id, session.user.companyId]
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

    const response = {
      project: snakeToCamel(project),
      moneyIn: snakeToCamel(moneyIn),
      expenses: snakeToCamel(expenses),
      steps: snakeToCamel(steps),
      materials: snakeToCamel(materials),
      totals: {
        totalIncome,
        totalSpent,
        profit,
        remaining: project.total_budget - totalSpent,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[v0] Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
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
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if project exists
    const existingProject = await queryOne<any>(
      'SELECT * FROM projects WHERE id = ? AND company_id = ?',
      [id, session.user.companyId]
    );

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const {
      name,
      location,
      description,
      clientName,
      clientEmail,
      startDate,
      endDate,
      totalBudget,
      status
    } = body;

    await execute(
      `UPDATE projects SET
        name = ?, location = ?, description = ?, client_name = ?,
        client_email = ?, start_date = ?, end_date = ?, total_budget = ?,
        status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name || existingProject.name,
        location || existingProject.location,
        description !== undefined ? description : existingProject.description,
        clientName || existingProject.client_name,
        clientEmail || existingProject.client_email,
        startDate || existingProject.start_date,
        endDate || existingProject.end_date,
        totalBudget !== undefined ? totalBudget : existingProject.total_budget,
        status || existingProject.status,
        id
      ]
    );

    // Get updated project
    const updatedProject = await queryOne<any>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    return NextResponse.json(snakeToCamel(updatedProject));
  } catch (error) {
    console.error('Update project error:', error);
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

    // Check if project exists
    const project = await queryOne<any>(
      'SELECT * FROM projects WHERE id = ? AND company_id = ?',
      [id, session.user.companyId]
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete project (cascading deletes will handle related records)
    await execute('DELETE FROM projects WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}