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
  CreditCard, Clock, ShieldCheck, AlertCircle, CalendarDays,
  ChevronRight, Layers,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  price: number;
  maxProjects: number;
  maxUsers: number;
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

interface QueuedSubscription {
  id: string;
  planId: string;
  months: number;
  startsAt: string;
  endsAt: string;
  status: 'pending' | 'active' | 'cancelled';
  plan?: Plan;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSlug(name: string): string {
  return (name ?? '').toLowerCase().trim();
}

function safeFmt(val: number | null | undefined): string {
  const n = Number(val ?? 0);
  return isNaN(n) ? '0' : n.toLocaleString();
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const MONTH_OPTIONS = [
  { value: 1,  label: '1 Month'  },
  { value: 3,  label: '3 Months', savings: '0%'  },
  { value: 6,  label: '6 Months', savings: '5%'  },
  { value: 12, label: '12 Months', savings: '10%' },
];

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
  starter:      <Zap       className="w-6 h-6" />,
  professional: <Building2 className="w-6 h-6" />,
  enterprise:   <Crown     className="w-6 h-6" />,
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

// ── Subscription Timeline Component ──────────────────────────────────────────
function SubscriptionTimeline({
  status,
  queue,
}: {
  status: SubscriptionStatus;
  queue: QueuedSubscription[];
}) {
  if (!status.subscription && queue.length === 0) return null;

  const entries: { label: string; planName: string; start: string; end: string; badge: string; badgeColor: string }[] = [];

  // Current subscription
  if (status.subscription && status.plan) {
    const isTrial = status.isTrial;
    entries.push({
      label:      isTrial ? 'Free Trial' : 'Current Plan',
      planName:   status.plan.name,
      start:      isTrial
        ? fmtDate(status.subscription.trialEndsAt ? undefined : undefined)
        : fmtDate(status.subscription.currentPeriodEnd ? undefined : undefined),
      end:        isTrial
        ? fmtDate(status.subscription.trialEndsAt)
        : fmtDate(status.subscription.currentPeriodEnd),
      badge:      isTrial ? 'Trial' : 'Active',
      badgeColor: isTrial ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700',
    });
  }

  // Queued entries
  for (const q of queue) {
    entries.push({
      label:      'Upcoming Plan',
      planName:   q.plan?.name ?? q.planId,
      start:      fmtDate(q.startsAt),
      end:        fmtDate(q.endsAt),
      badge:      `${q.months} mo`,
      badgeColor: 'bg-blue-100 text-blue-700',
    });
  }

  if (entries.length === 0) return null;

  return (
    <Card className="p-6 mb-10 border-border/50">
      <div className="flex items-center gap-2 mb-5">
        <Layers className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Subscription Timeline</h2>
      </div>

      <div className="relative">
        {/* Vertical line */}
        {entries.length > 1 && (
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border" />
        )}

        <div className="space-y-4">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-start gap-4">
              {/* Dot */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <CalendarDays className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-semibold text-foreground">{entry.planName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.badgeColor}`}>
                    {entry.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">{entry.label}</span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {i === 0 ? 'Ends' : 'Starts'} {i === 0 ? entry.end : entry.start}
                  {i > 0 && (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      Ends {entry.end}
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Month Selector Component ──────────────────────────────────────────────────
function MonthSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MONTH_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            value === opt.value
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-background text-foreground hover:border-primary/50'
          }`}
        >
          {opt.label}
          {opt.savings && (
            <span className={`ml-1 text-xs ${
              value === opt.value ? 'text-primary-foreground/80' : 'text-green-600'
            }`}>
              Save {opt.savings}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Inner page ────────────────────────────────────────────────────────────────
function BillingContent() {
  const { user }     = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [plans,       setPlans]       = useState<Plan[]>([]);
  const [status,      setStatus]      = useState<SubscriptionStatus | null>(null);
  const [queue,       setQueue]       = useState<QueuedSubscription[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [paying,      setPaying]      = useState<string | null>(null);
  const [monthsMap,   setMonthsMap]   = useState<Record<string, number>>({}); // planId → months

  // ── Verify payment on redirect back ──────────────────────────────────────
  useEffect(() => {
    const shouldVerify = searchParams.get('verify');
    const reference    = searchParams.get('reference') ?? searchParams.get('trxref');
    if (shouldVerify && reference) verifyPayment(reference);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadData = () => {
    return Promise.all([
      fetch('/api/plans').then((r) => r.json()),
      fetch('/api/subscriptions').then((r) => r.json()),
      fetch('/api/subscriptions/queue').then((r) => r.json()),
    ])
      .then(([p, s, q]) => {
        setPlans(Array.isArray(p) ? p : []);
        setStatus(s && typeof s === 'object' && !s.error ? s : null);
        setQueue(Array.isArray(q) ? q : []);
      })
      .catch(() => toast.error('Failed to load billing info'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  // ── Verify payment ────────────────────────────────────────────────────────
  const verifyPayment = async (reference: string) => {
    try {
      const res  = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message ?? 'Payment confirmed!');
        loadData();
      } else {
        toast.error(data.error ?? 'Payment verification failed.');
      }
    } catch {
      toast.error('Could not verify payment. Please contact support.');
    }
  };

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleUpgrade = async (planId: string) => {
    const months = monthsMap[planId] ?? 1;
    setPaying(planId);
    try {
      const res  = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, months }),
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

  const setMonths = (planId: string, val: number) => {
    setMonthsMap((prev) => ({ ...prev, [planId]: val }));
  };

  // ── Loading ───────────────────────────────────────────────────────────────
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
    ? fmtDate(status.subscription.trialEndsAt)
    : 'soon';
  const nextBillingDate = status?.subscription?.currentPeriodEnd
    ? fmtDate(status.subscription.currentPeriodEnd)
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

          {/* ── Page header ───────────────────────────────────────────────── */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground">Billing &amp; Plans</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription and unlock features for your team
            </p>
          </div>

          {/* ── Current subscription status card ──────────────────────────── */}
          <Card className={`p-6 mb-6 border-2 ${
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
                      : `Active until ${nextBillingDate}`}
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

          {/* ── Subscription Timeline ─────────────────────────────────────── */}
          <SubscriptionTimeline status={status!} queue={queue} />

          {/* ── Plans grid ────────────────────────────────────────────────── */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {status?.isActive && !isOnTrial ? 'Extend or Change Plan' : 'Choose Your Plan'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {status?.isActive && !isOnTrial
                ? 'Purchase months now — they stack onto your current subscription end date.'
                : 'All new accounts include a 15-day free trial'}
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
                const price     = Number(plan.price ?? 0);
                const months    = monthsMap[plan.id] ?? 1;
                const total     = price * months;

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

                      {/* Price display */}
                      <div className="mb-4">
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

                      {/* Month selector */}
                      <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          How many months?
                        </p>
                        <MonthSelector
                          value={months}
                          onChange={(v) => setMonths(plan.id, v)}
                        />
                        {months > 1 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Total:{' '}
                            <span className="font-semibold text-foreground">
                              GHS {safeFmt(total)}
                            </span>
                            {' '}for {months} months
                          </p>
                        )}
                      </div>

                      {/* Feature list */}
                      <ul className="space-y-2 mb-6">
                        {(PLAN_HIGHLIGHTS[slug] ?? []).map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
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
                            {isCurrent
                              ? `Extend ${months} Month${months > 1 ? 's' : ''}`
                              : isExpired || isOnTrial
                              ? 'Subscribe Now'
                              : `Add ${months} Month${months > 1 ? 's' : ''}`}
                          </span>
                        )}
                      </Button>

                      {/* Queued indicator */}
                      {queue.some((q) => q.planId === plan.id) && (
                        <p className="text-xs text-center text-blue-600 mt-2 font-medium">
                          ✓ {queue.filter((q) => q.planId === plan.id).length} purchase(s) queued
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ── Trust badge ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-10">
            <ShieldCheck className="w-4 h-4" />
            <span>
              Payments are secured and processed by Paystack. We never store your card details.
            </span>
          </div>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <Card className="p-8 border-border/50">
            <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: 'How does stacking months work?',
                  a: 'When you buy additional months while on an active plan, they queue onto your current end date. Your new plan or extra months begin exactly when your current one ends.',
                },
                {
                  q: 'Can I switch plans before my current one ends?',
                  a: 'Yes. Select a different plan, choose how many months, and pay. The new plan will be queued to start the day your current plan ends.',
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

// ── Export ────────────────────────────────────────────────────────────────────
export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}