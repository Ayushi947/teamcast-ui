'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ResetAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: (reason?: string) => Promise<void>;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function ResetAssessmentDialog({
  open,
  onOpenChange,
  onReset,
  title = 'Reset Assessment',
  description = '',
  trigger,
  disabled = false,
}: ResetAssessmentDialogProps) {
  const [resetReason, setResetReason] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await onReset(resetReason || undefined);

      // Reset form state
      setResetReason('');
      onOpenChange(false);
    } catch (error) {
      logger.error('Error in reset assessment dialog:', error);
      // Error handling is done in the parent component
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancel = () => {
    setResetReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reset-reason" className="text-sm font-medium">
              Reason for reset (optional)
            </Label>
            <Textarea
              id="reset-reason"
              placeholder="Enter reason for resetting the assessment..."
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isResetting || disabled}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={isResetting || disabled}
            className="bg-primary text-primary-foreground"
          >
            {isResetting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Assessment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
