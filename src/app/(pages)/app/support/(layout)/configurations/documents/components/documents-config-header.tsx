'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface DocumentsHeaderProps {
  onInviteClick: () => void;
}

export function DocumentsHeader({ onInviteClick }: DocumentsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          Document Management
        </h1>
        <p className="text-muted-foreground">
          Manage documents for the platform
        </p>
      </div>
      <Button
        onClick={onInviteClick}
        className="rounded-md"
        tooltip="Add Country Specific Documents"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Add Country
      </Button>
    </div>
  );
}
