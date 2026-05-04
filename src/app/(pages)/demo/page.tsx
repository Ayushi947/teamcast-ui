'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { demoService } from '@/lib/services/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Brain,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Video,
  Mic,
  Code,
  BarChart3,
  Users,
  TrendingUp,
  ArrowLeft,
  Database,
  DollarSign,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import DemoInterview from '@/components/demo/demo-interview';
import { logger } from '@/lib/logger';

// Constants for demo initialization (same as real assessment)
const DEMO_PROCESSING_MESSAGES = [
  'Initializing your AI interview demo...',
  'Preparing personalized questions based on your selected role...',
  'Setting up the AI interviewer...',
  "Almost there! We're finalizing your demo setup...",
  'Finalizing the initialization process...',
];

// Loading Overlay Component (same as real assessment)
const LoadingOverlay = ({ currentMessage }: { currentMessage: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.95, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 20, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, duration: 0.2 }}
      className="bg-background relative w-full max-w-xl rounded-2xl p-10 shadow-xl"
    >
      <div className="flex flex-col items-center">
        <div className="mb-16 scale-125 pt-16">
          <AIAvatar isSpeaking={true} />
        </div>
        <div className="text-center">
          <h3 className="text-foreground mb-4 text-xl font-semibold">
            Initializing Demo
          </h3>
          <p className="text-muted-foreground text-md mb-8">{currentMessage}</p>
          <div className="flex items-center justify-center">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

type DemoStep = 'landing' | 'initializing' | 'interview' | 'results';

// Demo profiles (simplified for quick access)
const DEMO_PROFILES = [
  {
    id: 'senior-software-engineer',
    title: 'Senior Software Engineer',
    category: 'technical',
    experienceLevel: '5+ years',
    description: 'Full-stack development with focus on scalable systems',
    skills: ['React', 'Node.js', 'AWS', 'System Design', 'TypeScript'],
    color: 'bg-primary',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'technical',
    experienceLevel: '3+ years',
    description: 'Machine learning and data analysis for business insights',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
    color: 'bg-primary',
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    category: 'non-technical',
    experienceLevel: '6+ years',
    description: 'Product strategy and roadmap development',
    skills: ['Product Strategy', 'Analytics', 'User Research', 'Roadmapping'],
    color: 'bg-primary',
  },
  {
    id: 'sales-manager',
    title: 'Sales Manager',
    category: 'non-technical',
    experienceLevel: '5+ years',
    description: 'Sales strategy and team leadership',
    skills: ['CRM', 'Lead Generation', 'Team Management', 'Sales Strategy'],
    color: 'bg-primary',
  },
  {
    id: 'senior-aiml-engineer',
    title: 'Senior AI/ML Engineer',
    category: 'technical',
    experienceLevel: '9+ years',
    description:
      'LLM architecture specialist with expertise in transformer models and production ML systems',
    skills: ['Large Language Models', 'PyTorch', 'MLOps'],
    color: 'bg-primary',
  },
  {
    id: 'senior-data-labeller',
    title: 'AI Training Specialist',
    category: 'technical',
    experienceLevel: '4+ years',
    description:
      'Expert in RLHF methodologies, instruction tuning datasets, and multi-modal annotation pipelines',
    skills: [
      'RLHF',
      'Instruction Tuning',
      'Dataset Creation',
      'Quality Assurance',
      'Python',
    ],
    color: 'bg-primary',
  },
  {
    id: 'senior-finance-analyst',
    title: 'Senior Finance Analyst',
    category: 'non-technical',
    experienceLevel: '5+ years',
    description:
      'Chartered Accountant expert in financial reporting, Ind AS, and business analysis',
    skills: [
      'Financial Reporting',
      'Ind AS',
      'Cost Accounting',
      'SAP FI/CO',
      'Variance Analysis',
    ],
    color: 'bg-primary',
  },
];

