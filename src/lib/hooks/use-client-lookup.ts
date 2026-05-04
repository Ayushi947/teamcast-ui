import { useState, useEffect, useCallback } from 'react';
import { supportClientManagementService } from '@/lib/services/services';
import type { ISupportClient } from '@/lib/shared';

interface ClientInfo {
  id: string;
  name: string;
  industry?: string;
  size?: string;
}

interface UseClientLookupReturn {
  getClientInfo: (clientId: string) => ClientInfo | null;
  loadClientInfo: (clientId: string) => Promise<ClientInfo | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for looking up client information by ID
 * Provides caching to avoid redundant API calls
 */
export function useClientLookup(): UseClientLookupReturn {
  const [clientCache, setClientCache] = useState<Map<string, ClientInfo>>(
    new Map()
  );
  const [loadingClients, setLoadingClients] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClientInfo = useCallback(
    (clientId: string): ClientInfo | null => {
      return clientCache.get(clientId) || null;
    },
    [clientCache]
  );

  const loadClientInfo = useCallback(
    async (clientId: string): Promise<ClientInfo | null> => {
      // Return cached data if available
      if (clientCache.has(clientId)) {
        return clientCache.get(clientId)!;
      }

      // Avoid duplicate requests
      if (loadingClients.has(clientId)) {
        return null;
      }

      try {
        setLoadingClients((prev) => new Set(prev).add(clientId));
        setIsLoading(true);
        setError(null);

        const supportClient: ISupportClient =
          await supportClientManagementService.getSupportClient(clientId);

        const clientInfo: ClientInfo = {
          id: clientId,
          name: supportClient.company?.name || 'Unknown Client',
          industry: supportClient.company?.industry,
          size: supportClient.company?.size,
        };

        setClientCache((prev) => new Map(prev).set(clientId, clientInfo));
        return clientInfo;
      } catch {
        setError('Failed to load client information');

        // Cache a fallback for failed requests to avoid repeated failures
        const fallbackInfo: ClientInfo = {
          id: clientId,
          name: 'Unknown Client',
        };
        setClientCache((prev) => new Map(prev).set(clientId, fallbackInfo));
        return fallbackInfo;
      } finally {
        setLoadingClients((prev) => {
          const updated = new Set(prev);
          updated.delete(clientId);
          return updated;
        });
        setIsLoading(false);
      }
    },
    [clientCache, loadingClients]
  );

  return {
    getClientInfo,
    loadClientInfo,
    isLoading,
    error,
  };
}

/**
 * Hook for preloading multiple client information at once
 */
export function useClientBatchLookup(clientIds: string[]): {
  clientsMap: Map<string, ClientInfo>;
  isLoading: boolean;
  error: string | null;
} {
  const [clientsMap, setClientsMap] = useState<Map<string, ClientInfo>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientIds.length === 0) return;

    const loadClients = async () => {
      setIsLoading(true);
      setError(null);
      const newClientsMap = new Map<string, ClientInfo>();

      try {
        // Load clients in parallel with a reasonable batch size
        const batchSize = 5;
        for (let i = 0; i < clientIds.length; i += batchSize) {
          const batch = clientIds.slice(i, i + batchSize);
          const promises = batch.map(async (clientId) => {
            try {
              const supportClient: ISupportClient =
                await supportClientManagementService.getSupportClient(clientId);
              return {
                id: clientId,
                name: supportClient.company?.name || 'Unknown Client',
                industry: supportClient.company?.industry,
                size: supportClient.company?.size,
              };
            } catch {
              return {
                id: clientId,
                name: 'Unknown Client',
              };
            }
          });

          const batchResults = await Promise.all(promises);
          batchResults.forEach((client) => {
            newClientsMap.set(client.id, client);
          });
        }

        setClientsMap(newClientsMap);
      } catch {
        setError('Failed to load client information');
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [clientIds]);

  return {
    clientsMap,
    isLoading,
    error,
  };
}
