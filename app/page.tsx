'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // ✅ Only redirect once auth state is certain
    if (!isLoading && !hasRedirected) {
      if (user) {
        router.replace('/dashboard'); // Use replace to avoid back button issues
      } else {
        router.replace('/login');
      }
      setHasRedirected(true);
    }
  }, [user, isLoading, router, hasRedirected]);

  // ✅ Show a simple loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-background to-secondary">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    </div>
  );
}