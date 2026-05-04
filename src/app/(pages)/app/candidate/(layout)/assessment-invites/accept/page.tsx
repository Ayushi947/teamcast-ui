'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { clientJobInviteApiService } from '@/lib/services/services';
import { IJobInviteTokenValidation } from '@/lib/shared/models/domain/client/job.invite.domain';

export default function JobInviteAcceptPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteId = searchParams.get('inviteId');

  // Validate invite token
  const {
    data: inviteValidation,
    isLoading: isValidatingInvite,
    error: validationError,
  } = useQuery<IJobInviteTokenValidation>({
    queryKey: ['validateJobInvite', inviteId],
    queryFn: async () => {
      if (!inviteId) {
        throw new Error('Invite ID is required');
      }
      const result =
        await clientJobInviteApiService.validateInviteToken(inviteId);
      return result;
    },
    enabled: !!inviteId,
    retry: false,
  });

  // Open dialog when data is loaded
  useEffect(() => {
    if (!isValidatingInvite && inviteValidation) {
      if (!inviteValidation.isValid) {
        toast.error(inviteValidation.message || 'Invalid invitation link');
        router.push('/app/candidate/applications');
        return;
      }
      // Redirect valid invites straight to dashboard to continue the flow there
      router.replace('/app/candidate/dashboard');
    }
  }, [isValidatingInvite, inviteValidation, router]);

  // Show loading state
  if (isValidatingInvite) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (validationError || !inviteValidation?.isValid) {
    return (
      <div className="bg-background flex h-screen items-center justify-center p-4">
        <div className="bg-card w-full max-w-md space-y-6 rounded-lg border p-8 shadow-lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-full">
              <AlertCircle className="text-destructive h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground text-xl font-semibold">
                Invalid Invitation
              </h2>
              <p className="text-muted-foreground text-sm">
                {inviteValidation?.message ||
                  'This invitation link is invalid or has expired.'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/app/candidate/applications')}
            className="w-full"
          >
            Go to Applications
          </Button>
        </div>
      </div>
    );
  }
}
