'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { ENV } from '@/lib/env';
import {
  Clock,
  CheckCircle2,
  ThumbsUp,
  Mic,
  Power,
  Camera,
  Info,
  Loader2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import TourGuide from '@/components/tour/tour-guide';
import { useTourHook } from '@/lib/hooks/use-tour-hook';
import { useApp } from '@/lib/context/app-context';

// Simplified mock data types
interface MockQuestion {
  id: string;
  sectionId: string;
  question: string;
  questionType: 'TEXT' | 'BOOLEAN' | 'CODE' | 'MULTIPLE_CHOICE';
  options: any;
}

interface MockSection {
  id: string;
  title: string;
  questions: MockQuestion[];
}

interface MockAssessment {
  id: string;
  duration: number;
  sections: MockSection[];
}

// Mock data for the assessment
const MOCK_ASSESSMENT: MockAssessment = {
  id: 'mock-assessment-id',
  duration: 3600, // 60 minutes
  sections: [
    {
      id: 'section-1',
      title: 'Technical Skills',
      questions: [
        {
          id: 'question-1',
          sectionId: 'section-1',
          question:
            'You are managing a project with a strict deadline, but one of your key team members is unexpectedly unavailable. How would you handle this situation to ensure the project is completed on time without compromising quality?',
          questionType: 'TEXT',
          options: {},
        },
        {
          id: 'question-2',
          sectionId: 'section-1',
          question: 'Do you have experience with React?',
          questionType: 'BOOLEAN',
          options: {},
        },
        {
          id: 'question-3',
          sectionId: 'section-1',
          question: 'Write a function to reverse a string in JavaScript',
          questionType: 'CODE',
          options: {
            template: 'function reverseString(str) {\n  // Your code here\n}',
            languages: ['javascript', 'python', 'java'],
            testCases: [
              { input: '"hello"', output: '"olleh"' },
              { input: '"world"', output: '"dlrow"' },
            ],
          },
        },
      ],
    },
    {
      id: 'section-2',
      title: 'Problem Solving',
      questions: [
        {
          id: 'question-4',
          sectionId: 'section-2',
          question: 'How do you approach debugging a complex issue?',
          questionType: 'TEXT',
          options: {},
        },
        {
          id: 'question-5',
          sectionId: 'section-2',
          question: 'Which problem-solving approach do you prefer?',
          questionType: 'MULTIPLE_CHOICE',
          options: {
            choices: [
              'Systematic step-by-step analysis',
              'Creative brainstorming',
              'Research and documentation review',
              'Collaborative team discussion',
            ],
          },
        },
      ],
    },
  ],
};

const InterviewPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const { isMobile } = useApp();
  const tourKey = 'candidate_onboarding_assessment_tour_guide';
  // Get tour completion state from the hook
  const {
    isTourCompleted,
    isActive,
    isLoading: isTourLoading,
  } = useTourHook(tourKey);

  // Static state - no API calls
  const [assessment] = useState<MockAssessment>(MOCK_ASSESSMENT);
  const [currentQuestion, _setCurrentQuestion] = useState<MockQuestion>(
    MOCK_ASSESSMENT.sections[0].questions[0]
  );
  const [currentSectionIndex, _setCurrentSectionIndex] = useState(0);

  const [isAssessmentLoading, _setIsAssessmentLoading] = useState(false);
  const [error, _setError] = useState<Error | null>(null);
  // Remove the local tourCompleted state since we're using the hook
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [isProcessing, _setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(
    MOCK_ASSESSMENT.duration || 1800
  );
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [_isAssessmentSubmitted, setIsAssessmentSubmitted] = useState(false);
  const [showEndAssessmentDialog, setShowEndAssessmentDialog] = useState(false);

  // Initialize timer when component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleInterviewComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle time warning states
  useEffect(() => {
    if (timeRemaining <= ENV.NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD) {
      setIsTimeWarning(true);
    } else {
      setIsTimeWarning(false);
    }
  }, [timeRemaining]);

  const handleInterviewComplete = async () => {
    try {
      setIsInterviewComplete(true);
      setIsSubmitting(true);
      setIsAssessmentSubmitted(true);

      // Simulate submission delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSubmitting(false);

      // Redirect after delay
      setTimeout(() => {
        router.push('/app/candidate/dashboard');
      }, 3000);
    } catch (error) {
      logger.error('Error ending assessment:', error);
      toast.error(
        'There was an error ending your assessment. Please try again later.'
      );
      setIsSubmitting(false);
      setIsInterviewComplete(false);
      setIsAssessmentSubmitted(false);
    }
  };

  // Handle end assessment request
  const handleEndAssessment = async () => {
    logger.info('User requested to end assessment early');
    setShowEndAssessmentDialog(false);

    // End the assessment
    await handleInterviewComplete();
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRedirectToAssessment = () => {
    router.push(
      `/app/candidate/assessments/onboarding/ai-interview?id=${assessmentId}`
    );
  };

  // Show loading state while tour status is being determined
  if (isTourLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Loading Teamcast...</p>
        </div>
      </div>
    );
  }

  if (isAssessmentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        <span className="text-text-secondary ml-3">Loading assessment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-text-primary mb-4 text-2xl font-bold">
          Error occurred
        </h2>
        <p className="text-text-secondary mb-6">
          There was an error loading your assessment. Please try again later.
        </p>
        <button
          onClick={() => router.push('/app/candidate/dashboard')}
          className="bg-primary text-surface hover:bg-primary-dark rounded-xl px-6 py-3 shadow-md transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen" data-tour="modal-container">
        <>
          {isInterviewComplete ? (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
              <div className="mb-8">
                <AIAvatar isSpeaking={false} />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md"
              >
                <h2 className="text-text-primary mb-4 text-2xl font-bold">
                  Assessment Complete!
                </h2>
                <p className="text-text-secondary mb-6">
                  Thank you for completing the assessment. Your responses have
                  been submitted for review.
                </p>
                <p className="text-text-tertiary mb-8">
                  Once the results are available, you will be notified and can
                  view them in your dashboard.
                </p>
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                    <span className="text-text-secondary ml-3">
                      Submitting your responses...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-text-tertiary mb-4 text-sm">
                      Redirecting to dashboard in a few seconds...
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/app/candidate/dashboard')}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-3 transition-colors"
                    >
                      Go to Dashboard Now
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <>
              {/* Top Navigation - Fixed */}
              <div className="bg-surface fixed top-0 right-0 left-0 z-25 shadow-sm">
                <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 md:px-6 md:py-3">
                  <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex w-full items-center justify-between">
                      {/* Section Navigation */}
                      {currentQuestion ? (
                        <div
                          className="flex items-center space-x-8 px-4 py-2"
                          data-tour="section-navigation"
                        >
                          {/* Current Section */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div className="bg-primary text-surface flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                                {currentSectionIndex + 1}
                              </div>
                              <div>
                                <div className="text-text-primary text-sm font-medium">
                                  {assessment?.sections?.[currentSectionIndex]
                                    ?.title || 'Loading...'}
                                </div>
                                <div className="text-text-tertiary text-xs">
                                  Section {currentSectionIndex + 1} of{' '}
                                  {assessment?.sections?.length || 0}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Upcoming Section */}
                          {assessment?.sections && (
                            <div className="text-text-tertiary hidden items-center space-x-3 text-sm md:flex">
                              {(() => {
                                const isLastSection =
                                  currentSectionIndex ===
                                  assessment.sections.length - 1;

                                return (
                                  <div
                                    className="flex items-center space-x-2"
                                    data-tour="upcoming-section"
                                  >
                                    {isLastSection ? (
                                      <div className="border-border text-text-secondary flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium">
                                        <ThumbsUp className="h-4 w-4" />
                                      </div>
                                    ) : (
                                      <div className="border-border text-text-secondary flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium">
                                        {currentSectionIndex + 2}
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-text-secondary text-sm">
                                        {isLastSection
                                          ? 'You&apos;re almost there!'
                                          : assessment.sections[
                                              currentSectionIndex + 1
                                            ]?.title}
                                      </div>
                                      <div className="text-text-tertiary text-xs">
                                        {isLastSection
                                          ? 'Last section of the assessment'
                                          : 'Coming up next'}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                              <div className="bg-muted-foreground/50 h-4 w-4 animate-pulse rounded-full" />
                            </div>
                            <div>
                              <div className="text-text-tertiary text-sm font-medium">
                                <div className="bg-muted-foreground/50 h-4 w-24 animate-pulse rounded" />
                              </div>
                              <div className="text-text-tertiary text-xs">
                                <div className="bg-muted-foreground/50 mt-1 h-3 w-16 animate-pulse rounded" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        {!isMobile && (
                          <div data-tour="proctoring-status-section">
                            <div className="bg-primary/10 flex items-center gap-2 rounded-full px-3 py-1.5">
                              <Info className="text-primary h-4 w-4" />
                              <p className="gap-2 text-center text-sm text-gray-900 dark:text-white">
                                Proctoring is enabled.
                              </p>
                            </div>
                          </div>
                        )}
                        {/* End Assessment Button - Desktop */}
                        <div data-tour="end-assessment-button">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEndAssessmentDialog(true)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden p-2 sm:flex"
                            disabled={isSubmitting || isInterviewComplete}
                          >
                            <Power className="h-5 w-5" />
                          </Button>
                        </div>
                        {/* End Assessment Button - Mobile */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEndAssessmentDialog(true)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2 sm:hidden"
                          disabled={isSubmitting || isInterviewComplete}
                        >
                          <Power className="h-5 w-5" />
                        </Button>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <ThemeToggle />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Toggle Theme</p>
                          </TooltipContent>
                        </Tooltip>
                        {/* Duration */}
                        <div data-tour="duration-section">
                          <motion.div
                            className={`flex items-center space-x-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 md:text-sm ${
                              isTimeWarning
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-muted-foreground'
                            }`}
                            animate={{
                              scale: isTimeWarning ? [1, 1.05, 1] : 1,
                              transition: {
                                duration: 1,
                                repeat: isTimeWarning ? Infinity : 0,
                                repeatType: 'reverse',
                              },
                            }}
                          >
                            <motion.div
                              animate={{
                                rotate: isTimeWarning ? 360 : 0,
                              }}
                              transition={{
                                duration: 2,
                                repeat: isTimeWarning ? Infinity : 0,
                                ease: 'linear',
                              }}
                            >
                              <Clock
                                className={`h-4 w-4 ${isTimeWarning ? 'text-destructive' : 'text-muted-foreground'}`}
                              />
                            </motion.div>
                            <motion.span
                              className={`font-mono ${isTimeWarning ? 'font-bold' : 'font-medium'}`}
                              animate={{
                                color: isTimeWarning
                                  ? 'var(--destructive)'
                                  : 'var(--muted-foreground)',
                              }}
                            >
                              {formatTime(timeRemaining)}
                            </motion.span>
                            {isTimeWarning && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-destructive text-xs font-medium"
                              >
                                remaining
                              </motion.span>
                            )}
                          </motion.div>
                        </div>
                        <div className="ml-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleRedirectToAssessment}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Start Assessment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Scrollable */}
              <div className="relative flex min-h-screen items-center justify-center sm:pt-8 md:pt-6">
                <div className="mx-auto min-h-148 w-full max-w-4xl px-3 sm:px-4 md:px-6">
                  {/* AI Avatar Section - Scrollable */}
                  <div className="mt-12 mb-6 sm:mt-8 md:mt-8 md:mb-8">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 sm:mb-4 md:mb-8">
                        <AIAvatar
                          isSpeaking={false}
                          audioLevel={-1}
                          isAudioLevelMode={false}
                        />
                      </div>

                      <AnimatePresence mode="wait">
                        {(!isTourCompleted || isActive) && (
                          <motion.div
                            key={currentQuestion?.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="px-0 text-center sm:px-4"
                          >
                            <div className="pt-6">
                              <p
                                className="sm:text-md text-text-primary px-4 text-lg md:text-lg"
                                data-tour="current-question-section"
                              >
                                {currentQuestion?.question}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Tour Completion Message and Continue Button */}
                  {isTourCompleted && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 text-center"
                      >
                        <div className="border-primary rounded-2xl p-6 sm:p-8">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="bg-primary/10 rounded-full p-3">
                              <CheckCircle2 className="text-primary h-8 w-8" />
                            </div>
                            <div>
                              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Tour Completed Successfully!
                              </h3>
                              <p className="text-sm text-gray-700 sm:text-base dark:text-gray-300">
                                You&apos;ve completed the tour guide.
                                You&apos;re now ready to proceed with the actual
                                assessment.
                              </p>
                            </div>
                            <Button
                              onClick={handleRedirectToAssessment}
                              size="lg"
                              className="px-8 py-3 text-base font-medium text-white"
                              disabled={isSubmitting || isInterviewComplete}
                            >
                              <CheckCircle2 className="mr-2 h-5 w-5" />
                              Continue to Assessment
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {/* Response Area */}
                  <div
                    className="mt-3 py-4 pb-24 sm:mt-4 sm:pb-20 md:mt-8 md:pb-12"
                    data-tour="response-area"
                  >
                    {isTourCompleted ? null : isProcessing ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                        <span className="text-text-secondary ml-3">
                          Processing your response...
                        </span>
                      </div>
                    ) : currentQuestion?.questionType === 'TEXT' ? (
                      <div>
                        {/* Speech Recognition Status */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="disabled mb-3 flex flex-col items-center justify-center sm:mb-4"
                        >
                          <div
                            className="bg-primary/10 text-primary flex items-center space-x-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2"
                            data-tour="speech-recognition-status"
                          >
                            <Mic className="h-4 w-4" />
                            <span className="text-xs font-medium sm:text-sm">
                              Speak Up!
                            </span>
                          </div>

                          {/* Transcript Display */}
                          <div className="bg-surface mt-4 flex min-h-12 w-full items-start justify-center rounded-lg p-4">
                            <p className="text-text-primary text-center text-sm">
                              Your response will be recorded automatically once
                              the AI finishes asking the question. Click the
                              button below to submit your answer and continue to
                              the next question.
                            </p>
                          </div>
                        </motion.div>

                        {/* Continue Button */}
                        <div className="flex w-auto justify-center">
                          <div
                            className="flex w-auto justify-center"
                            data-tour="continue-to-next-question-button"
                          >
                            <Button
                              variant="default"
                              onClick={() => {}}
                              disabled={isProcessing}
                              className={`flex w-auto gap-2 px-8 py-4 text-sm font-medium transition-colors ${
                                isProcessing
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>
                                {isProcessing
                                  ? 'Processing...'
                                  : 'Continue to next question'}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Animated Camera Placeholder - Demo Version */}
              <div className="absolute bottom-4 left-4 z-10 sm:left-6 md:left-8">
                <div
                  className="h-32 w-40 overflow-hidden rounded-2xl bg-white shadow-sm sm:h-36 sm:w-48 md:h-40 md:w-56 lg:h-48 lg:w-84"
                  data-tour="video-card"
                >
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-3 text-center dark:from-gray-800 dark:to-gray-900">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="mb-2"
                    >
                      <Camera className="h-6 w-6 text-blue-500 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                    </motion.div>
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="text-xs text-gray-600 sm:text-sm dark:text-gray-300"
                    >
                      Camera
                    </motion.div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="text-text-tertiary fixed right-0 bottom-4 left-0 text-center text-xs sm:text-sm">
            Need help? email{' '}
            <a
              href="mailto:help@teamcast.ai"
              className="text-info hover:underline"
            >
              help@teamcast.ai
            </a>
          </div>

          {/* End Assessment Confirmation Dialog */}
          <AlertDialog
            open={showEndAssessmentDialog}
            onOpenChange={setShowEndAssessmentDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Assessment?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end this assessment? This action
                  cannot be undone and your current progress will be submitted
                  automatically.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEndAssessment}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  End Assessment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      </div>
    </TooltipProvider>
  );
};

const InterviewPage = () => {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
            <p className="text-muted-foreground">Loading Teamcast...</p>
          </div>
        </div>
      }
    >
      <InterviewPageContent />
      <TourGuide
        autoStart={true}
        showProgress={true}
        tourKey="candidate_onboarding_assessment_tour_guide"
      />
    </Suspense>
  );
};

export default InterviewPage;
