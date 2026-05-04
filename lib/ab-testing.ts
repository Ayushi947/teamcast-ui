'use client';

import React from 'react';
import { trackEvent } from './analytics';

// Types for A/B testing
export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // Percentage allocation (0-100)
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  targetMetric: string;
}

// A/B Test configuration
export const AB_TESTS: Record<string, ABTest> = {
  hero_cta: {
    id: 'hero_cta',
    name: 'Hero Section CTA Button',
    description: 'Test different CTA button texts and styles on homepage hero',
    isActive: true,
    startDate: new Date('2024-01-01'),
    targetMetric: 'cta_click',
    variants: [
      {
        id: 'control',
        name: 'Start Free Trial',
        weight: 50,
        props: {
          text: 'Start Free Trial',
          variant: 'default',
          size: 'lg',
        },
      },
      {
        id: 'variant_a',
        name: 'Get Started Free',
        weight: 50,
        props: {
          text: 'Get Started Free',
          variant: 'outline',
          size: 'lg',
        },
      },
    ],
  },
  pricing_cta: {
    id: 'pricing_cta',
    name: 'Pricing Page CTA',
    description: 'Test different CTA button styles on pricing cards',
    isActive: true,
    startDate: new Date('2024-01-01'),
    targetMetric: 'pricing_click',
    variants: [
      {
        id: 'control',
        name: 'Choose Plan',
        weight: 50,
        props: {
          text: 'Choose Plan',
          color: 'primary',
        },
      },
      {
        id: 'variant_a',
        name: 'Start Today',
        weight: 50,
        props: {
          text: 'Start Today',
          color: 'gradient',
        },
      },
    ],
  },
  contact_form: {
    id: 'contact_form',
    name: 'Contact Form Layout',
    description: 'Test different contact form layouts',
    isActive: true,
    startDate: new Date('2024-01-01'),
    targetMetric: 'form_submit',
    variants: [
      {
        id: 'control',
        name: 'Standard Form',
        weight: 50,
        props: {
          layout: 'standard',
          showPhone: true,
        },
      },
      {
        id: 'variant_a',
        name: 'Simplified Form',
        weight: 50,
        props: {
          layout: 'simplified',
          showPhone: false,
        },
      },
    ],
  },
};

// Utility functions
export const getStoredVariant = (testId: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`ab_test_${testId}`);
};

export const storeVariant = (testId: string, variantId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`ab_test_${testId}`, variantId);
};

export const getUserId = (): string => {
  if (typeof window === 'undefined') return 'anonymous';

  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('user_id', userId);
  }
  return userId;
};

export const hashUserId = (userId: string, testId: string): number => {
  let hash = 0;
  const str = userId + testId;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const selectVariant = (testId: string): ABTestVariant | null => {
  const test = AB_TESTS[testId];
  if (!test || !test.isActive) return null;

  // Check if variant is already stored
  const storedVariant = getStoredVariant(testId);
  if (storedVariant) {
    const variant = test.variants.find((v) => v.id === storedVariant);
    if (variant) return variant;
  }

  // Select variant based on user ID hash for consistency
  const userId = getUserId();
  const hash = hashUserId(userId, testId);
  const random = (hash % 100) + 1; // 1-100

  let cumulativeWeight = 0;
  for (const variant of test.variants) {
    cumulativeWeight += variant.weight;
    if (random <= cumulativeWeight) {
      storeVariant(testId, variant.id);

      // Track variant assignment
      trackEvent(
        'ab_test_variant_assigned',
        'ab_testing',
        `${testId}_${variant.id}`
      );

      return variant;
    }
  }

  // Fallback to first variant
  const fallbackVariant = test.variants[0];
  storeVariant(testId, fallbackVariant.id);
  return fallbackVariant;
};

// Hook for using A/B tests in components
export const useABTest = (testId: string) => {
  const [variant, setVariant] = React.useState<ABTestVariant | null>(null);

  React.useEffect(() => {
    const selectedVariant = selectVariant(testId);
    setVariant(selectedVariant);
  }, [testId]);

  const trackConversion = (conversionValue?: number) => {
    if (variant) {
      trackEvent(
        'ab_test_conversion',
        'ab_testing',
        `${testId}_${variant.id}`,
        conversionValue
      );
    }
  };

  return { variant, trackConversion };
};

// Analytics functions
export const trackABTestImpression = (testId: string, variantId: string) => {
  trackEvent('ab_test_impression', 'ab_testing', `${testId}_${variantId}`);
};

export const trackABTestClick = (
  testId: string,
  variantId: string,
  element: string
) => {
  trackEvent(
    'ab_test_click',
    'ab_testing',
    `${testId}_${variantId}_${element}`
  );
};

export const getABTestResults = (testId: string): Promise<any> => {
  // In a real implementation, this would fetch results from your analytics service
  return Promise.resolve({
    testId,
    variants: AB_TESTS[testId]?.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      impressions: Math.floor(Math.random() * 1000) + 100,
      conversions: Math.floor(Math.random() * 50) + 10,
      conversionRate: (Math.random() * 0.15 + 0.05).toFixed(3),
    })),
  });
};

// Component for rendering A/B test variants
interface ABTestComponentProps {
  testId: string;
  fallback?: React.ReactNode;
  children?: (variant: ABTestVariant) => React.ReactNode;
}

export const ABTestComponent: React.FC<ABTestComponentProps> = ({
  testId,
  fallback,
  children,
}) => {
  const { variant } = useABTest(testId);

  React.useEffect(() => {
    if (variant) {
      trackABTestImpression(testId, variant.id);
    }
  }, [testId, variant]);

  if (!variant) {
    return fallback || null;
  }

  if (children) {
    return children(variant);
  }

  if (variant.component) {
    return React.createElement(variant.component, variant.props);
  }

  return null;
};
