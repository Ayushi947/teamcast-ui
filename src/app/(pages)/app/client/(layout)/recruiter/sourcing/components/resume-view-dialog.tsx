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
import { IJobPostingRecommendation } from '@/lib/shared';

interface ResumeViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: IJobPostingRecommendation['candidate'] | null;
  viewUrl: string | null;
  isLoading?: boolean;
}

export const ResumeViewDialog: React.FC<ResumeViewDialogProps> = ({
  isOpen,
  onClose,
  candidate,
  viewUrl,
  isLoading = false,
}) => {
  const handleOpenInNewTab = () => {
    if (viewUrl) {
      window.open(viewUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {candidate?.name ? `${candidate.name}'s Resume` : 'Resume View'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {viewUrl && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInNewTab}
                    className="mr-5 h-8 px-3"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Open in New Tab
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-sm text-gray-500">Loading resume...</p>
              </div>
            </div>
          ) : viewUrl ? (
            <iframe
              src={viewUrl}
              className="h-full w-full rounded-md border-0"
              title={`${candidate?.name || 'Candidate'}'s Resume`}
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
};
