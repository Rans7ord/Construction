import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const step = await queryOne<any>(
      'SELECT * FROM project_steps WHERE id = ?',
      [id]
    );

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(step);
  } catch (error) {
    console.error('Get step error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      projectId,
      name,
      description,
      estimatedBudget,
      status,
      order
    } = body;

    // Check if step exists
    const existingStep = await queryOne<any>(
      'SELECT * FROM project_steps WHERE id = ?',
      [id]
    );

    if (!existingStep) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }

    await execute(
      `UPDATE project_steps SET
        project_id = ?, name = ?, description = ?,
        estimated_budget = ?, status = ?, \`order\` = ?
      WHERE id = ?`,
      [
        projectId || existingStep.project_id,
        name || existingStep.name,
        description || existingStep.description,
        estimatedBudget || existingStep.estimated_budget,
        status || existingStep.status,
        order !== undefined ? order : existingStep.order,
        id
      ]
    );

    // Get updated step
    const updatedStep = await queryOne<any>(
      'SELECT * FROM project_steps WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedStep);
  } catch (error) {
    console.error('Update step error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if step exists
    const step = await queryOne<any>(
      'SELECT * FROM project_steps WHERE id = ?',
      [id]
    );

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }

    await execute('DELETE FROM project_steps WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Step deleted successfully' });
  } catch (error) {
    console.error('Delete step error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
