'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileSpreadsheet, X } from 'lucide-react';
import UploadIcon from '@/components/icons/UploadIcon';
import { toast } from 'sonner';
import { CandidateImportApiService } from '@/lib/shared/services/client/candidate.import.api.service';
import { apiClient } from '@/lib/api-client';
import UploadExcelIcon from '@/components/icons/UploadExcelIcon';

interface UploadCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobPostingId: string;
  onUploadSuccess?: () => void;
}

export function UploadCandidateModal({
  isOpen,
  onClose,
  jobPostingId,
  onUploadSuccess,
}: UploadCandidateModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const candidateImportService = new CandidateImportApiService(apiClient);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      // Download the template file from public folder
      const response = await fetch(
        '/candidate_import_template/external_jobboard_candidates_sample.xlsx'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'candidate_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully!');
    } catch (error) {
      toast.error(
        `Failed to download template: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Validate file type
    if (
      !file.name.endsWith('.xlsx') &&
      !file.name.endsWith('.xls') &&
      !file.name.endsWith('.csv')
    ) {
      toast.error('Please select an Excel or CSV file (.xlsx or .xls or .csv)');
      return false;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
    },
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      await candidateImportService.uploadCandidates(jobPostingId, selectedFile);

      toast.success('Upload successful! candidates imported.');

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();

      // Call the success callback to trigger parent component updates
      onUploadSuccess?.();
    } catch (error) {
      toast.error(
        `Failed to upload candidates: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-xl">
        <DialogHeader className="pb-6 text-center">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex-1 text-center text-2xl font-bold text-gray-900">
              Import Candidates
            </DialogTitle>
          </div>
          <DialogDescription
            className="mt-2 text-center text-base font-bold"
            style={{ color: '#BEBEBE' }}
          >
            Import candidates from your existing Job board or ATS applications
            exported csv or excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions Section */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
            <p className="mb-4 text-center text-sm text-gray-700">
              Before importing, ensure the Excel or CSV file contains the
              following fields: &ldquo;Full Name&rdquo; or &ldquo;Name&rdquo;,
              &ldquo;Email&rdquo;, &ldquo;Location&rdquo;, and &ldquo;Mobile
              No&rdquo;.
            </p>
            <div className="text-center">
              <p className="mb-0 text-lg font-semibold text-gray-900">OR</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-bold text-gray-700">
                  Download a sample Excel file to fill in the data here.
                </span>
                <Button
                  onClick={handleDownloadTemplate}
                  disabled={isDownloading}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-sm text-purple-600 hover:bg-purple-50"
                >
                  <UploadExcelIcon />
                  <span className="font-bold text-black">
                    {isDownloading ? 'Downloading...' : 'Sample Sheet'}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-purple-400 bg-purple-50/80'
                : 'border-rgba(0, 0, 0, 0.50)'
            } ${selectedFile ? 'border-green-300 bg-green-50/50' : ''} `}
            style={{
              backgroundColor: selectedFile ? undefined : '#F2F0F8',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="space-y-4">
                <div className="mx-auto flex items-center justify-center">
                  <UploadIcon />
                </div>
                <div className="space-y-2">
                  <p className="text-md text-gray-600">
                    Drag and drop Excel or CSV file or click to select max size
                    10 MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 rounded-lg border border-green-200 bg-white p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-red-100"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Import Button */}
          <div className="text-center">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-1/2 rounded-full bg-purple-600 px-12 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              size="lg"
            >
              {isUploading ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
