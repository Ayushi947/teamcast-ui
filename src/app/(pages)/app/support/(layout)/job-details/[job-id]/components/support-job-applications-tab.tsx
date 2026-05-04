'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Calendar,
  Clock,
  Mail,
  CheckCircle,
  XCircle,
  Award,
  Briefcase,
  Users,
  Target,
  Eye,
  MapPin,
  Building2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { IClientJobPosting, ApplicationStatusEnum } from '@/lib/shared';
import { getInitials } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supportJobApplicationService } from '@/lib/services/services';
import { Skeleton } from '@/components/ui/skeleton';
import { CommonTags } from '@/components/ui/common-tags';

interface SupportJobApplicationsTabProps {
  job: IClientJobPosting;
}

const toApplicationStatusEnum = (
  status: string | ApplicationStatusEnum | undefined
): ApplicationStatusEnum => {
  const upper = (status as string | undefined)?.toUpperCase();
  const values = Object.values(ApplicationStatusEnum) as string[];
  if (upper && values.includes(upper)) {
    return upper as ApplicationStatusEnum;
  }
  return ApplicationStatusEnum.APPLIED;
};

const getApplicationStatusBadge = (status: string | ApplicationStatusEnum) => {
  // Handle UI-only legacy statuses not present in enum
  if ((status as string)?.toUpperCase() === 'INTERVIEWED') {
    return (
      <Badge className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
        Interviewed
      </Badge>
    );
  }
  if ((status as string)?.toUpperCase() === 'HIRED') {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
        <Briefcase className="mr-1 h-3 w-3" /> Hired
      </Badge>
    );
  }

  const normalizedStatus = toApplicationStatusEnum(status);

  switch (normalizedStatus) {
    case ApplicationStatusEnum.APPLIED:
      return (
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 flex items-center gap-2"
        >
          <div className="bg-primary h-2 w-2 rounded-full"></div>
          Applied
        </Badge>
      );
    case ApplicationStatusEnum.REVIEWING:
      return (
        <Badge className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30">
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
          Reviewing
        </Badge>
      );
    case ApplicationStatusEnum.SHORTLISTED:
      return (
        <Badge className="flex items-center gap-3 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          Shortlisted
        </Badge>
      );
    case ApplicationStatusEnum.ASSESSING:
      return (
        <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
          <FileText className="mr-1 h-3 w-3" /> Assessing
        </Badge>
      );
    case ApplicationStatusEnum.OFFERED:
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30">
          <Award className="mr-1 h-3 w-3" /> Offered
        </Badge>
      );
    case ApplicationStatusEnum.ACCEPTED:
      return (
        <Badge className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          Accepted
        </Badge>
      );
    case ApplicationStatusEnum.FAILED:
      return (
        <Badge className="bg-red-50 text-red-500 dark:text-red-500">
          <XCircle className="mr-1 h-3 w-3 text-red-500" /> Failed
        </Badge>
      );
    case ApplicationStatusEnum.REJECTED:
      return (
        <Badge
          variant="destructive"
          className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          <XCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    case ApplicationStatusEnum.WITHDRAWN:
      return (
        <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
          <XCircle className="mr-1 h-3 w-3" /> Withdrawn
        </Badge>
      );
    case ApplicationStatusEnum.DRAFT:
      return (
        <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
          <FileText className="mr-1 h-3 w-3" /> Draft
        </Badge>
      );
    case ApplicationStatusEnum.INVITED:
      return (
        <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
          <Mail className="mr-1 h-3 w-3" /> Invited
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize">
          {normalizedStatus}
        </Badge>
      );
  }
};

// Loading state component
const LoadingState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="mb-4">
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="mb-2 h-6 w-48" />
    <Skeleton className="h-4 w-32" />
    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

// Empty state component
const ApplicationsEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
      <Briefcase className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
      No Applications Found
    </h3>
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
      No applications have been submitted for this job posting yet.
    </p>
  </div>
);

