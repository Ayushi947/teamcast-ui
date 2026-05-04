'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building,
  Plus,
  Users,
  Calendar,
  BarChart3,
  Brain,
  Target,
  FileText,
  Clock,
  CheckCircle,
  Lightbulb,
  Eye,
  MessageCircle,
  UserCheck,
  Award,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const clientFeatures = [
  {
    id: 'job-posting',
    title: 'Job Posting & Management',
    icon: Plus,
    description: 'Create and manage job listings with AI assistance',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    steps: [
      'Navigate to Jobs section in your dashboard',
      'Click "Create Job" to start a new posting',
      'Fill out job details including title, description, requirements',
      'Set salary range and employment type',
      'Use AI suggestions to optimize your job description',
      'Review and publish your job listing',
    ],
    tips: [
      'Use clear, specific job titles for better matching',
      'Include required skills and experience levels',
      'Set competitive salary ranges',
      'Add company culture information',
    ],
  },
  {
    id: 'candidate-matching',
    title: 'AI-Powered Candidate Matching',
    icon: Brain,
    description: 'Let AI find the perfect candidates for your roles',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    steps: [
      'Publish your job posting',
      'AI analyzes job requirements and candidate profiles',
      'Receive matched candidates in your dashboard',
      'Review candidate profiles and match scores',
      'Filter candidates by experience, skills, location',
      'Invite promising candidates to apply',
    ],
    tips: [
      'Review match scores and reasoning',
      'Use filters to narrow down candidates',
      'Check candidate availability and preferences',
      'Look at AI-generated compatibility insights',
    ],
  },
  {
    id: 'application-management',
    title: 'Application Management',
    icon: FileText,
    description: 'Efficiently manage and review candidate applications',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    steps: [
      'View all applications in the Applications section',
      'Review candidate profiles and resumes',
      'Use AI insights to evaluate candidates',
      'Move candidates through different stages',
      'Add notes and ratings for team collaboration',
      'Communicate with candidates directly',
    ],
    tips: [
      'Set up application stages that match your process',
      'Use AI recommendations for initial screening',
      'Collaborate with team members on evaluations',
      'Keep candidates informed of their status',
    ],
  },
  {
    id: 'interview-scheduling',
    title: 'Interview Scheduling',
    icon: Calendar,
    description: 'Schedule and manage interviews seamlessly',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    steps: [
      'Select candidates for interviews',
      'Choose interview type (AI or Panel)',
      'Set available time slots',
      'Send interview invitations',
      'Manage interview calendar',
      'Review interview results and feedback',
    ],
    tips: [
      'Use AI interviews for initial screening',
      'Schedule panel interviews for final rounds',
      'Provide clear interview instructions',
      'Follow up promptly after interviews',
    ],
  },
  {
    id: 'team-management',
    title: 'Team Management',
    icon: Users,
    description: 'Collaborate with your hiring team effectively',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    steps: [
      'Go to Team Management section',
      'Click "Invite Team Member"',
      'Enter email and select role (Admin, HR, Recruiter, Accounts)',
      'Send invitation email',
      'Manage team member permissions',
      'Monitor team activity and collaboration',
    ],
    tips: [
      'Assign appropriate roles based on responsibilities',
      'Use collaborative features for decision making',
      'Set up approval workflows for hiring decisions',
      'Regular team sync on hiring progress',
    ],
  },
  {
    id: 'analytics-reporting',
    title: 'Analytics & Reporting',
    icon: BarChart3,
    description: 'Track hiring metrics and optimize your process',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    steps: [
      'Access Analytics dashboard',
      'View key hiring metrics and KPIs',
      'Generate custom reports',
      'Track time-to-hire and cost-per-hire',
      'Analyze candidate sources and quality',
      'Export data for further analysis',
    ],
    tips: [
      'Monitor key metrics regularly',
      'Identify bottlenecks in your hiring process',
      'Track ROI on different sourcing channels',
      'Use data to improve job postings',
    ],
  },
];

const quickStartGuide = [
  {
    step: 1,
    title: 'Complete Company Profile',
    description: 'Set up your company information and branding',
    timeEstimate: '10 minutes',
    actions: [
      'Add company logo and description',
      'Set up company culture and values',
      'Add office locations and contact info',
      'Configure company settings',
    ],
  },
  {
    step: 2,
    title: 'Post Your First Job',
    description: 'Create your first job posting with AI assistance',
    timeEstimate: '15 minutes',
    actions: [
      'Navigate to Jobs section',
      'Use AI job description generator',
      'Set requirements and qualifications',
      'Publish and start receiving applications',
    ],
  },
  {
    step: 3,
    title: 'Invite Your Team',
    description: 'Add team members to collaborate on hiring',
    timeEstimate: '5 minutes',
    actions: [
      'Go to Team Management',
      'Invite HR and recruiting team members',
      'Set appropriate permissions',
      'Start collaborating on candidates',
    ],
  },
  {
    step: 4,
    title: 'Review Matched Candidates',
    description: 'Start reviewing AI-matched candidates',
    timeEstimate: '20 minutes',
    actions: [
      'Review candidate profiles',
      'Check AI match scores',
      'Shortlist promising candidates',
      'Schedule interviews',
    ],
  },
];

