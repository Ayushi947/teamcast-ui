'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { featureFlagService } from '@/lib/services/services';
import type { IFeatureFlag, IFeatureFlagPresetItem } from '@/lib/shared';

interface CreatePresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function flagToPresetItem(f: IFeatureFlag): IFeatureFlagPresetItem {
  return {
    key: f.key,
    name: f.name,
    description: f.description ?? null,
    enabled: f.enabled,
    category: f.category,
    targetUserType: f.targetUserType ?? null,
    targetUserRole: f.targetUserRole ?? null,
    rolloutPercentage: f.rolloutPercentage,
    metadata: f.metadata ?? undefined,
  };
}

export function CreatePresetDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePresetDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: globalFlags = [] } = useQuery({
    queryKey: ['supportFeatureFlagsGlobal', open],
    queryFn: async () => {
      const list = await featureFlagService.getAllFeatureFlags();
      return list.filter((f) => !f.clientId);
    },
    enabled: open,
  });

  const toggleFlag = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === globalFlags.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(globalFlags.map((f) => f.id)));
    }
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Enter a preset name');
      return;
    }
    if (selectedIds.size === 0) {
      toast.error('Select at least one flag');
      return;
    }
    const flagConfigs: IFeatureFlagPresetItem[] = globalFlags
      .filter((f) => selectedIds.has(f.id))
      .map(flagToPresetItem);
    setIsSubmitting(true);
    try {
      await featureFlagService.createPreset({
        name: trimmed,
        description: description.trim() || null,
        flagConfigs,
      });
      toast.success('Preset created');
      setName('');
      setDescription('');
      setSelectedIds(new Set());
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to create preset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create preset</DialogTitle>
          <DialogDescription>
            Save a set of global flags as a named preset to apply to clients
            later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="preset-name">Name</Label>
            <Input
              id="preset-name"
              placeholder="e.g. Proctoring strict"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="preset-desc">Description (optional)</Label>
            <Textarea
              id="preset-desc"
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Flags to include</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAll}
              >
                {selectedIds.size === globalFlags.length
                  ? 'Deselect all'
                  : 'Select all'}
              </Button>
            </div>
            <ScrollArea className="mt-2 h-[200px] rounded-md border p-2">
              <div className="space-y-2">
                {globalFlags.map((f) => (
                  <label
                    key={f.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5"
                  >
                    <Checkbox
                      checked={selectedIds.has(f.id)}
                      onCheckedChange={() => toggleFlag(f.id)}
                    />
                    <span className="text-sm">{f.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {f.key}
                    </span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || selectedIds.size === 0}
          >
            {isSubmitting ? 'Creating…' : 'Create preset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
