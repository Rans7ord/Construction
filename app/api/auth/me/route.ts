import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { snakeToCamel } from '@/lib/transform';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        user: null 
      }, { status: 401 });
    }

    const user = snakeToCamel(session.user);
    
    // ✅ Return both nested and flat versions for compatibility
    return NextResponse.json({
      // Flat version for new code
      ...user,
      // Nested version for legacy code
      user: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        user: null 
      }, 
      { status: 500 }
    );
  }
}