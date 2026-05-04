'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  featureFlagService,
  supportClientManagementService,
} from '@/lib/services/services';
import type { ISupportClient } from '@/lib/shared';

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

export function FeatureFlagsDiffView() {
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const { data: clientsResponse } = useQuery({
    queryKey: ['supportClientsForDiff', true],
    queryFn: async () => {
      return await supportClientManagementService.listSupportClients({
        page: 1,
        limit: 500,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    },
  });

  const clients = useMemo(
    () => clientsResponse?.items ?? [],
    [clientsResponse?.items]
  );

  const { data: diff, isLoading } = useQuery({
    queryKey: ['featureFlagDiff', selectedClientId],
    queryFn: () => featureFlagService.getFeatureFlagDiff(selectedClientId),
    enabled: !!selectedClientId,
  });

  const rows = useMemo(() => {
    if (!diff) return [];
    const globalByKey = new Map(diff.global.map((f) => [f.key, f]));
    const overrideByKey = new Map(diff.clientOverrides.map((f) => [f.key, f]));
    const allKeys = new Set([...globalByKey.keys(), ...overrideByKey.keys()]);
    return Array.from(allKeys).map((key) => {
      const global = globalByKey.get(key);
      const override = overrideByKey.get(key);
      return {
        key,
        name: (override ?? global)?.name ?? key,
        category: (override ?? global)?.category ?? '—',
        globalEnabled: global?.enabled ?? null,
        clientEnabled: override?.enabled ?? null,
      };
    });
  }, [diff]);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="text-muted-foreground mb-1 block text-sm">
          Client
        </label>
        <Select
          value={selectedClientId || undefined}
          onValueChange={(v) => setSelectedClientId(v || '')}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a client..." />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {getClientName(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!selectedClientId && (
        <p className="text-muted-foreground text-sm">
          Select a client to see the diff.
        </p>
      )}
      {selectedClientId && isLoading && (
        <p className="text-muted-foreground text-sm">Loading...</p>
      )}
      {selectedClientId && !isLoading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium">Key</th>
                <th className="p-2 text-left font-medium">Name</th>
                <th className="p-2 text-left font-medium">Category</th>
                <th className="p-2 text-left font-medium">Global</th>
                <th className="p-2 text-left font-medium">Client override</th>
                <th className="p-2 text-left font-medium">Diff</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const globalVal =
                  row.globalEnabled === true
                    ? 'On'
                    : row.globalEnabled === false
                      ? 'Off'
                      : '—';
                const clientVal =
                  row.clientEnabled === true
                    ? 'On'
                    : row.clientEnabled === false
                      ? 'Off'
                      : '—';
                const hasOverride = row.clientEnabled !== null;
                const differs = row.globalEnabled !== row.clientEnabled;
                return (
                  <tr key={row.key} className="border-b">
                    <td className="p-2 font-mono">{row.key}</td>
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.category}</td>
                    <td className="p-2">{globalVal}</td>
                    <td className="p-2">{clientVal}</td>
                    <td className="p-2">
                      {hasOverride && (
                        <Badge variant={differs ? 'default' : 'secondary'}>
                          {differs ? 'Overridden' : 'Same'}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {selectedClientId && !isLoading && rows.length === 0 && (
        <p className="text-muted-foreground text-sm">No flags to compare.</p>
      )}
    </div>
  );
}
