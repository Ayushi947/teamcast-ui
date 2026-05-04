'use client';

import { FC, useState, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Plus,
  AlertCircle,
  File,
  FileImage,
  FileSpreadsheet,
  MessageSquare,
} from 'lucide-react';

import { logger, IClientProfile } from '@/lib/shared';
import { EntityType } from '@/lib/shared/models/domain/common/document.domain';

import {
  clientDocumentService,
  documentConfigService,
} from '@/lib/services/services';
import { ProfileFormSection } from '../../ui/profile-form-section';
import { getUser } from '@/lib/utils/auth-utils';
import { formatEnumValue, formatFileSize } from '@/lib/utils';
import { AddNewDocument } from './add-new-document';

interface DocumentManagementFormProps {
  clientProfile: IClientProfile;
  onNavigateToLocation?: () => void;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return FileText;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return FileImage;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return FileSpreadsheet;
    default:
      return File;
  }
};

const MediaPreview: FC<{
  previewUrl: string;
  isLoading?: boolean;
  error?: string | null;
}> = ({ previewUrl, isLoading, error }) => {
  const isPdf = useMemo(() => {
    return previewUrl?.toLowerCase().includes('.pdf');
  }, [previewUrl]);

  if (isLoading) {
    return (
      <div className="bg-muted flex h-full w-full items-center justify-center rounded-md">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground mt-4 text-sm">
            Loading preview...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-muted flex h-full w-full items-center justify-center rounded-md">
        <div className="p-8 text-center">
          <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">Error Loading Preview</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!previewUrl) return null;

  return (
    <div className="flex h-full w-full items-center justify-center rounded-md">
      {isPdf ? (
        <iframe
          src={previewUrl}
          title="PDF Preview"
          className="h-full w-full rounded-md border-0"
        />
      ) : (
        <img
          src={previewUrl}
          alt="Document Preview"
          className="max-h-full max-w-full rounded-md object-contain shadow-lg"
        />
      )}
    </div>
  );
};

export const DocumentManagementForm: FC<DocumentManagementFormProps> = ({
  clientProfile,
  onNavigateToLocation,
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [previewDocument, setPreviewDocument] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const user = getUser();
  const clientId = user?.clientId;

  const country = clientProfile?.address.country?.toLowerCase();
  const { data: requiredDocumentTypesData } = useQuery({
    queryKey: ['requiredDocumentTypes', country],
    queryFn: () => documentConfigService.getDocumentsByCountry(country || ''),
    enabled: !!country,
  });

  const submittedTypes = clientProfile?.documents?.map((doc) => doc.type) || [];

  let requiredDocumentTypes: {
    value: string;
    label: string;
    required: boolean;
    isDocumentTypesAvailable: boolean;
  }[] = [];

  if (!requiredDocumentTypesData || requiredDocumentTypesData.length === 0) {
    requiredDocumentTypes = [
      {
        value: 'NO_DOCUMENT_TYPE',
        label: 'No document type available',
        required: false,
        isDocumentTypesAvailable: false,
      },
    ];
  } else if (
    requiredDocumentTypesData &&
    requiredDocumentTypesData.length > 0
  ) {
    const remainingTypes = requiredDocumentTypesData.filter(
      (doc) => !submittedTypes.includes(doc.type || '')
    );

    if (remainingTypes.length > 0) {
      requiredDocumentTypes = remainingTypes.map((document) => ({
        value: document.type || '',
        label: document.name,
        required: document.required,
        isDocumentTypesAvailable: true,
      }));
    } else {
      requiredDocumentTypes = [
        {
          value: 'ALL_SUBMITTED',
          label: 'All required document types submitted',
          required: false,
          isDocumentTypesAvailable: false,
        },
      ];
    }
  }

  const documents = clientProfile?.documents || [];
  const isDocumentsLoading = false;

  const handlePreview = async (documentId: string, documentName: string) => {
    if (!clientId) {
      toast.error('Client ID not found');
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewDocument({ id: documentId, name: documentName });

      // Call the preview API to get a pre-signed preview URL
      const response = await clientDocumentService.getDocumentPreview({
        entityType: EntityType.CLIENT,
        entityId: clientId,
        documentId,
      });
      setPreviewUrl(response.downloadUrl);
    } catch (error) {
      logger.error('Error getting preview URL:', error);
      setPreviewError('Failed to load document preview');
      toast.error('Failed to preview document');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (documentId: string, documentName: string) => {
    if (!clientId) {
      toast.error('Client ID not found');
      return;
    }

    try {
      // Call the download API to get a pre-signed download URL
      const response = await clientDocumentService.getDocumentPreview({
        entityType: EntityType.CLIENT,
        entityId: clientId,
        documentId,
      });
      const downloadUrl = response.downloadUrl;

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = documentName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    } catch (error) {
      logger.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      if (!clientId) {
        throw new Error('Client ID not available');
      }
      try {
        const response = await clientDocumentService.deleteClientDocument(
          clientId,
          documentId
        );

        return response;
      } catch (error) {
        logger.error('Error deleting document:', error);
        throw error;
      }
    },
    onSuccess: () => {
      logger.info('Document deleted successfully');
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      logger.error('Error deleting document:', error);
      if (!(error instanceof Error) || error.message !== 'No data received') {
        toast.error('Failed to delete document');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['clientProfile'],
      });
      setDeleteConfirm(null);
    },
  });

  const handleDelete = (documentId: string) => {
    deleteDocumentMutation.mutate(documentId);
  };

  const closePreview = () => {
    setPreviewDocument(null);
    setPreviewUrl('');
    setPreviewError(null);
    setPreviewLoading(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'VERIFIED':
        return 'success';
      case 'UNVERIFIED':
        return 'info';
      case 'REJECTED':
        return 'destructive';
    }
  };

  const renderRejectionInfo = (document: any) => {
    if (document.status !== 'REJECTED' || !document.remarks) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-3 overflow-hidden"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-start gap-2">
            <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <span className="font-bold">Reason:</span> {document.remarks}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div>
      <form className="space-y-6">
        <ProfileFormSection
          title="Document Management"
          description="Upload and manage your company documents"
          className="dark:bg-accent"
          icon={FileText}
          headerAction={
            <button
              type="button"
              onClick={() => setIsUploadDialogOpen(true)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </button>
          }
        >
          <div className="space-y-4">
            <AnimatePresence>
              {isDocumentsLoading ? (
                <div className="flex items-center justify-center py-12 text-center">
                  <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <FileText className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Loading documents...
                  </h3>
                </div>
              ) : documents.length > 0 ? (
                documents.map((document) => {
                  const IconComponent = getFileIcon(document.name);

                  return (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="group bg-card relative overflow-hidden rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-4">
                              <h4 className="text-foreground font-semibold">
                                {document.name}
                              </h4>
                              <Badge
                                variant={getStatusVariant(
                                  document.status || ''
                                )}
                                className="text-xs"
                              >
                                {formatEnumValue(document.status || '')}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {formatEnumValue(document.type)
                                  .split('_')
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(' ')}
                              </Badge>
                              <span>•</span>
                              <span>{formatFileSize(document.size)}</span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  document.uploadedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(document.id, document.name);
                            }}
                            className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            title="Preview document"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(document.id, document.name);
                            }}
                            className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(document.id);
                            }}
                            className="inline-flex items-center rounded border border-red-300 bg-white px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Rejection Information - Only shown for rejected documents */}
                      {renderRejectionInfo(document)}
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <FileText className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    No documents uploaded
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your company documents to keep them organized and
                    accessible.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Your First Document
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </ProfileFormSection>
      </form>

      {/* Add New Document Dialog */}
      <AddNewDocument
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        requiredDocumentTypes={requiredDocumentTypes}
        clientId={clientId || ''}
        hasLocation={!!country}
        onNavigateToLocation={onNavigateToLocation}
      />

      {/* Preview Dialog */}
      <Dialog
        open={!!previewDocument}
        onOpenChange={(open) => {
          if (!open) {
            closePreview();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle>
                Document Preview - {previewDocument?.name || 'Loading...'}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="h-[70vh] w-full overflow-auto p-1">
            <MediaPreview
              previewUrl={previewUrl}
              isLoading={previewLoading}
              error={previewError}
            />
          </div>
          <DialogFooter className="bg-muted/30 border-t px-6 py-4">
            <button
              type="button"
              onClick={closePreview}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {previewUrl && !previewLoading && !previewError && (
              <button
                type="button"
                onClick={() => window.open(previewUrl, '_blank')}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Eye className="mr-2 h-4 w-4" />
                Open in New Tab
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteDocumentMutation.isPending}
              className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteDocumentMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Document
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
