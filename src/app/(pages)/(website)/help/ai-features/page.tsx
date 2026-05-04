'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  Target,
  FileText,
  Eye,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  Lightbulb,
  Shield,
  TrendingUp,
  Award,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const aiFeatures = [
  {
    id: 'smart-matching',
    title: 'Smart Candidate Matching',
    icon: Target,
    description:
      'AI analyzes millions of data points to create perfect job-candidate matches',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    howItWorks: [
      'Analyzes job requirements and candidate profiles',
      'Compares skills, experience, and cultural fit',
      'Considers location preferences and availability',
      'Evaluates career trajectory and growth potential',
      'Generates compatibility scores and explanations',
    ],
    benefits: [
      '95% matching accuracy',
      '60% faster hiring process',
      'Reduced bias in candidate selection',
      'Higher candidate satisfaction',
      'Improved long-term retention',
    ],
    dataPoints: [
      'Skills and competencies',
      'Work experience and achievements',
      'Education and certifications',
      'Career goals and preferences',
      'Personality and work style',
      'Availability and location',
    ],
  },
  {
    id: 'resume-intelligence',
    title: 'Resume Intelligence',
    icon: FileText,
    description:
      'AI-powered resume analysis provides actionable feedback for optimization',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    howItWorks: [
      'Parses and extracts key information from resumes',
      'Analyzes content quality and completeness',
      'Compares against industry best practices',
      'Identifies missing skills and experiences',
      'Provides specific improvement recommendations',
    ],
    benefits: [
      'Improved resume quality scores',
      'Better keyword optimization',
      'Enhanced ATS compatibility',
      'Increased interview callbacks',
      'Professional formatting guidance',
    ],
    dataPoints: [
      'Content structure and formatting',
      'Keyword density and relevance',
      'Achievement quantification',
      'Skills alignment with target roles',
      'Experience progression patterns',
      'Education and certification relevance',
    ],
  },
  {
    id: 'interview-insights',
    title: 'Interview Insights',
    icon: Eye,
    description:
      'AI analyzes interview performance and provides detailed feedback',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    howItWorks: [
      'Records and analyzes video interview responses',
      'Evaluates verbal and non-verbal communication',
      'Assesses technical knowledge and problem-solving',
      'Measures confidence and presentation skills',
      'Generates comprehensive performance reports',
    ],
    benefits: [
      'Objective interview evaluation',
      'Consistent assessment criteria',
      'Detailed performance feedback',
      'Bias reduction in hiring decisions',
      'Candidate development insights',
    ],
    dataPoints: [
      'Response quality and relevance',
      'Communication clarity and confidence',
      'Technical accuracy and depth',
      'Problem-solving approach',
      'Cultural fit indicators',
      'Overall presentation skills',
    ],
  },
  {
    id: 'skill-assessment',
    title: 'Skill Assessment Engine',
    icon: Award,
    description:
      'Comprehensive skill evaluation through AI-powered assessments',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    howItWorks: [
      'Creates personalized assessment paths',
      'Adapts difficulty based on performance',
      'Evaluates both technical and soft skills',
      'Provides real-time performance feedback',
      'Generates skill proficiency reports',
    ],
    benefits: [
      'Accurate skill verification',
      'Personalized learning recommendations',
      'Industry-standard benchmarking',
      'Continuous skill tracking',
      'Gap analysis and improvement plans',
    ],
    dataPoints: [
      'Technical proficiency levels',
      'Problem-solving capabilities',
      'Learning agility and adaptability',
      'Communication and collaboration skills',
      'Leadership and management potential',
      'Industry-specific competencies',
    ],
  },
];

const aiAccuracy = [
  {
    metric: 'Matching Accuracy',
    value: 95,
    description: 'Job-candidate compatibility',
  },
  {
    metric: 'Resume Scoring',
    value: 92,
    description: 'Content quality assessment',
  },
  {
    metric: 'Interview Analysis',
    value: 88,
    description: 'Performance evaluation',
  },
  {
    metric: 'Skill Assessment',
    value: 94,
    description: 'Competency measurement',
  },
];

const privacyAndSecurity = [
  {
    title: 'Data Privacy',
    icon: Shield,
    features: [
      'End-to-end encryption for all data',
      'GDPR and CCPA compliance',
      'User consent for data processing',
      'Right to data deletion',
      'Transparent data usage policies',
    ],
  },
  {
    title: 'AI Ethics',
    icon: CheckCircle,
    features: [
      'Bias detection and mitigation',
      'Fair and inclusive algorithms',
      'Regular algorithm audits',
      'Diverse training datasets',
      'Explainable AI decisions',
    ],
  },
  {
    title: 'Security Measures',
    icon: Shield,
    features: [
      'Enterprise-grade security',
      'Regular security assessments',
      'Access controls and monitoring',
      'Secure data storage',
      'Incident response procedures',
    ],
  },
];

const improvementTips = [
  {
    category: 'For Better Matching',
    icon: Target,
    tips: [
      'Complete all profile sections thoroughly',
      'Keep skills and experience updated',
      'Be specific about job preferences',
      'Include relevant keywords in your profile',
      'Regularly update your availability status',
    ],
  },
  {
    category: 'Resume Optimization',
    icon: FileText,
    tips: [
      'Use action verbs and quantifiable achievements',
      'Include relevant keywords for your target roles',
      'Maintain consistent formatting throughout',
      'Update with recent accomplishments regularly',
      'Follow AI recommendations for improvements',
    ],
  },
  {
    category: 'Interview Performance',
    icon: MessageCircle,
    tips: [
      'Practice with AI interview simulations',
      'Prepare specific examples using STAR method',
      'Speak clearly and maintain good posture',
      'Be authentic and genuine in responses',
      'Review feedback and work on weak areas',
    ],
  },
  {
    category: 'Skill Development',
    icon: TrendingUp,
    tips: [
      'Take assessments regularly to track progress',
      'Focus on high-demand skills in your field',
      'Practice skills through real projects',
      'Seek feedback from mentors and peers',
      'Set learning goals and track achievements',
    ],
  },
];

