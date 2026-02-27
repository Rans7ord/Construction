// app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { execute, queryOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/** Pull a readable message out of any thrown value */
function errMsg(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}\n${e.stack ?? ''}`;
  return String(e);
}

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  let session: Awaited<ReturnType<typeof getServerSession>>;
  try {
    session = await getServerSession();
  } catch (e) {
    console.error('[paystack/initialize] ❌ getServerSession threw:', errMsg(e));
    return NextResponse.json({ error: 'Auth error' }, { status: 500 });
  }

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId, email, companyId } = session.user;

  // ── Env guard ─────────────────────────────────────────────────────────────
  if (!PAYSTACK_SECRET) {
    console.error('[paystack/initialize] ❌ PAYSTACK_SECRET_KEY is not set');
    return NextResponse.json(
      { error: 'Payment gateway not configured. Contact support.' },
      { status: 500 }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let planId: string;
  try {
    const body = await request.json();
    planId = body?.planId;
  } catch (e) {
    console.error('[paystack/initialize] ❌ Failed to parse request body:', errMsg(e));
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!planId) {
    return NextResponse.json({ error: 'planId is required' }, { status: 400 });
  }

  // ── Fetch plan ────────────────────────────────────────────────────────────
  let plan: any;
  try {
    plan = await queryOne<any>(
      'SELECT * FROM plans WHERE id = ? AND is_active = 1',
      [planId]
    );
  } catch (e) {
    console.error('[paystack/initialize] ❌ DB error fetching plan:', errMsg(e));
    return NextResponse.json({ error: 'Database error fetching plan' }, { status: 500 });
  }

  if (!plan) {
    console.error(`[paystack/initialize] ❌ Plan not found: ${planId}`);
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  // ── Build reference & amount ──────────────────────────────────────────────
  const reference     = `wf_${uuidv4().replace(/-/g, '').substring(0, 20)}`;
  const priceGhs      = Number(plan.price ?? 0);
  const amountPesewas = Math.round(priceGhs * 100);

  console.log(`[paystack/initialize] plan="${plan.name}" price=${priceGhs} ref=${reference} companyId=${companyId}`);

  // ── Insert pending transaction ────────────────────────────────────────────
  // NOTE: If you see "Cannot add or update a child row: a foreign key constraint fails"
  // here, run fix-fk-patch.sql — payment_transactions.company_id had a bad FK to users(id).
  try {
    await execute(
      `INSERT INTO payment_transactions
         (id, company_id, plan_id, paystack_ref, amount, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [uuidv4(), companyId, planId, reference, priceGhs]
    );
  } catch (e) {
    console.error('[paystack/initialize] ❌ DB error inserting transaction:', errMsg(e));
    console.error('  Values attempted:', { companyId, planId, reference, priceGhs });
    return NextResponse.json({ error: 'Failed to record payment. Try again.' }, { status: 500 });
  }

  // ── Call Paystack API ─────────────────────────────────────────────────────
  let paystackData: any;
  try {
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountPesewas,
        reference,
        currency: 'GHS',
        metadata: {
          company_id: companyId,
          plan_id:    planId,
          plan_name:  plan.name,
          user_id:    userId,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?verify=true`,
      }),
    });

    paystackData = await paystackRes.json();
  } catch (e) {
    console.error('[paystack/initialize] ❌ Network error calling Paystack:', errMsg(e));
    return NextResponse.json(
      { error: 'Could not reach payment gateway. Check internet/firewall.' },
      { status: 502 }
    );
  }

  if (!paystackData?.status) {
    console.error('[paystack/initialize] ❌ Paystack rejected request:', paystackData);
    return NextResponse.json(
      { error: paystackData?.message ?? 'Payment initialization failed' },
      { status: 502 }
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  console.log(`[paystack/initialize] ✅ Initialized. ref=${reference}`);

  return NextResponse.json({
    authorization_url: paystackData.data.authorization_url,
    access_code:       paystackData.data.access_code,
    reference:         paystackData.data.reference,
  });
}