const bestPractices = [
  {
    category: 'Job Posting',
    icon: FileText,
    practices: [
      'Write clear, specific job titles',
      'Include detailed job descriptions',
      'Set realistic requirements',
      'Use inclusive language',
      'Specify remote/hybrid options',
    ],
  },
  {
    category: 'Candidate Evaluation',
    icon: UserCheck,
    practices: [
      'Use AI insights as a starting point',
      'Look beyond just technical skills',
      'Consider cultural fit',
      'Check references thoroughly',
      'Provide timely feedback',
    ],
  },
  {
    category: 'Interview Process',
    icon: MessageCircle,
    practices: [
      'Prepare structured interview questions',
      'Use AI interviews for initial screening',
      'Involve multiple team members',
      'Focus on both skills and culture fit',
      'Document interview feedback',
    ],
  },
  {
    category: 'Team Collaboration',
    icon: Users,
    practices: [
      'Set clear roles and responsibilities',
      'Use collaborative evaluation features',
      'Maintain consistent communication',
      'Share feedback and insights',
      'Make data-driven decisions',
    ],
  },
];

const commonChallenges = [
  {
    challenge: 'Not getting quality candidates',
    solution:
      'Review your job description and requirements. Use AI suggestions to optimize your posting. Consider expanding your search criteria or improving your employer brand.',
    icon: Target,
  },
  {
    challenge: 'Too many applications to review',
    solution:
      'Use AI screening and filtering features. Set up automated workflows to pre-screen candidates. Focus on top-matched candidates first.',
    icon: Eye,
  },
  {
    challenge: 'Slow hiring process',
    solution:
      'Streamline your interview process. Use AI interviews for initial screening. Set up clear approval workflows and decision timelines.',
    icon: Clock,
  },
  {
    challenge: 'Team coordination issues',
    solution:
      'Use collaborative features for team evaluation. Set up clear roles and permissions. Regular team sync meetings on hiring progress.',
    icon: Users,
  },
];

export default function ForClientsPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="from-primary/5 via-primary/10 to-background border-border border-b bg-gradient-to-br">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <Link
                href="/help"
                className="text-muted-foreground hover:text-primary inline-flex items-center text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Help Center
              </Link>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-3">
                <Building className="text-primary h-8 w-8" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
                  Complete Guide for Clients
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Everything you need to know about hiring with Teamcast
                </p>
              </div>
            </div>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>25-30 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Comprehensive Guide</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Quick Start Guide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Quick Start Guide
                </h2>
                <p className="text-muted-foreground mb-8">
                  Get started with Teamcast in 4 simple steps and start hiring
                  top talent today.
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {quickStartGuide.map((step, index) => (
                    <Card key={index} className="border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full font-bold">
                              {step.step}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="text-foreground text-lg font-semibold">
                                {step.title}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {step.timeEstimate}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">
                              {step.description}
                            </p>
                            <ul className="space-y-2">
                              {step.actions.map((action, actionIndex) => (
                                <li
                                  key={actionIndex}
                                  className="text-muted-foreground flex items-center gap-2 text-sm"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>

              {/* Key Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Why Choose Teamcast for Hiring?
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <Card className="border-border/50 text-center">
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                          <Brain className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-foreground mb-2 text-lg font-semibold">
                        AI-Powered Matching
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Our AI analyzes millions of data points to find the
                        perfect candidates for your roles
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 text-center">
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-foreground mb-2 text-lg font-semibold">
                        Faster Hiring
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Reduce time-to-hire by 60% with automated screening and
                        smart workflows
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 text-center">
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                          <Award className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                      <h3 className="text-foreground mb-2 text-lg font-semibold">
                        Higher Quality Hires
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Improve hire quality with comprehensive candidate
                        assessments and insights
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="features">
              {/* Feature Guides */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Feature Guides
                </h2>

                {clientFeatures.map((feature, index) => (
                  <Card key={index} className="border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${feature.bgColor}`}>
                          <feature.icon
                            className={`h-6 w-6 ${feature.color}`}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {feature.title}
                          </CardTitle>
                          <p className="text-muted-foreground text-sm">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div>
                          <h4 className="text-foreground mb-3 font-semibold">
                            Step-by-Step Guide:
                          </h4>
                          <ol className="space-y-2">
                            {feature.steps.map((step, stepIndex) => (
                              <li
                                key={stepIndex}
                                className="text-muted-foreground flex items-start gap-2 text-sm"
                              >
                                <span className="bg-primary/10 text-primary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                  {stepIndex + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div>
                          <h4 className="text-foreground mb-3 font-semibold">
                            Pro Tips:
                          </h4>
                          <ul className="space-y-2">
                            {feature.tips.map((tip, tipIndex) => (
                              <li
                                key={tipIndex}
                                className="text-muted-foreground flex items-start gap-2 text-sm"
                              >
                                <Lightbulb className="mt-0.5 h-4 w-4 text-yellow-600" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="best-practices">
              {/* Best Practices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Best Practices for Successful Hiring
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {bestPractices.map((practice, index) => (
                    <Card key={index} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <practice.icon className="text-primary h-6 w-6" />
                          </div>
                          <CardTitle className="text-lg">
                            {practice.category}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {practice.practices.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="text-muted-foreground flex items-start gap-2 text-sm"
                            >
                              <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="troubleshooting">
              {/* Common Challenges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Common Challenges & Solutions
                </h2>

                <div className="space-y-6">
                  {commonChallenges.map((item, index) => (
                    <Card key={index} className="border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                              <item.icon className="h-6 w-6 text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-foreground mb-2 text-lg font-semibold">
                              {item.challenge}
                            </h3>
                            <p className="text-muted-foreground">
                              {item.solution}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Contact Support */}
                <Card className="border-border/50 bg-primary/5 mt-8">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="bg-primary/10 rounded-full p-3">
                          <MessageCircle className="text-primary h-8 w-8" />
                        </div>
                      </div>
                      <h3 className="text-foreground mb-2 text-xl font-bold">
                        Still Need Help?
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Our support team is available to help you succeed with
                        your hiring goals.
                      </p>
                      <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Contact Support
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Schedule Demo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
