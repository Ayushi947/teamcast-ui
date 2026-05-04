'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  MessageCircle,
  Phone,
  Mail,
  Download,
  Settings,
  User,
  CreditCard,
  Lock,
  AlertCircle,
  HelpCircle,
  Zap,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';

interface TroubleshootingItem {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  solutions: Solution[];
  relatedArticles: string[];
  lastUpdated: string;
}

interface Solution {
  id: string;
  title: string;
  steps: string[];
  timeEstimate: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  success_rate: number;
}

interface DiagnosticCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
}

const troubleshootingItems: TroubleshootingItem[] = [
  {
    id: 'login-issues',
    title: 'Cannot Login to Account',
    description: 'Unable to sign in to your Teamcast account',
    category: 'Authentication',
    severity: 'high',
    symptoms: [
      'Invalid email/password error',
      'Account locked message',
      'Two-factor authentication not working',
      'OAuth login failing',
    ],
    solutions: [
      {
        id: 'reset-password',
        title: 'Reset Your Password',
        steps: [
          'Go to the login page',
          'Click "Forgot Password?" link',
          'Enter your email address',
          'Check your email for reset instructions',
          'Follow the link in the email',
          'Create a new strong password',
          'Try logging in with your new password',
        ],
        timeEstimate: '5-10 minutes',
        difficulty: 'easy',
        success_rate: 95,
      },
      {
        id: 'clear-browser-data',
        title: 'Clear Browser Data',
        steps: [
          'Open your browser settings',
          'Go to Privacy/Security section',
          'Clear browsing data',
          'Select "Cookies and site data" and "Cached images and files"',
          'Choose "All time" as the time range',
          'Click "Clear data"',
          'Restart your browser',
          'Try logging in again',
        ],
        timeEstimate: '3-5 minutes',
        difficulty: 'easy',
        success_rate: 80,
      },
    ],
    relatedArticles: ['account-security', 'two-factor-auth'],
    lastUpdated: '2024-01-15',
  },
  {
    id: 'profile-upload-issues',
    title: 'Profile Photo/Resume Upload Problems',
    description: 'Issues with uploading files to your profile',
    category: 'Profile',
    severity: 'medium',
    symptoms: [
      'File upload fails or times out',
      'Unsupported file format error',
      'File size too large message',
      'Upload gets stuck at 0%',
    ],
    solutions: [
      {
        id: 'check-file-requirements',
        title: 'Verify File Requirements',
        steps: [
          'Ensure your file is in a supported format (JPG, PNG, PDF)',
          'Check file size is under 10MB',
          'Rename file to remove special characters',
          'Try uploading a different file to test',
          'Use a different browser if issues persist',
        ],
        timeEstimate: '2-3 minutes',
        difficulty: 'easy',
        success_rate: 90,
      },
    ],
    relatedArticles: ['profile-setup', 'resume-optimization'],
    lastUpdated: '2024-01-10',
  },
  {
    id: 'ai-assessment-issues',
    title: 'AI Assessment Not Working',
    description: 'Problems with AI-powered assessments and interviews',
    category: 'Assessments',
    severity: 'high',
    symptoms: [
      "Assessment won't start",
      'Camera/microphone not working',
      'Assessment freezes or crashes',
      'Unable to submit responses',
    ],
    solutions: [
      {
        id: 'check-permissions',
        title: 'Check Browser Permissions',
        steps: [
          'Click the camera/microphone icon in your browser address bar',
          'Allow access to camera and microphone',
          'Refresh the page',
          'Test your camera and microphone',
          'Try using a different browser if issues persist',
        ],
        timeEstimate: '3-5 minutes',
        difficulty: 'easy',
        success_rate: 85,
      },
    ],
    relatedArticles: ['ai-assessments', 'technical-requirements'],
    lastUpdated: '2024-01-12',
  },
  {
    id: 'job-search-issues',
    title: 'Job Search Not Showing Results',
    description: 'No jobs appearing in search results',
    category: 'Job Search',
    severity: 'medium',
    symptoms: [
      'Search returns no results',
      'Filters not working properly',
      'Old job postings showing',
      'Search is very slow',
    ],
    solutions: [
      {
        id: 'optimize-search',
        title: 'Optimize Your Search',
        steps: [
          'Clear all search filters',
          'Try broader search terms',
          'Check your location settings',
          'Update your profile skills and preferences',
          'Contact support if no jobs appear for your area',
        ],
        timeEstimate: '5-10 minutes',
        difficulty: 'easy',
        success_rate: 75,
      },
    ],
    relatedArticles: ['job-matching', 'profile-optimization'],
    lastUpdated: '2024-01-08',
  },
  {
    id: 'billing-issues',
    title: 'Billing and Payment Problems',
    description: 'Issues with subscription, payments, or billing',
    category: 'Billing',
    severity: 'high',
    symptoms: [
      'Payment declined',
      'Subscription not activated',
      'Incorrect billing amount',
      'Unable to update payment method',
    ],
    solutions: [
      {
        id: 'update-payment-method',
        title: 'Update Payment Information',
        steps: [
          'Go to Account Settings > Billing',
          'Click "Update Payment Method"',
          'Enter your new card details',
          'Verify billing address matches your card',
          'Save changes and retry payment',
        ],
        timeEstimate: '3-5 minutes',
        difficulty: 'easy',
        success_rate: 90,
      },
    ],
    relatedArticles: ['subscription-plans', 'billing-faq'],
    lastUpdated: '2024-01-14',
  },
];

