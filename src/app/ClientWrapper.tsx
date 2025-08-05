'use client';

import { useEffect } from 'react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/sonner';

export function ClientWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered with scope:', registration.scope))
        .catch((error) => console.error('Service Worker registration failed:', error));
    }
  }, []);

  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}