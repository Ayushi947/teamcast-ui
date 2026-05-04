'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  FileText,
  Brain,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Star,
  MessageCircle,
  Shield,
  Briefcase,
  GraduationCap,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const candidateFeatures = [
  {
    id: 'profile-building',
    title: 'Building Your Profile',
    icon: User,
    description: 'Create a compelling professional profile that stands out',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    steps: [
      'Complete basic information (name, title, location)',
      'Add professional photo and compelling summary',
      'Fill out work experience with detailed descriptions',
      'Add education, certifications, and skills',
      'Set job preferences and salary expectations',
      'Review and optimize your profile completeness',
    ],
    tips: [
      'Use a professional headshot photo',
      'Write a compelling summary highlighting your unique value',
      'Include quantifiable achievements in experience',
      'Keep information current and accurate',
    ],
  },
  {
    id: 'resume-optimization',
    title: 'Resume Upload & Optimization',
    icon: FileText,
    description: 'Get AI-powered feedback to improve your resume',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    steps: [
      'Upload your current resume (PDF or DOC format)',
      'Wait for AI analysis to complete',
      'Review AI feedback and recommendations',
      'Update your resume based on suggestions',
      'Re-upload optimized version if needed',
      'Monitor resume score improvements',
    ],
    tips: [
      'Use standard resume formats for better AI parsing',
      'Include relevant keywords for your target roles',
      'Quantify achievements with numbers and metrics',
      'Keep resume updated with recent accomplishments',
    ],
  },
  {
    id: 'ai-assessments',
    title: 'AI Assessments',
    icon: Brain,
    description: 'Complete assessments to showcase your skills and potential',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    steps: [
      'Start with onboarding assessment',
      'Complete skill-specific assessments',
      'Take behavioral and personality assessments',
      'Review your assessment results',
      'Use insights to improve weak areas',
      'Retake assessments to improve scores',
    ],
    tips: [
      'Be honest and authentic in your responses',
      "Take assessments when you're focused and alert",
      'Review feedback carefully for improvement areas',
      'Practice skills before retaking assessments',
    ],
  },
  {
    id: 'job-matching',
    title: 'Job Matching & Applications',
    icon: Target,
    description:
      'Get matched with relevant opportunities and apply effectively',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    steps: [
      'Set your job preferences and criteria',
      'Review AI-matched job recommendations',
      'Analyze match scores and compatibility',
      'Apply to relevant opportunities',
      'Track application status and progress',
      'Follow up appropriately with employers',
    ],
    tips: [
      'Set realistic but specific job preferences',
      'Apply to jobs with high match scores first',
      'Customize applications when possible',
      'Monitor application deadlines and requirements',
    ],
  },
  {
    id: 'interview-prep',
    title: 'Interview Preparation',
    icon: Calendar,
    description: 'Prepare for and excel in AI and panel interviews',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    steps: [
      'Accept interview invitations promptly',
      'Prepare for AI interview questions',
      'Research the company and role thoroughly',
      'Practice common interview questions',
      'Test technology for virtual interviews',
      'Follow up after interviews professionally',
    ],
    tips: [
      'Be authentic and honest in AI interviews',
      'Prepare specific examples using STAR method',
      'Dress professionally even for virtual interviews',
      'Ask thoughtful questions about the role and company',
    ],
  },
  {
    id: 'career-growth',
    title: 'Career Growth & Insights',
    icon: TrendingUp,
    description: 'Use AI insights to advance your career strategically',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    steps: [
      'Review career insights and recommendations',
      'Identify skill gaps and growth opportunities',
      'Set career goals and milestones',
      'Track progress over time',
      'Update profile with new achievements',
      'Leverage network and connections',
    ],
    tips: [
      'Regularly review and update career goals',
      'Invest in learning new skills',
      'Build and maintain professional network',
      'Stay current with industry trends',
    ],
  },
];

