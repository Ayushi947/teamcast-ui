'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface ClientsHeaderProps {
  onInviteClick: () => void;
}

export function ClientsHeader({ onInviteClick }: ClientsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          Client Management
        </h1>
        <p className="text-muted-foreground">
          Manage clients and send invites to join the platform
        </p>
      </div>
      <Button onClick={onInviteClick} size="default" className="rounded-md">
        <PlusIcon className="mr-2 h-3.5 w-3.5" />
        Client
      </Button>
    </div>
  );
}
