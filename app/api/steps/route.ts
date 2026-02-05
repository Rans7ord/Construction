import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const steps = await query<any>('SELECT * FROM project_steps ORDER BY project_id, `order`');

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

    const result = await query(
      `INSERT INTO project_steps (
        project_id, name, description, estimated_budget, status, \`order\`
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        name,
        description || '',
        estimatedBudget || 0,
        status || 'pending',
        order || 0
      ]
    );

    const stepId = (result as any).insertId;

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
