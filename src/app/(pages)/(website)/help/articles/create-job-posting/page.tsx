'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Star,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Building,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackSystem } from '@/components/help/feedback-system';
import { toast } from 'sonner';

interface TableOfContents {
  id: string;
  title: string;
  level: number;
}

interface RelatedArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  href: string;
}

const tableOfContents: TableOfContents[] = [
  { id: 'overview', title: 'Overview', level: 1 },
  { id: 'before-you-start', title: 'Before You Start', level: 1 },
  { id: 'step-by-step', title: 'Step-by-Step Guide', level: 1 },
  { id: 'job-details', title: 'Adding Job Details', level: 2 },
  { id: 'requirements', title: 'Setting Requirements', level: 2 },
  { id: 'ai-optimization', title: 'AI Optimization Tips', level: 2 },
  { id: 'publishing', title: 'Publishing Your Job', level: 2 },
  { id: 'best-practices', title: 'Best Practices', level: 1 },
  { id: 'common-mistakes', title: 'Common Mistakes to Avoid', level: 1 },
  { id: 'troubleshooting', title: 'Troubleshooting', level: 1 },
  { id: 'next-steps', title: 'Next Steps', level: 1 },
];

const relatedArticles: RelatedArticle[] = [
  {
    id: 'ai-matching',
    title: 'Understanding AI-Powered Matching',
    description: 'Learn how our AI matches candidates to your job postings',
    category: 'AI Features',
    readTime: '6 min read',
    href: '/help/articles/ai-matching',
  },
  {
    id: 'manage-applications',
    title: 'Managing Job Applications',
    description: 'How to review and manage incoming applications',
    category: 'For Clients',
    readTime: '8 min read',
    href: '/help/articles/manage-applications',
  },
  {
    id: 'interview-scheduling',
    title: 'Scheduling Interviews',
    description: 'Best practices for scheduling and conducting interviews',
    category: 'For Clients',
    readTime: '7 min read',
    href: '/help/articles/interview-scheduling',
  },
];

