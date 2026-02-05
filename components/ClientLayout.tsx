"use client"

import React, { useLayoutEffect, useState, useEffect } from "react"
import { AuthProvider } from '@/lib/auth-context'
import { DataProvider } from '@/lib/data-context'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Apply crypto polyfill after component mounts to avoid hydration issues
  useLayoutEffect(() => {
    if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
      crypto.randomUUID = function(): `${string}-${string}-${string}-${string}-${string}` {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        }) as `${string}-${string}-${string}-${string}-${string}`;
      };
    }
  }, []);

  // Mark as hydrated after first render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't render until hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return (
      <div style={{ visibility: 'hidden' }}>
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </div>
    );
  }

  return (
    <AuthProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthProvider>
  )
}
