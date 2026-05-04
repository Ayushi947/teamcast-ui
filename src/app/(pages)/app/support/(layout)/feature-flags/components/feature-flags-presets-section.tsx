'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Layers, Plus } from 'lucide-react';
import {
  featureFlagService,
  supportClientManagementService,
} from '@/lib/services/services';
import type { ISupportClient } from '@/lib/shared';
import { CreatePresetDialog } from './create-preset-dialog';
import { ApplyPresetDialog } from './apply-preset-dialog';

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
  return `Client ${client.id.slice(0, 8)}`;
}

interface FeatureFlagsPresetsSectionProps {
  onApplySuccess?: () => void;
  /** When true, hide the section heading (e.g. when embedded in a dialog that has its own title) */
  hideHeading?: boolean;
}

export function FeatureFlagsPresetsSection({
  onApplySuccess,
  hideHeading = false,
}: FeatureFlagsPresetsSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const { data: presets = [], refetch: refetchPresets } = useQuery({
    queryKey: ['featureFlagPresets'],
    queryFn: () => featureFlagService.listPresets(),
  });

  const { data: clientsResponse } = useQuery({
    queryKey: ['supportClientsForPresets', isApplyOpen],
    queryFn: async () => {
      return await supportClientManagementService.listSupportClients({
        page: 1,
        limit: 500,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    },
    enabled: isApplyOpen,
  });

  const clients = useMemo(
    () => clientsResponse?.items ?? [],
    [clientsResponse?.items]
  );

  const handleCreateSuccess = () => {
    refetchPresets();
    setIsCreateOpen(false);
  };

  const handleApplySuccess = () => {
    onApplySuccess?.();
    setIsApplyOpen(false);
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      {!hideHeading && (
        <>
          <h2 className="mb-3 text-lg font-semibold">Templates / presets</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Save a set of flags as a preset (e.g. &quot;Proctoring strict&quot;)
            and apply it to a new client.
          </p>
        </>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create preset
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsApplyOpen(true)}
          disabled={presets.length === 0}
        >
          <Layers className="mr-2 h-4 w-4" />
          Apply preset to client
        </Button>
      </div>
      {presets.length > 0 && (
        <ul className="text-muted-foreground mt-3 list-disc pl-5 text-sm">
          {presets.map((p) => (
            <li key={p.id}>
              {p.name}
              {p.description && ` — ${p.description}`} (
              {p.flagConfigs?.length ?? 0} flags)
            </li>
          ))}
        </ul>
      )}

      <CreatePresetDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreateSuccess}
      />
      <ApplyPresetDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        presets={presets}
        clients={clients}
        getClientName={getClientName}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
}
