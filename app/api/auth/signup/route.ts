import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'supervisor', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, supervisor, or staff' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // ✅ FIX: Check if this is an admin creating a user (authenticated request)
    const session = await getServerSession();
    let companyId: string;

    if (session?.user && session.user.role === 'admin') {
      // ✅ Admin creating a user - use the admin's company_id
      companyId = session.user.companyId;
      console.log(`[SIGNUP] Admin ${session.user.email} creating user for company ${companyId}`);
    } else {
      // ✅ Public signup - create a new company
      companyId = uuidv4();
      console.log(`[SIGNUP] Public signup - creating new company ${companyId}`);
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await query(
      'INSERT INTO users (id, name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, role, companyId]
    );

    return NextResponse.json(
      { message: 'User created successfully', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}