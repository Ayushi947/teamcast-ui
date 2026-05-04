'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { featureFlagService } from '@/lib/services/services';
import { logger } from '@/lib/logger';

interface FeatureFlagContextType {
  flags: Record<string, boolean>;
  isLoading: boolean;
  isFeatureEnabled: (key: string) => boolean;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(
  undefined
);

interface FeatureFlagProviderProps {
  children: ReactNode;
  clientId?: string;
  userType?: string;
}

export function FeatureFlagProvider({
  children,
  clientId,
  userType,
}: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      setIsLoading(true);
      const flagsData = await featureFlagService.getPublicFeatureFlags(
        clientId,
        userType
      );

      const safeFlags =
        flagsData && typeof flagsData === 'object' && !Array.isArray(flagsData)
          ? flagsData
          : {};
      setFlags(safeFlags);
      logger.info('Feature flags loaded', {
        count: Object.keys(safeFlags).length,
      });
    } catch (error) {
      logger.error('Failed to load feature flags', { error });

      setFlags({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [clientId, userType]);

  const isFeatureEnabled = (key: string): boolean => {
    return Boolean(flags && flags[key] === true);
  };

  const refreshFlags = async () => {
    await fetchFlags();
  };

  return (
    <FeatureFlagContext.Provider
      value={{ flags, isLoading, isFeatureEnabled, refreshFlags }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error(
      'useFeatureFlags must be used within a FeatureFlagProvider'
    );
  }
  return context;
}

// Hook for checking a specific feature
export function useFeature(key: string): boolean {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(key);
}
