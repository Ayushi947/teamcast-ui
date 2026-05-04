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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import type { IFeatureFlag } from '@/lib/shared';
import { featureFlagService } from '@/lib/services/services';
import { format } from 'date-fns';

interface ScheduleFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: IFeatureFlag | null;
  onSuccess?: () => void;
}

export function ScheduleFlagDialog({
  open,
  onOpenChange,
  flag,
  onSuccess,
}: ScheduleFlagDialogProps) {
  const [action, setAction] = useState<'ENABLE' | 'DISABLE'>('ENABLE');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('14:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!flag) return;
    const date = dateStr ? new Date(`${dateStr}T${timeStr}`) : null;
    if (!date || isNaN(date.getTime())) {
      toast.error('Pick a valid date and time');
      return;
    }
    if (date.getTime() <= Date.now()) {
      toast.error('Schedule time must be in the future');
      return;
    }
    setIsSubmitting(true);
    try {
      await featureFlagService.createSchedule({
        featureFlagId: flag.id,
        clientId: flag.clientId,
        scheduledAt: date.toISOString(),
        action,
      });
      toast.success(
        `${action === 'ENABLE' ? 'Enable' : 'Disable'} scheduled for ${format(date, 'PPp')}`
      );
      setDateStr('');
      setTimeStr('14:00');
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule change</DialogTitle>
          <DialogDescription>
            {flag && (
              <>
                Set when to {action === 'ENABLE' ? 'enable' : 'disable'} &quot;
                {flag.name}&quot;.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Action at scheduled time</Label>
            <RadioGroup
              value={action}
              onValueChange={(v) => setAction(v as 'ENABLE' | 'DISABLE')}
              className="mt-2 flex gap-4"
            >
              <label className="flex items-center gap-2">
                <RadioGroupItem value="ENABLE" />
                Enable
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="DISABLE" />
                Disable
              </label>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="schedule-date">Date</Label>
              <input
                id="schedule-date"
                type="date"
                className="border-input bg-background mt-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="schedule-time">Time</Label>
              <input
                id="schedule-time"
                type="time"
                className="border-input bg-background mt-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
              />
            </div>
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
            disabled={isSubmitting || !dateStr}
          >
            {isSubmitting ? 'Scheduling…' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
