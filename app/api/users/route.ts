import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { snakeToCamel } from '@/lib/transform';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await query<any>(
      'SELECT id, name, email, role, company_id, created_at FROM users WHERE company_id = ?',
      [session.user.companyId]
    );

    return NextResponse.json(snakeToCamel(users));
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}