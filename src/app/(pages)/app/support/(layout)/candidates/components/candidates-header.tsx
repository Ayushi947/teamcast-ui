'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, FileSpreadsheet } from 'lucide-react';
import { UploadExcelDialog } from './upload-excel-dialog';
import { useApp } from '@/lib/context/app-context';
import { UserTypeEnum, UserRoleEnum } from '@/lib/shared';

interface CandidatesHeaderProps {
  onInviteClick: () => void;
  onUploadSuccess?: () => void;
}

export function CandidatesHeader({
  onInviteClick,
  onUploadSuccess,
}: CandidatesHeaderProps) {
  const { user } = useApp();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const isSupportAdmin =
    user?.type === UserTypeEnum.SUPPORT && user?.role === UserRoleEnum.ADMIN;

  const handleUploadClick = () => {
    setIsUploadDialogOpen(true);
  };

  const handleUploadClose = () => {
    setIsUploadDialogOpen(false);
  };

  const handleUploadSuccess = () => {
    onUploadSuccess?.();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary text-2xl font-bold tracking-tight">
            Candidate Management
          </h1>
          <p className="text-muted-foreground">
            Manage candidates and send invites to join the platform
          </p>
        </div>
        <div className="flex gap-3">
          {isSupportAdmin && (
            <Button
              onClick={handleUploadClick}
              size="default"
              variant="default"
              className="rounded-md"
            >
              <FileSpreadsheet className="mr-2 mb-1 h-3.5 w-3.5" />
              Upload Excel
            </Button>
          )}
          <Button onClick={onInviteClick} size="default" className="rounded-md">
            <PlusIcon className="mr-2 h-3.5 w-3.5" />
            Candidate
          </Button>
        </div>
      </div>

      <UploadExcelDialog
        isOpen={isUploadDialogOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
