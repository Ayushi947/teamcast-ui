'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  ISupportJobApplication,
  ApplicationStatusEnum,
  IResume,
  IClientJobPosting,
} from '@/lib/shared';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CommonTags } from '@/components/ui/common-tags';
import { toast } from 'sonner';
import { supportResumeViewService } from '@/lib/services/services';
import { SupportResumeViewDialog } from '@/app/(pages)/app/support/(layout)/candidates/[candidateId]/components/details-tabs/support-resume-view-dialog';

interface OverviewTabProps {
  applicationData: ISupportJobApplication;
  candidateResumeData?: IResume;
}

// Application status configuration
const APPLICATION_STATUSES: Partial<
  Record<
    ApplicationStatusEnum,
    {
      label: string;
      variant: 'default' | 'secondary' | 'outline' | 'destructive';
      icon: typeof Mail;
    }
  >
> = {
  [ApplicationStatusEnum.INVITED]: {
    label: 'Invited',
    variant: 'secondary',
    icon: Mail,
  },
  [ApplicationStatusEnum.APPLIED]: {
    label: 'Applied',
    variant: 'outline' as const,
    icon: FileText,
  },
  [ApplicationStatusEnum.REVIEWING]: {
    label: 'Reviewing',
    variant: 'default' as const,
    icon: Clock,
  },
  [ApplicationStatusEnum.SHORTLISTED]: {
    label: 'Shortlisted',
    variant: 'default' as const,
    icon: CheckCircle,
  },
  [ApplicationStatusEnum.ASSESSING]: {
    label: 'Interviewed',
    variant: 'default' as const,
    icon: CheckCircle,
  },
  [ApplicationStatusEnum.OFFERED]: {
    label: 'Offered',
    variant: 'default' as const,
    icon: Briefcase,
  },
  [ApplicationStatusEnum.ACCEPTED]: {
    label: 'Accepted',
    variant: 'secondary' as const,
    icon: Briefcase,
  },
  [ApplicationStatusEnum.REJECTED]: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: XCircle,
  },
};

export function OverviewTab({
  applicationData,
  candidateResumeData,
}: OverviewTabProps) {
  const candidate = applicationData.candidate;
  const user = candidate?.user;
  const jobPosting = (
    applicationData as ISupportJobApplication & {
      jobPosting?: IClientJobPosting;
    }
  ).jobPosting;

  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeViewUrl, setResumeViewUrl] = useState<string | null>(null);

  const statusConfig = APPLICATION_STATUSES[
    applicationData.status as ApplicationStatusEnum
  ] ?? {
    label: applicationData.status,
    variant: 'default' as const,
    icon: FileText,
  };

  const StatusIcon = statusConfig.icon;
  const userPhone = (user as Partial<{ phone: string }> | undefined)?.phone;
  const userLocation = (user as Partial<{ location: string }> | undefined)
    ?.location;

  const handleCloseResumeDialog = useCallback((open: boolean) => {
    setIsResumeDialogOpen(open);
    if (!open) {
      setResumeViewUrl(null);
    }
  }, []);

  const handleViewResume = useCallback(async () => {
    if (!applicationData.candidateId) {
      toast.error('Candidate ID not found. Cannot view resume.');
      return;
    }

    setIsLoadingResume(true);

    try {
      const response = await supportResumeViewService.viewResume(
        applicationData.candidateId
      );
      const viewUrl = response?.result?.viewUrl;

      if (viewUrl) {
        setResumeViewUrl(viewUrl);
        setIsResumeDialogOpen(true);
        toast.success('Resume ready to view.');
      } else {
        toast.error('Resume view URL not available.');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load resume.';
      toast.error(errorMessage);
    } finally {
      setIsLoadingResume(false);
    }
  }, [applicationData.candidateId]);

  return (
    <div className="space-y-6">
      {/* Application Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={statusConfig.variant} className="text-sm">
              {statusConfig.label}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Applied{' '}
              {formatDistanceToNow(new Date(applicationData.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user?.image || ''}
                alt={user?.name || 'Candidate'}
              />
              <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                {getInitials(user?.name || 'Candidate')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.name || 'Unknown Candidate'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email || 'No email provided'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {userPhone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{userPhone}</span>
                  </div>
                )}

                {userLocation && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{userLocation}</span>
                  </div>
                )}

                {user?.jobTitle && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="h-4 w-4" />
                    <span>{user.jobTitle}</span>
                  </div>
                )}

                {candidate?.resume?.totalExperience && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {candidate.resume.totalExperience} years experience
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Information */}
      {candidateResumeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {candidateResumeData.jobTitle || 'Resume'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {candidateResumeData.summary || 'No summary available'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewResume}
                    disabled={isLoadingResume}
                  >
                    {isLoadingResume ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {candidateResumeData?.resumeSkills?.length > 0 && (
                <div>
                  <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skills
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    <CommonTags values={candidateResumeData.resumeSkills} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {jobPosting?.title || applicationData.jobTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {jobPosting?.clientId}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {jobPosting?.department && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="h-4 w-4" />
                  <span>Department: {jobPosting.department}</span>
                </div>
              )}

              {jobPosting?.jobType && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Briefcase className="h-4 w-4" />
                  <span>Type: {jobPosting.jobType}</span>
                </div>
              )}

              {jobPosting?.preferredLocations &&
                jobPosting.preferredLocations.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Location: {jobPosting.preferredLocations.join(', ')}
                    </span>
                  </div>
                )}

              {jobPosting?.minSalary && jobPosting?.maxSalary && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Salary: {jobPosting.minSalary.toLocaleString()} -{' '}
                    {jobPosting.maxSalary.toLocaleString()}{' '}
                    {jobPosting.salaryCurrency}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Application Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Application Submitted
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(applicationData.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {applicationData.updatedAt &&
              applicationData.updatedAt !== applicationData.createdAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Status Updated
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(
                          new Date(applicationData.updatedAt),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      <SupportResumeViewDialog
        isOpen={isResumeDialogOpen}
        onOpenChange={handleCloseResumeDialog}
        candidateName={user?.name || 'Candidate'}
        viewUrl={resumeViewUrl}
        isLoading={isLoadingResume && !resumeViewUrl}
      />
    </div>
  );
}
