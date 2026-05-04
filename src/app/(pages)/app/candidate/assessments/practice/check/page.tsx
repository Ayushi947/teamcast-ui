'use client';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { logger, PublicPracticeAssessmentTaskStatusEnum } from '@/lib/shared';

import PublicPracticeAssessmentCheck from '@/components/app/assessment/check/public-practice-assessment-check';
import { publicPracticeAssessmentService } from '@/lib/services/services';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';

// Constants
const PROCESSING_MESSAGES = [
  'Initializing your practice assessment...',
  'Preparing personalized questions based on the job description...',
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

const PracticeAssessmentCheckPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const [isPolling, setIsPolling] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const [isStartingAssessment, _setIsStartingAssessment] = useState(false);

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

  // Handle assessment status polling - matches job AI assessment flow
  // Only polls after initialization is triggered
  useEffect(() => {
    if (!assessmentId || !isPolling) return;

    let isPollingActive = true;

    const pollAssessment = async () => {
      if (!isPollingActive) return;

      try {
        const task =
          await publicPracticeAssessmentService.getTask(assessmentId);

        switch (task.status) {
          case PublicPracticeAssessmentTaskStatusEnum.PENDING:
          case PublicPracticeAssessmentTaskStatusEnum.PROCESSING:
            if (isPollingActive) {
              setTimeout(pollAssessment, 2000);
            }
            break;
          case PublicPracticeAssessmentTaskStatusEnum.COMPLETED:
            isPollingActive = false;
            setIsPolling(false);
            // Automatically redirect to instructions when initialization completes
            // This matches the job AI assessment flow
            router.push(
              `/app/candidate/assessments/practice/instructions?id=${assessmentId}`
            );
            return;
          case PublicPracticeAssessmentTaskStatusEnum.FAILED:
            isPollingActive = false;
            setIsPolling(false);
            toast.error('Assessment initialization failed. Please try again.');
            router.replace('/');
            return;
          default:
            isPollingActive = false;
            setIsPolling(false);
            router.replace('/');
            toast.error('Invalid assessment status');
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
      isPollingActive = false;
    };
  }, [assessmentId, router, isPolling]);

  return (
    <>
      {(isPolling || isStartingAssessment) && (
        <LoadingOverlay
          currentMessage={
            isStartingAssessment
              ? 'Starting assessment...'
              : PROCESSING_MESSAGES[currentMessageIndex]
          }
        />
      )}

      {assessmentId && (
        <PublicPracticeAssessmentCheck
          startAssessment={async () => {
            // When user clicks "I am ready", initialize the assessment
            // This matches the job AI assessment flow
            try {
              setIsPolling(true);
              const result =
                await publicPracticeAssessmentService.initializeAssessment(
                  assessmentId
                );

              if (!result?.id) {
                throw new Error('No task ID received');
              }

              // Polling will start automatically via useEffect when isPolling becomes true
              // When initialization completes, it will auto-redirect to instructions
            } catch (error) {
              logger.error('Error initializing assessment:', error);
              toast.error('Failed to start assessment. Please try again.');
              setIsPolling(false);
            }
          }}
          title="Practice AI Assessment"
          description="This practice assessment will help you prepare for real job interviews by evaluating your skills based on the job requirements."
          importantInformation={[
            {
              icon: CheckCircle2,
              text: 'The assessment will be based on the parsed job description',
              color: 'text-success',
            },
            {
              icon: AlertCircle,
              text: 'Make sure you are in a quiet environment',
              color: 'text-warning',
            },
            {
              icon: CheckCircle2,
              text: 'Your responses will be evaluated based on the job requirements',
              color: 'text-success',
            },
          ]}
          assessmentId={assessmentId}
        />
      )}
    </>
  );
};

const PracticeAssessmentCheckPage = () => {
  return (
    <Suspense
      fallback={<LoadingOverlay currentMessage={PROCESSING_MESSAGES[0]} />}
    >
      <PracticeAssessmentCheckPageContent />
    </Suspense>
  );
};

export default PracticeAssessmentCheckPage;