export default function AIFeaturesPage() {
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
                <Brain className="text-primary h-8 w-8" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
                  AI Features Guide
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Understanding how AI powers the Teamcast platform
                </p>
              </div>
            </div>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>15-20 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                <span>AI Technology</span>
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
              <TabsTrigger value="features">AI Features</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Ethics</TabsTrigger>
              <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* AI Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  How AI Powers Teamcast
                </h2>
                <p className="text-muted-foreground mb-8">
                  Our AI technology uses advanced machine learning algorithms to
                  analyze vast amounts of data and provide intelligent insights
                  for both candidates and employers. Here&apos;s how it works:
                </p>

                <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-foreground text-lg font-semibold">
                          Data Processing
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Our AI processes millions of data points including
                        skills, experience, preferences, and performance metrics
                        to create comprehensive profiles.
                      </p>
                      <ul className="text-muted-foreground space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Real-time data analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Pattern recognition
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Predictive modeling
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                          <Zap className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-foreground text-lg font-semibold">
                          Intelligent Matching
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Advanced algorithms compare and score compatibility
                        between candidates and job opportunities based on
                        multiple factors.
                      </p>
                      <ul className="text-muted-foreground space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Multi-factor analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Compatibility scoring
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Continuous learning
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Accuracy Metrics */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="text-primary h-6 w-6" />
                      AI Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {aiAccuracy.map((metric, index) => (
                        <div key={index} className="text-center">
                          <div className="mb-4">
                            <div className="text-primary mb-1 text-3xl font-bold">
                              {metric.value}%
                            </div>
                            <Progress value={metric.value} className="h-2" />
                          </div>
                          <h4 className="text-foreground mb-1 font-semibold">
                            {metric.metric}
                          </h4>
                          <p className="text-muted-foreground text-xs">
                            {metric.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="features">
              {/* AI Features Detail */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  AI Features in Detail
                </h2>

                {aiFeatures.map((feature, index) => (
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
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div>
                          <h4 className="text-foreground mb-3 font-semibold">
                            How It Works:
                          </h4>
                          <ul className="space-y-2">
                            {feature.howItWorks.map((step, stepIndex) => (
                              <li
                                key={stepIndex}
                                className="text-muted-foreground flex items-start gap-2 text-sm"
                              >
                                <ArrowRight className="text-primary mt-0.5 h-4 w-4" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-foreground mb-3 font-semibold">
                            Key Benefits:
                          </h4>
                          <ul className="space-y-2">
                            {feature.benefits.map((benefit, benefitIndex) => (
                              <li
                                key={benefitIndex}
                                className="text-muted-foreground flex items-start gap-2 text-sm"
                              >
                                <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-foreground mb-3 font-semibold">
                            Data Points Analyzed:
                          </h4>
                          <ul className="space-y-2">
                            {feature.dataPoints.map((point, pointIndex) => (
                              <li
                                key={pointIndex}
                                className="text-muted-foreground flex items-start gap-2 text-sm"
                              >
                                <BarChart3 className="mt-0.5 h-4 w-4 text-blue-600" />
                                {point}
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

            <TabsContent value="privacy">
              {/* Privacy and Ethics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Privacy, Ethics & Security
                </h2>
                <p className="text-muted-foreground mb-8">
                  We&apos;re committed to responsible AI development and
                  protecting your data privacy. Our AI systems are designed with
                  ethics and security at their core.
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {privacyAndSecurity.map((section, index) => (
                    <Card key={index} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <section.icon className="text-primary h-6 w-6" />
                          </div>
                          <CardTitle className="text-lg">
                            {section.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {section.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="text-muted-foreground flex items-start gap-2 text-sm"
                            >
                              <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Additional Information */}
                <Card className="border-border/50 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Lightbulb className="text-primary h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-foreground mb-2 text-lg font-semibold">
                          Transparent AI Decisions
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          We believe in explainable AI. Our system provides
                          clear explanations for matching decisions, assessment
                          scores, and recommendations, so you understand how and
                          why decisions are made.
                        </p>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Clear match reasoning and explanations
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Detailed assessment feedback
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Transparent scoring methodology
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="optimization">
              {/* Optimization Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Optimization Tips for Better AI Results
                </h2>
                <p className="text-muted-foreground mb-8">
                  Get the most out of our AI features by following these
                  optimization tips. The more complete and accurate your
                  information, the better our AI can help you.
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {improvementTips.map((category, index) => (
                    <Card key={index} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <category.icon className="text-primary h-6 w-6" />
                          </div>
                          <CardTitle className="text-lg">
                            {category.category}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="text-muted-foreground flex items-start gap-2 text-sm"
                            >
                              <Lightbulb className="mt-0.5 h-4 w-4 text-yellow-600" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Call to Action */}
                <Card className="border-border/50 from-primary/5 to-primary/10 bg-gradient-to-r">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="bg-primary/10 rounded-full p-3">
                          <Brain className="text-primary h-8 w-8" />
                        </div>
                      </div>
                      <h3 className="text-foreground mb-2 text-xl font-bold">
                        Experience the Power of AI
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Ready to see how our AI can transform your hiring or job
                        search experience? Get started today and discover the
                        difference intelligent matching makes.
                      </p>
                      <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Try AI Features
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Learn More
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
