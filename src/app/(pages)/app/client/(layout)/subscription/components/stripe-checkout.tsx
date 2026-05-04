import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IClientSubscriptionPackage } from '@/lib/shared';
import { stripeService } from '@/lib/services/services';
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface StripeCheckoutProps {
  package: IClientSubscriptionPackage;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  package: pkg,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [_checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      // Create checkout session
      const response = await stripeService.createCheckoutSession({
        packageId: pkg.id,
        successUrl: `${window.location.origin}/app/client/subscription?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/app/client/subscription?canceled=true`,
        metadata: {
          packageName: pkg.name,
          billingCycle: pkg.billingCycle,
        },
      });

      if (response.url) {
        setCheckoutUrl(response.url);
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (_error) {
      toast.error('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBillingCycleText = (cycle: string) => {
    switch (cycle.toUpperCase()) {
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
    if (pkg.billingCycle.toUpperCase() === 'ANNUALLY') {
      return Math.round(pkg.price * 12 * 0.2); // 20% savings
    }
    return 0;
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
            <Badge variant="secondary">{pkg.billingCycle}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{pkg.maxSeats} Team Members</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{pkg.maxJobPostings} Job Postings</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {pkg.unlimitedCandidateViews
                  ? 'Unlimited'
                  : pkg.maxCandidateViews}{' '}
                Candidate Views
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {pkg.maxAiAssessments} AI Assessments
              </span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-medium">Subtotal</span>
            <span className="text-lg">
              ${pkg.price}/{getBillingCycleText(pkg.billingCycle)}
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
              $
              {pkg.billingCycle.toUpperCase() === 'ANNUALLY'
                ? pkg.price * 12 - calculateSavings()
                : pkg.price}
              /{getBillingCycleText(pkg.billingCycle)}
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
            disabled={loading}
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
            disabled={loading}
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
