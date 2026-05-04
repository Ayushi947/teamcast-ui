import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { stripeService } from '@/lib/services/services';
import { IClientSubscription } from '@/lib/shared';
import {
  Download,
  ExternalLink,
  Receipt,
  FileText,
  RefreshCcw,
  CreditCard,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface BillingHistoryProps {
  subscription: IClientSubscription;
  customerId: string;
  subscriptionId: string;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({
  subscription,
  customerId,
  subscriptionId,
}) => {
  const router = useRouter();
  // Check if subscription is free
  const isFreeSubscription = subscription.package.name === 'Free';
  // Get customer and subscription IDs from subscription metadata or properties
  const {
    data: invoicesData,
    refetch,
    isLoading: isLoadingInvoices,
  } = useQuery({
    queryKey: ['invoices', customerId],
    queryFn: async () => {
      const invoices = await stripeService.getInvoices(customerId || '');
      return invoices;
    },
    enabled: !!customerId,
  });
  const invoices = invoicesData?.invoices || [];

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const invoice = await stripeService.getInvoice(invoiceId);
      if (invoice.invoicePdf) {
        window.open(invoice.invoicePdf, '_blank');
      } else {
        toast.error('PDF not available for this invoice');
      }
    } catch (_error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleViewInvoice = (hostedUrl: string) => {
    window.open(hostedUrl, '_blank');
  };

  const paymentProvider =
    (subscription as any).paymentProvider ||
    (subscription as any).metadata?.paymentProvider ||
    'Stripe';

  return (
    <div className="space-y-6">
      {/* Only show billing summary and invoices if not free */}
      {!isFreeSubscription && (
        <>
          {/* Invoices List */}
          <Card className="bg-card shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary h-5 w-5" />
                  <span className="text-xl font-bold">Recent Invoices</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetch();
                  }}
                  disabled={isLoadingInvoices}
                  className="h-8 gap-1"
                >
                  {isLoadingInvoices ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  <span>Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted rounded-full p-4">
                    <FileText className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="mt-4 mb-2 text-lg font-semibold">
                    No Invoices Found
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Your billing history will appear here once you have active
                    subscriptions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="bg-card/50 hover:bg-accent/5 rounded-lg border transition-all"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 flex-shrink-0 rounded-full p-2">
                              <Receipt className="text-primary h-6 w-6" />
                            </div>
                            <div>
                              <div className="mb-1 flex items-center space-x-2">
                                <p className="font-semibold">
                                  Invoice #{invoice.id.slice(-8)}
                                </p>
                                <Badge
                                  variant={
                                    invoice.status === 'paid'
                                      ? 'success'
                                      : invoice.status === 'open'
                                        ? 'outline'
                                        : 'secondary'
                                  }
                                  className="capitalize"
                                >
                                  {invoice.status}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground grid grid-cols-2 gap-x-4 text-sm">
                                <p>Date: {formatDate(invoice.invoiceDate)}</p>
                                {invoice.status !== 'paid' && (
                                  <p>Due: {formatDate(invoice.dueDate)}</p>
                                )}
                                {invoice.paidAt && (
                                  <p className="text-green-600">
                                    Paid: {formatDate(invoice.paidAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {formatCurrency(
                                invoice.amountDue,
                                invoice.currency
                              )}
                            </p>
                            <div className="mt-2 flex items-center justify-end gap-1">
                              {invoice.invoicePdf && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadInvoice(invoice.id)
                                  }
                                  className="h-8 gap-1"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download</span>
                                </Button>
                              )}
                              {invoice.hostedInvoiceUrl && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleViewInvoice(invoice.hostedInvoiceUrl!)
                                  }
                                  className="h-8 gap-1"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  <span>View</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {invoice.description && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-muted-foreground text-sm">
                              {invoice.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Billing Information (always show) */}
      {/* Account Information & Support */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Details */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex flex-wrap justify-between border-b border-slate-100 py-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Customer ID
                </span>
                <span className="flex items-center gap-2 font-mono text-sm">
                  {customerId || 'Not available'}
                  <Copy
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => handleCopyToClipboard(customerId || 'N/A')}
                  />
                </span>
              </div>
              <div className="flex flex-wrap justify-between border-b border-slate-100 py-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Subscription ID
                </span>
                <span className="flex items-center gap-2 font-mono text-sm">
                  {subscriptionId || 'Not available'}
                  <Copy
                    className="h-4 w-4 cursor-pointer"
                    onClick={() =>
                      handleCopyToClipboard(subscriptionId || 'N/A')
                    }
                  />
                </span>
              </div>
              <div className="flex flex-wrap justify-between py-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Payment Provider
                </span>
                <span className="text-sm">{paymentProvider}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Have questions about your billing, need to update your payment
              method, or want to make changes to your subscription?
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="bg-card w-full justify-start gap-2"
                onClick={() => {
                  router.push('/help');
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="bg-card w-full justify-start gap-2"
                onClick={() => {
                  router.push('/help');
                }}
              >
                <FileText className="h-4 w-4" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
