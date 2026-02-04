import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

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

    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view users' },
        { status: 403 }
      );
    }

    // Get users for the company
    const users = await query(
      'SELECT id, name, email, role, company_id FROM users WHERE company_id = ?',
      [authUser.companyId]
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error('[v0] Get users error:', error);
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
        { error: 'Only admins can create users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, role = 'staff', password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const id = uuidv4();
    const hashedPassword = await bcryptjs.hash(password, 10);

    await execute(
      'INSERT INTO users (id, name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, role, authUser.companyId]
    );

    return NextResponse.json(
      { message: 'User created successfully', id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
        { error: 'Only admins can update users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, name, email, role } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user
    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(userId);
    params.push(authUser.companyId);

    await execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
      params
    );

    return NextResponse.json(
      { message: 'User updated successfully' }
    );
  } catch (error) {
    console.error('[v0] Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
        { error: 'Only admins can delete users' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (userId === authUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await execute(
      'DELETE FROM users WHERE id = ? AND company_id = ?',
      [userId, authUser.companyId]
    );

    return NextResponse.json(
      { message: 'User deleted successfully' }
    );
  } catch (error) {
    console.error('[v0] Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
