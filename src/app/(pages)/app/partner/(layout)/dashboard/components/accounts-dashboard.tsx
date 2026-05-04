'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  Plus,
  Receipt,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const AccountsDashboard = () => {
  // Mock data - replace with actual API calls
  const financialStats = [
    {
      name: 'Current Plan',
      value: 'Enterprise Pro',
      icon: CreditCard,
      change: 'Active',
      changeType: 'positive' as const,
      description: 'Monthly subscription',
    },
    {
      name: 'Monthly Billing',
      value: '$2,499',
      icon: DollarSign,
      change: '+5%',
      changeType: 'positive' as const,
      description: 'vs last month',
    },
    {
      name: 'Outstanding',
      value: '$0',
      icon: AlertCircle,
      change: 'Paid',
      changeType: 'positive' as const,
      description: 'All invoices paid',
    },
    {
      name: 'Add-ons',
      value: '$450',
      icon: Plus,
      change: '+$150',
      changeType: 'positive' as const,
      description: 'This month',
    },
  ];

  const recentInvoices = [
    {
      id: 'INV-2024-001',
      date: '2024-03-01',
      amount: '$2,499.00',
      status: 'Paid',
      dueDate: '2024-03-15',
      description: 'Monthly Subscription - March 2024',
    },
    {
      id: 'INV-2024-002',
      date: '2024-02-01',
      amount: '$2,349.00',
      status: 'Paid',
      dueDate: '2024-02-15',
      description: 'Monthly Subscription - February 2024',
    },
    {
      id: 'INV-2024-003',
      date: '2024-01-01',
      amount: '$2,499.00',
      status: 'Paid',
      dueDate: '2024-01-15',
      description: 'Monthly Subscription - January 2024',
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-01',
      amount: '$2,299.00',
      status: 'Paid',
      dueDate: '2023-12-15',
      description: 'Monthly Subscription - December 2023',
    },
  ];

  const addOnPurchases = [
    {
      id: 1,
      name: 'Additional Candidate Slots',
      quantity: 100,
      unitPrice: '$2.50',
      totalPrice: '$250.00',
      purchaseDate: '2024-03-10',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Premium AI Assessments',
      quantity: 50,
      unitPrice: '$4.00',
      totalPrice: '$200.00',
      purchaseDate: '2024-03-05',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Advanced Analytics',
      quantity: 1,
      unitPrice: '$99.00',
      totalPrice: '$99.00',
      purchaseDate: '2024-02-28',
      status: 'Active',
    },
  ];

  const subscriptionDetails = {
    plan: 'Enterprise Pro',
    nextBilling: '2024-04-01',
    billingCycle: 'Monthly',
    autoRenew: true,
    paymentMethod: '**** **** **** 4242',
    usage: {
      candidates: { used: 342, limit: 500, cost: '$0.00' },
      jobs: { used: 127, limit: 200, cost: '$0.00' },
      interviews: { used: 89, limit: 150, cost: '$0.00' },
      assessments: { used: 156, limit: 200, cost: '$0.00' },
    },
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'active':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      'font-medium',
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscription Plan Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Plan</span>
                <Badge variant="default">{subscriptionDetails.plan}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Billing Cycle
                </span>
                <span className="text-sm font-medium">
                  {subscriptionDetails.billingCycle}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Next Billing
                </span>
                <span className="text-sm font-medium">
                  {subscriptionDetails.nextBilling}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Auto Renew
                </span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-sm font-medium">Enabled</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Payment Method
                </span>
                <span className="text-sm font-medium">
                  {subscriptionDetails.paymentMethod}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Usage This Month</h4>
              {Object.entries(subscriptionDetails.usage).map(([key, usage]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">
                      {key}
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        getUsageColor(usage.used, usage.limit)
                      )}
                    >
                      {usage.used}/{usage.limit}
                    </span>
                  </div>
                  <Progress
                    value={(usage.used / usage.limit) * 100}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>

            <Button className="w-full" variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Invoices
              </CardTitle>
              <Button variant="outline" size="sm">
                View All Invoices
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.date}
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.amount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(invoice.status) as any}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add-on Purchases Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add-on Purchases Summary
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              $
              {addOnPurchases
                .reduce(
                  (sum, addon) =>
                    sum + parseFloat(addon.totalPrice.replace('$', '')),
                  0
                )
                .toFixed(2)}{' '}
              Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Add-on Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addOnPurchases.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell>{addon.quantity}</TableCell>
                  <TableCell>{addon.unitPrice}</TableCell>
                  <TableCell className="font-medium">
                    {addon.totalPrice}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {addon.purchaseDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(addon.status) as any}>
                      {addon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Receipt className="mr-1 h-3 w-3" />
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
