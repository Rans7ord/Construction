// app/dashboard/billing/page.tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ProtectedLayout } from '@/app/app-layout';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  CheckCircle2, Crown, Zap, Building2, ArrowLeft,
  CreditCard, Clock, ShieldCheck, AlertCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  price: number;          // ← API returns "price", NOT "priceMonthly"
  maxProjects: number;    // 0 = unlimited
  maxUsers: number;       // 0 = unlimited
  features: Record<string, boolean>;
}

interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysLeftInTrial: number;
  subscription: {
    status: string;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    planId: string;
  } | null;
  plan: Plan | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Derive a slug from plan name, e.g. "Professional" → "professional" */
function toSlug(name: string): string {
  return (name ?? '').toLowerCase().trim();
}

/** Format a number safely — never throws on undefined/null */
function safeFmt(val: number | null | undefined): string {
  const n = Number(val ?? 0);
  return isNaN(n) ? '0' : n.toLocaleString();
}

// ── Static display data ───────────────────────────────────────────────────────
const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  starter: [
    'Up to 3 active projects',
    'Up to 2 users',
    'Basic budget & expense tracking',
    'Material requisitions',
    'Project steps & phases',
  ],
  professional: [
    'Up to 10 active projects',
    'Unlimited users',
    'Reports & summaries',
    'Export to Excel / CSV',
    'Petty cash management',
    'Material requisitions',
  ],
  enterprise: [
    'Unlimited projects',
    'Unlimited users',
    'Role-based permissions',
    'Advanced reports',
    'PDF requisition generator',
    'Priority support',
    'All Professional features',
  ],
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  starter:      <Zap      className="w-6 h-6" />,
  professional: <Building2 className="w-6 h-6" />,
  enterprise:   <Crown    className="w-6 h-6" />,
};

const PLAN_CARD_COLORS: Record<string, string> = {
  starter:      'border-blue-200  bg-blue-50/50',
  professional: 'border-primary/30 bg-primary/5',
  enterprise:   'border-amber-200 bg-amber-50/50',
};

const PLAN_BADGE_COLORS: Record<string, string> = {
  starter:      'bg-blue-100   text-blue-700',
  professional: 'bg-primary/10 text-primary',
  enterprise:   'bg-amber-100  text-amber-700',
};

const PLAN_TAGLINES: Record<string, string> = {
  starter:      'Small Contractors',
  professional: 'Growing Firms',
  enterprise:   'Enterprises',
};

