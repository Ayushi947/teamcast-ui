'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  clientDocumentService,
  documentConfigService,
} from '@/lib/services/services';
import { useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  AlertCircle,
  Edit,
  Calendar,
  Building,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';
import {
  ISupportClientDocument,
  VerificationStatus,
  logger,
  EntityType,
  ICompanyVerificationStatus,
} from '@/lib/shared';
import { IDocumentVerificationRequest } from '@/lib/shared/models/domain/support/document.config.domain';
import { ISupportClient } from '@/lib/shared';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatEnumValue } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';

interface VerifyClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  clientId: string;
  companyId: string;
  clientDetails: ISupportClient;
}

export function VerifyClientDialog({
  open,
  onOpenChange,
  trigger,
  clientId,
  companyId,
  clientDetails,
}: VerifyClientDialogProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useApp();
  const [documentComments, setDocumentComments] = useState<
    Record<string, string>
  >({});
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});

  // Memoize documents to prevent unnecessary re-renders
  const documents = useMemo(
    () => clientDetails.profile?.documents || [],
    [clientDetails.profile?.documents]
  );

  // Handle document verification
  const handleVerifyDocument = useCallback(
    async (documentId: string, status: VerificationStatus) => {
      setIsLoading(true);
      try {
        const verificationData: IDocumentVerificationRequest = {
          status,
          remarks: documentComments[documentId] || '',
        };

        await documentConfigService.verifyDocument(
          documentId,
          verificationData
        );

        // Invalidate the correct query keys for the support client data
        queryClient.invalidateQueries({
          queryKey: ['support-client', clientId],
        });
        queryClient.invalidateQueries({
          queryKey: ['supportClients'],
        });
        queryClient.invalidateQueries({
          queryKey: ['support-clients'],
        });

        toast.success(
          `Document ${status === VerificationStatus.VERIFIED ? 'accepted' : 'rejected'} successfully`
        );
      } catch (error) {
        toast.error('Failed to update document verification', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [documentComments, queryClient, clientId]
  );

  // Handle document preview
  const handlePreviewDocument = useCallback(
    async (documentId: string) => {
      try {
        const response = await clientDocumentService.getDocumentPreview({
          entityType: EntityType.CLIENT,
          entityId: clientId,
          documentId,
        });
        window.open(response.downloadUrl, '_blank');
      } catch (error) {
        logger.error('Error getting preview URL:', error);
        toast.error('Failed to preview document');
      }
    },
    [clientId]
  );

  // Handle comment change
  const handleCommentChange = useCallback(
    (documentId: string, comment: string) => {
      setDocumentComments((prev) => ({ ...prev, [documentId]: comment }));
    },
    []
  );

  // Toggle comment section
  const toggleCommentExpansion = useCallback((documentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  }, []);

  // Render verification status badge with enhanced styling
  const renderStatusBadge = useCallback(
    (status?: VerificationStatus) => {
      const badgeClasses = isMobile
        ? 'text-xs px-1.5 py-0.5'
        : 'px-2 py-1 text-xs';

      switch (status) {
        case VerificationStatus.VERIFIED:
          return (
            <Badge
              className={`border-emerald-200 bg-emerald-50 font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 ${badgeClasses}`}
            >
              <CheckCircle2
                className={`mr-1 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
              />
              Verified
            </Badge>
          );
        case VerificationStatus.REJECTED:
          return (
            <Badge
              className={`border-red-200 bg-red-50 font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 ${badgeClasses}`}
            >
              <XCircle
                className={`mr-1 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
              />
              Rejected
            </Badge>
          );
        case VerificationStatus.REVISED:
          return (
            <Badge
              className={`border-amber-200 bg-amber-50 font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900 ${badgeClasses}`}
            >
              <AlertCircle
                className={`mr-1 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
              />
              Revised
            </Badge>
          );
        default:
          return (
            <Badge
              className={`border-purple-200 bg-purple-50 font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900 ${badgeClasses}`}
            >
              <FileText
                className={`mr-1 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
              />
              Unverified
            </Badge>
          );
      }
    },
    [isMobile]
  );

  const handleVerifyClient = useCallback(async () => {
    setIsLoading(true);
    try {
      const response =
        await documentConfigService.updateCompanyVerificationStatus(
          companyId,
          ICompanyVerificationStatus.VERIFIED,
          'Company verified by admin'
        );
      logger.info('Company verification status updated', response);
      toast.success('Company verification status updated');
      onOpenChange(false);

      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: ['support-client', clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['supportClients'],
      });
      queryClient.invalidateQueries({
        queryKey: ['support-clients'],
      });
    } catch (error) {
      logger.error('Error updating company verification status', error);
      toast.error('Failed to update company verification status');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, clientId, queryClient, onOpenChange]);

  const handleRejectClient = useCallback(async () => {
    setIsLoading(true);
    try {
      const response =
        await documentConfigService.updateCompanyVerificationStatus(
          companyId,
          ICompanyVerificationStatus.REJECTED,
          'Company rejected by admin'
        );
      logger.info('Company verification status updated', response);
      toast.success('Company verification status updated');
      onOpenChange(false);

      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: ['support-client', clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['supportClients'],
      });
      queryClient.invalidateQueries({
        queryKey: ['support-clients'],
      });
    } catch (error) {
      logger.error('Error updating company verification status', error);
      toast.error('Failed to update company verification status');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, clientId, queryClient, onOpenChange]);

  const handleRejectDocument = useCallback(
    async (documentId: string) => {
      try {
        await handleVerifyDocument(documentId, VerificationStatus.REJECTED);
      } catch (error) {
        logger.error('Error rejecting document', error);
        toast.error('Failed to reject document');
      }
    },
    [handleVerifyDocument]
  );

  const handleAcceptDocument = useCallback(
    async (documentId: string) => {
      try {
        await handleVerifyDocument(documentId, VerificationStatus.VERIFIED);
      } catch (error) {
        logger.error('Error accepting document', error);
        toast.error('Failed to accept document');
      }
    },
    [handleVerifyDocument]
  );

  const allDocumentsAccepted = documents.every(
    (document) => document.status === VerificationStatus.VERIFIED
  );

  const DefaultTrigger = (
    <Button
      variant="secondary"
      className={`border-border hover:bg-primary/50 border bg-emerald-300 shadow-sm ${
        isMobile ? 'gap-1 px-2' : 'gap-1.5 px-3'
      }`}
    >
      <CheckCircle
        className={`text-card ${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`}
      />
      <span
        className={`text-card font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}
      >
        {isMobile ? 'Verify' : 'Verify Documents'}
      </span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || DefaultTrigger}</DialogTrigger>
      <DialogContent
        className={`bg-background overflow-hidden p-0 ${
          isMobile
            ? 'max-h-[95vh] w-[98vw] max-w-none rounded-t-lg'
            : 'max-h-[90vh] w-[95vw] max-w-3xl rounded-lg'
        }`}
      >
        <DialogHeader
          className={`border-border bg-card border-b ${
            isMobile ? 'px-3 py-3' : 'px-4 py-4 sm:px-6'
          }`}
        >
          <div
            className={`flex gap-3 ${
              isMobile
                ? 'flex-col'
                : 'flex-col sm:flex-row sm:items-center sm:justify-between'
            }`}
          >
            <div>
              <DialogTitle
                className={`text-foreground flex items-center gap-2 font-bold ${
                  isMobile ? 'text-sm' : 'text-base sm:text-lg'
                }`}
              >
                Document Verification
              </DialogTitle>
              <DialogDescription
                className={`text-muted-foreground mt-1 ${
                  isMobile ? 'text-xs' : 'text-xs sm:text-sm'
                }`}
              >
                {isMobile
                  ? 'Review and verify documents'
                  : 'Review and verify client documents. Ensure all information is accurate before approval.'}
              </DialogDescription>
            </div>
            <div
              className={`flex items-center gap-3 ${isMobile ? 'self-start' : ''}`}
            >
              <div
                className={`${isMobile ? 'text-left' : 'text-left sm:text-right'}`}
              >
                <div
                  className={`text-muted-foreground font-medium ${isMobile ? 'text-xs' : 'text-xs'}`}
                >
                  Client
                </div>
                <div
                  className={`text-foreground font-semibold ${
                    isMobile ? 'max-w-[150px] truncate text-xs' : 'text-sm'
                  }`}
                >
                  {clientDetails.company?.name || 'Unknown Company'}
                </div>
              </div>
              <div
                className={`bg-primary/10 flex items-center justify-center rounded-full ${
                  isMobile ? 'h-6 w-6' : 'h-8 w-8'
                }`}
              >
                <Building
                  className={`text-primary ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        {documents.length === 0 ? (
          <div
            className={`border-muted-foreground/25 bg-muted/30 mx-4 my-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${
              isMobile ? 'py-6' : 'py-8 sm:mx-6 sm:py-12'
            }`}
          >
            <div className="bg-muted mb-4 rounded-full p-3">
              <FileText
                className={`text-muted-foreground ${isMobile ? 'h-5 w-5' : 'h-6 w-6 sm:h-8 sm:w-8'}`}
              />
            </div>
            <h3
              className={`text-foreground mb-2 font-bold ${
                isMobile ? 'text-sm' : 'text-base sm:text-lg'
              }`}
            >
              No Documents Found
            </h3>
            <p
              className={`text-muted-foreground max-w-sm text-center ${
                isMobile ? 'px-2 text-xs' : 'text-xs sm:text-sm'
              }`}
            >
              This client has not uploaded any documents yet. Documents will
              appear here once uploaded.
            </p>
          </div>
        ) : (
          <ScrollArea
            className={`${isMobile ? 'max-h-[65vh] px-3 py-3' : 'max-h-[60vh] px-6 py-4'}`}
          >
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              {documents.map((document: ISupportClientDocument) => (
                <div
                  key={document.id}
                  className="group border-border bg-card hover:border-border/60 relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  {/* Document Header */}
                  <div
                    className={`flex items-start justify-between ${
                      isMobile ? 'p-3' : 'p-4'
                    }`}
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <div
                        className={`from-primary/10 to-primary/5 shrink-0 rounded-lg bg-gradient-to-br ${
                          isMobile ? 'p-2' : 'p-3'
                        }`}
                      >
                        <FileText
                          className={`text-primary ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`}
                        />
                      </div>

                      <div className={`flex-1 space-y-${isMobile ? '2' : '3'}`}>
                        {/* Document Name and Status */}
                        <div
                          className={`flex items-center gap-2 ${
                            isMobile ? 'flex-col items-start' : 'gap-3'
                          }`}
                        >
                          <h3
                            className={`text-foreground font-bold ${
                              isMobile ? 'text-sm leading-tight' : 'text-base'
                            }`}
                          >
                            {document.name}
                          </h3>
                          <div className="shrink-0">
                            {renderStatusBadge(
                              document.status as VerificationStatus
                            )}
                          </div>
                        </div>

                        {/* Document Metadata and Actions */}
                        <div
                          className={`${
                            isMobile
                              ? 'flex flex-col gap-2'
                              : 'flex items-center justify-between'
                          }`}
                        >
                          {/* Document Metadata */}
                          <div
                            className={`${
                              isMobile
                                ? 'flex flex-col gap-1.5'
                                : 'grid grid-cols-1 gap-3 md:grid-cols-2'
                            }`}
                          >
                            <div
                              className={`text-muted-foreground flex items-center gap-1.5 ${
                                isMobile ? 'text-xs' : 'text-xs'
                              }`}
                            >
                              <FileText
                                className={`text-muted-foreground ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
                              />
                              <span className="font-medium">Type:</span>
                              <Badge
                                variant="secondary"
                                className={
                                  isMobile ? 'px-1 text-xs' : 'text-xs'
                                }
                              >
                                {formatEnumValue(document.type)}
                              </Badge>
                            </div>

                            <div
                              className={`text-muted-foreground flex items-center gap-1.5 ${
                                isMobile ? 'text-xs' : 'text-xs'
                              }`}
                            >
                              <Calendar
                                className={`text-muted-foreground ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
                              />
                              <span className="font-medium">Uploaded:</span>
                              <span className="text-foreground font-medium">
                                {new Date(
                                  document.createdAt
                                ).toLocaleDateString('en-US', {
                                  year: isMobile ? '2-digit' : 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div
                            className={`flex items-center gap-1.5 ${
                              isMobile ? 'flex-wrap' : 'gap-2'
                            }`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewDocument(document.id)}
                              disabled={isLoading}
                              className={`border-border bg-background text-foreground hover:bg-muted/50 flex items-center gap-1.5 font-medium ${
                                isMobile
                                  ? 'h-6 px-2 text-xs'
                                  : 'h-7 px-2 text-xs'
                              }`}
                              tooltip="Preview"
                            >
                              <Eye
                                className={isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}
                              />
                              {isMobile ? 'View' : 'Preview'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectDocument(document.id)}
                              disabled={
                                isLoading ||
                                document.status === VerificationStatus.REJECTED
                              }
                              className={`flex items-center gap-1.5 font-medium ${
                                isMobile
                                  ? 'h-6 px-2 text-xs'
                                  : 'h-7 px-2 text-xs'
                              }`}
                              tooltip="Reject"
                            >
                              <XCircle
                                className={isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}
                              />
                              Reject
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAcceptDocument(document.id)}
                              disabled={
                                isLoading ||
                                document.status === VerificationStatus.VERIFIED
                              }
                              className={`flex items-center gap-1.5 font-medium ${
                                isMobile
                                  ? 'h-6 px-2 text-xs'
                                  : 'h-7 px-2 text-xs'
                              }`}
                              tooltip="Accept"
                            >
                              <CheckCircle2
                                className={isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}
                              />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <Collapsible
                    open={expandedComments[document.id]}
                    onOpenChange={() => toggleCommentExpansion(document.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground w-full border-t font-medium ${
                          isMobile ? 'py-1.5 text-xs' : 'py-2 text-xs'
                        }`}
                      >
                        <Edit
                          className={`mr-1.5 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
                        />
                        {isMobile ? 'Comments' : 'Add Remarks'}
                        {expandedComments[document.id] ? (
                          <ChevronUp
                            className={`ml-1.5 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
                          />
                        ) : (
                          <ChevronDown
                            className={`ml-1.5 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
                          />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div
                        className={`border-border/50 bg-muted/30 border-t ${
                          isMobile ? 'p-3' : 'p-4'
                        }`}
                      >
                        <label
                          htmlFor={`comment-${document.id}`}
                          className={`text-foreground mb-2 block font-semibold ${
                            isMobile ? 'text-xs' : 'text-xs'
                          }`}
                        >
                          Verification Comments
                        </label>
                        <Textarea
                          id={`comment-${document.id}`}
                          placeholder="Add verification comments or feedback about this document..."
                          className={`border-border bg-background focus:border-primary focus:ring-primary resize-none ${
                            isMobile
                              ? 'min-h-[60px] text-xs'
                              : 'min-h-[80px] text-sm'
                          }`}
                          value={
                            documentComments[document.id] ||
                            document.remarks ||
                            ''
                          }
                          onChange={(e) =>
                            handleCommentChange(document.id, e.target.value)
                          }
                          disabled={
                            (document.status &&
                              document.status ===
                                VerificationStatus.VERIFIED) ||
                            isLoading
                          }
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter
          className={`border-border bg-muted/30 border-t ${
            isMobile ? 'px-3 py-3' : 'px-4 py-4 sm:px-6'
          }`}
        >
          <div
            className={`flex w-full gap-3 ${
              isMobile
                ? 'flex-col'
                : 'flex-col sm:flex-row sm:items-center sm:justify-between'
            }`}
          >
            <div
              className={`flex items-center ${isMobile ? 'justify-center gap-2' : 'gap-2 sm:gap-3'}`}
            >
              <div
                className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}
              >
                <span className="text-foreground font-semibold">
                  {documents.length}
                </span>{' '}
                document{documents.length !== 1 ? 's' : ''} to review
              </div>
              {!isMobile && <div className="bg-border h-3 w-px"></div>}
            </div>
            <div
              className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-col sm:flex-row sm:gap-2'}`}
            >
              <Button
                variant="destructive"
                onClick={handleRejectClient}
                disabled={
                  isLoading ||
                  documents.length === 0 ||
                  clientDetails.company?.status ===
                    ICompanyVerificationStatus.REJECTED
                }
                className={`border-destructive/20 hover:bg-destructive/10 flex items-center justify-center gap-1.5 font-medium ${
                  isMobile
                    ? 'h-8 w-full text-xs'
                    : 'h-9 w-full text-xs sm:h-8 sm:w-auto sm:px-3'
                }`}
              >
                <XCircle className={isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                Reject Company
              </Button>
              <Button
                onClick={handleVerifyClient}
                disabled={
                  isLoading ||
                  documents.length === 0 ||
                  clientDetails.company?.status ===
                    ICompanyVerificationStatus.VERIFIED ||
                  !allDocumentsAccepted
                }
                className={`flex items-center justify-center gap-1.5 font-medium ${
                  isMobile
                    ? 'h-8 w-full text-xs'
                    : 'h-9 w-full text-xs sm:h-8 sm:w-auto sm:px-3'
                }`}
              >
                <CheckCircle2
                  className={isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}
                />
                Verify Company
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
