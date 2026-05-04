'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { Card } from '@/components/ui/card';
import { supportPlatformUserService } from '@/lib/services/services';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function SupportPlatformUsersPage() {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [confirmUserIdOpen, setConfirmUserIdOpen] = useState(false);

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);

  const deleteByEmailMutation = useMutation({
    mutationFn: async () =>
      supportPlatformUserService.deletePlatformUserByEmail(normalizedEmail),
    onSuccess: () => {
      toast.success('User deleted successfully');
      setConfirmEmailOpen(false);
      setEmail('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const deleteByIdMutation = useMutation({
    mutationFn: async () =>
      supportPlatformUserService.deletePlatformUserById(userId.trim()),
    onSuccess: () => {
      toast.success('User deleted successfully');
      setConfirmUserIdOpen(false);
      setUserId('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const isBusy =
    deleteByEmailMutation.isPending || deleteByIdMutation.isPending;

  return (
    <div className="text-foreground mx-auto max-w-3xl p-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Platform Users</h1>
        <p className="text-muted-foreground text-sm">
          Support-admin tool to delete a platform user
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">Delete by email</h2>
              <p className="text-muted-foreground text-sm">
                Deletes the platform user found by email
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="delete-email">Email</Label>
              <Input
                id="delete-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                autoComplete="off"
                disabled={isBusy}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => setConfirmEmailOpen(true)}
                disabled={isBusy || !normalizedEmail}
              >
                Delete user
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">Delete by user ID</h2>
              <p className="text-muted-foreground text-sm">
                Deletes the platform user found by UUID
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="delete-userid">User ID (UUID)</Label>
              <Input
                id="delete-userid"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                autoComplete="off"
                disabled={isBusy}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => setConfirmUserIdOpen(true)}
                disabled={isBusy || !userId.trim()}
              >
                Delete user
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={confirmEmailOpen} onOpenChange={setConfirmEmailOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete the user with email{' '}
              <strong>{normalizedEmail || '(empty)'}</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteByEmailMutation.mutate()}
              disabled={isBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteByEmailMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmUserIdOpen} onOpenChange={setConfirmUserIdOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete the user with ID{' '}
              <strong>{userId.trim() || '(empty)'}</strong>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteByIdMutation.mutate()}
              disabled={isBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteByIdMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
