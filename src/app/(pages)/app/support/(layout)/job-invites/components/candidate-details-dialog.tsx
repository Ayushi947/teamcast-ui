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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Mail, Calendar, Briefcase, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { candidateProfileService } from '@/lib/services/services';
import { formatEnumValue } from '@/lib/utils';

interface CandidateDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateEmail: string;
}

export function CandidateDetailsDialog({
  open,
  onOpenChange,
  candidateEmail,
}: CandidateDetailsDialogProps) {
  const {
    data: candidate,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['candidate-profile-by-email', candidateEmail],
    queryFn: () => candidateProfileService.getProfileByEmailID(candidateEmail),
    enabled: open && !!candidateEmail,
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogDescription>
              Loading candidate information...
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    // Check if the error indicates the user is not registered
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.code;
    const isNotRegistered =
      errorMessage?.toLowerCase().includes('not registered') ||
      errorMessage?.toLowerCase().includes('user not registered') ||
      errorMessage?.toLowerCase().includes('candidate not found') ||
      errorCode === 'ERR_21006' ||
      (error as any)?.response?.status === 404;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogDescription>
              {isNotRegistered
                ? 'Candidate registration status'
                : 'Error loading candidate information'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              {isNotRegistered ? (
                <>
                  <User className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="mb-2 text-lg font-semibold">
                    Candidate Not Yet Registered
                  </p>
                  <p className="text-muted-foreground text-sm">
                    This candidate has not yet registered on Teamcast. They will
                    need to complete the registration process before their
                    details can be viewed.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-destructive">
                    Failed to load candidate details
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Please try again later
                  </p>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!candidate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogDescription>Candidate not found</DialogDescription>
          </DialogHeader>
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">
                No candidate found with this email
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
          <DialogDescription>
            Detailed information for {candidate.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={candidate.image} alt={candidate.name} />
              <AvatarFallback className="bg-primary text-lg font-semibold text-white">
                {candidate.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{candidate.name}</h2>
              <p className="text-gray-600">{candidate.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">
                  {formatEnumValue(candidate.status)}
                </Badge>
                <Badge variant="secondary">
                  {formatEnumValue(candidate.candidateStatus)}
                </Badge>
                <Badge variant="default">
                  {candidate.completionPercentage}% Complete
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Email:</span>
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Job Title:</span>
                  <span>{candidate.jobTitle || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Job Search Status:</span>
                  <span>{formatEnumValue(candidate.jobSearchStatus)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Joined:</span>
                  <span>
                    {format(new Date(candidate.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Last Updated:</span>
                  <span>
                    {format(new Date(candidate.updatedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Role:</span>
                  <span>{formatEnumValue(candidate.role)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Assessment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Assessment Stage:</span>
                  <Badge variant="outline">
                    {formatEnumValue(candidate.assessmentStage)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Resume Assessment:</span>
                  <Badge variant="outline">
                    {formatEnumValue(candidate.resumeAssessmentStatus)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Onboarding Assessment:</span>
                  <Badge variant="outline">
                    {formatEnumValue(candidate.onboardingAssessmentStatus)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Profile Published:</span>
                  <Badge
                    variant={candidate.isPublished ? 'default' : 'secondary'}
                  >
                    {candidate.isPublished ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(candidate.sex ||
            candidate.birthDate ||
            candidate.maritalStatus) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {candidate.sex && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Sex:</span>
                    <span>{formatEnumValue(candidate.sex)}</span>
                  </div>
                )}
                {candidate.birthDate && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Birth Date:</span>
                    <span>
                      {format(new Date(candidate.birthDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
                {candidate.maritalStatus && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Marital Status:</span>
                    <span>{formatEnumValue(candidate.maritalStatus)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
