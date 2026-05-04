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
import { Calendar, Copy, Mail, User, Users } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { clientPanelInterviewService } from '@/lib/services/services';
import { formatName } from '@/lib/shared';

interface InterviewDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlotId: string;
}

export function InterviewDetailsDialog({
  isOpen,
  onClose,
  selectedSlotId,
}: InterviewDetailsDialogProps) {
  const { data: interviewSlotDetails } = useQuery({
    queryKey: ['interviewSlotDetails', selectedSlotId],
    queryFn: () =>
      clientPanelInterviewService.getPanelAssessmentSlot(selectedSlotId),
  });

  if (!interviewSlotDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="p-6 text-center text-gray-400 dark:text-gray-500">
            Loading interview details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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

  const formatTime = (dateTime: string | Date | undefined) => {
    if (
      !dateTime ||
      (typeof dateTime === 'string' && isNaN(new Date(dateTime).getTime()))
    )
      return 'N/A';
    return format(new Date(dateTime), 'h:mm a');
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
                      {interviewSlotDetails.panelAssessment?.candidate?.name}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-3 w-3" />
                      <span>
                        {interviewSlotDetails.panelAssessment?.candidate?.email}
                      </span>
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
                            interviewSlotDetails.panelAssessment?.candidate
                              ?.email || ''
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
                  Date & Time
                </p>
                <p className="text-sm font-medium">
                  {formatDateTime(interviewSlotDetails.startDateTime)}
                </p>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Duration
                </p>
                <p className="text-sm font-medium">
                  {formatTime(interviewSlotDetails.startDateTime)} -{' '}
                  {formatTime(interviewSlotDetails.endDateTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Panel Members */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Users className="h-4 w-4" />
              <h4>Panel Members</h4>
            </div>
            <div className="space-y-2">
              {interviewSlotDetails.panelMemberNames?.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{formatName(name || 'N/A')}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-3 w-3" />
                        <span>
                          {interviewSlotDetails.panelMemberEmails?.[index] ||
                            'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="Copy panel email"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              interviewSlotDetails.panelMemberEmails?.[index] ||
                                ''
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
              ))}
            </div>
          </div>

          {/* Host */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4" />
              <h4>Host</h4>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {formatName(interviewSlotDetails.hostName || 'N/A')}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-3 w-3" />
                      <span>{interviewSlotDetails.hostEmail}</span>
                    </div>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label="Copy host email"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(interviewSlotDetails.hostEmail || '')
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
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
