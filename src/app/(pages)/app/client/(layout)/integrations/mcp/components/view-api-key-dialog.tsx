'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mcpClientService } from '@/lib/services/services';
import type { IMcpClient, IMcpClientWithApiKey } from '@/lib/shared';
import { toast } from 'sonner';
import {
  CopyIcon,
  CheckIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from 'lucide-react';

interface ViewApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: IMcpClient;
}

export function ViewApiKeyDialog({
  open,
  onOpenChange,
  client,
}: ViewApiKeyDialogProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const regenerateMutation = useMutation({
    mutationFn: () => mcpClientService.regenerateApiKey(client.id),
    onSuccess: (data: IMcpClientWithApiKey) => {
      setNewApiKey(data.apiKey);
      toast.success('API key regenerated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to regenerate API key');
    },
  });

  const handleRegenerateClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRegenerate = () => {
    setShowConfirmDialog(false);
    regenerateMutation.mutate();
  };

  const handleCopyApiKey = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setNewApiKey(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>API Key Management</DialogTitle>
            <DialogDescription>
              Manage the API key for {client.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {newApiKey ? (
              <>
                <Alert variant="destructive">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Copy this API key now. You will not be able to see it again.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>New API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newApiKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyApiKey}
                    >
                      {copied ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Alert>
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    For security reasons, the existing API key cannot be
                    displayed. You can regenerate a new key if needed.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    value={client.id}
                    readOnly
                    className="font-mono text-sm"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={handleRegenerateClick}
                  disabled={regenerateMutation.isPending}
                  className="w-full"
                >
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  {regenerateMutation.isPending
                    ? 'Regenerating...'
                    : 'Regenerate API Key'}
                </Button>
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>
              {newApiKey ? 'Done' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate the current API key immediately. Any
              integrations using the old key will stop working. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRegenerate}>
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