const profileOptimizationTips = [
  {
    section: 'Basic Information',
    icon: User,
    tips: [
      'Use your full professional name',
      'Add a current, professional job title',
      'Include your location (city, state/country)',
      'Add contact information (email, phone)',
      'Write a compelling professional summary',
    ],
  },
  {
    section: 'Work Experience',
    icon: Briefcase,
    tips: [
      'List experiences in reverse chronological order',
      'Include company names, titles, and dates',
      'Write detailed descriptions of achievements',
      'Use action verbs and quantifiable results',
      'Highlight relevant skills and technologies',
    ],
  },
  {
    section: 'Education & Skills',
    icon: GraduationCap,
    tips: [
      'Include all relevant degrees and certifications',
      'Add graduation dates and institutions',
      'List technical and soft skills',
      'Include relevant coursework or projects',
      'Add language proficiencies',
    ],
  },
  {
    section: 'Preferences',
    icon: Settings,
    tips: [
      'Set realistic salary expectations',
      'Specify preferred job types and locations',
      'Include remote work preferences',
      'Set availability and start date',
      'Add industry and role preferences',
    ],
  },
];

const interviewTypes = [
  {
    type: 'AI Interview',
    icon: Brain,
    description: 'Automated screening interview powered by AI',
    duration: '15-30 minutes',
    format: 'Video recording',
    tips: [
      'Speak clearly and at a moderate pace',
      'Look directly at the camera',
      'Provide specific examples in your answers',
      'Be authentic and genuine',
      'Take your time to think before answering',
    ],
    preparation: [
      'Test your camera and microphone',
      'Choose a quiet, well-lit location',
      'Practice common interview questions',
      'Prepare STAR method examples',
      'Review the job description thoroughly',
    ],
  },
  {
    type: 'Panel Assessment',
    icon: Calendar,
    description: 'Live interview with hiring team members',
    duration: '45-90 minutes',
    format: 'Video call or in-person',
    tips: [
      'Research all panel members if possible',
      'Prepare questions for each interviewer',
      'Make eye contact with all participants',
      'Address questions to the person who asked',
      'Show enthusiasm and engagement',
    ],
    preparation: [
      'Research the company and team thoroughly',
      'Prepare for technical and behavioral questions',
      'Practice with mock interviews',
      'Prepare thoughtful questions to ask',
      'Plan your outfit and setup in advance',
    ],
  },
];

const careerGrowthStrategies = [
  {
    strategy: 'Skill Development',
    icon: Award,
    description: 'Continuously improve and expand your skillset',
    actions: [
      'Identify in-demand skills in your field',
      'Take online courses and certifications',
      'Practice new skills through projects',
      'Get feedback from mentors or peers',
      'Update your profile with new skills',
    ],
  },
  {
    strategy: 'Network Building',
    icon: MessageCircle,
    description: 'Build meaningful professional relationships',
    actions: [
      'Connect with industry professionals',
      'Attend virtual and in-person events',
      'Engage with content on professional platforms',
      'Offer help and value to your network',
      'Maintain regular contact with connections',
    ],
  },
  {
    strategy: 'Personal Branding',
    icon: Star,
    description: 'Establish yourself as an expert in your field',
    actions: [
      'Share insights and knowledge online',
      'Contribute to industry discussions',
      'Showcase your work and achievements',
      'Seek speaking or writing opportunities',
      'Maintain consistent professional presence',
    ],
  },
];

