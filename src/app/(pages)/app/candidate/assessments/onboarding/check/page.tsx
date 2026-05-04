'use client';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  VolumeX,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  logger,
  OnboardingAssessmentTaskStatusEnum,
  FEATURE_FLAGS,
} from '@/lib/shared';

import AssessmentCheck from '@/components/app/assessment/check/assessment-system-check';
import AssessmentCheckV2 from '@/components/app/assessment/check/assessment-system-check-v2';
import { candidateOnboardingAssessmentService } from '@/lib/services/services';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import TourGuide from '@/components/tour/tour-guide';
import { useFeature } from '@/lib/context/feature-flag-context';

// Constants
const PROCESSING_MESSAGES = [
  'Initializing your onboarding assessment...',
  'Preparing personalized questions based on your profile...',
  'Setting up the assessment environment...',
  'Almost there! We&apos;re finalizing your assessment setup...',
  'Finalizing the initialization process...',
];

// Loading Overlay Component
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
            Initializing Assessment
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

const OnboardingInterviewPageContent = () => {
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // Feature flag for new design
  const useNewDesign = useFeature(FEATURE_FLAGS.ASSESSMENT_SYSTEM_CHECK_NEW_UI);

  // Handle message rotation
  useEffect(() => {
    if (!isPolling) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPolling]);

  // Handle assessment status polling
  useEffect(() => {
    if (!assessmentId) return;

    let isPollingActive = true; // Add flag to prevent state updates after unmount

    const pollAssessment = async () => {
      if (!isPollingActive) return;

      try {
        const task =
          await candidateOnboardingAssessmentService.getAssessmentTask(
            assessmentId
          );

        switch (task.status) {
          case OnboardingAssessmentTaskStatusEnum.PENDING:
          case OnboardingAssessmentTaskStatusEnum.INITIALIZE_STARTED:
            if (isPollingActive) {
              setTimeout(pollAssessment, 2000);
            }
            break;
          case OnboardingAssessmentTaskStatusEnum.INITIALIZE_COMPLETED:
          case OnboardingAssessmentTaskStatusEnum.ASSESSMENT_STARTED:
            isPollingActive = false;
            // Navigate first, then update UI
            router.push(
              `/app/candidate/assessments/onboarding/instructions?id=${assessmentId}`
            );
            setIsPolling(false);
            return;
          default:
            isPollingActive = false;
            setIsPolling(false);
            router.push('/app/candidate/dashboard');
            toast.error(
              'Already your onboarding assessment is in progress or completed'
            );
            return;
        }
      } catch (error) {
        logger.error('Error polling assessment:', error);
        if (isPollingActive) {
          setIsPolling(false);
          toast.error('Failed to check assessment status');
        }
      }
    };

    pollAssessment();

    return () => {
      isPollingActive = false; // Cleanup flag on unmount
    };
  }, [assessmentId, router]);

  const handleStartAssessment = async () => {
    try {
      setIsPolling(true);
      const result =
        await candidateOnboardingAssessmentService.initializeAssessment();

      if (!result?.assessment?.id) {
        throw new Error('No assessment ID received');
      }

      setAssessmentId(result.assessment.id);
    } catch (error) {
      logger.error('Error starting assessment:', error);
      toast.error('Failed to start assessment. Please try again.');
      setIsPolling(false);
    }
  };

  // Common props for both versions
  const commonProps = {
    startAssessment: handleStartAssessment,
    title: 'Screening Interview',
    description:
      'This assessment will help us evaluate your skills and experience to match you with the best opportunities.',
    importantInformation: useNewDesign
      ? [
          {
            icon: FileText,
            text: 'Assessment is based on your profile details.',
            color: 'text-primary',
          },
          {
            icon: VolumeX,
            text: 'Please ensure you are in a quiet environment.',
            color: 'text-primary',
          },
        ]
      : [
          {
            icon: CheckCircle2,
            text: 'The assessment will be based on your resume and profile details',
            color: 'text-success',
          },
          {
            icon: AlertCircle,
            text: 'Make sure you are in a quiet environment',
            color: 'text-warning',
          },
          {
            icon: CheckCircle2,
            text: 'Your responses will be evaluated based on your resume and profile information',
            color: 'text-success',
          },
        ],
    assessmentId: assessmentId || undefined,
  };

  return (
    <>
      {isPolling && (
        <LoadingOverlay
          currentMessage={PROCESSING_MESSAGES[currentMessageIndex]}
        />
      )}

      {useNewDesign ? (
        <AssessmentCheckV2 {...commonProps} />
      ) : (
        <AssessmentCheck {...commonProps} />
      )}
    </>
  );
};

const OnboardingInterviewPage = () => {
  return (
    <Suspense
      fallback={<LoadingOverlay currentMessage={PROCESSING_MESSAGES[0]} />}
    >
      <OnboardingInterviewPageContent />
      <TourGuide
        autoStart={true}
        showProgress={true}
        tourKey="candidate_onboarding_assessment_check_tour"
        className="fixed right-0 bottom-0"
      />
    </Suspense>
  );
};

export default OnboardingInterviewPage;