export default function CreateJobPostingArticle() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, _setReadingProgress] = useState(0);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'How to Create Your First Job Posting - Teamcast Help',
          text: 'Learn how to create effective job postings on Teamcast',
          url: window.location.href,
        });
      } catch (_error) {
        // Error sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const _copyCodeSnippet = (_code: string) => {
    navigator.clipboard.writeText(_code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Progress Bar */}
      <div className="fixed top-0 right-0 left-0 z-50 h-1 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <section className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/help" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Help
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                <Badge variant="outline">For Clients</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark
                  className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
                />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Table of Contents - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Table of Contents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-2">
                      {tableOfContents.map((item) => (
                        <Link
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block text-sm transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                            activeSection === item.id
                              ? 'font-medium text-blue-600 dark:text-blue-400'
                              : 'text-slate-600 dark:text-slate-300'
                          } ${item.level === 2 ? 'ml-4' : ''}`}
                          onClick={() => setActiveSection(item.id)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="max-w-4xl">
                {/* Article Header */}
                <header className="mb-8">
                  <div className="mb-4">
                    <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
                      How to Create Your First Job Posting
                    </h1>
                    <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                      A comprehensive guide to creating effective job postings
                      that attract top candidates using Teamcast&apos;s
                      AI-powered platform.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>5 min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated Jan 15, 2024</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>By Teamcast Team</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>2,340 views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8 rating</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Beginner
                    </Badge>
                  </div>
                </header>

                {/* Article Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {/* Overview Section */}
                  <section id="overview" className="mb-12">
                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                      <Target className="h-6 w-6 text-blue-600" />
                      Overview
                    </h2>
                    <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
                      Creating your first job posting on Teamcast is the first
                      step towards finding exceptional talent. Our AI-powered
                      platform helps you attract the right candidates by
                      optimizing your job descriptions and matching them with
                      qualified professionals.
                    </p>
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div className="flex-1">
                          <h5 className="font-medium text-blue-900 dark:text-blue-100">
                            Pro Tip
                          </h5>
                          <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                            Well-crafted job postings receive 3x more qualified
                            applications. Take your time to create detailed,
                            engaging descriptions.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/20"
                            onClick={() =>
                              toast.info(
                                'Well-crafted job postings receive 3x more qualified applications. Take your time to create detailed, engaging descriptions.'
                              )
                            }
                          >
                            Show Tip Toast
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Before You Start */}
                  <section id="before-you-start" className="mb-12">
                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      Before You Start
                    </h2>
                    <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
                      Before creating your job posting, make sure you have the
                      following information ready:
                    </p>
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Card className="border-slate-200 dark:border-slate-700">
                        <CardContent className="p-4">
                          <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                            Job Information
                          </h4>
                          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                            <li>• Job title and department</li>
                            <li>• Detailed job description</li>
                            <li>• Required qualifications</li>
                            <li>• Nice-to-have skills</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-slate-200 dark:border-slate-700">
                        <CardContent className="p-4">
                          <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                            Company Details
                          </h4>
                          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                            <li>• Company culture and values</li>
                            <li>• Benefits and perks</li>
                            <li>• Salary range (if applicable)</li>
                            <li>• Remote work policy</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  {/* Step-by-Step Guide */}
                  <section id="step-by-step" className="mb-12">
                    <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                      <Zap className="h-6 w-6 text-orange-600" />
                      Step-by-Step Guide
                    </h2>

                    <Tabs defaultValue="step1" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="step1">Step 1</TabsTrigger>
                        <TabsTrigger value="step2">Step 2</TabsTrigger>
                        <TabsTrigger value="step3">Step 3</TabsTrigger>
                        <TabsTrigger value="step4">Step 4</TabsTrigger>
                      </TabsList>

                      <TabsContent value="step1" className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <span className="font-semibold text-blue-600">
                                  1
                                </span>
                              </div>
                              Access the Job Creation Page
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="mb-4 text-slate-600 dark:text-slate-300">
                              Navigate to your dashboard and click on
                              &quot;Create Job&quot; to start the process.
                            </p>
                            <div className="mb-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                <strong>Path:</strong> Dashboard → Jobs → Create
                                New Job
                              </p>
                            </div>
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                <div className="flex-1">
                                  <h5 className="font-medium text-amber-800 dark:text-amber-200">
                                    Important
                                  </h5>
                                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                    Make sure you&apos;re logged in to your
                                    client account. Candidate accounts cannot
                                    create job postings.
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/20"
                                    onClick={() =>
                                      toast.warning(
                                        "Make sure you're logged in to your client account. Candidate accounts cannot create job postings."
                                      )
                                    }
                                  >
                                    Show Warning Toast
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="step2" className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <span className="font-semibold text-blue-600">
                                  2
                                </span>
                              </div>
                              Fill in Basic Job Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="mb-4 text-slate-600 dark:text-slate-300">
                              Start with the essential details that will help
                              candidates understand the role.
                            </p>
                            <div className="space-y-4">
                              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                                <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                  Required Fields:
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Job Title (be specific and clear)
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Department/Team
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Employment Type (Full-time, Part-time,
                                    Contract)
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Location (Remote, On-site, Hybrid)
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="step3" className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <span className="font-semibold text-blue-600">
                                  3
                                </span>
                              </div>
                              Write Compelling Job Description
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="mb-4 text-slate-600 dark:text-slate-300">
                              Create a detailed job description that attracts
                              the right candidates.
                            </p>
                            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                              <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                AI Writing Assistant
                              </h4>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                Use our AI writing assistant to generate
                                compelling job descriptions based on your
                                requirements. It analyzes top-performing job
                                posts to suggest improvements.
                              </p>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-slate-900 dark:text-white">
                                    Company Overview
                                  </h5>
                                  <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Brief description of your company and
                                    mission
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-slate-900 dark:text-white">
                                    Role Responsibilities
                                  </h5>
                                  <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Clear list of what the candidate will be
                                    doing
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-slate-900 dark:text-white">
                                    Growth Opportunities
                                  </h5>
                                  <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Career development and learning
                                    opportunities
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="step4" className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <span className="font-semibold text-blue-600">
                                  4
                                </span>
                              </div>
                              Set Requirements and Publish
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="mb-4 text-slate-600 dark:text-slate-300">
                              Define the qualifications and skills needed, then
                              publish your job posting.
                            </p>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                                <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                  Must-Have Requirements
                                </h4>
                                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                  <li>• Years of experience</li>
                                  <li>• Technical skills</li>
                                  <li>• Education requirements</li>
                                  <li>• Certifications</li>
                                </ul>
                              </div>
                              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                                <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                  Nice-to-Have Skills
                                </h4>
                                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                  <li>• Additional technologies</li>
                                  <li>• Soft skills</li>
                                  <li>• Industry experience</li>
                                  <li>• Language skills</li>
                                </ul>
                              </div>
                            </div>
                            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/10">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                <div className="flex-1">
                                  <h5 className="font-medium text-green-900 dark:text-green-100">
                                    AI Optimization
                                  </h5>
                                  <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                                    Our AI will automatically suggest
                                    improvements to increase your job&apos;s
                                    visibility and attract better matches.
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 border-green-300 text-green-800 hover:bg-green-100 dark:border-green-700 dark:text-green-200 dark:hover:bg-green-900/20"
                                    onClick={() =>
                                      toast.success(
                                        "Our AI will automatically suggest improvements to increase your job's visibility and attract better matches."
                                      )
                                    }
                                  >
                                    Show AI Tip Toast
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </section>

                  {/* Best Practices */}
                  <section id="best-practices" className="mb-12">
                    <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      Best Practices
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                            <CheckCircle className="h-5 w-5" />
                            Do&apos;s
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                            <li>✓ Use clear, specific job titles</li>
                            <li>✓ Include salary range when possible</li>
                            <li>✓ Highlight company culture and benefits</li>
                            <li>✓ Use bullet points for easy scanning</li>
                            <li>✓ Include growth opportunities</li>
                            <li>✓ Proofread for errors</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                            <AlertCircle className="h-5 w-5" />
                            Don&apos;s
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                            <li>
                              ✗ Use vague job titles like &quot;Ninja&quot; or
                              &quot;Rockstar&quot;
                            </li>
                            <li>✗ List unrealistic requirements</li>
                            <li>✗ Write overly long descriptions</li>
                            <li>✗ Include discriminatory language</li>
                            <li>✗ Forget to mention remote work options</li>
                            <li>✗ Skip the company description</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  {/* Common Mistakes */}
                  <section id="common-mistakes" className="mb-12">
                    <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                      Common Mistakes to Avoid
                    </h2>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/10">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                          <div className="flex-1">
                            <h5 className="font-medium text-orange-900 dark:text-orange-100">
                              Mistake #1
                            </h5>
                            <p className="mt-1 text-sm text-orange-800 dark:text-orange-200">
                              Using generic job descriptions that don&apos;t
                              reflect your company&apos;s unique culture and
                              requirements.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900/20"
                              onClick={() =>
                                toast.error(
                                  "Mistake #1: Using generic job descriptions that don't reflect your company's unique culture and requirements."
                                )
                              }
                            >
                              Show Mistake Toast
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/10">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                          <div className="flex-1">
                            <h5 className="font-medium text-orange-900 dark:text-orange-100">
                              Mistake #2
                            </h5>
                            <p className="mt-1 text-sm text-orange-800 dark:text-orange-200">
                              Setting unrealistic requirements that eliminate
                              qualified candidates unnecessarily.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900/20"
                              onClick={() =>
                                toast.error(
                                  'Mistake #2: Setting unrealistic requirements that eliminate qualified candidates unnecessarily.'
                                )
                              }
                            >
                              Show Mistake Toast
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/10">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                          <div className="flex-1">
                            <h5 className="font-medium text-orange-900 dark:text-orange-100">
                              Mistake #3
                            </h5>
                            <p className="mt-1 text-sm text-orange-800 dark:text-orange-200">
                              Not leveraging AI optimization features to improve
                              job visibility and matching accuracy.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900/20"
                              onClick={() =>
                                toast.error(
                                  'Mistake #3: Not leveraging AI optimization features to improve job visibility and matching accuracy.'
                                )
                              }
                            >
                              Show Mistake Toast
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Next Steps */}
                  <section id="next-steps" className="mb-12">
                    <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                      <ArrowRight className="h-6 w-6 text-blue-600" />
                      Next Steps
                    </h2>
                    <p className="mb-6 text-slate-600 dark:text-slate-300">
                      After publishing your job posting, here&apos;s what you
                      should do next:
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {relatedArticles.map((article) => (
                        <Card
                          key={article.id}
                          className="transition-shadow hover:shadow-lg"
                        >
                          <CardContent className="p-4">
                            <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                              <Link
                                href={article.href}
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {article.title}
                              </Link>
                            </h4>
                            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                              {article.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {article.readTime}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Article Footer */}
                <footer className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
                  <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Was this article helpful?
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Yes
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        No
                      </Button>
                    </div>
                  </div>

                  <FeedbackSystem
                    articleId="create-job-posting"
                    articleTitle="Create Job Posting"
                  />
                </footer>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
