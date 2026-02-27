// app/api/paystack/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { execute, queryOne } from '@/lib/db';
import { activatePaidSubscription } from '@/lib/subscription';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

function errMsg(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  return String(e);
}

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!PAYSTACK_SECRET) {
    console.error('[paystack/verify] ❌ PAYSTACK_SECRET_KEY not set');
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
  }

  // ── Body ──────────────────────────────────────────────────────────────────
  let reference: string;
  try {
    const body = await request.json();
    reference = body?.reference;
  } catch (e) {
    console.error('[paystack/verify] ❌ Bad request body:', errMsg(e));
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!reference) {
    return NextResponse.json({ error: 'reference is required' }, { status: 400 });
  }

  // ── Look up transaction — column is "paystack_ref" ────────────────────────
  let tx: any;
  try {
    tx = await queryOne<any>(
      'SELECT * FROM payment_transactions WHERE paystack_ref = ? AND company_id = ?',
      [reference, session.user.companyId]
    );
  } catch (e) {
    console.error('[paystack/verify] ❌ DB error looking up transaction:', errMsg(e));
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!tx) {
    console.error(`[paystack/verify] ❌ Transaction not found: ref=${reference} company=${session.user.companyId}`);
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  // Already verified — idempotent
  if (tx.status === 'success') {
    return NextResponse.json({ success: true, message: 'Already verified' });
  }

  // ── Verify with Paystack ──────────────────────────────────────────────────
  let paystackData: any;
  try {
    const res  = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    paystackData = await res.json();
  } catch (e) {
    console.error('[paystack/verify] ❌ Network error calling Paystack:', errMsg(e));
    return NextResponse.json({ error: 'Could not reach Paystack. Try again.' }, { status: 502 });
  }

  // ── Payment failed or rejected ────────────────────────────────────────────
  if (!paystackData?.status || paystackData.data?.status !== 'success') {
    console.error('[paystack/verify] ❌ Payment not successful:', paystackData?.data?.status);
    try {
      await execute(
        `UPDATE payment_transactions SET status = 'failed' WHERE paystack_ref = ?`,
        [reference]
      );
    } catch (e) {
      console.error('[paystack/verify] ❌ Could not mark transaction failed:', errMsg(e));
    }
    return NextResponse.json({ success: false, error: 'Payment was not successful' }, { status: 400 });
  }

  // ── Mark transaction success — columns: status, paid_at ──────────────────
  try {
    await execute(
      `UPDATE payment_transactions
       SET status = 'success', paid_at = CURRENT_TIMESTAMP
       WHERE paystack_ref = ?`,
      [reference]
    );
  } catch (e) {
    console.error('[paystack/verify] ❌ DB error marking success:', errMsg(e));
    // Non-fatal — still activate subscription
  }

  // ── Activate subscription ─────────────────────────────────────────────────
  const customerCode = paystackData.data.customer?.customer_code ?? null;
  try {
    await activatePaidSubscription(session.user.companyId, tx.plan_id, customerCode);
  } catch (e) {
    console.error('[paystack/verify] ❌ Failed to activate subscription:', errMsg(e));
    return NextResponse.json({ error: 'Payment received but failed to activate plan. Contact support.' }, { status: 500 });
  }

  // ── Respond ───────────────────────────────────────────────────────────────
  const plan = await queryOne<any>('SELECT name FROM plans WHERE id = ?', [tx.plan_id]);
  console.log(`[paystack/verify] ✅ Activated ${plan?.name} for company ${session.user.companyId}`);

  return NextResponse.json({
    success: true,
    message: `Payment confirmed! Your ${plan?.name ?? ''} plan is now active.`,
  });
}