'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeatureFlagsPresetsSection } from './feature-flags-presets-section';

interface PresetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplySuccess?: () => void;
}

export function PresetsDialog({
  open,
  onOpenChange,
  onApplySuccess,
}: PresetsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Templates / presets</DialogTitle>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1 pr-4">
          {open ? (
            <FeatureFlagsPresetsSection
              onApplySuccess={onApplySuccess}
              hideHeading
            />
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
