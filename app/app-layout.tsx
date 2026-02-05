'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // ✅ Wait for auth check to complete
    if (!isLoading) {
      if (!user) {
        // ✅ Only redirect if definitely not authenticated
        // Use replace instead of push to avoid back button issues
        if (!redirecting) {
          setRedirecting(true);
          router.replace('/login');
        }
      } else {
        setShouldRender(true);
      }
    }
  }, [user, isLoading, router, redirecting]);

  // ✅ Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Don't render anything if not authenticated or redirecting
  if (!user || !shouldRender || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SidebarNav user={user} />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default ProtectedLayout;