'use client';

import { Button } from '@/components/ui/button';
import { UserPlusIcon } from 'lucide-react';

interface UsersHeaderProps {
  onInviteClick: () => void;
}

export function UsersHeader({ onInviteClick }: UsersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage users and send invites to your organization
        </p>
      </div>
      <Button onClick={onInviteClick}>
        <UserPlusIcon className="mr-2 h-4 w-4" />
        Invite User
      </Button>
    </div>
  );
}
