'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon, BotIcon } from 'lucide-react';

interface McpClientsHeaderProps {
  onCreateClick: () => void;
}

export function McpClientsHeader({ onCreateClick }: McpClientsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <BotIcon className="text-primary h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            MCP Integrations
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage AI agent integrations using the Model Context Protocol
          </p>
        </div>
      </div>
      <Button onClick={onCreateClick}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Create MCP Client
      </Button>
    </div>
  );
}
