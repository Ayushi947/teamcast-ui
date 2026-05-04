import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { useForm } from 'react-hook-form';
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientDocumentService } from '@/lib/services/services';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils';
import {
  Upload,
  X,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  CheckCircle,
  AlertTriangle,
  Cloud,
  MapPin,
} from 'lucide-react';

const documentUploadSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.string().min(1, 'Document type is required'),
});

type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

interface AddNewDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  requiredDocumentTypes: {
    value: string;
    label: string;
    required: boolean;
    isDocumentTypesAvailable: boolean;
  }[];
  hasLocation?: boolean;
  onNavigateToLocation?: () => void;
}

// File type configurations
const ALLOWED_FILE_TYPES = [
  '.pdf',
  '.doc',
  '.docx',
  '.jpg',
  '.jpeg',
  '.png',
  '.xls',
  '.xlsx',
  '.txt',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getFileIcon = (fileName: string) => {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
      return <FileText className="h-8 w-8 text-blue-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <Image className="h-8 w-8 text-green-500" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="h-8 w-8 text-emerald-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};

export const AddNewDocument = ({
  isOpen,
  onClose,
  clientId,
  requiredDocumentTypes,
  hasLocation = true,
  onNavigateToLocation,
}: AddNewDocumentProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string>('');

  const form = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      name: '',
      type: '',
    },
  });

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    // Check file type
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      return `File type not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`;
    }

    return null;
  };

  const handleFileSelection = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      toast.error(error);
      return;
    }

    setFileError('');
    setSelectedFile(file);

    // Auto-populate document name with file name (without extension)
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
    form.setValue('name', nameWithoutExtension);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelection(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFileError('');
    form.setValue('name', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = (data: DocumentUploadFormData) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!clientId) {
      toast.error('Client ID not found. Please log in again.');
      return;
    }
    uploadDocumentMutation.mutate(data);
  };

  // Upload document mutation with progress simulation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: DocumentUploadFormData) => {
      if (!selectedFile || !clientId) {
        throw new Error('File or client ID not available');
      }

      const request = {
        file: selectedFile,
        name: formData.name,
        documentType: formData.type,
      };

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await clientDocumentService.uploadClientDocument(
        clientId,
        request
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      logger.info('Upload response:', response);
      return response;
    },
    onSuccess: () => {
      logger.info('Upload successful, invalidating queries');
      queryClient.invalidateQueries({
        queryKey: ['clientProfile'],
      });
      toast.success('Document uploaded successfully');

      // Reset form and close dialog after a brief delay to show completion
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setUploadProgress(0);
        setFileError('');
        form.reset();
      }, 1000);
    },
    onError: (error) => {
      logger.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      setUploadProgress(0);
    },
  });

  const handleClose = () => {
    if (!uploadDocumentMutation.isPending) {
      onClose();
      setSelectedFile(null);
      setUploadProgress(0);
      setFileError('');
      form.reset();
    }
  };

  const hasAvailableDocumentTypes =
    requiredDocumentTypes?.length > 0 &&
    requiredDocumentTypes.some(
      (type) =>
        type.isDocumentTypesAvailable &&
        type.value !== 'NO_DOCUMENT_TYPE' &&
        type.value !== 'ALL_SUBMITTED'
    );

  const isLocationMissing = !hasLocation;
  const isDocumentTypesNotConfigured =
    hasLocation && !hasAvailableDocumentTypes;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload a new document to your company profile. Drag and drop or
            click to select a file.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpload)}
            className="space-y-4"
          >
            <div className="grid gap-4">
              {isLocationMissing ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <div className="flex-1">
                      <h4 className="mb-1 text-sm font-semibold text-orange-900 dark:text-orange-100">
                        Location Required
                      </h4>
                      <p className="mb-3 text-sm text-orange-800 dark:text-orange-200">
                        Please set your company location to view available
                        document types. Document types are determined based on
                        your company&apos;s country.
                      </p>
                      {onNavigateToLocation && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToLocation();
                          }}
                          className="inline-flex items-center rounded-md border border-orange-600 bg-white px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Go to Location Settings
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : isDocumentTypesNotConfigured ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <h4 className="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Document Types Not Configured
                      </h4>
                      <p className="mb-3 text-sm text-blue-800 dark:text-blue-200">
                        Document types have not been configured for your country
                        yet. Please contact support to set up document types for
                        your location, or check back later.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={uploadDocumentMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {requiredDocumentTypes?.map((type) => (
                            <SelectItem
                              key={type.value}
                              value={type.value || ''}
                              disabled={!type.isDocumentTypesAvailable}
                            >
                              <div className="flex w-full items-center justify-between gap-4">
                                <span className="flex-1">{type.label}</span>
                                {type.required && (
                                  <Badge
                                    variant="outline"
                                    className="ml-auto border-orange-600 text-orange-600"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Enhanced File Upload Area */}
              {!isLocationMissing && !isDocumentTypesNotConfigured && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Choose File</label>

                  {!selectedFile ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ${
                        isDragOver
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                      } `}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                      <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        {ALLOWED_FILE_TYPES.join(', ')} up to{' '}
                        {formatFileSize(MAX_FILE_SIZE)}
                      </p>

                      <Input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept={ALLOWED_FILE_TYPES.join(',')}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(selectedFile.name)}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {uploadDocumentMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                              <span className="text-xs text-blue-600">
                                {uploadProgress}%
                              </span>
                            </div>
                          ) : uploadProgress === 100 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <button
                              type="button"
                              onClick={removeSelectedFile}
                              disabled={uploadDocumentMutation.isPending}
                              className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Upload Progress Bar */}
                      {uploadDocumentMutation.isPending && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3"
                        >
                          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <motion.div
                              className="h-1.5 rounded-full bg-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* File Error Display */}
                  <AnimatePresence>
                    {fileError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-sm text-red-600"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {fileError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {!isLocationMissing && !isDocumentTypesNotConfigured && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter document name"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={uploadDocumentMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={uploadDocumentMutation.isPending}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLocationMissing || isDocumentTypesNotConfigured
                  ? 'Close'
                  : 'Cancel'}
              </button>
              {!isLocationMissing && !isDocumentTypesNotConfigured && (
                <button
                  type="submit"
                  disabled={
                    !selectedFile ||
                    !form.getValues('type') ||
                    !form.getValues('name') ||
                    uploadDocumentMutation.isPending ||
                    !!fileError
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadDocumentMutation.isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                      />
                      Uploading... ({uploadProgress}%)
                    </>
                  ) : uploadProgress === 100 ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Uploaded!
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
