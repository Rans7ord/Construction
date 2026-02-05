import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { snakeToCamel } from '@/lib/transform';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, stepId, name, type, quantity, unit, description } = body;

    if (!projectId || !stepId || !name || !type || !quantity || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await execute(
      `INSERT INTO materials (id, project_id, step_id, name, type, quantity, unit, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, stepId, name, type, quantity, unit, description || null]
    );

    return NextResponse.json(
      { message: 'Material added successfully', id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Add material error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get('projectId');
    const stepId = request.nextUrl.searchParams.get('stepId');

    let sql = 'SELECT m.* FROM materials m JOIN projects p ON m.project_id = p.id WHERE p.company_id = ?';
    const params: any[] = [session.user.companyId];

    if (projectId) {
      sql += ' AND m.project_id = ?';
      params.push(projectId);
    }

    if (stepId) {
      sql += ' AND m.step_id = ?';
      params.push(stepId);
    }

    sql += ' ORDER BY m.created_at DESC';

    const materials = await query(sql, params);

    return NextResponse.json(snakeToCamel(materials));
  } catch (error) {
    console.error('Get materials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
