'use client';

import { useState, useEffect, type FC, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export const CookieConsentBanner: FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing consent on mount
    const consent = Cookies.get('gdpr-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = useCallback(() => {
    setIsLoading(true);
    try {
      // Set cookie with secure options
      Cookies.set('gdpr-consent', 'accepted', {
        expires: 365,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      setShowBanner(false);
    } catch (error) {
      logger.error('Failed to set cookie consent:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDecline = useCallback(() => {
    setIsLoading(true);
    try {
      // Set cookie with secure options
      Cookies.set('gdpr-consent', 'declined', {
        expires: 365,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      setShowBanner(false);
    } catch (error) {
      logger.error('Failed to set cookie consent:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 bg-gray-100 p-4 shadow-md dark:bg-gray-900">
      <div className="container mx-auto flex flex-col items-center justify-between md:flex-row">
        <p className="mb-4 text-sm text-gray-800 md:mb-0 dark:text-gray-200">
          We use cookies to enhance your experience. By continuing to visit this
          site you agree to our use of cookies. Learn more in our{' '}
          <Link href="/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAccept} size="sm" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Accept'}
          </Button>
          <Button
            onClick={handleDecline}
            size="sm"
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Decline'}
          </Button>
        </div>
      </div>
    </div>
  );
};
