'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Calendar,
  User,
  MessageSquare,
  ArrowLeft,
  Check,
} from 'lucide-react';
import {
  SupportTicketStatusEnum,
  SupportTicketPriorityEnum,
  UserTypeEnum,
  UserRoleEnum,
  logger,
} from '@/lib/shared';
import { formatFileSize } from '@/lib/utils';
import {
  supportTicketActivityService,
  supportTicketService,
} from '@/lib/services/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/lib/context/app-context';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TicketCommentSection } from './components/support-ticket-comment-section';
import { TimelineSection } from './components/support-ticket-timeline-section';
import { TicketDetailsRightPanel } from './components/ticket-details-right-panel';
import { RcaSection } from './components/support-ticket-rca-section';

interface TicketDetailsPageProps {
  ticketId: string;
  onBack: () => void;
  onTicketUpdate?: (ticketId: string, updates: any) => Promise<void>;
}

export const TicketDetailsPage: React.FC<TicketDetailsPageProps> = ({
  ticketId,
  onBack,
}) => {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const isSupportUser = user?.type === UserTypeEnum.SUPPORT;

  // Check if user has write access (support admin or support account manager)
  const hasWriteAccess =
    isSupportUser &&
    (user?.role === UserRoleEnum.ADMIN ||
      user?.role === UserRoleEnum.ACCOUNT_MANAGER);

  const [activeTab, setActiveTab] = useState('comments');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const userType = user?.type.toLocaleLowerCase();
  const { data: ticket, isLoading: isTicketLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => supportTicketService.getTicketByTicketId(ticketId),
    enabled: !!ticketId,
  });

  const { data: comments } = useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: async () => {
      const result = await supportTicketService.getTicketComments(ticketId);
      return result;
    },
    enabled: !!ticketId,
  });

  const { data: rcaData } = useQuery({
    queryKey: ['ticket-rca', ticketId],
    queryFn: async () => {
      const result = await supportTicketService.getRootCauseAnalysis(ticketId);
      return result;
    },
    enabled: !!ticketId && isSupportUser,
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['ticket-audit-logs', ticketId],
    queryFn: async () => {
      const result =
        await supportTicketActivityService.getTicketActivityLogs(ticketId);
      return result;
    },
    enabled: !!ticketId,
  });

  const handleAddComment = async (
    comment: string,
    isInternal?: boolean,
    mentionedUserIds?: string[]
  ) => {
    if (!comment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await addCommentMutation.mutateAsync({
        comment,
        isInternal,
        mentionedUserIds,
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const addCommentMutation = useMutation({
    mutationFn: async ({
      comment,
      isInternal,
      mentionedUserIds,
    }: {
      comment: string;
      isInternal?: boolean;
      mentionedUserIds?: string[];
    }) => {
      const result = await supportTicketService.addTicketComment(ticketId, {
        content: comment,
        isInternal: isInternal || false,
        mentionedUserIds: mentionedUserIds || [],
      });
      return result;
    },
    onSuccess: () => {
      // Invalidate the specific comments query
      queryClient.invalidateQueries({
        queryKey: ['ticket-comments', ticketId],
      });
      // Also refetch the comments immediately
      queryClient.refetchQueries({
        queryKey: ['ticket-comments', ticketId],
      });
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      logger.error('Failed to add comment', error);
      toast.error('Failed to add comment');
    },
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: async (updates: any) =>
      supportTicketService.changeStatus(
        ticketId,
        updates.status,
        updates.reason
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.refetchQueries({ queryKey: ['ticket-audit-logs', ticketId] });
      toast.success('Ticket updated successfully');
    },
    onError: () => toast.error('Failed to update ticket'),
  });

  const updateTicketPriorityMutation = useMutation({
    mutationFn: async (updates: any) =>
      supportTicketService.changePriority(ticketId, updates.priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.refetchQueries({ queryKey: ['ticket-audit-logs', ticketId] });
      toast.success('Ticket updated successfully');
    },
    onError: () => toast.error('Failed to update ticket'),
  });

  const assignTicketMutation = useMutation({
    mutationFn: async (updates: any) =>
      supportTicketService.assignTicket(ticketId, updates.assignedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.refetchQueries({ queryKey: ['ticket-audit-logs', ticketId] });
      toast.success('Ticket assigned successfully');
    },
    onError: () => toast.error('Failed to assign ticket'),
  });

  const resolveTicketMutation = useMutation({
    mutationFn: async (notes: string) => {
      // First add resolution notes
      await supportTicketService.addResolutionNotes(ticketId, {
        resolutionNotes: notes,
      });
      // Then change status to RESOLVED
      return supportTicketService.changeStatus(
        ticketId,
        SupportTicketStatusEnum.RESOLVED,
        notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.refetchQueries({ queryKey: ['ticket-audit-logs', ticketId] });
      toast.success('Ticket resolved successfully');
      setIsResolveDialogOpen(false);
      setResolutionNotes('');
    },
    onError: () => toast.error('Failed to resolve ticket'),
  });

  const handleStatusChange = async (status: SupportTicketStatusEnum) => {
    await updateTicketStatusMutation.mutateAsync({ status });
  };

  const handlePriorityChange = async (priority: SupportTicketPriorityEnum) => {
    await updateTicketPriorityMutation.mutateAsync({ priority });
  };

  const handleAssigneeChange = async (assigneeId: string | null) => {
    await assignTicketMutation.mutateAsync({ assignedUserId: assigneeId });
  };

  const handleResolveTicket = async () => {
    if (!resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }
    setIsResolving(true);
    try {
      await resolveTicketMutation.mutateAsync(resolutionNotes);
    } finally {
      setIsResolving(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar'))
      return <FileArchive className="h-4 w-4" />;
    if (mimeType.includes('json') || mimeType.includes('xml'))
      return <FileCode className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (isTicketLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              Ticket Not Found
            </h2>
            <p className="text-muted-foreground max-w-md">
              The requested ticket could not be found or you may not have
              permission to view it.
            </p>
          </div>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card min-h-screen rounded-xl">
      {/* Header */}
      <div className="sticky top-0 z-10 rounded-xl border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Breadcrumb */}
            <div className="mb-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/app/${userType}/dashboard`}
                      className="hover:text-primary transition-colors"
                    >
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/app/${userType}/support-tickets/${userType === 'support' && user?.role === UserRoleEnum.ACCOUNT_MANAGER ? 'account-manager' : userType === 'support' && user?.role === UserRoleEnum.ADMIN ? 'admin' : ''}`}
                      className="hover:text-primary transition-colors"
                    >
                      Support Tickets
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold">
                      {ticket.ticketNumber}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Title and Status */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {ticket.title}
                  </h1>
                </div>
                <div className="text-muted-foreground flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {ticket.assignedTo && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Assigned to {ticket.assignedTo.user.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{comments?.length || 0} comments</span>
                  </div>
                </div>
              </div>

              {/* Resolve Ticket Button - Only show if ticket is not already resolved/closed and user has write access */}
              {hasWriteAccess &&
                ticket.status !== SupportTicketStatusEnum.RESOLVED &&
                ticket.status !== SupportTicketStatusEnum.CLOSED && (
                  <Dialog
                    open={isResolveDialogOpen}
                    onOpenChange={setIsResolveDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="mr-8">
                        <Check className="mr-2 h-4 w-4" />
                        Resolve Ticket
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Resolve Ticket</DialogTitle>
                        <DialogDescription>
                          Add resolution notes to close this ticket. This action
                          will mark the ticket as resolved.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resolution-notes">
                            Resolution Notes
                          </Label>
                          <Textarea
                            id="resolution-notes"
                            placeholder="Describe how the issue was resolved..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsResolveDialogOpen(false);
                            setResolutionNotes('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleResolveTicket}
                          variant="default"
                          disabled={isResolving || !resolutionNotes.trim()}
                        >
                          {isResolving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Resolving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Resolve Ticket
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Description
                </h2>
              </div>
              <div className="bg-background rounded-lg px-4 py-2 dark:border dark:bg-gray-800">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* RCA Section - Only for Support Users */}
            {isSupportUser && (
              <RcaSection
                ticketId={ticketId}
                rcaData={rcaData}
                isEditable={hasWriteAccess}
              />
            )}

            {/* Resolution Notes */}
            {ticket.resolutionNotes && (
              <Card className="border-0 bg-green-50/50 backdrop-blur-sm hover:shadow-none dark:bg-green-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Resolution Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="leading-relaxed whitespace-pre-wrap text-green-800 dark:text-green-200">
                      {ticket.resolutionNotes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="bg-card/60 border-0 shadow-none backdrop-blur-sm hover:shadow-none">
                <div className="border-b border-gray-200 pb-2 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Attachments
                  </h2>
                </div>
                <div>
                  <div className="grid gap-3 pt-4">
                    {ticket.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                      >
                        {/* File Info */}
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                            {attachment.mimeType.endsWith('.jpg') ||
                            attachment.mimeType.endsWith('.jpeg') ||
                            attachment.mimeType.endsWith('.png') ||
                            attachment.mimeType.endsWith('.gif') ||
                            attachment.mimeType.endsWith('.webp') ? (
                              <img
                                src={attachment.previewUrl}
                                alt={attachment.fileName}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <div className="text-gray-500 dark:text-gray-400">
                                {getFileIcon(attachment.mimeType)}
                              </div>
                            )}
                          </div>

                          {/* Name and Size */}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {attachment.fileName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatFileSize(attachment.fileSize)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() =>
                            window.open(attachment.previewUrl, '_blank')
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Section */}
            <Card className="bg-card/60 border shadow-none backdrop-blur-sm hover:shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Tab Switcher */}
                <div className="mb-4 flex gap-4 border-b">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`pb-2 text-sm font-medium ${
                      activeTab === 'comments'
                        ? 'border-primary text-primary border-b-2'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`pb-2 text-sm font-medium ${
                      activeTab === 'timeline'
                        ? 'border-primary text-primary border-b-2'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Timeline
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'comments' && (
                  <TicketCommentSection
                    comments={comments || []}
                    ticketId={ticketId}
                    handleAddComment={handleAddComment}
                    isSubmitting={isSubmittingComment}
                  />
                )}

                {activeTab === 'timeline' && (
                  <TimelineSection
                    auditLogs={auditLogs?.logs || []}
                    userType={user?.type}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TicketDetailsRightPanel
              ticket={ticket}
              hasWriteAccess={hasWriteAccess}
              handleStatusChange={handleStatusChange}
              handlePriorityChange={handlePriorityChange}
              handleAssigneeChange={handleAssigneeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
