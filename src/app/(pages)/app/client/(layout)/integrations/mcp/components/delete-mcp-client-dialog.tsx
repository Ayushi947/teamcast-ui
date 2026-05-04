'use client';

import { useMutation } from '@tanstack/react-query';
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
import { mcpClientService } from '@/lib/services/services';
import type { IMcpClient } from '@/lib/shared';
import { toast } from 'sonner';

interface DeleteMcpClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: IMcpClient;
  onDeleteSuccess?: () => void;
}

export function DeleteMcpClientDialog({
  open,
  onOpenChange,
  client,
  onDeleteSuccess,
}: DeleteMcpClientDialogProps) {
  const deleteMutation = useMutation({
    mutationFn: () => mcpClientService.deleteMcpClient(client.id),
    onSuccess: () => {
      toast.success('MCP client deleted successfully');
      onDeleteSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete MCP client');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete MCP Client?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{client.name}</strong>? This
            will immediately revoke access for any integrations using this
            client&apos;s API key. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
