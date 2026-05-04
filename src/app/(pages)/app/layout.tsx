'use client';

import { useLayoutEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/utils/auth-utils';
import { Loader2 } from 'lucide-react';
import { publicPaths } from '@/middleware/auth.middleware';
import { TourProvider } from '@/lib/context/tour-context';

function isPublicPath(path: string): boolean {
  return publicPaths.some((publicPath) => path.startsWith(publicPath));
}

function forceRedirect(url: string) {
  try {
    window.location.replace(url);
  } catch {
    window.location.href = url;
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useLayoutEffect(() => {
    const currentPath = window.location.pathname;

    if (isPublicPath(currentPath)) {
      setIsAuthChecked(true);
      return;
    }

    try {
      if (!isAuthenticated()) {
        forceRedirect('/app/auth/login');
        return;
      }

      setIsAuthChecked(true);
    } catch (_error) {
      forceRedirect('/app/auth/login');
    }
  }, []);

  if (!isAuthChecked) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Loading Teamcast...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TourProvider>{children}</TourProvider>
    </>
  );
}
