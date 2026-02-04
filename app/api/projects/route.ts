import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getAuthUser(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get projects for the user's company
    const projects = await query(
      'SELECT * FROM projects WHERE company_id = ? ORDER BY created_at DESC',
      [authUser.companyId]
    );

    return NextResponse.json(projects);
  } catch (error) {
    console.error('[v0] Get projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create projects' },
        { status: 403 }
      );
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
      status = 'active',
    } = body;

    if (!name || !location || !clientName || !totalBudget) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString().split('T')[0];

    await execute(
      `INSERT INTO projects (id, name, location, description, client_name, client_email, start_date, end_date, total_budget, created_by, created_at, company_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        location,
        description || null,
        clientName,
        clientEmail || null,
        startDate || null,
        endDate || null,
        totalBudget,
        authUser.id,
        now,
        authUser.companyId,
        status,
      ]
    );

    return NextResponse.json(
      { message: 'Project created successfully', id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
