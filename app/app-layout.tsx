// app/app-layout.tsx  (UPDATED — adds TrialBanner + Expired User Lock)
'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { TrialBanner } from '@/components/trial-banner';

interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysLeftInTrial: number;
}

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Fetch subscription status when user is logged in
  useEffect(() => {
    if (user) {
      fetch('/api/subscriptions')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setSubscriptionStatus(data))
        .catch(() => null);
    }
  }, [user]);

  // Block navigation for expired users - force them to stay on billing page
  useEffect(() => {
    if (!user || !subscriptionStatus) return;

    const isExpired = subscriptionStatus.isExpired;
    const isOnBillingPage = pathname === '/dashboard/billing';

    // If subscription is expired and user is NOT on billing page, redirect to billing
    if (isExpired && !isOnBillingPage) {
      // Only redirect if we're not already redirecting
      if (!redirecting) {
        setRedirecting(true);
        router.replace('/dashboard/billing');
      }
    } else if (isExpired && isOnBillingPage) {
      // User is on billing page - clear the redirecting flag so they can interact with the page
      setRedirecting(false);
    }
  }, [user, subscriptionStatus, pathname, router, redirecting]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        if (!redirecting) {
          setRedirecting(true);
          router.replace('/login');
        }
      } else {
        setShouldRender(true);
      }
    }
  }, [user, isLoading, router, redirecting]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !shouldRender || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SidebarNav user={user} />
      <div className="flex-1 flex flex-col">
        {/* Trial / expiry banner — shown to all authenticated users */}
        <TrialBanner />
        {children}
      </div>
    </div>
  );
}

export default ProtectedLayout;