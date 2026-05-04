import {
  ISupportClientJobPostingByIdResponse,
  ISupportTicket,
  SupportClientTicketCategoryEnum,
  SupportTicketStatusEnum,
  UserTypeEnum,
} from '@/lib/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateAndTime } from '@/lib/utils';
import { formatEnumValue } from '@/lib/utils';
import { SupportTicketPriorityEnum } from '@/lib/shared';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Tag } from 'lucide-react';
import { useState } from 'react';
import { AssignmentDialog } from './assignment-dialog';
import { logger } from '@/lib/logger';
import { supportClientManagementService } from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/lib/context/app-context';

interface TicketDetailsRightPanelProps {
  ticket: ISupportTicket;
  hasWriteAccess: boolean;
  handleStatusChange: (value: SupportTicketStatusEnum) => void;
  handlePriorityChange: (value: SupportTicketPriorityEnum) => void;
  handleAssigneeChange?: (assigneeId: string | null, notes?: string) => void;
}

// Utility function to get background color based on urgency
const getUrgencyColor = (startDate: Date, durationMinutes: number): string => {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();

  const diffMs = end.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes <= 0) {
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  } else if (diffMinutes <= 60) {
    // Less than 1 hour
    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
  } else if (diffMinutes <= 240) {
    // Less than 4 hours
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
  } else {
    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
  }
};

// Priority color mapping
const getPriorityColor = (priority: SupportTicketPriorityEnum) => {
  switch (priority) {
    case SupportTicketPriorityEnum.CRITICAL:
      return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30';
    case SupportTicketPriorityEnum.HIGH:
      return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30';
    case SupportTicketPriorityEnum.MEDIUM:
      return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30';
    case SupportTicketPriorityEnum.LOW:
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30';
    default:
      return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700';
  }
};

