'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  ICandidateJobAssessmentInviteResponse,
  ICandidateJobApplication,
} from '@/lib/shared';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

type InviteDialogMode = 'assessment' | 'application';

interface AcceptInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invite?: ICandidateJobAssessmentInviteResponse | null;
  application?: ICandidateJobApplication | null;
  mode?: InviteDialogMode;
  onAccept: () => void;
  isAccepting: boolean;
  onDecline: () => void;
  isDeclining: boolean;
  infoMessage?: {
    type: 'success' | 'error';
    message: string;
  } | null;
  onMaybeLater?: () => void;
}

export function AcceptInviteDialog({
  open,
  onOpenChange,
  invite,
  application,
  mode = 'assessment',
  onAccept,
  isAccepting,
  onDecline,
  isDeclining,
  infoMessage,
  onMaybeLater,
}: AcceptInviteDialogProps) {
  const isApplicationMode = mode === 'application';

  if (isApplicationMode && !application) {
    return null;
  }

  if (!isApplicationMode && !invite) {
    return null;
  }

  const positionTitle = isApplicationMode
    ? application?.jobPosting?.title || 'N/A'
    : invite?.jobPostingTitle || 'N/A';
  const companyName = isApplicationMode
    ? application?.jobPosting?.company?.name || 'N/A'
    : invite?.companyName || 'N/A';
  const inviterName = isApplicationMode ? undefined : invite?.inviterName;
  const invitedOn = isApplicationMode
    ? application?.createdAt
    : invite?.createdAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isApplicationMode ? 'sm:max-w-[750px]' : 'sm:max-w-[500px]'}
      >
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {isApplicationMode
                  ? 'Confirm Your Application'
                  : 'Job Invitation'}
              </DialogTitle>
              <DialogDescription className="mt-1 text-base">
                {isApplicationMode
                  ? "You've accepted the job invitation. Confirm below to submit your application and unlock the Job AI assessment journey."
                  : "You've been invited to apply for this position"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {infoMessage && (
          <Alert
            variant={infoMessage.type === 'error' ? 'destructive' : 'default'}
            className="mb-4"
          >
            <AlertDescription>{infoMessage.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-2">
          {/* Job Details Card */}
          <div className="bg-card rounded-lg border p-5 shadow-sm">
            <div className="space-y-4">
              {/* Job Title */}
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Briefcase className="text-primary h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl leading-tight font-semibold">
                    {positionTitle}
                  </h3>
                  {companyName && (
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium">{companyName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-2 border-t pt-4">
                {inviterName && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span className="text-sm">
                      Invited by{' '}
                      <span className="font-medium">{inviterName}</span>
                    </span>
                  </div>
                )}
                {invitedOn && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span className="text-sm">
                      Invited on{' '}
                      <span className="font-medium">
                        {format(new Date(invitedOn), 'MMM d, yyyy')}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Message */}
          {!infoMessage && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                {isApplicationMode
                  ? 'Confirming will submit your application and unlock the Job AI assessment. You can start the assessment from your resume page.'
                  : 'By accepting this invitation, you will be redirected to the applications page where you can apply for this role.'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {onMaybeLater && (
              <Button
                variant="outline"
                onClick={() => {
                  onMaybeLater();
                }}
                disabled={isAccepting || isDeclining}
                className="flex-1"
              >
                Maybe Later
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onDecline}
              disabled={isDeclining || isAccepting}
              className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive flex-1 border-gray-900 text-gray-800"
            >
              {isDeclining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isApplicationMode ? 'Rejecting...' : 'Declining...'}
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  {isApplicationMode ? 'Decline Application' : 'Decline'}
                </>
              )}
            </Button>
            <Button
              onClick={onAccept}
              disabled={isAccepting || isDeclining}
              className="bg-primary hover:bg-primary/90 flex-1"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isApplicationMode ? 'Confirming...' : 'Accepting...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isApplicationMode
                    ? 'Confirm & Go to Job AI Assessment'
                    : 'Accept Invitation'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
