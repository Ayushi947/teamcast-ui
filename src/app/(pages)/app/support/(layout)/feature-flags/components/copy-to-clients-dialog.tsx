'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import type { IFeatureFlag } from '@/lib/shared';
import type { ISupportClient } from '@/lib/shared';
import {
  featureFlagService,
  supportClientManagementService,
} from '@/lib/services/services';

const CLIENT_NAME_FALLBACK_PREFIX = 'Client';

function getClientName(client: ISupportClient): string {
  if (client.company?.name?.trim()) return client.company.name.trim();
  const listCompanyName = (client as unknown as { companyName?: string })
    .companyName;
  if (
    typeof listCompanyName === 'string' &&
    listCompanyName.trim().length > 0
  ) {
    return listCompanyName.trim();
  }
  return `${CLIENT_NAME_FALLBACK_PREFIX} ${client.id.slice(0, 8)}`;
}

interface CopyToClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: IFeatureFlag | null;
  onSuccess?: () => void;
}

export function CopyToClientsDialog({
  open,
  onOpenChange,
  flag,
  onSuccess,
}: CopyToClientsDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clientsResponse } = useQuery({
    queryKey: ['supportClientsForCopyFlag', open],
    queryFn: async () => {
      return await supportClientManagementService.listSupportClients({
        page: 1,
        limit: 500,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    },
    enabled: open,
  });

  const clients = useMemo(
    () => clientsResponse?.items ?? [],
    [clientsResponse?.items]
  );

  const toggleClient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)));
    }
  };

  const handleSubmit = async () => {
    if (!flag || selectedIds.size === 0) {
      toast.error('Select at least one client');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await featureFlagService.copyFeatureFlagToClients(
        flag.id,
        Array.from(selectedIds)
      );
      const created = result.created?.length ?? 0;
      const skipped = result.skipped?.length ?? 0;
      if (created > 0) {
        toast.success(
          `Copied to ${created} client${created !== 1 ? 's' : ''}${
            skipped > 0 ? ` (${skipped} already had this flag)` : ''
          }`
        );
      }
      if (created === 0 && skipped > 0) {
        toast.info('All selected clients already have this flag');
      }
      setSelectedIds(new Set());
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to copy flag to clients');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedIds(new Set());
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copy flag to clients</DialogTitle>
          <DialogDescription>
            {flag ? (
              <>
                Copy &quot;<span className="font-medium">{flag.name}</span>
                &quot; (global) to selected clients as client-specific
                overrides.
              </>
            ) : (
              'Select clients to copy this flag to.'
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              {selectedIds.size === clients.length
                ? 'Deselect all'
                : 'Select all'}
            </Button>
            <span className="text-muted-foreground text-sm">
              {selectedIds.size} of {clients.length} selected
            </span>
          </div>
          <ScrollArea className="h-[240px] rounded-md border p-2">
            <div className="space-y-2">
              {clients.map((client) => (
                <label
                  key={client.id}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5"
                >
                  <Checkbox
                    checked={selectedIds.has(client.id)}
                    onCheckedChange={() => toggleClient(client.id)}
                  />
                  <span className="text-sm">{getClientName(client)}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {client.id.slice(0, 8)}…
                  </span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedIds.size === 0}
          >
            {isSubmitting ? 'Copying…' : 'Copy to selected clients'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