// Status color mapping
const getStatusColor = (status: SupportTicketStatusEnum) => {
  switch (status) {
    case SupportTicketStatusEnum.OPEN:
      return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case SupportTicketStatusEnum.IN_PROGRESS:
      return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case SupportTicketStatusEnum.RESOLVED:
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
    case SupportTicketStatusEnum.CLOSED:
      return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    case SupportTicketStatusEnum.CANCELLED:
      return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
};

export function TicketDetailsRightPanel({
  ticket,
  hasWriteAccess,
  handleStatusChange,
  handlePriorityChange,
  handleAssigneeChange,
}: TicketDetailsRightPanelProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const { user } = useApp();
  // Assignment dialog state
  const [isAssigning, setIsAssigning] = useState(false);
  // Get job posting
  const { data: jobPosting } = useQuery<ISupportClientJobPostingByIdResponse>({
    queryKey: ['job-posting', ticket.targetId],
    queryFn: () =>
      supportClientManagementService.getSupportClientJobPostingById(
        ticket.targetId
      ),
    enabled: ticket.category === SupportClientTicketCategoryEnum.JOB_POSTING,
  });
  // Handle assignment submission
  const handleAssignmentSubmit = async (assigneeId: string, notes?: string) => {
    if (!handleAssigneeChange) return;

    setIsAssigning(true);
    try {
      await handleAssigneeChange(assigneeId, notes);
    } catch (error) {
      logger.error('Failed to assign ticket:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {/* Enhanced Header */}
        <div className="rounded-t-xl border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Ticket Details
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  #{ticket.ticketNumber}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDetailsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Content */}
        {isDetailsExpanded && (
          <div className="space-y-6 p-6">
            {/* Status Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <label className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">
                  Status
                </label>
              </div>
              <div>
                {hasWriteAccess ? (
                  <Select
                    value={ticket.status}
                    onValueChange={(value) =>
                      handleStatusChange(value as SupportTicketStatusEnum)
                    }
                  >
                    <SelectTrigger className="h-10 border-gray-200 bg-gray-50 text-sm hover:bg-gray-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SupportTicketStatusEnum).map((status) => (
                        <SelectItem key={status} value={status}>
                          <div>{formatEnumValue(status)}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={cn(
                      'h-8 border px-3 text-xs font-medium',
                      getStatusColor(ticket.status)
                    )}
                  >
                    <div>{formatEnumValue(ticket.status)}</div>
                  </Badge>
                )}
              </div>
            </div>

            {/* Priority Section */}
            {user?.type === UserTypeEnum.SUPPORT && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                  <label className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">
                    Priority
                  </label>
                </div>
                <div>
                  {hasWriteAccess ? (
                    <Select
                      value={ticket.priority}
                      onValueChange={(value) =>
                        handlePriorityChange(value as SupportTicketPriorityEnum)
                      }
                    >
                      <SelectTrigger className="h-10 border-gray-200 bg-gray-50 text-sm hover:bg-gray-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SupportTicketPriorityEnum).map(
                          (priority) => (
                            <SelectItem key={priority} value={priority}>
                              <div>{formatEnumValue(priority)}</div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      className={cn(
                        'h-8 border px-3 text-xs font-medium',
                        getPriorityColor(ticket.priority)
                      )}
                    >
                      <div>{formatEnumValue(ticket.priority)}</div>
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {/* Issue/Category Type Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                <label className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">
                  Issue
                </label>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                      <p className="text-muted-foreground text-sm">
                        Category: {formatEnumValue(ticket.category)}
                      </p>
                    </div>
                  </div>
                  {ticket.subcategory && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                      <p className="text-muted-foreground text-sm">
                        Subcategory: {formatEnumValue(ticket.subcategory)}
                      </p>
                    </div>
                  )}
                  {jobPosting?.title && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                      <p className="text-muted-foreground text-sm">
                        Job Posting: {jobPosting.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reported By Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <label className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">
                  Reported By
                </label>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm dark:border-gray-700">
                    <AvatarFallback className="bg-purple-100 text-sm font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      {ticket.createdBy?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {ticket.createdBy?.name || 'Unknown User'}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {ticket.createdBy?.email || 'No email provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned To Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <label className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">
                  Assignee
                </label>
              </div>
              <div>
                {hasWriteAccess && handleAssigneeChange ? (
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        {ticket.assignedTo?.user ? (
                          <>
                            <Avatar className="h-8 w-8 border-2 border-white shadow-sm dark:border-gray-700">
                              <AvatarFallback className="bg-purple-100 text-sm font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                {ticket.assignedTo.user.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                {ticket.assignedTo.user.name}
                              </p>
                              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                {ticket.assignedTo.user.email}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Avatar className="h-8 w-8 border-2 border-white shadow-sm dark:border-gray-700">
                              <AvatarFallback className="bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                U
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Unassigned
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                No assignee selected
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <AssignmentDialog
                        onAssign={handleAssignmentSubmit}
                        isAssigning={isAssigning}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      {ticket.assignedTo?.user ? (
                        <>
                          <Avatar className="h-8 w-8 border-2 border-white shadow-sm dark:border-gray-700">
                            <AvatarFallback className="bg-purple-100 text-sm font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                              {ticket.assignedTo.user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                              {ticket.assignedTo.user.name}
                            </p>
                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                              {ticket.assignedTo.user.email}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Avatar className="h-8 w-8 border-2 border-white shadow-sm dark:border-gray-700">
                            <AvatarFallback className="bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              U
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Unassigned
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              No assignee selected
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SLA and Escalation Sections */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <label className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">
                  Resolution Timeline
                </label>
              </div>
              <div className="flex flex-col gap-3">
                {/* Due Date */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Due Date
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {ticket.slaBreachAt
                          ? formatDateAndTime(ticket.slaBreachAt)
                          : 'No due date set'}
                      </p>
                    </div>
                    {ticket.isSlaBreach && (
                      <div
                        className={cn(
                          'rounded-md px-2 py-1 text-xs font-medium',
                          ticket.slaStartedAt &&
                            ticket.slaPolicy?.resolutionTime
                            ? getUrgencyColor(
                                new Date(ticket.slaStartedAt),
                                ticket.slaPolicy.resolutionTime
                              )
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        )}
                      >
                        Overdue
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
