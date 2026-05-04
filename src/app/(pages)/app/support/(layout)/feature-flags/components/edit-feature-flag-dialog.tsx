'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  IFeatureFlag,
  IFeatureFlagCreate,
  IFeatureFlagUpdate,
  FeatureFlagCategoryEnum,
  ISupportClient,
} from '@/lib/shared';
import {
  featureFlagService,
  supportClientManagementService,
} from '@/lib/services/services';

const GLOBAL_SCOPE = '__global__';
const CLIENT_NAME_FALLBACK_PREFIX = 'Client';

interface IClientOption {
  id: string;
  name: string;
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

interface EditFeatureFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: IFeatureFlag | null;
  onSuccess?: () => void;
}

export function EditFeatureFlagDialog({
  open,
  onOpenChange,
  flag,
  onSuccess,
}: EditFeatureFlagDialogProps) {
  const [formData, setFormData] = useState<IFeatureFlagCreate>({
    key: '',
    name: '',
    description: '',
    enabled: false,
    category: FeatureFlagCategoryEnum.SYSTEM,
    rolloutPercentage: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (flag) {
      setFormData({
        key: flag.key,
        name: flag.name,
        description: flag.description || '',
        enabled: flag.enabled,
        category: flag.category,
        targetUserType: flag.targetUserType || undefined,
        clientId: flag.clientId || undefined,
        rolloutPercentage: flag.rolloutPercentage,
      });
    }
  }, [flag]);

  const { data: clientsResponse } = useQuery({
    queryKey: ['supportClientsForFeatureFlag', open],
    queryFn: async () => {
      const response = await supportClientManagementService.listSupportClients({
        page: 1,
        limit: 200,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      return response;
    },
    enabled: open,
  });

  const clients: IClientOption[] = useMemo(() => {
    const items = clientsResponse?.items ?? [];
    const extractName = (client: ISupportClient): string | null => {
      if (client.company?.name?.trim()) return client.company.name.trim();
      const listCompanyName = (client as unknown as { companyName?: unknown })
        .companyName;
      if (
        typeof listCompanyName === 'string' &&
        listCompanyName.trim().length > 0
      ) {
        return listCompanyName.trim();
      }
      return null;
    };
    return items.map((client) => ({
      id: client.id,
      name:
        extractName(client) ||
        `${CLIENT_NAME_FALLBACK_PREFIX} ${client.id.slice(0, 8)}`,
    }));
  }, [clientsResponse?.items]);

  const handleSave = async () => {
    if (!flag) return;
    try {
      setIsSubmitting(true);
      const updateData: IFeatureFlagUpdate = {
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
        category: formData.category,
        targetUserType: formData.targetUserType,
        clientId: formData.clientId || null,
        rolloutPercentage: formData.rolloutPercentage,
      };
      await featureFlagService.updateFeatureFlag(flag.id, updateData);
      toast.success('Feature flag updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update feature flag'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Feature Flag</DialogTitle>
          <DialogDescription>Update feature flag settings</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-key">Key (Read-only)</Label>
            <Input id="edit-key" value={formData.key} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  category: value as FeatureFlagCategoryEnum,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FeatureFlagCategoryEnum).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-client-scope">
              Assign to Client (Optional)
            </Label>
            <Select
              value={formData.clientId || GLOBAL_SCOPE}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  clientId: value === GLOBAL_SCOPE ? undefined : value,
                })
              }
            >
              <SelectTrigger id="edit-client-scope">
                <SelectValue placeholder="Global (all clients)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GLOBAL_SCOPE}>
                  Global (all clients)
                </SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit-enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked })
              }
            />
            <Label htmlFor="edit-enabled">Enabled</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
