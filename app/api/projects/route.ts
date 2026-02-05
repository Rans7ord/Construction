import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await query<any>(
      'SELECT * FROM projects WHERE company_id = ? ORDER BY created_at DESC',
      [session.user.companyId]
    );

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
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
      name,
      location,
      description,
      clientName,
      clientEmail,
      startDate,
      endDate,
      totalBudget,
      createdBy,
      status = 'active'
    } = body;

    // Validate required fields
    if (!name || !location || !clientName || !clientEmail || !startDate || !endDate || !totalBudget) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await execute(
      `INSERT INTO projects (
        name, location, description, client_name, client_email,
        start_date, end_date, total_budget, created_by, company_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        location,
        description || '',
        clientName,
        clientEmail,
        startDate,
        endDate,
        totalBudget,
        createdBy,
        session.user.companyId,
        status
      ]
    );

    const projectId = (result as any).insertId;

    // Get the created project
    const project = await queryOne<any>(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
