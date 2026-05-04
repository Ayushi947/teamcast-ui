'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Brain,
  Eye,
  BarChart3,
  Target,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Play,
  Download,
  Share2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoService } from '@/lib/services/services';
import { logger } from '@/lib/logger';

interface DemoResultsDashboardProps {
  profile: any;
  assessmentData: any;
  onComplete: () => void;
  onBack: () => void;
}

export function DemoResultsDashboard({
  profile,
  assessmentData,
  onComplete,
  onBack,
}: DemoResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(true);
  const [results, setResults] = useState<any>(null);

  // Mock results data
  const mockResults = {
    overallScore: 0.87,
    recommendation: 'HIGHLY_RECOMMENDED',
    scores: {
      overall: 0.87,
      technicalSkills: 0.85,
      problemSolving: 0.89,
      communication: 0.88,
      leadership: 0.82,
      strategicThinking: 0.86,
    },
    strengths: [
      'Excellent communication skills with clear articulation',
      'Strong technical foundation and problem-solving approach',
      'Demonstrated leadership potential and strategic thinking',
      'Professional demeanor and confidence throughout',
    ],
    areasForImprovement: [
      'Could provide more specific examples from past projects',
      'Consider elaborating on challenges faced and solutions implemented',
      'Opportunity to showcase more hands-on technical experience',
    ],
    detailedFeedback: {
      technicalSkills:
        'Demonstrated solid understanding of core concepts with good practical knowledge. Showed ability to think through complex problems systematically.',
      problemSolving:
        'Excellent analytical thinking with structured approach to problem-solving. Demonstrated creativity in solution design.',
      communication:
        'Clear and articulate communication with good structure in responses. Maintained professional tone throughout.',
      leadership:
        'Showed potential for leadership with examples of team collaboration and strategic thinking.',
      strategicThinking:
        'Demonstrated good strategic thinking with consideration of business impact and long-term implications.',
    },
    videoAnalysis: {
      engagementScore: 0.88,
      confidenceScore: 0.82,
      clarityScore: 0.87,
      professionalDemeanorScore: 0.9,
      proctoringScore: 0.95,
      engagementFeedback:
        'Maintained good eye contact and showed enthusiasm throughout the interview.',
      confidenceFeedback:
        'Spoke with confidence and conviction in answers, with occasional moments of uncertainty.',
      clarityFeedback:
        'Articulated thoughts clearly with well-structured responses and good use of examples.',
      professionalDemeanorFeedback:
        'Presented professionally with appropriate demeanor and respect for the process.',
      proctoringFeedback:
        'No suspicious activities detected during the assessment.',
    },
    highlights: {
      introduction: {
        startTime: '00:05',
        endTime: '00:20',
        description: 'Strong opening with clear background summary',
        keyPoints: [
          '5+ years experience',
          'Full-stack development',
          'Team leadership',
        ],
      },
      highs: [
        {
          startTime: '01:30',
          endTime: '02:00',
          description: 'Excellent technical explanation',
          reason: 'Demonstrated deep understanding of system architecture',
          keyQuote:
            'I would implement a microservices architecture with API gateways for scalability.',
        },
        {
          startTime: '03:15',
          endTime: '03:45',
          description: 'Strong problem-solving approach',
          reason: 'Showed systematic thinking and consideration of trade-offs',
          keyQuote:
            'First, I would identify the root cause, then evaluate multiple solutions before implementing.',
        },
      ],
      lows: [
        {
          startTime: '04:20',
          endTime: '04:35',
          description: 'Could improve example specificity',
          reason: 'General answer without concrete examples',
          improvement:
            'Provide specific examples from past projects with measurable outcomes',
        },
      ],
      interviewEnd: {
        startTime: '04:45',
        endTime: '05:00',
        description: 'Professional closing with enthusiasm',
        closingThoughts:
          'The candidate showed strong potential with room for growth in providing specific examples.',
      },
    },
  };

  useEffect(() => {
    const loadResults = async () => {
      try {
        // Try to get results from API if sessionId exists
        if (assessmentData.sessionId) {
          const apiResults = await demoService.getAssessmentResults(
            assessmentData.sessionId
          );
          setResults(apiResults);
        } else {
          // Use mock results as fallback
          setResults(mockResults);
        }
      } catch (error) {
        logger.error('Error loading results:', error);
        setResults(mockResults);
      } finally {
        setIsGenerating(false);
      }
    };

    // Simulate AI processing time
    const timer = setTimeout(loadResults, 3000);
    return () => clearTimeout(timer);
  }, [assessmentData.sessionId]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100';
    if (score >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'HIGHLY_RECOMMENDED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RECOMMENDED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NOT_RECOMMENDED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'HIGHLY_RECOMMENDED':
        return <ThumbsUp className="h-4 w-4" />;
      case 'RECOMMENDED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'NOT_RECOMMENDED':
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isGenerating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
            <Brain className="h-12 w-12 animate-pulse text-blue-600" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            AI Analysis in Progress
          </h2>
          <p className="mb-6 text-lg text-gray-600">
            Our AI is analyzing your responses and generating comprehensive
            insights...
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>

            <div className="text-sm text-gray-500">
              Analyzing communication, technical skills, and problem-solving
              abilities...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Assessment</span>
          </Button>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>AI Analysis Complete</span>
            </Badge>
            <div className="text-sm text-gray-600">
              {profile.title} • {assessmentData.totalDuration}s
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Overall Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-between lg:flex-row">
                <div className="mb-6 text-center lg:mb-0 lg:text-left">
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    Assessment Results
                  </h1>
                  <p className="mb-4 text-lg text-gray-600">
                    Comprehensive AI analysis of your {profile.title} interview
                  </p>

                  <div className="flex items-center justify-center space-x-4 lg:justify-start">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">
                        {Math.round(results.overallScore * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>

                    <div className="h-16 w-px bg-gray-300"></div>

                    <Badge
                      className={cn(
                        'px-4 py-2 text-sm font-medium',
                        getRecommendationColor(results.recommendation)
                      )}
                    >
                      {getRecommendationIcon(results.recommendation)}
                      <span className="ml-2">
                        {results.recommendation.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scores">Detailed Scores</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="video">Video Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Strengths */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.strengths.map(
                        (strength: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                            <span className="text-gray-700">{strength}</span>
                          </motion.div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Areas for Improvement */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span>Areas for Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.areasForImprovement.map(
                        (area: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                            <span className="text-gray-700">{area}</span>
                          </motion.div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Score Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Score Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(results.scores)
                      .filter(([key]) => key !== 'overall')
                      .map(([skill, score]) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700 capitalize">
                              {skill.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span
                              className={cn(
                                'font-bold',
                                getScoreColor(score as number)
                              )}
                            >
                              {Math.round((score as number) * 100)}%
                            </span>
                          </div>
                          <Progress
                            value={(score as number) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Detailed Scores Tab */}
          <TabsContent value="scores" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(results.scores)
                .filter(([key]) => key !== 'overall')
                .map(([skill, score]) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div
                            className={cn(
                              'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                              getScoreBgColor(score as number)
                            )}
                          >
                            <span
                              className={cn(
                                'text-2xl font-bold',
                                getScoreColor(score as number)
                              )}
                            >
                              {Math.round((score as number) * 100)}
                            </span>
                          </div>
                          <h3 className="mb-2 font-semibold text-gray-900 capitalize">
                            {skill.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {results.detailedFeedback[skill] ||
                              'No detailed feedback available.'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {Object.entries(results.detailedFeedback).map(
                ([skill, feedback]) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="capitalize">
                          {skill.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{feedback as string}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          </TabsContent>

          {/* Video Analysis Tab */}
          <TabsContent value="video" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Video Scores */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <span>Video Analysis Scores</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(results.videoAnalysis)
                        .filter(([key]) => key.includes('Score'))
                        .map(([metric, score]) => (
                          <div key={metric} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">
                                {metric
                                  .replace('Score', '')
                                  .replace(/([A-Z])/g, ' $1')
                                  .trim()}
                              </span>
                              <span
                                className={cn(
                                  'font-bold',
                                  getScoreColor(score as number)
                                )}
                              >
                                {Math.round((score as number) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(score as number) * 100}
                              className="h-2"
                            />
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Video Feedback */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <span>Video Feedback</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(results.videoAnalysis)
                        .filter(([key]) => key.includes('Feedback'))
                        .map(([metric, feedback]) => (
                          <div
                            key={metric}
                            className="rounded-lg bg-gray-50 p-3"
                          >
                            <h4 className="mb-1 font-medium text-gray-900">
                              {metric
                                .replace('Feedback', '')
                                .replace(/([A-Z])/g, ' $1')
                                .trim()}
                            </h4>
                            <p className="text-sm text-gray-700">
                              {feedback as string}
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Video Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5 text-purple-600" />
                    <span>Video Highlights</span>
                  </CardTitle>
                  <CardDescription>
                    Key moments from your interview with AI-generated insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Introduction */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="mb-2 flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="border-blue-300 text-blue-600"
                        >
                          {results.highlights.introduction.startTime} -{' '}
                          {results.highlights.introduction.endTime}
                        </Badge>
                        <span className="text-sm font-medium text-blue-800">
                          Introduction
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-gray-700">
                        {results.highlights.introduction.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {results.highlights.introduction.keyPoints.map(
                          (point: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {point}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    {/* High Moments */}
                    {results.highlights.highs.map(
                      (high: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-lg border border-green-200 bg-green-50 p-4"
                        >
                          <div className="mb-2 flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className="border-green-300 text-green-600"
                            >
                              {high.startTime} - {high.endTime}
                            </Badge>
                            <span className="text-sm font-medium text-green-800">
                              Strong Moment
                            </span>
                          </div>
                          <p className="mb-2 text-sm text-gray-700">
                            {high.description}
                          </p>
                          <p className="mb-2 text-xs text-gray-600">
                            {high.reason}
                          </p>
                          <div className="rounded border-l-4 border-green-400 bg-white p-2">
                            <p className="text-sm text-gray-800 italic">
                              &ldquo;{high.keyQuote}&rdquo;
                            </p>
                          </div>
                        </div>
                      )
                    )}

                    {/* Low Moments */}
                    {results.highlights.lows.map((low: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                      >
                        <div className="mb-2 flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="border-yellow-300 text-yellow-600"
                          >
                            {low.startTime} - {low.endTime}
                          </Badge>
                          <span className="text-sm font-medium text-yellow-800">
                            Improvement Area
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-gray-700">
                          {low.description}
                        </p>
                        <p className="mb-2 text-xs text-gray-600">
                          {low.reason}
                        </p>
                        <div className="rounded border-l-4 border-yellow-400 bg-white p-2">
                          <p className="text-sm text-gray-800">
                            <strong>Suggestion:</strong> {low.improvement}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center pt-8"
        >
          <Button
            size="lg"
            onClick={onComplete}
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg text-white hover:from-blue-700 hover:to-purple-700"
          >
            Continue to Platform
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
