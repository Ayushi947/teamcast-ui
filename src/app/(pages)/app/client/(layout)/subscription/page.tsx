'use client';
import { useEffect, useState, Suspense } from 'react';
import { SubscriptionUsage } from './components/subscription-usage';
import { SubscriptionHeader } from './components/subscription-header';
import {
  clientSubscriptionService,
  stripeService,
} from '@/lib/services/services';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClientNotifications } from '@/lib/hooks/use-client-notifications';
import { useApp } from '@/lib/context/app-context';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface CheckoutSession {
  sessionId: string;
  url: string;
  status?: string;
  paymentStatus?: string;
}

function SubscriptionPageContent() {
  const { user } = useApp();
  const clientId = user?.clientId;
  const clientNotifications = useClientNotifications();
  const router = useRouter();
  const [_currentSessionId, setCurrentSessionId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const paymentMethodSuccess = searchParams.get('payment_method');

  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const subscription = await clientSubscriptionService.getSubscription();
        return subscription;
      } catch (error) {
        logger.error('Failed to fetch subscription:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1, // Only retry once instead of 3 times
    retryDelay: 1000, // Wait 1 second before retry
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const packageId = subscriptionData?.packageId;
  const { data: checkoutSession } = useQuery<CheckoutSession>({
    queryKey: ['checkoutSession', packageId],
    queryFn: async () => {
      try {
        const checkoutSession = await stripeService.createCheckoutSession({
          packageId: packageId as string,
          successUrl: `${window.location.origin}/app/client/subscription?success=true`,
          cancelUrl: `${window.location.origin}/app/client/subscription?canceled=true`,
          metadata: {
            clientId: clientId,
          },
        });
        return checkoutSession;
      } catch (error) {
        logger.error('Failed to create checkout session:', error);
        throw error;
      }
    },
    enabled: !!packageId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const sessionId = checkoutSession?.sessionId;

  const { data: retrieveCheckoutSession } = useQuery({
    queryKey: ['retrieveCheckoutSession', sessionId],
    queryFn: async () => {
      try {
        const retrieveCheckoutSession =
          await stripeService.retrieveCheckoutSession(sessionId || '');
        return retrieveCheckoutSession;
      } catch (error) {
        logger.error('Failed to retrieve checkout session:', error);
        throw error;
      }
    },
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const customerId = retrieveCheckoutSession?.customerId;
  const subscriptionId = retrieveCheckoutSession?.subscriptionId;

  useEffect(() => {
    if (checkoutSession?.sessionId) {
      setCurrentSessionId(checkoutSession.sessionId);
    }
  }, [checkoutSession?.sessionId]);

  // Sync subscription data from Stripe
  const syncSubscriptionData = async () => {
    try {
      await stripeService.syncSubscriptionFromStripe({
        subscriptionId: subscriptionId || '',
        autoRenew: subscriptionData?.autoRenew,
      });
      await refetchSubscription();
    } catch (error) {
      logger.error('Failed to sync subscription data:', error);
    }
  };

  useEffect(() => {
    if (subscriptionData?.id && subscriptionId) {
      syncSubscriptionData();
    }
  }, [subscriptionData?.id, subscriptionId]);

  // Process checkout session directly
  const processCheckoutSession = async (sessionId: string) => {
    try {
      // Retrieve the checkout session
      setIsLoading(true);
      const checkoutSession =
        await stripeService.retrieveCheckoutSession(sessionId);

      // If the session is complete and payment was successful, sync the subscription
      if (
        checkoutSession.status === 'complete' &&
        checkoutSession.paymentStatus === 'paid'
      ) {
        // Complete checkout and sync subscription data
        const _syncResult = await stripeService.completeCheckoutAndSync({
          sessionId,
          clientId: clientId as string,
          autoRenew: true,
        });

        // Send notification for successful subscription upgrade
        if (user?.id && checkoutSession.metadata?.packageName) {
          clientNotifications.subscriptionUpgraded(
            user.id,
            checkoutSession.metadata.packageName,
            checkoutSession.amountTotal.toString()
          );
        }

        // Refresh subscription data
        await refetchSubscription();

        return true; // Return success status
      }
      return false;
    } catch (error) {
      logger.error('Failed to process checkout session:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL parameters for Stripe redirects
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    let isProcessing = false;

    const handleSession = async () => {
      if (isProcessing) return;

      try {
        isProcessing = true;

        if (sessionId && success === 'true') {
          const processSuccess = await processCheckoutSession(sessionId);

          // Only show toast if processing was successful
          if (processSuccess) {
            toast.success(
              'Payment completed successfully! Your subscription has been updated.',
              { id: 'payment-success' } // Add unique ID to prevent duplicates
            );
          }

          // Remove query parameters from URL
          const url = new URL(window.location.href);
          url.searchParams.delete('success');
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
        } else if (canceled === 'true') {
          toast.info(
            'Payment was canceled. No changes were made to your subscription.',
            { id: 'payment-canceled' } // Add unique ID
          );
          const url = new URL(window.location.href);
          url.searchParams.delete('canceled');
          window.history.replaceState({}, '', url.toString());
        } else if (paymentMethodSuccess === 'success') {
          toast.success(
            'Payment method added successfully!',
            { id: 'payment-method-success' } // Add unique ID
          );
          if (user?.id) {
            clientNotifications.paymentMethodAdded(user.id, 'New');
          }
          await refetchSubscription();

          const url = new URL(window.location.href);
          url.searchParams.delete('payment_method');
          window.history.replaceState({}, '', url.toString());
        } else if (paymentMethodSuccess === 'canceled') {
          toast.info(
            'Payment method setup was canceled.',
            { id: 'payment-method-canceled' } // Add unique ID
          );
          const url = new URL(window.location.href);
          url.searchParams.delete('payment_method');
          window.history.replaceState({}, '', url.toString());
        }
      } finally {
        isProcessing = false;
      }
    };

    handleSession();
  }, [
    success,
    canceled,
    paymentMethodSuccess,
    searchParams,
    user?.id,
    clientNotifications,
    refetchSubscription,
  ]);

  const handleCancelSubscription = async (reason?: string) => {
    try {
      await clientSubscriptionService.cancelSubscription({
        reason: reason,
      });
      toast.success('Subscription cancelled successfully');

      if (user?.id) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        clientNotifications.subscriptionCancelled(
          user.id,
          endDate.toLocaleDateString()
        );
      }

      refetchSubscription();
    } catch (_err) {
      toast.error('Failed to cancel subscription. Please try again later.');
    }
  };

  // Show loading state when any critical data is loading

  if (isLoading || isLoadingSubscription) {
    return (
      <div className="space-y-6 p-4">
        <SubscriptionHeader user={user} subscription={subscriptionData} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-muted h-[140px] animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <SubscriptionHeader user={user} subscription={subscriptionData} />
      {subscriptionData ? (
        <SubscriptionUsage
          subscription={subscriptionData}
          onCancelSubscription={handleCancelSubscription}
          subscriptionId={subscriptionId || ''}
          customerId={customerId || ''}
        />
      ) : subscriptionError ? (
        <div className="py-12 text-center">
          <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No Active Subscription</h3>
          <p className="text-muted-foreground">
            Subscribe to a plan to view usage statistics
          </p>
          <Button className="mt-4" onClick={() => router.push('/pricing')}>
            View Pricing Plans
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// Main component with Suspense boundary
export default function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionPageLoading />}>
      <SubscriptionPageContent />
    </Suspense>
  );
}

// Loading fallback component
const SubscriptionPageLoading = () => (
  <div className="space-y-6 p-4">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-primary text-2xl font-bold">
            Subscription Management
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Loading subscription information...
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-muted h-[140px] animate-pulse rounded-lg"
        ></div>
      ))}
    </div>
  </div>
);
