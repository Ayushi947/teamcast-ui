'use client';

import { FeatureFlagProvider } from '@/lib/context/feature-flag-context';
import { useApp } from '@/lib/context/app-context';
import { ReactNode } from 'react';

interface FeatureFlagProviderWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that connects FeatureFlagProvider with AppProvider
 * to pass user context (clientId and userType) to feature flags
 */
export function FeatureFlagProviderWrapper({
  children,
}: FeatureFlagProviderWrapperProps) {
  const { user } = useApp();

  // Extract clientId and userType from user context
  const clientId = user?.type === 'CLIENT' ? user?.clientId : undefined;
  const userType = user?.type;

  return (
    <FeatureFlagProvider clientId={clientId} userType={userType}>
      {children}
    </FeatureFlagProvider>
  );
}
