/**
 * FILE LOCATION: app/api/steps/route.ts
 * 
 * CHANGES MADE:
 * - Added snakeToCamel() transformation to all database responses
 * - Added validation for required fields (projectId, name)
 * - Changed INSERT from query() to execute() for proper execution
 * - Added detailed error messages with error.message
 * - Added proper company_id filtering for data security
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

    let sql = 'SELECT ps.* FROM project_steps ps JOIN projects p ON ps.project_id = p.id WHERE p.company_id = ?';
    const params: any[] = [session.user.companyId];

    if (projectId) {
      sql += ' AND ps.project_id = ?';
      params.push(projectId);
    }

    sql += ' ORDER BY ps.project_id, ps.`order`';

    const steps = await query<any>(sql, params);
    
    return NextResponse.json(snakeToCamel(steps));
  } catch (error) {
    console.error('Get steps error:', error);
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
      name,
      description,
      estimatedBudget,
      status,
      order
    } = body;

    // Validate required fields
    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId and name are required' },
        { status: 400 }
      );
    }

    // Generate unique step ID
    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await execute(
      `INSERT INTO project_steps (
        id, project_id, name, description, estimated_budget, status, \`order\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        stepId,
        projectId,
        name,
        description || '',
        estimatedBudget || 0,
        status || 'pending',
        order || 0
      ]
    );

    // Get the created step
    const step = await queryOne<any>(
      'SELECT * FROM project_steps WHERE id = ?',
      [stepId]
    );

    return NextResponse.json(snakeToCamel(step), { status: 201 });
  } catch (error) {
    console.error('Create step error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}