// ── Inner page (uses useSearchParams — must be inside Suspense) ───────────────
function BillingContent() {
  const { user } = useAuth();
  const router      = useRouter();
  const searchParams = useSearchParams();

  const [plans,   setPlans]   = useState<Plan[]>([]);
  const [status,  setStatus]  = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState<string | null>(null); // planId currently processing

  // ── Verify payment if Paystack redirected back ────────────────────────────
  useEffect(() => {
    const shouldVerify = searchParams.get('verify');
    const reference    = searchParams.get('reference') ?? searchParams.get('trxref');
    if (shouldVerify && reference) verifyPayment(reference);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load plans + subscription status ─────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch('/api/plans').then((r) => r.json()),
      fetch('/api/subscriptions').then((r) => r.json()),
    ])
      .then(([p, s]) => {
        // p may come back as an object on error — guard array
        setPlans(Array.isArray(p) ? p : []);
        setStatus(s && typeof s === 'object' && !s.error ? s : null);
      })
      .catch(() => toast.error('Failed to load billing info'))
      .finally(() => setLoading(false));
  }, []);

  // ── Verify payment with backend ───────────────────────────────────────────
  const verifyPayment = async (reference: string) => {
    try {
      const res  = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message ?? 'Payment confirmed! Your plan is now active.');
        fetch('/api/subscriptions').then((r) => r.json()).then((s) => {
          if (s && !s.error) setStatus(s);
        });
      } else {
        toast.error(data.error ?? 'Payment verification failed.');
      }
    } catch {
      toast.error('Could not verify payment. Please contact support.');
    }
  };

  // ── Start Paystack checkout ───────────────────────────────────────────────
  const handleUpgrade = async (planId: string) => {
    setPaying(planId);
    try {
      const res  = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error(data.error ?? 'Failed to start payment.');
        setPaying(null);
      }
    } catch {
      toast.error('Could not initialize payment. Please try again.');
      setPaying(null);
    }
  };

  // ── Loading spinner ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </ProtectedLayout>
    );
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const currentPlanSlug = status?.plan ? toSlug(status.plan.name) : '';
  const isOnTrial       = status?.isTrial    ?? false;
  const isExpired       = status?.isExpired  ?? false;
  const daysLeft        = status?.daysLeftInTrial ?? 0;
  const trialEndDate    = status?.subscription?.trialEndsAt
    ? new Date(status.subscription.trialEndsAt).toLocaleDateString()
    : 'soon';
  const nextBillingDate = status?.subscription?.currentPeriodEnd
    ? new Date(status.subscription.currentPeriodEnd).toLocaleDateString()
    : 'N/A';

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground">Billing &amp; Plans</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription and unlock features for your team
            </p>
          </div>

          {/* ── Current subscription card ────────────────────────────────── */}
          <Card className={`p-6 mb-10 border-2 ${
            isExpired
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-primary/20 bg-primary/5'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isExpired
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {isExpired
                    ? <AlertCircle className="w-6 h-6" />
                    : isOnTrial
                    ? <Clock className="w-6 h-6" />
                    : <ShieldCheck className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {isExpired
                      ? 'Subscription Expired'
                      : isOnTrial
                      ? `Free Trial — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                      : `${status?.plan?.name ?? 'Active'} Plan`}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {isExpired
                      ? 'Please upgrade to regain access to your projects and data.'
                      : isOnTrial
                      ? `Trial ends ${trialEndDate}. No credit card required during trial.`
                      : `Next billing: ${nextBillingDate}`}
                  </p>
                </div>
              </div>
              {(isExpired || isOnTrial) && (
                <span className={`self-start sm:self-center inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  isExpired
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {isExpired ? 'Expired' : 'Trial Active'}
                </span>
              )}
            </div>
          </Card>

          {/* ── Plans grid ──────────────────────────────────────────────── */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Choose Your Plan</h2>
            <p className="text-muted-foreground mt-1">
              All new accounts include a 15-day free trial
            </p>
          </div>

          {plans.length === 0 ? (
            <Card className="p-12 text-center border-border/50 mb-12">
              <p className="text-muted-foreground">
                Could not load plans. Please refresh the page.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-12">
              {plans.map((plan) => {
                const slug      = toSlug(plan.name);
                const isCurrent = slug === currentPlanSlug && !isOnTrial && !isExpired;
                const isPopular = slug === 'professional';
                // Safely coerce price — guard against undefined
                const price     = Number(plan.price ?? 0);

                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden border-2 transition-all ${
                      isCurrent
                        ? 'border-green-400 shadow-lg'
                        : (PLAN_CARD_COLORS[slug] ?? 'border-border')
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                        POPULAR
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                        CURRENT PLAN
                      </div>
                    )}

                    <div className="p-6">
                      {/* Plan header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          PLAN_BADGE_COLORS[slug] ?? 'bg-muted text-foreground'
                        }`}>
                          {PLAN_ICONS[slug] ?? <Zap className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{plan.name}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            PLAN_BADGE_COLORS[slug] ?? 'bg-muted text-foreground'
                          }`}>
                            {PLAN_TAGLINES[slug] ?? plan.name}
                          </span>
                        </div>
                      </div>

                      {/* Price — uses safeFmt so toLocaleString is never called on undefined */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">
                            GHS {safeFmt(price)}
                          </span>
                          <span className="text-muted-foreground text-sm">/month</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plan.maxProjects === 0
                            ? 'Unlimited projects'
                            : `Up to ${plan.maxProjects} projects`}
                          {' · '}
                          {plan.maxUsers === 0
                            ? 'Unlimited users'
                            : `${plan.maxUsers} user${plan.maxUsers > 1 ? 's' : ''}`}
                        </p>
                      </div>

                      {/* Feature list */}
                      <ul className="space-y-2 mb-8">
                        {(PLAN_HIGHLIGHTS[slug] ?? []).map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA button */}
                      {isCurrent ? (
                        <Button variant="outline" disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={isPopular ? 'default' : 'outline'}
                          disabled={paying === plan.id}
                          onClick={() => handleUpgrade(plan.id)}
                        >
                          {paying === plan.id ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Redirecting...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              {isExpired || isOnTrial ? 'Subscribe Now' : 'Upgrade'}
                            </span>
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ── Trust badge ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-10">
            <ShieldCheck className="w-4 h-4" />
            <span>
              Payments are secured and processed by Paystack. We never store your card details.
            </span>
          </div>

          {/* ── FAQ ──────────────────────────────────────────────────────── */}
          <Card className="p-8 border-border/50">
            <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: 'How does the free trial work?',
                  a: 'Every new account gets 15 days free on the Starter plan — no credit card required. You can upgrade any time.',
                },
                {
                  q: 'Can I upgrade or downgrade anytime?',
                  a: 'Yes. Upgrades take effect immediately. Downgrades apply at the end of your current billing period.',
                },
                {
                  q: 'What happens to my data if I expire?',
                  a: 'Your data is always safe. Expired accounts have read-only access. Upgrade to restore full functionality.',
                },
                {
                  q: 'Do you support team billing?',
                  a: 'Yes — the Professional and Enterprise plans include multi-user access under one company account.',
                },
              ].map((item) => (
                <div key={item.q}>
                  <h4 className="font-semibold mb-1">{item.q}</h4>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </ProtectedLayout>
  );
}

// ── Export wrapped in Suspense (required for useSearchParams) ─────────────────
export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}