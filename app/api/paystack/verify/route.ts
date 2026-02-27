// app/api/paystack/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { activatePaidSubscription } from '@/lib/subscription';
import { execute, queryOne } from '@/lib/db';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body      = await request.json();
    const reference = body.reference as string;

    if (!reference) {
      return NextResponse.json({ error: 'reference is required' }, { status: 400 });
    }

    // Look up our pending transaction
    const txn = await queryOne<any>(
      `SELECT * FROM payment_transactions
       WHERE paystack_ref = ? AND company_id = ?`,
      [reference, session.user.companyId]
    );

    if (!txn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Already processed — return success without hitting Paystack again
    if (txn.status === 'success') {
      return NextResponse.json({ message: 'Payment already verified', alreadyActive: true });
    }

    // Verify with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      await execute(
        "UPDATE payment_transactions SET status = 'failed' WHERE paystack_ref = ?",
        [reference]
      );
      return NextResponse.json(
        { error: 'Payment was not successful', paystackStatus: paystackData.data?.status },
        { status: 402 }
      );
    }

    const txnData = paystackData.data;

    // Mark transaction as successful
    await execute(
      `UPDATE payment_transactions
       SET status = 'success', paid_at = NOW()
       WHERE paystack_ref = ?`,
      [reference]
    );

    // Activate subscription
    await activatePaidSubscription(session.user.companyId, txn.plan_id, {
      customerCode:     txnData.customer?.customer_code,
      subscriptionCode: txnData.subscription?.subscription_code,
    });

    return NextResponse.json({
      message: 'Payment verified and subscription activated',
      plan:    txn.plan_id,
    });
  } catch (error) {
    console.error('Paystack verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}