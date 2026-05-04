'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Copy, Mail, User, Building, Video } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { clientJobAiAssessmentInviteService } from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';

interface AiInterviewDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
}

export function AiInterviewDetailsDialog({
  isOpen,
  onClose,
  invitationId,
}: AiInterviewDetailsDialogProps) {
  const { data: aiInterviewDetails } = useQuery({
    queryKey: ['aiInterviewDetails', invitationId],
    queryFn: () =>
      clientJobAiAssessmentInviteService.getJobAiAssessmentDetails(
        invitationId
      ),
    enabled: !!invitationId,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast here if desired
  };

  const formatDateTime = (dateTime: string | Date | undefined) => {
    if (
      !dateTime ||
      (typeof dateTime === 'string' && isNaN(new Date(dateTime).getTime()))
    )
      return 'N/A';
    return format(new Date(dateTime), 'PPp');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                Interview Details
              </DialogTitle>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Candidate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4" />
              <h4>Candidate</h4>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {aiInterviewDetails?.candidateName}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-3 w-3" />
                      <span>{aiInterviewDetails?.candidateEmail}</span>
                    </div>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label="Copy candidate email"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            aiInterviewDetails?.candidateEmail || ''
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy email</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              <h4>Schedule</h4>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Created At
                </p>
                <p className="text-sm font-medium">
                  {formatDateTime(aiInterviewDetails?.createdAt || '')}
                </p>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Expires at
                </p>
                <p className="text-sm font-medium">
                  {formatDateTime(aiInterviewDetails?.expiresAt || '')}
                </p>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Building className="h-4 w-4" />
              <h4>Job Information</h4>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Building className="h-3 w-3" />
                <span>{aiInterviewDetails?.jobTitle || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Interview Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Video className="h-4 w-4" />
              <h4>Interview Type</h4>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
              <p className="font-medium">AI Assessment Interview</p>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <span>Automated interview with AI assessment</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