// Get voice indicator for role cards
const getVoiceIndicator = (_profile: any, index: number) => {
  // All roles alternate between IN and US based on card index
  return index % 2 === 0 ? 'IN' : 'US';
};

// Get appropriate icon for each role
const getRoleIcon = (profile: any) => {
  switch (profile.id) {
    case 'senior-software-engineer':
      return Code;
    case 'data-scientist':
      return BarChart3;
    case 'product-manager':
      return Users;
    case 'sales-manager':
      return TrendingUp;
    case 'senior-aiml-engineer':
      return Brain;
    case 'senior-data-labeller':
      return Database;
    case 'senior-finance-analyst':
      return DollarSign;
    default:
      return Brain;
  }
};

const DemoPageContent = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<DemoStep>('landing');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  // Handle message rotation during initialization
  useEffect(() => {
    if (!isInitializing) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex(
        (prev) => (prev + 1) % DEMO_PROCESSING_MESSAGES.length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isInitializing]);

  const handleStartDemo = async (profile: any) => {
    setSelectedProfile(profile);
    setIsInitializing(true);
    setCurrentStep('initializing');

    try {
      // Start actual demo assessment session
      const session = await demoService.startDemoAssessment({
        profileId: profile.id,
        candidateName: 'Demo Candidate',
        candidateEmail: 'demo@example.com',
      });

      // Update profile with session information
      setSelectedProfile({
        ...profile,
        sessionId: session.sessionId,
        candidateName: session.candidateName,
        candidateEmail: session.candidateEmail,
      });

      // Simulate initialization delay (like real assessment)
      setTimeout(() => {
        setIsInitializing(false);
        setCurrentStep('interview');
      }, 4000);
    } catch (error) {
      logger.info('Failed to start demo assessment:', error);
      setTimeout(() => {
        setIsInitializing(false);
        setCurrentStep('interview');
      }, 4000);
    }
  };

  const handleInterviewComplete = (results: any) => {
    setAssessmentResults(results);
    setCurrentStep('results');
  };

  const handleBackToLanding = () => {
    setCurrentStep('landing');
    setSelectedProfile(null);
    setIsInitializing(false);
    setAssessmentResults(null);
  };

  // Show loading overlay during initialization
  if (isInitializing) {
    return (
      <LoadingOverlay
        currentMessage={DEMO_PROCESSING_MESSAGES[currentMessageIndex]}
      />
    );
  }

  // Show interview component
  if (currentStep === 'interview') {
    return (
      <DemoInterview
        profile={selectedProfile}
        onComplete={handleInterviewComplete}
        onBack={handleBackToLanding}
      />
    );
  }

  // Show results (if needed)
  if (currentStep === 'results') {
    return (
      <div className="bg-background min-h-screen">
        {/* Top Navigation */}
        <div className="bg-surface fixed top-0 right-0 left-0 z-50 shadow-sm">
          <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 md:px-6 md:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                  ✓
                </div>
                <div>
                  <div className="text-foreground text-sm font-medium">
                    Assessment Complete
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {selectedProfile?.title} Demo
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-20 pb-8">
          <div className="mx-auto max-w-4xl px-6">
            {assessmentResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="text-center">
                  <div className="mb-6">
                    <AIAvatar isSpeaking={false} />
                  </div>
                  <h1 className="text-foreground mb-4 text-4xl font-bold">
                    Assessment Complete!
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Your {selectedProfile?.title} interview has been analyzed
                    using advanced AI technology.
                  </p>
                </div>

                {/* Overall Score Card */}
                <div className="bg-surface rounded-2xl border p-8 shadow-sm">
                  <div className="flex flex-col items-center text-center md:flex-row md:justify-between">
                    <div className="mb-6 md:mb-0">
                      <h2 className="text-foreground mb-2 text-2xl font-bold">
                        Overall Score
                      </h2>
                      <div className="text-muted-foreground text-sm">
                        Based on your responses and performance
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="from-primary to-primary/80 h-24 w-24 rounded-full bg-gradient-to-r p-1">
                          <div className="bg-background flex h-full w-full items-center justify-center rounded-full">
                            <span className="text-primary text-2xl font-bold">
                              {Math.round(assessmentResults.overallScore * 100)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          assessmentResults.recommendation ===
                          'HIGHLY_RECOMMENDED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : assessmentResults.recommendation === 'RECOMMENDED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        {assessmentResults.recommendation ===
                        'HIGHLY_RECOMMENDED'
                          ? 'Highly Recommended'
                          : assessmentResults.recommendation === 'RECOMMENDED'
                            ? 'Recommended'
                            : 'Under Review'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="bg-surface rounded-2xl border p-8 shadow-sm">
                  <h3 className="text-foreground mb-6 text-xl font-semibold">
                    Skills Assessment
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(assessmentResults.scores)
                      .filter(([key]) => key !== 'overall')
                      .map(([skill, score]) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground capitalize">
                              {skill.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-muted-foreground text-sm font-medium">
                              {Math.round((score as number) * 100)}%
                            </span>
                          </div>
                          <div className="bg-muted h-2 w-full rounded-full">
                            <div
                              className="from-primary to-primary/80 h-2 rounded-full bg-gradient-to-r transition-all duration-1000"
                              style={{ width: `${(score as number) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="bg-surface rounded-2xl border p-8 shadow-sm">
                  <h3 className="text-foreground mb-6 text-xl font-semibold">
                    Strengths
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {assessmentResults.strengths.map(
                      (strength: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            ✓
                          </div>
                          <span className="text-foreground text-sm">
                            {strength}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-surface rounded-2xl border p-8 shadow-sm">
                  <h3 className="text-foreground mb-6 text-xl font-semibold">
                    Areas for Improvement
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {assessmentResults.areasForImprovement.map(
                      (area: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            💡
                          </div>
                          <span className="text-foreground text-sm">
                            {area}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Detailed Feedback */}
                {assessmentResults.detailedFeedback && (
                  <div className="bg-surface rounded-2xl border p-8 shadow-sm">
                    <h3 className="text-foreground mb-6 text-xl font-semibold">
                      Detailed Feedback
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(assessmentResults.detailedFeedback)
                        .filter(
                          ([_, feedback]) =>
                            feedback &&
                            typeof feedback === 'string' &&
                            (feedback as string).trim() !== ''
                        )
                        .map(([skill, feedback]) => (
                          <div key={skill} className="space-y-2">
                            <h4 className="text-foreground font-medium capitalize">
                              {skill.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {feedback as string}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    onClick={handleBackToLanding}
                    size="lg"
                    className="bg-primary text-primary-foreground"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Try Another Role
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Home
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <h3 className="text-foreground mb-2 text-xl font-semibold">
                    No Results Available
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Unable to retrieve assessment results.
                  </p>
                  <Button variant="outline" onClick={handleBackToLanding}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Landing
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main landing page
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="w-full border-b px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Brain className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-foreground text-xl font-bold">
              Teamcast AI Demo
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered Interview Demo
            </Badge>

            <h1 className="mb-6 text-4xl leading-tight font-bold lg:text-5xl">
              Experience the Future of
              <span className="text-primary"> AI Interviews</span>
            </h1>

            <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
              Try our AI interviewer with real-time video analysis, intelligent
              questioning, and instant feedback. No signup required - just
              select a role and start!
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-12">
            <h2 className="mb-8 text-center text-2xl font-semibold">
              Choose a Role to Experience
            </h2>
            <div className="w-full max-w-none px-6">
              {/* First Row - Exactly 4 Cards */}
              <div className="mb-8 flex flex-wrap justify-center gap-6">
                {DEMO_PROFILES.slice(0, 4).map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-64 flex-shrink-0"
                  >
                    <Card
                      className="hover:border-primary/20 relative flex h-full cursor-pointer flex-col border-2 transition-all duration-200 hover:shadow-lg"
                      onClick={() => handleStartDemo(profile)}
                    >
                      {/* Voice Indicator Chip - Top Right Corner */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary/10 text-primary flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                          <Mic className="h-3 w-3" />
                          <span>{getVoiceIndicator(profile, index)}</span>
                        </div>
                      </div>

                      <CardContent className="flex h-full flex-col p-6">
                        <div className="flex flex-grow flex-col">
                          <div
                            className={`h-12 w-12 ${profile.color} mb-4 flex items-center justify-center rounded-lg`}
                          >
                            {(() => {
                              const IconComponent = getRoleIcon(profile);
                              return (
                                <IconComponent className="h-6 w-6 text-white" />
                              );
                            })()}
                          </div>
                          <h3 className="mb-2 line-clamp-1 text-lg font-semibold">
                            {profile.title}
                          </h3>
                          <p className="text-muted-foreground mb-3 line-clamp-3 flex-grow text-sm">
                            {profile.description}
                          </p>
                          <div className="mb-4 flex flex-wrap gap-1">
                            {profile.skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button className="mt-auto w-full" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Try Demo
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Second Row - Exactly 3 Cards Centered */}
              <div className="flex flex-wrap justify-center gap-6">
                {DEMO_PROFILES.slice(4).map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-64 flex-shrink-0"
                  >
                    <Card
                      className="hover:border-primary/20 relative flex h-full cursor-pointer flex-col border-2 transition-all duration-200 hover:shadow-lg"
                      onClick={() => handleStartDemo(profile)}
                    >
                      {/* Voice Indicator Chip - Top Right Corner */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary/10 text-primary flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                          <Mic className="h-3 w-3" />
                          <span>{getVoiceIndicator(profile, index + 4)}</span>
                        </div>
                      </div>

                      <CardContent className="flex h-full flex-col p-6">
                        <div className="flex flex-grow flex-col">
                          <div
                            className={`h-12 w-12 ${profile.color} mb-4 flex items-center justify-center rounded-lg`}
                          >
                            {(() => {
                              const IconComponent = getRoleIcon(profile);
                              return (
                                <IconComponent className="h-6 w-6 text-white" />
                              );
                            })()}
                          </div>
                          <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
                            {profile.title}
                          </h3>
                          <p className="text-muted-foreground mb-3 line-clamp-2 flex-grow text-sm">
                            {profile.description}
                          </p>
                          <div className="mb-4 flex flex-wrap gap-1">
                            {profile.skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button className="mt-auto w-full" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Try Demo
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                <Clock className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                5-Minute Assessment
              </h3>
              <p className="text-muted-foreground">
                Complete comprehensive interviews in just 5 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                <Video className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Real-Time Analysis</h3>
              <p className="text-muted-foreground">
                AI analyzes your responses in real-time
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                <CheckCircle className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Instant Feedback</h3>
              <p className="text-muted-foreground">
                Get detailed insights immediately after completion
              </p>
            </div>
          </div>

          {/* Important Information */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-center">What to Expect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">AI Voice Interviewer</p>
                      <p className="text-muted-foreground text-sm">
                        Our AI will ask you questions using natural speech
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">Video Recording</p>
                      <p className="text-muted-foreground text-sm">
                        Your responses will be recorded for analysis
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                    <div>
                      <p className="font-medium">Quiet Environment</p>
                      <p className="text-muted-foreground text-sm">
                        Make sure you&apos;re in a quiet place for best results
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                    <div>
                      <p className="font-medium">Camera & Microphone</p>
                      <p className="text-muted-foreground text-sm">
                        You&apos;ll need to allow camera and microphone access
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const DemoPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <span className="text-muted-foreground ml-3">Loading demo...</span>
        </div>
      }
    >
      <DemoPageContent />
    </Suspense>
  );
};

export default DemoPage;
