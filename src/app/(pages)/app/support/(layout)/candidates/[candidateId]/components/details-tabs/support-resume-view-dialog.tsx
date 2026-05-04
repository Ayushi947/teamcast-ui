'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface SupportResumeViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName?: string;
  viewUrl: string | null;
  isLoading?: boolean;
}

export function SupportResumeViewDialog({
  isOpen,
  onOpenChange,
  candidateName,
  viewUrl,
  isLoading = false,
}: SupportResumeViewDialogProps) {
  const handleOpenInNewTab = () => {
    if (viewUrl) {
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {candidateName ? `${candidateName}'s Resume` : 'Resume View'}
            </DialogTitle>
            {viewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="h-8 px-3"
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                Open in New Tab
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2" />
                <p className="text-sm text-gray-500">Loading resume...</p>
              </div>
            </div>
          ) : viewUrl ? (
            <iframe
              src={viewUrl}
              className="h-full w-full rounded-md border-0"
              title={`${candidateName || 'Candidate'}'s Resume`}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500">Resume not available</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
