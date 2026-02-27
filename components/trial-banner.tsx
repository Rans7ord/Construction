'use client';

// components/trial-banner.tsx
// Shown at the top of every dashboard page while a company is on trial.
// Auto-fetches subscription status; dismissible per session (not persisted).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysLeftInTrial: number;
  plan: { name: string } | null;
}

export function TrialBanner() {
  const { user } = useAuth();
  const router   = useRouter();
  const [status,    setStatus]    = useState<SubscriptionStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetch('/api/subscriptions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStatus(data))
      .catch(() => null);
  }, [user]);

  // Nothing to show
  if (!status || dismissed) return null;

  // Expired trial — always show (not dismissible)
  if (status.isExpired) {
    return (
      <div className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Your free trial has expired. Subscribe now to continue using Workfield.</span>
        </div>
        <button
          onClick={() => router.push('/dashboard/billing')}
          className="flex-shrink-0 bg-white text-destructive text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-white/90 transition"
        >
          Subscribe Now
        </button>
      </div>
    );
  }

  // Active trial
  if (status.isTrial && status.isActive) {
    const days    = status.daysLeftInTrial;
    const urgent  = days <= 5;

    return (
      <div
        className={`px-4 py-2.5 flex items-center justify-between gap-4 text-sm ${
          urgent
            ? 'bg-orange-500 text-white'
            : 'bg-primary/10 text-foreground border-b border-primary/20'
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 flex-shrink-0 ${urgent ? 'text-white' : 'text-primary'}`} />
          <span>
            {urgent ? (
              <strong>Only {days} day{days !== 1 ? 's' : ''} left</strong>
            ) : (
              <>
                <strong>{days} days</strong> remaining in your free trial
              </>
            )}
            {' '}— currently on the <strong>{status.plan?.name ?? 'Starter'}</strong> plan.
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => router.push('/dashboard/billing')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${
              urgent
                ? 'bg-white text-orange-500 hover:bg-white/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            Upgrade
          </button>
          {/* Only allow dismiss if not urgent */}
          {!urgent && (
            <button
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground transition"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}