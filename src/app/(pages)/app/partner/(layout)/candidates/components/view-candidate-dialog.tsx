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
  IPartnerCandidate,
  CandidateStatusEnum,
  CandidateAssessmentStageEnum,
} from '@/lib/shared';
import Image from 'next/image';

interface ViewCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: IPartnerCandidate;
}

// Helper functions
const getStatusVariant = (status: CandidateStatusEnum) => {
  switch (status) {
    case CandidateStatusEnum.NEW:
      return 'outline';
    case CandidateStatusEnum.ONBOARDED:
      return 'default';
    case CandidateStatusEnum.HIRED:
      return 'default';
    case CandidateStatusEnum.REJECTED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getAssessmentStageColor = (stage: CandidateAssessmentStageEnum) => {
  switch (stage) {
    case CandidateAssessmentStageEnum.RESUME_ASSESSMENT:
      return 'bg-blue-100 text-blue-800';
    case CandidateAssessmentStageEnum.ONBOARDING_ASSESSMENT:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function ViewCandidateDialog({
  open,
  onOpenChange,
  candidate,
}: ViewCandidateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
          <DialogDescription>
            View detailed information for {candidate.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Header */}
          <div className="flex items-start space-x-4">
            <Image
              src="/images/avatar-placeholder.png"
              alt={candidate.name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{candidate.name}</h2>
              <p className="text-gray-600">{candidate.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={getStatusVariant(candidate.status)}>
                  {candidate.status}
                </Badge>
                <Badge
                  className={getAssessmentStageColor(candidate.assessmentStage)}
                >
                  {candidate.assessmentStage}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Full Name</p>
                  <p className="text-sm">{candidate.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm">{candidate.email}</p>
                </div>
                {candidate.birthDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Birth Date
                    </p>
                    <p className="text-sm">
                      {format(new Date(candidate.birthDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {candidate.sex && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gender</p>
                    <p className="text-sm">{candidate.sex}</p>
                  </div>
                )}
                {candidate.maritalStatus && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Marital Status
                    </p>
                    <p className="text-sm">{candidate.maritalStatus}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {candidate.jobTitle && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Job Title
                    </p>
                    <p className="text-sm">{candidate.jobTitle}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Profile Completion
                  </p>
                  <p className="text-sm">{candidate.completionPercentage}%</p>
                </div>
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
                    Assessment Stage
                  </p>
                  <Badge
                    className={getAssessmentStageColor(
                      candidate.assessmentStage
                    )}
                  >
                    {candidate.assessmentStage}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Job Search Status
                  </p>
                  <Badge variant="outline">{candidate.jobSearchStatus}</Badge>
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
                  <p className="text-sm font-medium text-gray-600">User ID</p>
                  <p className="font-mono text-sm">{candidate.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Publication Status
                  </p>
                  <Badge
                    variant={candidate.isPublished ? 'default' : 'secondary'}
                  >
                    {candidate.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm">
                    {format(new Date(candidate.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Last Updated
                  </p>
                  <p className="text-sm">
                    {format(new Date(candidate.updatedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                {candidate.updatedBy && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Updated By
                    </p>
                    <p className="text-sm">{candidate.updatedBy}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
