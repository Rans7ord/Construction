// app/api/paystack/webhook/route.ts
// Handles Paystack server-to-server events so renewals and cancellations
// are processed automatically, even if the user closes the browser.
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { execute, queryOne } from '@/lib/db';
import { activatePaidSubscription } from '@/lib/subscription';
import { v4 as uuidv4 } from 'uuid';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? '';

function verifySignature(payload: string, signature: string): boolean {
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(payload).digest('hex');
  return hash === signature;
}

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Could not read body' }, { status: 400 });
  }

  // ── Verify Paystack signature ─────────────────────────────────────────────
  const signature = request.headers.get('x-paystack-signature') ?? '';
  if (!verifySignature(rawBody, signature)) {
    console.error('[Webhook] ❌ Invalid signature — possible spoofed request');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log('[Webhook] Event received:', event.event);

  try {
    switch (event.event) {

      // ── Successful charge (one-time or recurring) ───────────────────────
      case 'charge.success': {
        const data      = event.data;
        const meta      = data?.metadata ?? {};
        const companyId = meta?.company_id;
        const planId    = meta?.plan_id;
        const ref       = data?.reference;

        if (!companyId || !planId || !ref) {
          console.error('[Webhook] charge.success — missing metadata:', { companyId, planId, ref });
          break;
        }

        // Upsert transaction — column names: paystack_ref, amount, paid_at
        const existing = await queryOne<any>(
          'SELECT id, status FROM payment_transactions WHERE paystack_ref = ?',
          [ref]
        );

        if (!existing) {
          await execute(
            `INSERT INTO payment_transactions
               (id, company_id, plan_id, paystack_ref, amount, status, paid_at)
             VALUES (?, ?, ?, ?, ?, 'success', CURRENT_TIMESTAMP)`,
            [uuidv4(), companyId, planId, ref, (data.amount ?? 0) / 100]
          );
        } else if (existing.status !== 'success') {
          await execute(
            `UPDATE payment_transactions
             SET status = 'success', paid_at = CURRENT_TIMESTAMP
             WHERE paystack_ref = ?`,
            [ref]
          );
        }

        const customerCode = data.customer?.customer_code ?? null;
        await activatePaidSubscription(companyId, planId, customerCode);
        console.log(`[Webhook] ✅ charge.success — activated plan ${planId} for company ${companyId}`);
        break;
      }

      // ── Subscription disabled (cancelled or non-payment) ────────────────
      case 'subscription.disable': {
        const subCode = event.data?.subscription_code;
        if (!subCode) break;

        await execute(
          `UPDATE subscriptions
           SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
           WHERE paystack_sub_code = ?`,   // ← column is "paystack_sub_code"
          [subCode]
        );
        console.log(`[Webhook] subscription.disable — subCode=${subCode}`);
        break;
      }

      // ── Invoice payment failed (renewal failure) ─────────────────────────
      case 'invoice.payment_failed': {
        const subCode = event.data?.subscription?.subscription_code;
        if (!subCode) break;

        await execute(
          `UPDATE subscriptions
           SET status = 'past_due', updated_at = CURRENT_TIMESTAMP
           WHERE paystack_sub_code = ?`,   // ← column is "paystack_sub_code"
          [subCode]
        );
        console.log(`[Webhook] invoice.payment_failed — subCode=${subCode}`);
        break;
      }

      default:
        console.log('[Webhook] Unhandled event (ignored):', event.event);
    }
  } catch (error) {
    // Log but always return 200 so Paystack doesn't keep retrying
    console.error('[Webhook] ❌ Error processing event:', error);
  }

  // Always ACK — Paystack retries if we return non-2xx
  return NextResponse.json({ received: true });
}