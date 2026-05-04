'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Video } from 'lucide-react';
import {
  ICandidateProfile,
  IResumeAssessment,
  ICandidateOnboardingAssessment,
} from '@/lib/shared';

import { TooltipProvider } from '@/components/ui/tooltip';
import { useState } from 'react';
import { OnboardingDetailedDialog } from '@/app/(pages)/app/candidate/(layout)/resume/(resume)/components/dialog/onboarding-detailed-dialog';
import ResumeAssessmentDialog from '@/app/(pages)/app/candidate/(layout)/resume/(resume)/components/dialog/resume-assessment-dialog';
import AIPoweredLogo from '@/components/app/common/animations/ai-powered-logo';
import { OnboardingVideoChunksPlayer } from '@/components/video/onboarding-video-chunks-player';

interface PublicAssessmentCardsProps {
  profile: ICandidateProfile;
  resumeAssessment?: IResumeAssessment;
  onboardingAssessment?: ICandidateOnboardingAssessment;
  readonly?: boolean;
}

export const PublicAssessmentCards = ({
  resumeAssessment,
  onboardingAssessment,
}: PublicAssessmentCardsProps) => {
  const [onboardingAssessmentOpen, setOnboardingAssessmentOpen] =
    useState(false);
  const [resumeAssessmentOpen, setResumeAssessmentOpen] = useState(false);

  const hasResumeAssessment = !!resumeAssessment?.overallFeedback;
  const hasOnboardingAssessment = !!onboardingAssessment?.overallFeedback;

  return (
    <TooltipProvider>
      <div className="space-y-3 sm:space-y-4">
        {/* AI Resume Assessment */}
        <Card className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-800">
          <CardHeader className="px-3 pb-2 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:gap-4 sm:text-xl dark:text-white">
              <p className="text-sm sm:text-base">Resume Assessment</p>
              <AIPoweredLogo />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm dark:text-gray-400">
              Detailed assessment of Candidate&apos;s resume
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-3 pt-1 sm:px-5">
            <div className="flex h-full flex-col">
              <div className="border-muted bg-background text-muted-foreground rounded-lg border p-3 text-xs sm:p-4 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {hasResumeAssessment ? (
                  resumeAssessment.overallFeedback
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No resume assessment available
                  </span>
                )}
              </div>

              <div className="mt-auto flex flex-col justify-center gap-3 pt-3 sm:gap-4 sm:pt-4">
                <div className="flex justify-center">
                  <Button
                    className="w-fit text-xs sm:text-sm"
                    onClick={() => setResumeAssessmentOpen(true)}
                    disabled={!hasResumeAssessment}
                  >
                    <Eye className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">
                      View Detailed Resume Assessment
                    </span>
                    <span className="sm:hidden">View Assessment</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Screening Assessment */}
        <Card className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-800">
          <CardHeader className="px-3 pb-2 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:gap-4 sm:text-xl dark:text-white">
              <p className="text-sm sm:text-base">Screening Assessment</p>
              <AIPoweredLogo />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm dark:text-gray-400">
              Detailed assessment of Candidate&apos;s skills and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-3 pt-1 sm:px-5">
            <div className="flex h-full flex-col">
              <div className="border-muted bg-background text-muted-foreground rounded-lg border p-3 text-xs sm:p-4 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {hasOnboardingAssessment ? (
                  onboardingAssessment.overallFeedback
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No screening assessment available
                  </span>
                )}
              </div>

              {/* Video Player Section */}
              {hasOnboardingAssessment &&
                onboardingAssessment?.videoAnalysis && (
                  <div className="bg-background mt-3 rounded-lg p-3 sm:mt-4 sm:p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="flex items-center gap-1.5 text-base font-semibold sm:gap-2 sm:text-lg">
                        <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                        Video Analysis
                      </h3>
                    </div>

                    {/* Video Chunks Player with fallback to video URLs */}
                    {onboardingAssessment?.id && (
                      <OnboardingVideoChunksPlayer
                        assessmentId={onboardingAssessment.id}
                        service={{
                          // No-op service for public page - chunks are preloaded
                          getOnboardingVideoChunks: async () => ({
                            chunks: [],
                          }),
                        }}
                        className="bg-background rounded-lg"
                        videoUrl={onboardingAssessment?.videoAnalysis?.videoUrl}
                        highlightsVideoUrl={
                          onboardingAssessment?.videoAnalysis
                            ?.highlightsVideoUrl
                        }
                        preloadedChunks={onboardingAssessment?.videoChunks}
                      />
                    )}
                  </div>
                )}

              <div className="mt-auto flex flex-col justify-center gap-3 pt-3 sm:gap-4 sm:pt-4">
                <div className="flex justify-center">
                  <Button
                    className="w-fit text-xs sm:text-sm"
                    onClick={() => setOnboardingAssessmentOpen(true)}
                    disabled={!hasOnboardingAssessment}
                  >
                    <Eye className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">
                      View Detailed Screening Assessment
                    </span>
                    <span className="sm:hidden">View Assessment</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasResumeAssessment && (
        <ResumeAssessmentDialog
          open={resumeAssessmentOpen}
          onOpenChange={setResumeAssessmentOpen}
          resumeAssessment={resumeAssessment as IResumeAssessment}
        />
      )}

      {hasOnboardingAssessment && (
        <OnboardingDetailedDialog
          open={onboardingAssessmentOpen}
          onOpenChange={setOnboardingAssessmentOpen}
          onboardingAssessment={
            onboardingAssessment as ICandidateOnboardingAssessment
          }
          videoAnalysisVariant="strengths"
        />
      )}
    </TooltipProvider>
  );
};
