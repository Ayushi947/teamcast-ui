'use client';

import { Button } from '@/components/ui/button';
import { UserRoleEnum } from '@/lib/shared';
import { PlusIcon } from 'lucide-react';

interface UsersHeaderProps {
  onInviteClick?: () => void;
  userRole: string;
  canInviteUsers: boolean;
}

export function UsersHeader({
  onInviteClick,
  userRole,
  canInviteUsers,
}: UsersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-shrink-0">
        <div className="backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-primary text-2xl font-bold">
                User Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage users and control access to your organization
              </p>
            </div>
          </div>
        </div>
      </div>
      {onInviteClick &&
        (userRole === UserRoleEnum.ADMIN || userRole === UserRoleEnum.HR) && (
          <Button onClick={onInviteClick} disabled={!canInviteUsers}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        )}
    </div>
  );
}
