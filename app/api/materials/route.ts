import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, stepId, name, type, quantity, unit, description } = body;

    if (!projectId || !stepId || !name || !type || !quantity || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = uuidv4();

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
    const projectId = request.nextUrl.searchParams.get('projectId');
    const stepId = request.nextUrl.searchParams.get('stepId');

    let sql = 'SELECT * FROM materials WHERE 1=1';
    const params: any[] = [];

    if (projectId) {
      sql += ' AND project_id = ?';
      params.push(projectId);
    }

    if (stepId) {
      sql += ' AND step_id = ?';
      params.push(stepId);
    }

    sql += ' ORDER BY created_at DESC';

    const materials = await query(sql, params);

    return NextResponse.json(materials);
  } catch (error) {
    console.error('[v0] Get materials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
