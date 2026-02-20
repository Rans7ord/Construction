// FILE LOCATION: app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { snakeToCamel } from '@/lib/transform';
import bcryptjs from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await queryOne<any>(
      'SELECT id, name, email, role, company_id, created_at FROM users WHERE id = ? AND company_id = ?',
      [id, session.user.companyId]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(snakeToCamel(user));
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { name, email, role, password } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'supervisor', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check user exists and belongs to same company
    const existingUser = await queryOne<any>(
      'SELECT id FROM users WHERE id = ? AND company_id = ?',
      [id, session.user.companyId]
    );

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check email not taken by another user
    const emailConflict = await queryOne<any>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );

    if (emailConflict) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    if (password && password.length > 0) {
      // Update with new password
      const hashedPassword = await bcryptjs.hash(password, 10);
      await execute(
        'UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?',
        [name, email, role, hashedPassword, id]
      );
    } else {
      // Update without changing password
      await execute(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id]
      );
    }

    const updatedUser = await queryOne<any>(
      'SELECT id, name, email, role, company_id, created_at FROM users WHERE id = ?',
      [id]
    );

    return NextResponse.json(snakeToCamel(updatedUser));
  } catch (error) {
    console.error('Update user error:', error);
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

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check user exists and belongs to same company
    const user = await queryOne<any>(
      'SELECT id FROM users WHERE id = ? AND company_id = ?',
      [id, session.user.companyId]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await execute('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
