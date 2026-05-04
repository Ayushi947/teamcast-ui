import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IClientSubscriptionPackage } from '@/lib/shared';
import { stripeService } from '@/lib/services/services';
import { useApp } from '@/lib/context/app-context';
import { useClientNotifications } from '@/lib/hooks/use-client-notifications';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface StripeFormProps {
  package: IClientSubscriptionPackage;
  onSuccess: () => void;
  onCancel: () => void;
  isAnnual?: boolean;
}

export const StripeForm: React.FC<StripeFormProps> = ({
  package: pkg,
  onSuccess,
  onCancel,
  isAnnual = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const processedSessionId = React.useRef<string | null>(null);
  const { user } = useApp();
  const clientNotifications = useClientNotifications();
  const selectedPackage = pkg;
  const searchParams = useSearchParams();

  // Get URL parameters
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  // Process checkout session when session_id is present
  const processCheckoutSession = useCallback(
    async (sessionId: string) => {
      // Prevent duplicate processing
      if (processedSessionId.current === sessionId) {
        return;
      }

      try {
        setProcessingCheckout(true);
        processedSessionId.current = sessionId;

        // Call the retrieve checkout API to get the session details
        const checkoutSession =
          await stripeService.retrieveCheckoutSession(sessionId);

        // Check if the session is complete and payment was successful
        if (
          checkoutSession.status === 'complete' &&
          checkoutSession.paymentStatus === 'paid'
        ) {
          // This is the critical step - sync subscription data with Stripe
          const syncResult = await stripeService.completeCheckoutAndSync({
            sessionId,
            clientId: user?.clientId || '',
            autoRenew: true,
          });

          logger.info('Subscription synced successfully:', syncResult);

          // Send notification for successful subscription upgrade
          if (user?.id && selectedPackage) {
            clientNotifications.subscriptionUpgraded(
              user.id,
              selectedPackage.name,
              selectedPackage.price.toString()
            );
          }

          // Call the onSuccess callback to update UI
          onSuccess();
        } else {
          toast.error(
            'Payment was not completed successfully. Please try again.'
          );
        }
      } catch (error) {
        logger.error('Error processing checkout session:', error);
        toast.error(
          'Failed to process payment. Please contact support if you were charged.'
        );
      } finally {
        setProcessingCheckout(false);
      }
    },
    [user?.id, user?.clientId, selectedPackage, clientNotifications, onSuccess]
  );

  // Handle URL parameters for Stripe redirects
  useEffect(() => {
    logger.info('StripeForm: URL parameters', { sessionId, success, canceled });

    if (sessionId && success === 'true') {
      logger.info('StripeForm: Processing checkout session', { sessionId });
      processCheckoutSession(sessionId);
    } else if (canceled === 'true') {
      logger.info('StripeForm: Payment canceled');
      toast.info(
        'Payment was canceled. No changes were made to your subscription.'
      );
      onCancel();
    }
  }, [sessionId, success, canceled, processCheckoutSession, onCancel]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      logger.info('StripeForm: Initiating checkout', { packageId: pkg.id });

      if (!pkg.id) {
        throw new Error('Invalid package ID');
      }

      // Create checkout session with annual flag
      const response = await stripeService.createCheckoutSession({
        packageId: pkg.id,
        successUrl: `${window.location.origin}/app/client/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/app/client/subscription?canceled=true`,
        metadata: {
          packageName: pkg.name,
          billingCycle: isAnnual ? 'ANNUALLY' : pkg.billingCycle,
          packageId: pkg.id, // Add package ID to metadata for verification
          clientId: user?.clientId || '', // Include client ID in metadata
        },
      });

      if (!response?.url) {
        throw new Error('Failed to create checkout session');
      }

      window.location.href = response.url;
    } catch (error) {
      toast.error('Failed to initiate checkout. Please try again.');
      logger.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (typeof pkg.price !== 'number') return pkg.price;

    if (isAnnual) {
      const monthlyPrice = pkg.price;
      const annualPrice = monthlyPrice * 12;
      const discount = annualPrice * 0.2; // 20% annual discount
      return annualPrice - discount;
    }

    return pkg.price;
  };

  const getBillingCycleText = () => {
    if (isAnnual) return 'year';

    switch (pkg.billingCycle.toUpperCase()) {
      case 'MONTHLY':
        return 'month';
      case 'QUARTERLY':
        return 'quarter';
      case 'ANNUALLY':
        return 'year';
      default:
        return 'month';
    }
  };

  const calculateSavings = () => {
    if (!isAnnual || typeof pkg.price !== 'number') return 0;
    return Math.round(pkg.price * 12 * 0.2); // 20% annual savings
  };

  return (
    <Card className="bg-card mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Complete Your Purchase
        </CardTitle>
        <p className="text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Package Summary */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{pkg.name}</h3>
            <Badge variant="secondary">
              {isAnnual ? 'Annual' : pkg.billingCycle}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {pkg.maxSeats
                  ? `${pkg.maxSeats} Team Members`
                  : 'Unlimited Team Members'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {pkg.maxJobPostings
                  ? `${pkg.maxJobPostings} Job Postings`
                  : 'Unlimited Job Postings'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {pkg.unlimitedCandidateViews
                  ? 'Unlimited Candidate Views'
                  : `${pkg.maxCandidateViews} Candidate Views`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {pkg.maxAiAssessments
                  ? `${pkg.maxAiAssessments} AI Assessments`
                  : 'Unlimited AI Assessments'}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-medium">Subtotal</span>
            <span className="text-lg">
              ${calculatePrice()}/{getBillingCycleText()}
            </span>
          </div>

          {calculateSavings() > 0 && (
            <div className="mb-2 flex items-center justify-between text-green-600">
              <span className="text-sm">Annual Savings</span>
              <span className="text-sm font-medium">
                -${calculateSavings()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-xl font-bold">Total</span>
            <span className="text-xl font-bold">
              ${calculatePrice()}/{getBillingCycleText()}
            </span>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-3">
          <div className="text-muted-foreground flex items-center space-x-3 text-sm">
            <Shield className="h-4 w-4" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="text-muted-foreground flex items-center space-x-3 text-sm">
            <Lock className="h-4 w-4" />
            <span>PCI DSS compliant</span>
          </div>
          <div className="text-muted-foreground flex items-center space-x-3 text-sm">
            <CreditCard className="h-4 w-4" />
            <span>Secure payment processing</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCheckout}
            disabled={loading || processingCheckout}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Proceed to Payment</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading || processingCheckout}
            className="w-full"
          >
            Cancel
          </Button>
        </div>

        {/* Terms */}
        <p className="text-muted-foreground text-center text-xs">
          By proceeding, you agree to our{' '}
          <a href="/terms" className="hover:text-primary underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="hover:text-primary underline">
            Privacy Policy
          </a>
        </p>
      </CardContent>
    </Card>
  );
};
