'use client';

import { FeatureFlagProvider } from '@/lib/context/feature-flag-context';
import { useApp } from '@/lib/context/app-context';
import { ReactNode } from 'react';

interface FeatureFlagWrapperProps {
  children: ReactNode;
}

export function FeatureFlagWrapper({ children }: FeatureFlagWrapperProps) {
  const { user } = useApp();

  return (
    <FeatureFlagProvider clientId={user?.clientId} userType={user?.type}>
      {children}
    </FeatureFlagProvider>
  );
}