const diagnosticChecks: DiagnosticCheck[] = [
  {
    id: 'internet-connection',
    name: 'Internet Connection',
    description: 'Check if you have a stable internet connection',
    status: 'pending',
  },
  {
    id: 'browser-compatibility',
    name: 'Browser Compatibility',
    description: 'Verify your browser is supported and up to date',
    status: 'pending',
  },
  {
    id: 'javascript-enabled',
    name: 'JavaScript Enabled',
    description: 'Ensure JavaScript is enabled in your browser',
    status: 'pending',
  },
  {
    id: 'cookies-enabled',
    name: 'Cookies Enabled',
    description: 'Check if cookies are enabled for Teamcast',
    status: 'pending',
  },
  {
    id: 'popup-blocker',
    name: 'Popup Blocker',
    description: "Verify popup blocker isn't interfering",
    status: 'pending',
  },
];

export default function TroubleshootingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [diagnostics, setDiagnostics] =
    useState<DiagnosticCheck[]>(diagnosticChecks);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories', icon: HelpCircle },
    { id: 'Authentication', name: 'Authentication', icon: Lock },
    { id: 'Profile', name: 'Profile', icon: User },
    { id: 'Assessments', name: 'Assessments', icon: Brain },
    { id: 'Job Search', name: 'Job Search', icon: Search },
    { id: 'Billing', name: 'Billing', icon: CreditCard },
    { id: 'Technical', name: 'Technical', icon: Settings },
  ];

  const severityLevels = [
    { id: 'all', name: 'All Severity', color: 'bg-gray-500' },
    { id: 'low', name: 'Low', color: 'bg-green-500' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-500' },
    { id: 'high', name: 'High', color: 'bg-orange-500' },
    { id: 'critical', name: 'Critical', color: 'bg-red-500' },
  ];

  const filteredItems = troubleshootingItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symptoms.some((symptom) =>
        symptom.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSeverity =
      selectedSeverity === 'all' || item.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);

    for (let i = 0; i < diagnostics.length; i++) {
      setDiagnostics((prev) =>
        prev.map((check, index) =>
          index === i ? { ...check, status: 'running' } : check
        )
      );

      // Simulate diagnostic check
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate result (mostly pass, some random failures)
      const passed = Math.random() > 0.2;
      setDiagnostics((prev) =>
        prev.map((check, index) =>
          index === i
            ? {
                ...check,
                status: passed ? 'passed' : 'failed',
                details: passed
                  ? 'Check passed successfully'
                  : 'Issue detected - see solutions below',
              }
            : check
        )
      );
    }

    setIsRunningDiagnostics(false);
  };

  const resetDiagnostics = () => {
    setDiagnostics(diagnosticChecks);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <h1 className="text-4xl font-bold">Troubleshooting</h1>
            </div>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Find solutions to common issues and get your Teamcast experience
              back on track
            </p>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search for issues, symptoms, or solutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium">Category:</span>
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <category.icon className="mr-1 h-3 w-3" />
                        {category.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium">Severity:</span>
                    {severityLevels.map((level) => (
                      <Badge
                        key={level.id}
                        variant={
                          selectedSeverity === level.id ? 'default' : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => setSelectedSeverity(level.id)}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${level.color} mr-1`}
                        />
                        {level.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Troubleshooting Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Common Issues</h2>
                <Badge variant="outline">
                  {filteredItems.length} issues found
                </Badge>
              </div>

              {filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-medium">
                      No issues found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-3">
                                <h3 className="text-lg font-semibold">
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`h-2 w-2 rounded-full ${getSeverityColor(item.severity)}`}
                                  />
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-3">
                                {item.description}
                              </p>

                              {/* Symptoms */}
                              <div className="mb-4">
                                <h4 className="mb-2 text-sm font-medium">
                                  Common Symptoms:
                                </h4>
                                <ul className="text-muted-foreground space-y-1 text-sm">
                                  {item.symptoms.map((symptom, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2"
                                    >
                                      <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-orange-500" />
                                      {symptom}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Solutions */}
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            {item.solutions.map((solution, _idx) => (
                              <AccordionItem
                                key={solution.id}
                                value={solution.id}
                              >
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>{solution.title}</span>
                                    <Badge
                                      variant="outline"
                                      className={getDifficultyColor(
                                        solution.difficulty
                                      )}
                                    >
                                      {solution.difficulty}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {solution.timeEstimate}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-4">
                                      <div className="text-sm">
                                        <span className="font-medium">
                                          Success Rate:
                                        </span>
                                        <Progress
                                          value={solution.success_rate}
                                          className="ml-2 w-20"
                                        />
                                      </div>
                                      <span className="text-muted-foreground text-sm">
                                        {solution.success_rate}% success rate
                                      </span>
                                    </div>

                                    <div>
                                      <h5 className="mb-2 font-medium">
                                        Steps to follow:
                                      </h5>
                                      <ol className="space-y-2">
                                        {solution.steps.map((step, stepIdx) => (
                                          <li
                                            key={stepIdx}
                                            className="flex items-start gap-3"
                                          >
                                            <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
                                              {stepIdx + 1}
                                            </span>
                                            <span className="text-sm">
                                              {step}
                                            </span>
                                          </li>
                                        ))}
                                      </ol>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Diagnostics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    System Diagnostics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Run automated checks to identify common issues
                    </p>

                    <div className="space-y-3">
                      {diagnostics.map((check) => (
                        <div
                          key={check.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {check.status === 'pending' && (
                                <Clock className="text-muted-foreground h-4 w-4" />
                              )}
                              {check.status === 'running' && (
                                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                              )}
                              {check.status === 'passed' && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {check.status === 'failed' && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {check.name}
                              </p>
                              {check.details && (
                                <p className="text-muted-foreground text-xs">
                                  {check.details}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={runDiagnostics}
                        disabled={isRunningDiagnostics}
                        className="flex-1"
                      >
                        {isRunningDiagnostics ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Run Diagnostics
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetDiagnostics}
                        disabled={isRunningDiagnostics}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear Browser Cache
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Download System Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Check System Requirements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Still Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Can&apos;t find a solution? Our support team is here to
                      help.
                    </p>

                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Start Live Chat
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email Support
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Schedule Call
                      </Button>
                    </div>

                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p>📧 hello@teamcast.ai</p>
                      <p>📞 +1 (650) 695-9495</p>
                      <p>🕐 Mon-Fri 9AM-6PM PST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
