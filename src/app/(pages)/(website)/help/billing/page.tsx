'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  Shield,
  Star,
  RefreshCw,
  Mail,
  Lock,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

interface BillingTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  articles: BillingArticle[];
}

interface BillingArticle {
  id: string;
  title: string;
  description: string;
  steps: string[];
  tips?: string[];
  warning?: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$199',
    period: 'month',
    description: 'Perfect for small teams and startups',
    features: [
      'Post up to 5 jobs simultaneously',
      'AI-powered candidate matching',
      'Browse 75 candidate profiles with full details',
      'Conduct 15 AI-driven interviews',
      'Email support during business hours',
      'Basic performance insights and reports',
      'Automated interview scheduling',
    ],
    popular: false,
    color: 'border-blue-500',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$499',
    period: 'month',
    description: 'Ideal for growing companies',
    features: [
      'Post up to 20 jobs simultaneously',
      'Advanced AI matching with custom criteria',
      'Browse 250 candidate profiles with full details',
      'Conduct 50 AI-driven interviews',
      'Priority support via email and live chat',
      'Comprehensive analytics and detailed reports',
      'Smart interview scheduling with calendar sync',
      'Seamless ATS and job board connections',
    ],
    popular: true,
    color: 'border-green-500',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Talk to us',
    period: 'pricing',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited job postings with no restrictions',
      'Custom AI matching algorithms tailored to your needs',
      '24/7 dedicated support with dedicated team',
      'Seamless ATS and job board connections',
      'Custom analytics and white-label reporting',
      'Advanced interview tools with custom workflows',
      'Complete team management and collaboration suite',
      'Full API access for custom integrations',
      'Custom integrations with your existing tools',
      'Dedicated account manager for personalized service',
    ],
    color: 'border-purple-500',
  },
];

