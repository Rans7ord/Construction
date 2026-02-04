import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { queryOne } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get user from database
    const user = await queryOne<any>(
      'SELECT id, name, email, role, company_id FROM users WHERE id = ? AND email = ?',
      [decoded.id, decoded.email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.company_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Auth check error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
