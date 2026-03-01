// app/api/paystack/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { execute, queryOne } from '@/lib/db';
import { activatePaidSubscription, extendPaidSubscription } from '@/lib/subscription';

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

  // ── Look up transaction ───────────────────────────────────────────────────
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
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    paystackData = await res.json();
  } catch (e) {
    console.error('[paystack/verify] ❌ Network error calling Paystack:', errMsg(e));
    return NextResponse.json({ error: 'Could not reach Paystack. Try again.' }, { status: 502 });
  }

  // ── Payment failed ────────────────────────────────────────────────────────
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

  // ── Mark transaction success ──────────────────────────────────────────────
  try {
    await execute(
      `UPDATE payment_transactions
       SET status = 'success', paid_at = CURRENT_TIMESTAMP
       WHERE paystack_ref = ?`,
      [reference]
    );
  } catch (e) {
    console.error('[paystack/verify] ❌ DB error marking success:', errMsg(e));
    // Non-fatal — still activate
  }

  // ── Resolve months from Paystack metadata ─────────────────────────────────
  const months: number = Math.max(
    1,
    parseInt(paystackData.data?.metadata?.months ?? '1', 10)
  );
  const customerCode   = paystackData.data.customer?.customer_code ?? null;
  const companyId      = session.user.companyId;
  const planId         = tx.plan_id;

  // ── Check if user already has an active subscription ─────────────────────
  let existingSub: any;
  try {
    existingSub = await queryOne<any>(
      `SELECT status, current_period_end FROM subscriptions
       WHERE company_id = ? AND status = 'active'`,
      [companyId]
    );
  } catch (e) {
    console.error('[paystack/verify] ❌ DB error checking existing sub:', errMsg(e));
  }

  try {
    if (existingSub) {
      // Active sub exists → extend/queue
      await extendPaidSubscription(companyId, planId, months, reference);
      console.log(
        `[paystack/verify] ✅ Queued/extended ${months} month(s) of plan ${planId} ` +
        `for company ${companyId}`
      );
    } else {
      // No active sub → activate immediately
      await activatePaidSubscription(companyId, planId, customerCode);
      console.log(`[paystack/verify] ✅ Activated plan ${planId} for company ${companyId}`);
    }
  } catch (e) {
    console.error('[paystack/verify] ❌ Failed to activate/extend subscription:', errMsg(e));
    return NextResponse.json(
      { error: 'Payment received but failed to activate plan. Contact support.' },
      { status: 500 }
    );
  }

  // ── Respond ───────────────────────────────────────────────────────────────
  const plan = await queryOne<any>('SELECT name FROM plans WHERE id = ?', [planId]);
  const msg  = existingSub
    ? `Payment confirmed! ${months} month${months > 1 ? 's' : ''} of ${plan?.name ?? ''} queued.`
    : `Payment confirmed! Your ${plan?.name ?? ''} plan is now active.`;

  console.log(`[paystack/verify] ✅ Done. companyId=${companyId} months=${months}`);

  return NextResponse.json({ success: true, message: msg });
}