const billingTopics: BillingTopic[] = [
  {
    id: 'subscription',
    title: 'Subscription Management',
    description: 'Manage your subscription plans and billing cycle',
    icon: RefreshCw,
    color: 'text-blue-600',
    articles: [
      {
        id: 'upgrade-plan',
        title: 'Upgrade Your Plan',
        description: 'How to upgrade to a higher tier plan',
        steps: [
          'Go to Settings > Billing',
          'Click "Upgrade Plan"',
          'Select your desired plan',
          'Review pricing and features',
          'Enter payment information',
          'Confirm upgrade',
        ],
        tips: [
          'Upgrades take effect immediately',
          'You&apos;ll be charged the prorated amount',
          'New features are available right away',
        ],
      },
      {
        id: 'downgrade-plan',
        title: 'Downgrade Your Plan',
        description: 'How to downgrade to a lower tier plan',
        steps: [
          'Navigate to Settings > Billing',
          'Click "Change Plan"',
          'Select the lower tier plan',
          'Review feature limitations',
          'Confirm downgrade',
        ],
        tips: [
          'Downgrades take effect at next billing cycle',
          'You keep current features until then',
          'No refund for unused portion',
        ],
        warning: 'Some features may be lost when downgrading',
      },
      {
        id: 'cancel-subscription',
        title: 'Cancel Your Subscription',
        description: 'How to cancel your paid subscription',
        steps: [
          'Go to Settings > Billing',
          'Click "Cancel Subscription"',
          'Select reason for cancellation',
          'Confirm cancellation',
          'Your subscription remains active until the end of current billing period',
        ],
        warning: 'Cancellation is immediate and cannot be undone',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payment Methods',
    description: 'Manage your payment methods and billing information',
    icon: CreditCard,
    color: 'text-green-600',
    articles: [
      {
        id: 'add-payment-method',
        title: 'Add Payment Method',
        description: 'How to add a new credit card or payment method',
        steps: [
          'Go to Settings > Billing',
          'Click "Payment Methods"',
          'Click "Add New Payment Method"',
          'Enter card details or select other payment option',
          'Verify the payment method',
          'Set as default if desired',
        ],
        tips: [
          'We accept all major credit cards (Visa, MasterCard, American Express)',
          'PayPal and bank transfers available for annual plans',
          'All payments are processed securely',
          'No setup fees for any plan',
        ],
      },
      {
        id: 'update-payment-method',
        title: 'Update Payment Method',
        description: 'How to update your existing payment information',
        steps: [
          'Navigate to Settings > Billing',
          'Find "Payment Methods" section',
          'Click "Edit" on the payment method',
          'Update the information',
          'Save changes',
        ],
        tips: [
          'Update before your card expires',
          'Changes take effect immediately',
        ],
      },
      {
        id: 'failed-payment',
        title: 'Handle Failed Payments',
        description: 'What to do when a payment fails',
        steps: [
          'Check your email for payment failure notification',
          'Go to Settings > Billing',
          'Update your payment method',
          'Click "Retry Payment"',
          'Contact support if issues persist',
        ],
        warning: 'Account may be suspended after multiple failed payments',
      },
    ],
  },
  {
    id: 'invoices',
    title: 'Invoices & Receipts',
    description: 'Access your billing history and download receipts',
    icon: Receipt,
    color: 'text-purple-600',
    articles: [
      {
        id: 'download-invoice',
        title: 'Download Invoices',
        description: 'How to download your billing invoices',
        steps: [
          'Go to Settings > Billing',
          'Click "Billing History"',
          'Find the invoice you need',
          'Click "Download PDF"',
          'Save the file to your device',
        ],
        tips: [
          'Invoices are available immediately after payment',
          'All invoices include tax information',
          'Keep invoices for expense reporting',
        ],
      },
      {
        id: 'billing-history',
        title: 'View Billing History',
        description: 'How to view your complete billing history',
        steps: [
          'Navigate to Settings > Billing',
          'Click "Billing History"',
          'Use filters to find specific transactions',
          'Click on any transaction for details',
        ],
        tips: [
          'History shows all payments and refunds',
          'Export history for accounting purposes',
        ],
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing & Features',
    description: 'Understand our pricing structure and plan features',
    icon: DollarSign,
    color: 'text-orange-600',
    articles: [
      {
        id: 'plan-comparison',
        title: 'Compare Plans',
        description: 'Detailed comparison of all available plans',
        steps: [
          'Visit our pricing page',
          'Review feature comparison table',
          'Consider your usage needs',
          'Check for current promotions',
          'Contact sales for custom pricing',
        ],
        tips: [
          'Annual plans offer 20% discount (Starter: $160/month, Professional: $399/month)',
          'Starter plan includes 14-day free trial',
          'Enterprise plans include custom features and dedicated support',
          'All plans include SSL security and 99.9% uptime guarantee',
        ],
      },
      {
        id: 'enterprise-pricing',
        title: 'Enterprise Pricing',
        description: 'Custom pricing for large organizations',
        steps: [
          'Contact our sales team via /contact page',
          'Discuss your specific requirements',
          'Receive custom quote based on your needs',
          'Review contract terms and SLA',
          'Sign agreement and begin onboarding',
        ],
        tips: [
          'Volume discounts available for large teams',
          'Custom integrations and API access included',
          'Dedicated account manager assigned',
          '24/7 dedicated support with SLA guarantee',
        ],
      },
    ],
  },
];

const commonIssues = [
  {
    issue: 'Payment declined',
    solution:
      'Check card details, ensure sufficient funds, or try a different payment method.',
    icon: CreditCard,
  },
  {
    issue: "Can't find invoice",
    solution:
      'Check your email or go to Settings > Billing > Billing History to download.',
    icon: Receipt,
  },
  {
    issue: 'Unexpected charge',
    solution:
      "Review your billing history and contact support if you don't recognize the charge.",
    icon: AlertTriangle,
  },
  {
    issue: 'Refund request',
    solution:
      'Contact support within 30 days of payment with your reason for refund.',
    icon: RefreshCw,
  },
];

export default function BillingPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/help" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Help
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <Badge variant="outline">Billing & Plans</Badge>
            </div>
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              Billing & Subscription Plans
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Manage your subscription, payments, and billing information
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Current Plans Overview */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Available Plans
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Choose the plan that best fits your needs
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                >
                  <Card
                    className={`relative h-full ${plan.color} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                        <Badge className="bg-blue-500 text-white">
                          <Star className="mr-1 h-3 w-3" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {plan.price}
                        <span className="text-sm font-normal text-slate-600 dark:text-slate-300">
                          /{plan.period}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="mb-6 space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.popular ? 'default' : 'outline'}
                        asChild
                      >
                        <Link href={`/signup?plan=${plan.id}`}>
                          {plan.price === '$0' ? 'Get Started' : 'Choose Plan'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Billing Topics */}
          <section className="mb-12">
            <Tabs defaultValue="subscription" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {billingTopics.map((topic) => (
                  <TabsTrigger
                    key={topic.id}
                    value={topic.id}
                    className="flex items-center gap-2"
                  >
                    <topic.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {topic.title.split(' ')[0]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {billingTopics.map((topic) => (
                <TabsContent key={topic.id} value={topic.id} className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                            <topic.icon className={`h-6 w-6 ${topic.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              {topic.title}
                            </CardTitle>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {topic.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {topic.articles.map((article, _index) => (
                            <div
                              key={article.id}
                              className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0 dark:border-slate-700"
                            >
                              <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                {article.title}
                              </h3>
                              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                                {article.description}
                              </p>

                              {article.warning && (
                                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                    <div>
                                      <h5 className="font-medium text-amber-800 dark:text-amber-200">
                                        Warning
                                      </h5>
                                      <p className="text-sm text-amber-700 dark:text-amber-300">
                                        {article.warning}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="mb-4">
                                <h4 className="mb-2 font-medium text-slate-900 dark:text-white">
                                  Step-by-step guide:
                                </h4>
                                <ol className="space-y-1">
                                  {article.steps.map((step, stepIndex) => (
                                    <li
                                      key={stepIndex}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600 dark:bg-blue-900/20">
                                        {stepIndex + 1}
                                      </span>
                                      <span className="text-sm text-slate-600 dark:text-slate-300">
                                        {step}
                                      </span>
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              {article.tips && (
                                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
                                  <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900 dark:text-blue-100">
                                    <Info className="h-4 w-4" />
                                    Pro Tips:
                                  </h4>
                                  <ul className="space-y-1">
                                    {article.tips.map((tip, tipIndex) => (
                                      <li
                                        key={tipIndex}
                                        className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200"
                                      >
                                        <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* Common Issues */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Common Billing Issues
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Quick solutions for frequent billing problems
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {commonIssues.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                          <item.icon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                            {item.issue}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {item.solution}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Billing Security */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:border-green-800 dark:from-green-900/10 dark:to-blue-900/10">
                <CardContent className="p-8">
                  <div className="mb-6 text-center">
                    <div className="mb-4 inline-flex rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                      Secure Billing
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                      Your payment information is protected with
                      enterprise-grade security
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[
                      {
                        title: 'PCI Compliant',
                        description:
                          'All payment data is processed according to PCI DSS standards',
                        icon: Lock,
                      },
                      {
                        title: 'Encrypted Storage',
                        description:
                          'Payment information is encrypted and securely stored',
                        icon: Shield,
                      },
                      {
                        title: 'Fraud Protection',
                        description:
                          'Advanced fraud detection protects your transactions',
                        icon: Eye,
                      },
                    ].map((security, index) => (
                      <div key={index} className="text-center">
                        <div className="mb-3 inline-flex rounded-lg bg-white p-3 dark:bg-slate-800">
                          <security.icon className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                          {security.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {security.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Contact Billing Support */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-center"
            >
              <Card className="border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                <CardContent className="p-8">
                  <HelpCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                    Need Billing Help?
                  </h2>
                  <p className="mx-auto mb-6 max-w-2xl text-slate-600 dark:text-slate-300">
                    Our billing support team is available to help with any
                    questions about your subscription, payments, or invoices.
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button size="lg" asChild>
                      <Link href="mailto:hello@teamcast.ai">
                        <Mail className="mr-2 h-5 w-5" />
                        Email Billing Support
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/help">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Help Center
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                    <p>📧 hello@teamcast.ai • 📞 +1 (650) 695-9495</p>
                    <p>Billing support available Monday-Friday, 9AM-6PM PST</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
