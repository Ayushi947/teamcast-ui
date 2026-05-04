'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { featureFlagService } from '@/lib/services/services';
import { FeatureFlagCategoryEnum, IFeatureFlag } from '@/lib/shared';
import { RefreshCw } from 'lucide-react';

interface FeatureFlagsTabProps {
  clientId: string;
  isActive?: boolean;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export function FeatureFlagsTab({
  clientId,
  isActive = false,
}: FeatureFlagsTabProps) {
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const {
    data: flags = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['support-feature-flags', clientId],
    queryFn: () => featureFlagService.getAllFeatureFlags(),
    enabled: !!clientId && isActive,
  });

  const availableFlags = useMemo(
    () => flags.filter((flag) => !flag.clientId || flag.clientId === clientId),
    [flags, clientId]
  );

  const unavailableCount = useMemo(
    () =>
      flags.filter((flag) => flag.clientId && flag.clientId !== clientId)
        .length,
    [flags, clientId]
  );

  const handleAssign = async (flag: IFeatureFlag) => {
    try {
      setIsUpdatingId(flag.id);
      await featureFlagService.updateFeatureFlag(flag.id, {
        clientId,
      });
      toast.success(`Assigned ${flag.key} to this client`);
      await refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to assign feature flag'));
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleUnassign = async (flag: IFeatureFlag) => {
    try {
      setIsUpdatingId(flag.id);
      await featureFlagService.updateFeatureFlag(flag.id, {
        clientId: null,
      });
      toast.success(`Removed client assignment for ${flag.key}`);
      await refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to unassign feature flag'));
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleToggle = async (flag: IFeatureFlag) => {
    try {
      setIsUpdatingId(flag.id);
      await featureFlagService.updateFeatureFlag(flag.id, {
        enabled: !flag.enabled,
      });
      toast.success(
        `${flag.key} ${flag.enabled ? 'disabled' : 'enabled'} successfully`
      );
      await refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update feature status'));
    } finally {
      setIsUpdatingId(null);
    }
  };

  const getCategoryColor = (category: FeatureFlagCategoryEnum) => {
    const colors = {
      SYSTEM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      ASSESSMENT:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PROCTORING:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      UI_ENHANCEMENT:
        'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      ANALYTICS:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      INTEGRATION:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      EXPERIMENTAL:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      BETA: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      DEPRECATED:
        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[category] || colors.SYSTEM;
  };

  if (!isActive) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Feature Flags</CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {unavailableCount > 0 && (
          <p className="text-muted-foreground text-sm">
            {unavailableCount} flag(s) are assigned to other clients and cannot
            be assigned here.
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : availableFlags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No feature flags available for this client
                </TableCell>
              </TableRow>
            ) : (
              availableFlags.map((flag) => {
                const assignedToThisClient = flag.clientId === clientId;
                const isUpdating = isUpdatingId === flag.id;

                return (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <div>
                        <div className="font-mono text-sm">{flag.key}</div>
                        <div className="text-muted-foreground text-xs">
                          {flag.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(flag.category)}>
                        {flag.category.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assignedToThisClient ? (
                        <Badge>Assigned to this client</Badge>
                      ) : (
                        <Badge variant="outline">Global</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => handleToggle(flag)}
                          disabled={isUpdating}
                        />
                        <span
                          className={
                            flag.enabled
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500'
                          }
                        >
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {assignedToThisClient ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassign(flag)}
                          disabled={isUpdating}
                        >
                          Unassign
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAssign(flag)}
                          disabled={isUpdating}
                        >
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
