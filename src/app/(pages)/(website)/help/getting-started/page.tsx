'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Building,
  Handshake,
  Lightbulb,
  Zap,
  MessageCircle,
  Download,
  Shield,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Step {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  completed?: boolean;
}

interface UserType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  features: string[];
  href: string;
}

const userTypes: UserType[] = [
  {
    id: 'client',
    title: 'Client (Hiring Company)',
    description:
      'Companies looking to hire top talent using AI-powered recruitment',
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    features: [
      'Post unlimited job listings',
      'AI-powered candidate matching',
      'Advanced filtering and search',
      'Team collaboration tools',
      'Interview scheduling and management',
      'Analytics and reporting',
    ],
    href: '/help/for-clients',
  },
  {
    id: 'candidate',
    title: 'Candidate (Job Seeker)',
    description: 'Professionals seeking their next career opportunity',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    features: [
      'Create detailed professional profile',
      'AI resume optimization',
      'Personalized job matching',
      'AI-powered skill assessments',
      'Interview preparation tools',
      'Career growth insights',
    ],
    href: '/help/for-candidates',
  },
  {
    id: 'partner',
    title: 'Partner (Recruitment Agency)',
    description: 'Recruitment agencies and staffing firms',
    icon: Handshake,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    features: [
      'Manage multiple client accounts',
      'White-label solutions',
      'Advanced candidate database',
      'Commission tracking',
      'Multi-client dashboard',
      'Partner-specific analytics',
    ],
    href: '/help/for-partners',
  },
];

const quickStartSteps: Step[] = [
  {
    id: 'create-account',
    title: 'Create Your Account',
    description: 'Sign up and verify your email address to get started',
    timeEstimate: '2 min',
  },
  {
    id: 'complete-profile',
    title: 'Complete Your Profile',
    description: 'Add your information and preferences for better matching',
    timeEstimate: '10 min',
  },
  {
    id: 'explore-features',
    title: 'Explore Key Features',
    description: 'Take a tour of the platform and understand the main features',
    timeEstimate: '15 min',
  },
  {
    id: 'first-action',
    title: 'Take Your First Action',
    description: 'Post a job (clients) or apply to positions (candidates)',
    timeEstimate: '5 min',
  },
];

const commonQuestions = [
  {
    question: 'How do I choose the right account type?',
    answer:
      "Choose Client if you're hiring, Candidate if you're job seeking, or Partner if you're a recruitment agency.",
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes! We offer a 14-day free trial for all new users to explore the platform.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'Basic setup takes about 15-20 minutes. Full profile optimization can take 30-45 minutes.',
  },
  {
    question: 'Can I change my account type later?',
    answer:
      'Yes, you can upgrade or change your account type anytime from your settings.',
  },
];

export default function GettingStartedPage() {
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
              <Lightbulb className="h-5 w-5 text-emerald-600" />
              <Badge variant="outline">Getting Started</Badge>
            </div>
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              Getting Started with Teamcast
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Everything you need to know to get up and running quickly
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* User Types Section */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Choose Your Path
              </h2>
              <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                Teamcast serves different types of users. Select your role to
                get personalized guidance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {userTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                >
                  <Card className="h-full border-slate-200 transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-slate-700">
                    <CardHeader>
                      <div
                        className={`inline-flex rounded-2xl p-3 ${type.bgColor} mb-4`}
                      >
                        <type.icon className={`h-8 w-8 ${type.color}`} />
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white">
                        {type.title}
                      </CardTitle>
                      <p className="text-slate-600 dark:text-slate-300">
                        {type.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 space-y-2">
                        {type.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full" asChild>
                        <Link href={type.href}>
                          Get Started as {type.title.split(' ')[0]}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quick Start Guide */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Quick Start Guide
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Follow these steps to get started in under 30 minutes
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {quickStartSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <span className="text-sm font-semibold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {step.timeEstimate}
                        </Badge>
                      </div>
                      <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Platform Overview */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-900/10 dark:to-purple-900/10">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                    <div>
                      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                        Why Choose Teamcast?
                      </h2>
                      <p className="mb-6 text-slate-600 dark:text-slate-300">
                        Our AI-powered platform revolutionizes the hiring
                        process by creating perfect matches between companies
                        and candidates.
                      </p>
                      <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="mb-1 text-2xl font-bold text-blue-600">
                            98%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            Match Accuracy
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="mb-1 text-2xl font-bold text-purple-600">
                            50%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            Faster Hiring
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="mb-1 text-2xl font-bold text-green-600">
                            10K+
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            Companies
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="mb-1 text-2xl font-bold text-orange-600">
                            500K+
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            Candidates
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild>
                          <Link href="/signup">
                            Start Free Trial
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/help/downloads">
                            <Download className="mr-2 h-4 w-4" />
                            Download Guide
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <Zap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            AI-Powered Matching
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Advanced algorithms find perfect fits
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                          <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            Secure & Private
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Enterprise-grade security for your data
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            Global Reach
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Connect with talent worldwide
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Common Questions */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Common Questions
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Quick answers to help you get started faster
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {commonQuestions.map((qa, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                        {qa.question}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {qa.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="text-center"
            >
              <Card className="border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                <CardContent className="p-8">
                  <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                    Ready to Get Started?
                  </h2>
                  <p className="mx-auto mb-6 max-w-2xl text-slate-600 dark:text-slate-300">
                    Choose your path and start your journey with Teamcast today.
                    Our support team is here to help every step of the way.
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button size="lg" asChild>
                      <Link href="/signup">
                        Create Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/help">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Get Help
                      </Link>
                    </Button>
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
