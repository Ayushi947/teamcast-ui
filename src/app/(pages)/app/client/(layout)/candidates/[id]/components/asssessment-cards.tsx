'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
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

interface AssessmentCardsProps {
  profile: ICandidateProfile;
  resumeAssessment?: IResumeAssessment;
  onboardingAssessment?: ICandidateOnboardingAssessment;
  readonly?: boolean;
}

export const AssessmentCards = ({
  onboardingAssessment,
  resumeAssessment,
}: AssessmentCardsProps) => {
  const [onboardingAssessmentOpen, setOnboardingAssessmentOpen] =
    useState(false);
  const [resumeAssessmentOpen, setResumeAssessmentOpen] = useState(false);

  const hasResumeAssessment = !!resumeAssessment?.overallFeedback;
  const hasOnboardingAssessment = !!onboardingAssessment?.overallFeedback;

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* AI Resume Assessment */}
        <Card className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-4 text-xl dark:text-white">
              <p>Resume Assessment</p>
              <AIPoweredLogo />
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Detailed assessment of Candidate&apos;s resume
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-6">
            <div className="flex h-full flex-col">
              <div className="border-muted bg-background text-muted-foreground rounded-lg border p-4 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {hasResumeAssessment ? (
                  resumeAssessment.overallFeedback
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No resume assessment available
                  </span>
                )}
              </div>

              <div className="mt-auto flex flex-col justify-center gap-4 pt-4">
                <div className="flex justify-center">
                  <Button
                    className="w-fit"
                    onClick={() => setResumeAssessmentOpen(true)}
                    disabled={!hasResumeAssessment}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Detailed Resume Assessment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Screening Assessment */}
        <Card className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-4 text-xl dark:text-white">
              <p>Screening Assessment</p>
              <AIPoweredLogo />
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Detailed assessment of Candidate&apos;s skills and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-6">
            <div className="flex h-full flex-col">
              <div className="border-muted bg-background text-muted-foreground rounded-lg border p-4 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {hasOnboardingAssessment ? (
                  onboardingAssessment.overallFeedback
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No screening assessment available
                  </span>
                )}
              </div>

              <div className="mt-auto flex flex-col justify-center gap-4 pt-4">
                <div className="flex justify-center">
                  <Button
                    className="w-fit"
                    onClick={() => setOnboardingAssessmentOpen(true)}
                    disabled={!hasOnboardingAssessment}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Detailed Screening Assessment
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
        />
      )}
    </TooltipProvider>
  );
};
