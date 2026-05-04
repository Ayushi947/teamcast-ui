'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Upload, File, FileText, FileImage, AlertCircle } from 'lucide-react';
import { getUser } from '@/lib/utils/auth-utils';
import {
  clientDocumentService,
  documentConfigService,
} from '@/lib/services/services';
import { IDocumentConfig, logger } from '@/lib/shared';

// Form schema
const documentUploadSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.string().min(1, 'Document type is required'),
});

type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

interface DocumentUploadFormProps {
  onSuccess?: () => void;
  isEditing?: boolean;
  country: string;
}

interface DocumentConfigResponse extends IDocumentConfig {
  id: string;
  doc_type: string;
  doc_name: string;
}

export const DocumentUploadForm: FC<DocumentUploadFormProps> = ({
  onSuccess,
  isEditing = true,
  country,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const user = getUser();
  const clientId = user?.clientId || '';

  const form = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),

    defaultValues: {
      name: '',
      type: '',
    },
  });
  const { data: requiredDocuments } = useQuery({
    queryKey: ['requiredDocuments', country],
    queryFn: async () => {
      const response =
        await documentConfigService.getDocumentsByCountry(country);
      return response;
    },
  });
  // Fixed Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: { file: File; name: string; type: string }) => {
      if (!clientId) {
        throw new Error('Client ID not available');
      }

      try {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('name', data.name);
        formData.append('documentType', data.type);

        const response = await clientDocumentService.uploadClientDocument(
          clientId,
          {
            file: data.file,
            documentType: data.type,
          }
        );

        return response;
      } catch (error) {
        logger.error('Upload error details:', error);

        // More detailed error handling
        if (error instanceof Error) {
          throw new Error(`Upload failed: ${error.message}`);
        }

        if (typeof error === 'object' && error !== null) {
          const errorObj = error as any;
          if (errorObj.response?.data?.message) {
            throw new Error(`Upload failed: ${errorObj.response.data.message}`);
          }
          if (errorObj.response?.status) {
            throw new Error(
              `Upload failed with status ${errorObj.response.status}`
            );
          }
        }

        throw new Error('Upload failed with unknown error');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      queryClient.invalidateQueries({ queryKey: ['clientDocuments'] });
      toast.success('Document uploaded successfully');
      form.reset();
      setSelectedFile(null);
      setFileError(null);
      onSuccess?.();
    },
    onError: (error) => {
      logger.error('Upload mutation error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload document';
      toast.error(errorMessage);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      // Check file size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        setFileError('File size exceeds 15MB limit');
        return;
      }

      // Validate file type
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ];

      if (!validTypes.includes(file.type)) {
        setFileError(
          'Invalid file type. Please upload a PDF, image, or document file'
        );
        return;
      }

      setSelectedFile(file);
      // Auto-populate name field with filename (without extension)
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      form.setValue('name', nameWithoutExtension);
    }
  };

  const onSubmit = async (data: DocumentUploadFormData) => {
    if (!selectedFile) {
      setFileError('Please select a file to upload');
      return;
    }

    if (!clientId) {
      toast.error('Client ID not found. Please log in again.');
      return;
    }

    if (!data.name.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    if (!data.type) {
      toast.error('Please select a document type');
      return;
    }

    // Clear any previous file errors
    setFileError(null);

    try {
      await uploadDocumentMutation.mutateAsync({
        file: selectedFile,
        name: data.name.trim(),
        type: data.type,
      });
    } catch (error) {
      // Error is already handled in the mutation's onError callback
      logger.error('Submit error:', error);
    }
  };

  // Helper function to get the appropriate icon for a file type
  const getFileIcon = (file: File | null) => {
    if (!file) return <File className="h-8 w-8 text-gray-400" />;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (
      ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')
    ) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileText className="h-8 w-8 text-orange-500" />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
      return <FileText className="h-8 w-8 text-green-500" />;
    }

    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <Form {...form}>
      <form
        id="document-upload-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* File Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-600" />
              Upload File
            </FormLabel>
            {selectedFile && (
              <p className="text-muted-foreground text-xs">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6">
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                {getFileIcon(selectedFile)}
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileError(null);
                    form.setValue('name', '');
                  }}
                  disabled={uploadDocumentMutation.isPending}
                >
                  Change File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-muted-foreground text-center text-sm">
                  Drag and drop a file here or click to browse
                </p>
                <div className="relative inline-block">
                  <input
                    id="file-upload"
                    type="file"
                    className="absolute top-0 left-0 z-50 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    disabled={!isEditing || uploadDocumentMutation.isPending}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.csv"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!isEditing || uploadDocumentMutation.isPending}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            )}
          </div>

          {fileError && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              {fileError}
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Document Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Document Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isEditing || uploadDocumentMutation.isPending}
                    placeholder="Enter document name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Document Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <File className="h-4 w-4 text-green-600" />
                  Document Type
                </FormLabel>
                <Select
                  disabled={!isEditing || uploadDocumentMutation.isPending}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  {Array.isArray(requiredDocuments) &&
                  requiredDocuments.length > 0 ? (
                    <SelectContent>
                      {(requiredDocuments as DocumentConfigResponse[]).map(
                        (document) => (
                          <SelectItem
                            key={document.id}
                            value={document.doc_type}
                            disabled={!document.id}
                          >
                            {document.doc_name ??
                              document.doc_type ??
                              'Unknown Type'}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  ) : (
                    <SelectContent>
                      <SelectItem value="no_documents_available" disabled>
                        No document required yet available
                      </SelectItem>
                    </SelectContent>
                  )}
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={uploadDocumentMutation.isPending || !selectedFile}
            >
              {uploadDocumentMutation.isPending
                ? 'Uploading...'
                : 'Upload Document'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
