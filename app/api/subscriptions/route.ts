// app/api/subscriptions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getSubscriptionStatus } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getSubscriptionStatus(session.user.companyId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}