'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Bot,
  PenTool,
  Eye,
  Settings,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { clientJobPostingAssessmentService } from '@/lib/services/services';
import { IJobPostingAssessment, logger } from '@/lib/shared';

interface JobPostingSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  onEditJob?: () => void;
}

export function JobPostingSuccessDialog({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  onEditJob,
}: JobPostingSuccessDialogProps) {
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [_assessment, setAssessment] = useState<IJobPostingAssessment | null>(
    null
  );

  if (!isOpen) return null;

  const handleStartAssessment = async () => {
    setIsStartingAssessment(true);
    try {
      await clientJobPostingAssessmentService.startAssessment(jobId);
      toast.success('Job assessment started successfully');

      // Poll for assessment completion since it's a background task
      let completedAssessment = null;
      let attempts = 0;
      const maxAttempts = 10; // Maximum 10 attempts (40 seconds)
      const pollInterval = 4000; // 4 second interval

      while (attempts < maxAttempts) {
        try {
          completedAssessment =
            await clientJobPostingAssessmentService.getLatestAssessment(jobId);
          if (completedAssessment) {
            // Assessment found, break out of polling
            break;
          }
        } catch (error) {
          // Assessment not found yet, continue polling
          logger.debug(
            `Assessment not ready for job ${jobId}, attempt ${attempts + 1}`,
            error
          );
        }

        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        attempts++;
      }

      if (completedAssessment) {
        setAssessment(completedAssessment);
        toast.success('Assessment completed successfully');

        // Close dialog and refresh page to show assessment results
        onClose();
        window.location.reload();
      } else {
        // Assessment not found after all attempts
        logger.warn(
          `Assessment not found for job ${jobId} after ${maxAttempts} attempts`
        );
        toast.info(
          'Assessment is being processed. Please check back in a few moments.'
        );

        // Close dialog and refresh page
        onClose();
        window.location.reload();
      }
    } catch (error) {
      logger.error('Error in handleStartAssessment:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start assessment'
      );
    } finally {
      setIsStartingAssessment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-primary/20 dark:border-primary/30 mx-auto flex h-auto max-h-[85vh] min-h-[600px] w-full max-w-5xl overflow-hidden rounded-2xl border bg-white shadow-2xl dark:bg-gray-950">
        <div className="from-primary/5 via-primary/3 dark:from-primary/10 dark:via-primary/5 flex h-full w-full flex-col bg-gradient-to-br to-blue-50/50 dark:to-gray-900/50">
          {/* Header */}
          <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 flex items-center justify-between border-b px-8 py-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 dark:bg-primary/30 flex h-8 w-8 items-center justify-center rounded-full">
                <FileText className="text-primary dark:text-primary/90 h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Job Posting Created!
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-primary hover:bg-primary/10 hover:text-primary/80 dark:text-primary/90 dark:hover:bg-primary/20 dark:hover:text-primary/70"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-y-auto">
            <div className="flex w-full flex-col justify-center px-8 py-6">
              {/* Main Content Area */}
              <div className="mx-auto w-full max-w-4xl">
                {/* Status Message */}
                <div className="mb-8 text-center">
                  <div className="bg-primary/20 dark:bg-primary/30 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <CheckCircle2 className="text-primary dark:text-primary/90 h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                    Your job posting is successfully created for position
                  </h3>
                  <p className="text-primary dark:text-primary/90 mb-2 text-3xl font-semibold">
                    {jobTitle}
                  </p>
                  <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-400">
                    Your job posting has been successfully created and saved as
                    a draft. To publish and start attracting candidates, you
                    need to review the job posting with AI.
                  </p>

                  {/* Status Badge */}
                  <div className="bg-primary/10 dark:bg-primary/20 mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2">
                    <div className="bg-primary h-2 w-2 rounded-full"></div>
                    <span className="text-primary dark:text-primary/90 text-sm font-medium">
                      Draft Status - Not Published
                    </span>
                  </div>
                </div>

                {/* Action Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Assessment Card - Primary Action */}
                  <Card className="group border-primary bg-primary/5 hover:border-primary/70 hover:bg-primary/10 dark:border-primary/60 dark:bg-primary/10 dark:hover:border-primary/50 dark:hover:bg-primary/20 border-2 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 group-hover:bg-primary/30 dark:bg-primary/30 dark:group-hover:bg-primary/40 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                          <Bot className="text-primary dark:text-primary/90 h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-primary dark:text-primary/90 text-lg font-bold">
                            Review Job Posting
                          </CardTitle>
                          <CardDescription className="text-primary/80 dark:text-primary/70 text-sm">
                            Review the job posting with AI
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-primary/90 dark:text-primary/80 mb-4 text-sm">
                        Our AI will analyze your job posting and suggest
                        improvements to increase your job&apos;s visibility and
                        attract better matches.
                      </p>
                      <Button
                        onClick={handleStartAssessment}
                        disabled={isStartingAssessment}
                        className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 w-full text-white"
                        size="sm"
                      >
                        {isStartingAssessment ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing with AI...
                          </>
                        ) : (
                          <>
                            <Bot className="mr-2 h-4 w-4" />
                            Review Job Posting
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Edit Job Card */}
                  <Card className="group hover:border-primary/30 hover:bg-primary/5 dark:hover:border-primary/40 dark:hover:bg-primary/10 border-2 border-gray-200 bg-gray-50/50 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="group-hover:bg-primary/20 dark:group-hover:bg-primary/30 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 transition-colors dark:bg-gray-800">
                          <PenTool className="group-hover:text-primary dark:group-hover:text-primary/90 h-6 w-6 text-gray-600 transition-colors dark:text-gray-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Edit Job Details
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-700 dark:text-gray-300">
                            Make adjustments before publishing
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="mb-4 text-sm text-gray-800 dark:text-gray-200">
                        Refine job requirements, update compensation, or modify
                        any details to better match your hiring needs and
                        increase your job&apos;s visibility.
                      </p>
                      <Button
                        onClick={() => {
                          onClose();
                          onEditJob?.();
                        }}
                        variant="outline"
                        className="hover:border-primary/50 hover:bg-primary/5 hover:text-primary dark:hover:border-primary/50 dark:hover:bg-primary/10 w-full border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        size="sm"
                      >
                        <PenTool className="mr-2 h-4 w-4" />
                        Edit Job
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Actions */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button
                      onClick={() => {
                        onClose();
                        window.location.href = `/app/client/recruiter/sourcing?jobId=${jobId}`;
                      }}
                      variant="outline"
                      className="hover:border-primary/50 hover:bg-primary/5 hover:text-primary dark:hover:border-primary/50 dark:hover:bg-primary/10 border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Draft
                    </Button>

                    <Button
                      onClick={() => {
                        // Navigate to job management page
                        onClose();
                        window.location.href = `/app/client/recruiter/sourcing?jobId=${jobId}&action=manage`;
                      }}
                      variant="outline"
                      className="hover:border-primary/50 hover:bg-primary/5 hover:text-primary dark:hover:border-primary/50 dark:hover:bg-primary/10 border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
                      size="sm"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Job
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
