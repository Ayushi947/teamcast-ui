import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IPaymentMethod } from '@/lib/shared';
import { stripeService } from '@/lib/services/services';
import {
  Star,
  StarIcon,
  Trash2,
  Plus,
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface PaymentMethodsProps {
  paymentMethods: IPaymentMethod[];
  customerId: string;
  onAddPaymentMethod: (
    paymentMethodId: string,
    isDefault?: boolean
  ) => Promise<void>;
  onRemovePaymentMethod: (paymentMethodId: string) => Promise<void>;
  onSetDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentMethods,
  customerId,
  onRemovePaymentMethod,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAddPaymentMethod = async () => {
    try {
      setLoading('add');

      // Create a payment method setup session
      const response = await stripeService.createCheckoutSession({
        packageId: '',
        successUrl: `${window.location.origin}/app/client/subscription?payment_method=success`,
        cancelUrl: `${window.location.origin}/app/client/subscription?payment_method=canceled`,
        metadata: {
          action: 'add_payment_method',
        },
      });

      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create payment method setup session');
      }
    } catch (_error) {
      toast.error('Failed to add payment method. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(paymentMethodId);
      await onRemovePaymentMethod(paymentMethodId);
      toast.success('Payment method removed successfully');
    } catch (_error) {
      toast.error('Failed to remove payment method. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    switch (brandLower) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardBrandColor = (brand: string) => {
    const brandLower = brand.toLowerCase();
    switch (brandLower) {
      case 'visa':
        return 'bg-purple-500';
      case 'mastercard':
        return 'bg-red-500';
      case 'amex':
        return 'bg-green-500';
      case 'discover':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(paymentMethodId);
      await stripeService.setDefaultPaymentMethod(customerId, {
        paymentMethodId,
      });
      toast.success('Default payment method updated successfully');
    } catch (_error) {
      toast.error('Failed to update default payment method. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="rounded-lg border border-purple-200 bg-purple-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 shadow-sm">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-purple-900">
                Secure Payment Processing
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-purple-700">
                Your payment information is encrypted and securely processed by
                Stripe. We never store your full card details on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <div className="bg-card space-y-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`transition-all duration-200 hover:shadow-md ${
              method.isDefault ? 'bg-purple-50 ring-2 ring-purple-500' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Card Brand Icon */}
                  <div
                    className={`h-8 w-12 rounded-md ${getCardBrandColor(method.brand || 'unknown')} flex items-center justify-center text-sm font-bold text-white`}
                  >
                    {getCardBrandIcon(method.brand || 'unknown')}
                  </div>

                  {/* Card Details */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">
                        {(method.brand || 'Card').charAt(0).toUpperCase() +
                          (method.brand || 'Card').slice(1)}{' '}
                        ending in {method.last4}
                      </p>
                      {method.isDefault && (
                        <Badge className="bg-purple-600 text-xs text-white">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Expires{' '}
                      {method.expMonth?.toString().padStart(2, '0') || '00'}/
                      {method.expYear || '00'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultPaymentMethod(method.id)}
                      disabled={loading === method.id}
                      className="text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                    >
                      {loading === method.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  {method.isDefault && (
                    <div className="flex items-center space-x-1 text-purple-600">
                      <Star className="h-4 w-4" />
                      <span className="text-xs font-medium">Default</span>
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={method.isDefault || loading === method.id}
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remove Payment Method
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this payment method?
                          {method.isDefault &&
                            ' This is your default payment method and cannot be removed.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemovePaymentMethod(method.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {paymentMethods.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-600">
                No Payment Methods
              </h3>
              <p className="text-muted-foreground mb-4">
                Add a payment method to manage your subscription billing
              </p>
              <Button
                onClick={handleAddPaymentMethod}
                disabled={loading === 'add'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading === 'add' ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Adding...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Your First Payment Method</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Security Info */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2">
              <Lock className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm font-semibold">PCI Compliant</p>
                <p className="text-muted-foreground text-xs">
                  Industry standard security
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm font-semibold">256-bit SSL</p>
                <p className="text-muted-foreground text-xs">
                  Bank-level encryption
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm font-semibold">Stripe Powered</p>
                <p className="text-muted-foreground text-xs">
                  Trusted by millions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
