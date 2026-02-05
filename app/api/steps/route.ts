import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const steps = await query<any>(
      'SELECT ps.* FROM project_steps ps JOIN projects p ON ps.project_id = p.id WHERE p.company_id = ? ORDER BY ps.project_id, ps.`order`',
      [session.user.companyId]
    );

    return NextResponse.json(steps);
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
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique step ID
    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await query(
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
    const step = await query<any>(
      'SELECT * FROM project_steps WHERE id = ?',
      [stepId]
    );

    return NextResponse.json(step[0], { status: 201 });
  } catch (error) {
    console.error('Create step error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
