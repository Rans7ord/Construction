// app/api/paystack/webhook/route.ts
// Paystack sends webhook events here for async payment confirmations.
// Set this URL in your Paystack dashboard:
//   https://yourdomain.com/api/paystack/webhook
//
// Events handled:
//   charge.success        → activate subscription
//   subscription.disable  → cancel subscription
//   invoice.payment_failed → mark subscription expired

import { NextRequest, NextResponse } from 'next/server';
import { activatePaidSubscription } from '@/lib/subscription';
import { execute, queryOne } from '@/lib/db';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

// Verify Paystack HMAC-SHA512 signature
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(body)
    .digest('hex');
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody  = await request.text();
    const signature = request.headers.get('x-paystack-signature') ?? '';

    if (!verifySignature(rawBody, signature)) {
      console.warn('[webhook] Invalid Paystack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { event: eventType, data } = event;

    console.log(`[webhook] Received: ${eventType}`);

    // ── charge.success ────────────────────────────────────────────────────────
    if (eventType === 'charge.success') {
      const reference = data.reference as string;
      const metadata  = data.metadata || {};

      const companyId = metadata.company_id as string;
      const planId    = metadata.plan_id    as string;

      if (!companyId || !planId) {
        // Could be a non-subscription charge — ignore silently
        return NextResponse.json({ received: true });
      }

      // Find the pending transaction
      const txn = await queryOne<any>(
        'SELECT * FROM payment_transactions WHERE paystack_ref = ?',
        [reference]
      );

      if (txn && txn.status !== 'success') {
        await execute(
          "UPDATE payment_transactions SET status = 'success', paid_at = NOW() WHERE paystack_ref = ?",
          [reference]
        );
      }

      // Activate subscription (idempotent)
      await activatePaidSubscription(companyId, planId, {
        customerCode:     data.customer?.customer_code,
        subscriptionCode: data.subscription?.subscription_code,
      });
    }

    // ── subscription.disable ──────────────────────────────────────────────────
    else if (eventType === 'subscription.disable') {
      const subCode = data.subscription_code as string;

      if (subCode) {
        await execute(
          "UPDATE subscriptions SET status = 'cancelled' WHERE paystack_sub_code = ?",
          [subCode]
        );
        console.log(`[webhook] Subscription cancelled: ${subCode}`);
      }
    }

    // ── invoice.payment_failed ────────────────────────────────────────────────
    else if (eventType === 'invoice.payment_failed') {
      const subCode = data.subscription?.subscription_code as string;

      if (subCode) {
        await execute(
          "UPDATE subscriptions SET status = 'past_due' WHERE paystack_sub_code = ?",
          [subCode]
        );
        console.log(`[webhook] Invoice payment failed, subscription past_due: ${subCode}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhook] Error:', error);
    // Return 200 so Paystack doesn't retry on our internal errors
    return NextResponse.json({ received: true });
  }
}