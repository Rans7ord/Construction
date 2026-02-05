import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { snakeToCamel } from '@/lib/transform';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(snakeToCamel(session.user));
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