export default function ForCandidatesPage() {
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
                <User className="text-primary h-8 w-8" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
                  Complete Guide for Candidates
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Your roadmap to finding the perfect job opportunity
                </p>
              </div>
            </div>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>20-25 min read</span>
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
          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-5">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="profile-optimization">
                Profile Tips
              </TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="career-growth">Career Growth</TabsTrigger>
              <TabsTrigger value="features">All Features</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started">
              {/* Success Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Your Success Journey
                </h2>
                <p className="text-muted-foreground mb-8">
                  Candidates who complete their profiles and take assessments
                  are 5x more likely to get matched with relevant opportunities.
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <Card className="border-border/50 text-center">
                    <CardContent className="p-6">
                      <div className="text-primary mb-2 text-3xl font-bold">
                        85%
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Profile Match Rate
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 text-center">
                    <CardContent className="p-6">
                      <div className="text-primary mb-2 text-3xl font-bold">
                        3x
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Faster Job Placement
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 text-center">
                    <CardContent className="p-6">
                      <div className="text-primary mb-2 text-3xl font-bold">
                        92%
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Interview Success Rate
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 text-center">
                    <CardContent className="p-6">
                      <div className="text-primary mb-2 text-3xl font-bold">
                        $15K
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Average Salary Increase
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Quick Start Checklist */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      Quick Start Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="text-foreground mb-3 font-semibold">
                          Essential Steps (30 minutes):
                        </h4>
                        <ul className="space-y-2">
                          {[
                            'Complete basic profile information',
                            'Upload your current resume',
                            'Add work experience and education',
                            'Set job preferences and salary expectations',
                            'Take the onboarding assessment',
                          ].map((step, index) => (
                            <li
                              key={index}
                              className="text-muted-foreground flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-foreground mb-3 font-semibold">
                          Optimization Steps (1 hour):
                        </h4>
                        <ul className="space-y-2">
                          {[
                            'Optimize profile based on AI feedback',
                            'Complete additional skill assessments',
                            'Add portfolio links and certifications',
                            'Write compelling project descriptions',
                            'Review and apply to matched jobs',
                          ].map((step, index) => (
                            <li
                              key={index}
                              className="text-muted-foreground flex items-center gap-2 text-sm"
                            >
                              <Star className="h-4 w-4 text-yellow-600" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="profile-optimization">
              {/* Profile Optimization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Profile Optimization Guide
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {profileOptimizationTips.map((section, index) => (
                    <Card key={index} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <section.icon className="text-primary h-6 w-6" />
                          </div>
                          <CardTitle className="text-lg">
                            {section.section}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {section.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="text-muted-foreground flex items-start gap-2 text-sm"
                            >
                              <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="interviews">
              {/* Interview Guide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Interview Success Guide
                </h2>

                <div className="space-y-8">
                  {interviewTypes.map((interview, index) => (
                    <Card key={index} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <interview.icon className="text-primary h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              {interview.type}
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                              {interview.description}
                            </p>
                            <div className="mt-2 flex gap-4">
                              <Badge variant="secondary">
                                {interview.duration}
                              </Badge>
                              <Badge variant="outline">
                                {interview.format}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                          <div>
                            <h4 className="text-foreground mb-3 font-semibold">
                              Interview Tips:
                            </h4>
                            <ul className="space-y-2">
                              {interview.tips.map((tip, tipIndex) => (
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

                          <div>
                            <h4 className="text-foreground mb-3 font-semibold">
                              Preparation Checklist:
                            </h4>
                            <ul className="space-y-2">
                              {interview.preparation.map((prep, prepIndex) => (
                                <li
                                  key={prepIndex}
                                  className="text-muted-foreground flex items-start gap-2 text-sm"
                                >
                                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                                  {prep}
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
            </TabsContent>

            <TabsContent value="career-growth">
              {/* Career Growth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Career Growth Strategies
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {careerGrowthStrategies.map((strategy, index) => (
                    <Card key={index} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <strategy.icon className="text-primary h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {strategy.strategy}
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                              {strategy.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {strategy.actions.map((action, actionIndex) => (
                            <li
                              key={actionIndex}
                              className="text-muted-foreground flex items-start gap-2 text-sm"
                            >
                              <ArrowRight className="text-primary mt-0.5 h-4 w-4" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="features">
              {/* All Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Complete Feature Guide
                </h2>

                {candidateFeatures.map((feature, index) => (
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
          </Tabs>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <Card className="border-border/50 bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Shield className="text-primary h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-foreground mb-2 text-xl font-bold">
                    Ready to Accelerate Your Career?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Our support team is here to help you succeed. Get
                    personalized guidance and tips for your job search.
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Get Career Advice
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Consultation
                    </Button>
                  </div>
                  <div className="text-muted-foreground mt-4 text-sm">
                    <p>Email: hello@teamcast.ai | Phone: +1 (650) 695-9495</p>
                    <p>Monday - Friday, 9:00 AM - 6:00 PM PST</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
