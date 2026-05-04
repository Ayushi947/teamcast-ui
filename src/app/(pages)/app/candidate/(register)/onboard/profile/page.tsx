'use client';

import { Profile } from '../../../../../../../components/app/candidate/profile/profile';
import { useRouter } from 'next/navigation';
import { ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { candidateResumeParsingService } from '@/lib/services/services';
import { ResumeParsingTaskStatusEnum } from '@/lib/shared';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  hasPendingResumeTask,
  hasParsedResumeData,
  storeParsedResumeData,
  RESUME_PROCESSING_MESSAGES,
  MAX_POLL_ATTEMPTS,
} from '@/lib/utils/resume-draft.utils';
import { TourGuide } from '@/components/tour/tour-guide';

interface LoadingOverlayProps {
  isPolling: boolean;
  pollingMessage: string;
}

const LoadingOverlay = ({ isPolling, pollingMessage }: LoadingOverlayProps) => {
  if (!isPolling) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-sm"
      style={{
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-card dark:bg-primary/10 relative mx-4 w-full max-w-xl rounded-2xl p-10 shadow-lg"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex flex-col items-center">
          {/* AI Avatar */}
          <div className="mb-16 scale-125 pt-16">
            <AIAvatar isSpeaking={true} />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-foreground mb-4 text-xl font-semibold dark:text-white">
              Processing Resume
            </h3>
            <p className="text-md text-muted-foreground mb-8 dark:text-gray-300">
              {pollingMessage}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const [isWaitingForParsing, setIsWaitingForParsing] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isCurrentlyPolling, setIsCurrentlyPolling] = useState(false);

  // Track USA work authorization completion
  // Profile component will update this via callback if USA auth is required
  const [isUSAAuthCompleted, setIsUSAAuthCompleted] = useState(true);

  // Check for pending resume parsing task on component mount
  useEffect(() => {
    const pendingTaskId = localStorage.getItem('pendingResumeParsingTask');

    if (
      hasPendingResumeTask() &&
      !hasParsedResumeData() &&
      pendingTaskId &&
      !isCurrentlyPolling
    ) {
      // Wait for parsing to complete
      setIsWaitingForParsing(true);
      setIsCurrentlyPolling(true);
      setCurrentMessageIndex(0);

      let pollCount = 0;
      let shouldContinuePolling = true;

      const pollForCompletion = async () => {
        if (!shouldContinuePolling || pollCount >= MAX_POLL_ATTEMPTS) {
          if (pollCount >= MAX_POLL_ATTEMPTS) {
            localStorage.removeItem('pendingResumeParsingTask');
            logger.error('Resume parsing timeout after 5 minutes');
            toast.error(
              'Resume parsing timed out. Please try uploading again.'
            );
          }
          setIsWaitingForParsing(false);
          setIsCurrentlyPolling(false);
          return;
        }
        pollCount++;

        try {
          const taskStatus =
            await candidateResumeParsingService.getPublicParsingTask(
              pendingTaskId
            );

          if (taskStatus.status === ResumeParsingTaskStatusEnum.COMPLETED) {
            const parsedResume =
              await candidateResumeParsingService.getParsedResumeFromPublicTask(
                pendingTaskId
              );
            if (parsedResume && parsedResume.parsedResume) {
              storeParsedResumeData(parsedResume);
              localStorage.removeItem('pendingResumeParsingTask');
              setIsWaitingForParsing(false);
              setIsCurrentlyPolling(false);
              toast.success(
                'Resume parsed successfully! Your profile has been pre-filled.'
              );
            }
          } else if (taskStatus.status === ResumeParsingTaskStatusEnum.FAILED) {
            localStorage.removeItem('pendingResumeParsingTask');
            setIsWaitingForParsing(false);
            setIsCurrentlyPolling(false);
            logger.error('Resume parsing failed:', taskStatus.error);
            toast.error('Resume parsing failed. Please try uploading again.');
          } else {
            // Task is still processing, continue polling
            if (shouldContinuePolling) {
              setTimeout(pollForCompletion, 2000);
            }
          }
        } catch (error) {
          logger.error('Error polling for resume parsing completion:', error);
          setIsWaitingForParsing(false);
          setIsCurrentlyPolling(false);
          localStorage.removeItem('pendingResumeParsingTask');
          toast.error(
            'Error checking resume parsing status. Please try again.'
          );
        }
      };

      pollForCompletion();

      // Cleanup function
      return () => {
        shouldContinuePolling = false;
        setIsCurrentlyPolling(false);
      };
    }
  }, [isCurrentlyPolling]);

  // Cycle through processing messages when waiting
  useEffect(() => {
    if (!isWaitingForParsing) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex(
        (prev) => (prev + 1) % RESUME_PROCESSING_MESSAGES.length
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isWaitingForParsing]);

  return (
    <>
      <div className="space-y-6 p-3">
        <LoadingOverlay
          isPolling={isWaitingForParsing}
          pollingMessage={RESUME_PROCESSING_MESSAGES[currentMessageIndex]}
        />

        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                  <User className="text-primary h-10 w-10 pr-2" />
                  Complete Your Profile
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Tell us about yourself, your current situation and preferences
                  so we can match you with the right opportunities.
                </p>
              </div>
            </div>
          </div>
          <div data-tour="profile-card-section">
            <Profile onUSAAuthCompleted={setIsUSAAuthCompleted} />
          </div>
          <div className="mt-6 sm:mt-8">
            <Button
              onClick={() => {
                // Check if required fields are completed
                if (!isUSAAuthCompleted) {
                  toast.error(
                    'Please complete all required fields before continuing'
                  );
                  return;
                }

                router.push('/app/candidate/onboard/experience');
              }}
              variant="default"
              disabled={!isUSAAuthCompleted}
              className="h-11 w-full rounded-lg px-6 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
            >
              Save & Continue to Experience
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {!isUSAAuthCompleted && (
              <p className="text-muted-foreground mt-2 text-sm">
                Please complete all required fields to continue.
              </p>
            )}
          </div>
        </div>
      </div>
      <TourGuide tourKey="candidate_onboarding_profile" />
    </>
  );
}
