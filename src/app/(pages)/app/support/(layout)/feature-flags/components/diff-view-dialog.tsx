'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeatureFlagsDiffView } from './feature-flags-diff-view';

interface DiffViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiffViewDialog({ open, onOpenChange }: DiffViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>Diff: Global vs client overrides</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Compare default (global) flag values with client-specific overrides.
          </p>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1 pr-4">
          {open ? <FeatureFlagsDiffView /> : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
