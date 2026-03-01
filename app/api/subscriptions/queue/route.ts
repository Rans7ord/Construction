// app/api/subscriptions/queue/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getSubscriptionQueue } from '@/lib/subscription';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const queue = await getSubscriptionQueue(session.user.companyId);
    return NextResponse.json(queue);
  } catch (e) {
    console.error('[subscriptions/queue] ❌ Error fetching queue:', e);
    return NextResponse.json({ error: 'Failed to fetch subscription queue' }, { status: 500 });
  }
}