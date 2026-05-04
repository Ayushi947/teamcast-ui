'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ICandidateJobAssessmentInvite,
  JobAssessmentInviteStatusEnum,
} from '@/lib/shared';

interface ViewAssessmentInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invite: ICandidateJobAssessmentInvite;
}

// Helper functions
const getStatusVariant = (status: JobAssessmentInviteStatusEnum) => {
  switch (status) {
    case JobAssessmentInviteStatusEnum.ACCEPTED:
      return 'default';
    case JobAssessmentInviteStatusEnum.DECLINED:
      return 'destructive';
    case JobAssessmentInviteStatusEnum.CANCELLED:
      return 'secondary';
    case JobAssessmentInviteStatusEnum.EXPIRED:
      return 'secondary';
    case JobAssessmentInviteStatusEnum.PENDING:
    default:
      return 'outline';
  }
};

const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function ViewAssessmentInviteDialog({
  open,
  onOpenChange,
  invite,
}: ViewAssessmentInviteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assessment Invite Details</DialogTitle>
          <DialogDescription>
            View detailed information for your assessment invitation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Header */}
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{invite.jobPostingTitle}</h2>
              <p className="text-gray-600">{invite.companyName}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant={getStatusVariant(
                    invite.status || JobAssessmentInviteStatusEnum.PENDING
                  )}
                >
                  {formatEnumValue(
                    invite.status || JobAssessmentInviteStatusEnum.PENDING
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Job Position
                  </p>
                  <p className="text-sm">{invite.jobPostingTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Company</p>
                  <p className="text-sm">{invite.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Job Posting ID
                  </p>
                  <p className="font-mono text-sm">{invite.jobPostingId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Invited By
                  </p>
                  <p className="text-sm">{invite.inviterName || 'Unknown'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invite Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invite Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Message</p>
                  <p className="text-sm">
                    {invite.message || 'No message provided'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {invite.scheduledDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Scheduled Date
                    </p>
                    <p className="text-sm">
                      {format(invite.scheduledDate, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {invite.expiresAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Expires At
                    </p>
                    <p className="text-sm">
                      {format(invite.expiresAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {invite.acceptedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Accepted At
                    </p>
                    <p className="text-sm">
                      {format(invite.acceptedAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {invite.declinedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Declined At
                    </p>
                    <p className="text-sm">
                      {format(invite.declinedAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Assessment ID
                  </p>
                  <p className="font-mono text-sm">
                    {invite.jobAssessmentId || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge
                    variant={getStatusVariant(
                      invite.status || JobAssessmentInviteStatusEnum.PENDING
                    )}
                  >
                    {formatEnumValue(
                      invite.status || JobAssessmentInviteStatusEnum.PENDING
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Invite ID</p>
                  <p className="font-mono text-sm">{invite.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Received</p>
                  <p className="text-sm">
                    {format(invite.createdAt, 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Last Updated
                  </p>
                  <p className="text-sm">
                    {format(invite.updatedAt, 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