export function SupportJobApplicationsTab({
  job,
}: SupportJobApplicationsTabProps) {
  const router = useRouter();

  // Fetch applications for this job
  const {
    data: applicationsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['supportJobApplications', job.id],
    queryFn: () =>
      supportJobApplicationService.getSupportJobApplications({
        jobId: job.id,
        page: 1,
        limit: 100,
        sortBy: 'acceptedAt',
        sortOrder: 'desc',
      }),
  });

  const applications = applicationsResponse?.items || [];

  const handleViewApplication = (applicationId: string) => {
    router.push(`/app/support/applications/${applicationId}`);
  };

  if (isLoading) {
    return <LoadingState message="Loading applications..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          Error Loading Applications
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Failed to load applications. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="dark:bg-primary/10 h-full space-y-6 rounded-lg">
      {/* Summary Stats */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card rounded-lg p-4 dark:border-gray-700">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-base font-medium text-gray-600 dark:text-gray-400">
                Total Applications
              </div>
              <div className="bg-primary/20 dark:bg-primary/30 rounded-full p-2">
                <Users className="text-primary dark:text-primary h-4 w-4" />
              </div>
            </div>
            <div className="flex h-[68px] flex-col justify-between">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {applications.length}
              </div>
              <span className="text-primary dark:text-primary text-sm font-medium">
                All applications
              </span>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 dark:border-gray-700">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-base font-medium text-gray-600 dark:text-gray-400">
                In Review
              </div>
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex h-[68px] flex-col justify-between">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {
                  applications.filter(
                    (app) => app.status === ApplicationStatusEnum.REVIEWING
                  ).length
                }
              </div>
              <span className="text-primary dark:text-primary text-sm font-medium">
                Applications in review
              </span>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 dark:border-gray-700">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-base font-medium text-gray-600 dark:text-gray-400">
                Shortlisted
              </div>
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex h-[68px] flex-col justify-between">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {
                  applications.filter(
                    (app) => app.status === ApplicationStatusEnum.SHORTLISTED
                  ).length
                }
              </div>
              <span className="text-primary dark:text-primary text-sm font-medium">
                Shortlisted candidates
              </span>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 dark:border-gray-700">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-base font-medium text-gray-600 dark:text-gray-400">
                Hired
              </div>
              <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex h-[68px] flex-col justify-between">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {
                  applications.filter(
                    (app) => app.status === ApplicationStatusEnum.OFFERED
                  ).length
                }
              </div>
              <span className="text-primary dark:text-primary text-sm font-medium">
                Final stage candidates
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <ApplicationsEmptyState />
        ) : (
          applications.map((application) => {
            // Skip rendering invalid applications
            if (!application || !application.id) return null;

            return (
              <Card
                key={application.id}
                onClick={() => handleViewApplication(application.id)}
                className="bg-card dark:bg-background/30 cursor-pointer overflow-hidden border border-l-4 border-gray-200 transition-all hover:shadow-md dark:border-gray-700"
                style={{
                  borderLeftColor:
                    application.status === ApplicationStatusEnum.SHORTLISTED
                      ? '#10b981'
                      : application.status === ApplicationStatusEnum.ACCEPTED
                        ? '#10b981'
                        : application.status === ApplicationStatusEnum.OFFERED
                          ? '#10b981'
                          : application.status ===
                              ApplicationStatusEnum.ASSESSING
                            ? '#059669'
                            : application.status ===
                                ApplicationStatusEnum.REJECTED
                              ? '#ef4444'
                              : '#6b7280',
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Candidate Info */}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 rounded-full border">
                        {application?.candidate?.user?.image && (
                          <AvatarImage
                            src={application?.candidate?.user?.image}
                            alt={application?.candidate?.user?.name}
                            className="rounded-full object-cover"
                          />
                        )}
                        <AvatarFallback className="from-primary/10 to-primary/20 text-primary dark:from-primary/20 dark:to-primary/30 dark:text-primary bg-gradient-to-br">
                          {application?.candidate?.user?.name
                            ? getInitials(application?.candidate?.user?.name)
                            : null}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-3">
                          <h3 className="text-gray-90 truncate pb-1 text-base font-semibold dark:text-gray-50">
                            {application?.candidate?.user?.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-400">
                            <div className="flex items-center gap-4">
                              <p className="text-gray-60 text-sm dark:text-gray-400">
                                {application.jobTitle}
                              </p>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Applied{' '}
                                  {formatDistanceToNow(
                                    new Date(application.createdAt)
                                  )}{' '}
                                  ago
                                </span>
                              </div>
                            </div>
                            {application.updatedAt !==
                              application.createdAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Updated{' '}
                                  {formatDistanceToNow(
                                    new Date(application.updatedAt)
                                  )}{' '}
                                  ago
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Candidate summary */}
                          {application?.candidate?.resume?.summary && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-300">
                              {application.candidate.resume.summary}
                            </p>
                          )}
                        </div>

                        {/* Key Details Row: Company, Experience, Location */}
                        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {(application?.candidate?.resume?.currentCompany ||
                            application?.candidate?.resume
                              ?.currentWorkLocation) && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate">
                                {application?.candidate?.resume
                                  ?.currentCompany && (
                                  <span className="font-medium">
                                    {
                                      application.candidate.resume
                                        ?.currentCompany
                                    }
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {application?.candidate?.resume?.totalExperience && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span>
                                {application.candidate.resume?.totalExperience}{' '}
                                years exp
                              </span>
                            </div>
                          )}
                          {application?.candidate?.resume?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {application.candidate.resume?.location}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Skills badges with show more/less toggle */}
                        {application?.candidate?.resume?.resumeSkills && (
                          <CommonTags
                            values={application.candidate.resume?.resumeSkills}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {getApplicationStatusBadge(
                          application.status || ApplicationStatusEnum.APPLIED
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  {application.coverLetter && (
                    <div className="mt-4 border-t pt-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 w-1 bg-gray-200 dark:bg-gray-700" />
                        <p className="line-clamp-2 pl-3 text-sm text-gray-600 italic dark:text-gray-400">
                          &ldquo;{application.coverLetter}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
