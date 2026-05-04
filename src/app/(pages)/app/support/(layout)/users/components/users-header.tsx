'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface UsersHeaderProps {
  onInviteClick: () => void;
}

export function UsersHeader({ onInviteClick }: UsersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-primary text-2xl font-semibold tracking-tight">
          Support User Management
        </h1>
        <p className="text-muted-foreground">
          Manage support users and control access to the support organization
        </p>
      </div>
      <Button onClick={onInviteClick} size="default" className="rounded-md">
        <PlusIcon className="mr-2 h-3.5 w-3.5" />
        Support User
      </Button>
    </div>
  );
}
