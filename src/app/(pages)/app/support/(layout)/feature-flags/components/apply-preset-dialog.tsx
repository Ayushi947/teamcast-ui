'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { featureFlagService } from '@/lib/services/services';
import type { IFeatureFlagPreset } from '@/lib/shared';
import type { ISupportClient } from '@/lib/shared';

interface ApplyPresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: IFeatureFlagPreset[];
  clients: ISupportClient[];
  getClientName: (client: ISupportClient) => string;
  onSuccess?: () => void;
}

export function ApplyPresetDialog({
  open,
  onOpenChange,
  presets,
  clients,
  getClientName,
  onSuccess,
}: ApplyPresetDialogProps) {
  const [presetId, setPresetId] = useState('');
  const [clientId, setClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!presetId || !clientId) {
      toast.error('Select a preset and a client');
      return;
    }
    setIsSubmitting(true);
    try {
      await featureFlagService.applyPresetToClient(presetId, clientId);
      toast.success('Preset applied to client');
      setPresetId('');
      setClientId('');
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to apply preset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Apply preset to client</DialogTitle>
          <DialogDescription>
            Apply a saved preset (set of flags) to the selected client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Preset</Label>
            <Select value={presetId} onValueChange={setPresetId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select preset..." />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select client..." />
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
            disabled={isSubmitting || !presetId || !clientId}
          >
            {isSubmitting ? 'Applying…' : 'Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
