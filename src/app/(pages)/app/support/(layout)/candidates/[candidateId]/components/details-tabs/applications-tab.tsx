'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Users,
  MapPin,
  Calendar,
  Building,
  Clock,
  TrendingUp,
  ExternalLink,
  Mail,
  RefreshCw,
} from 'lucide-react';
import {
  ISupportCandidate,
  JobAiAssessmentInviteStatusEnum,
} from '@/lib/shared';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supportCandidateManagementService } from '@/lib/services/services';
import { toast } from 'sonner';

interface ApplicationsTabProps {
  candidate: ISupportCandidate;
}

const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatEnumValue = (value: string): string => {
  if (!value) return 'N/A';
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'SHORTLISTED':
      return 'bg-green-500';
    case 'REVIEWING':
    case 'UNDER_REVIEW':
      return 'bg-yellow-500';
    case 'REJECTED':
      return 'bg-red-500';
    case 'APPLIED':
      return 'bg-blue-500';
    case 'INTERVIEW_SCHEDULED':
      return 'bg-purple-500';
    case 'HIRED':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
};

export function ApplicationsTab({ candidate }: ApplicationsTabProps) {
  const queryClient = useQueryClient();
  const [resendingInvitationId, setResendingInvitationId] = useState<
    string | null
  >(null);

  const hasApplications =
    (candidate.applications && candidate.applications.length > 0) ||
    (candidate.partnerApplications && candidate.partnerApplications.length > 0);

  const hasJobAiInvitations =
    candidate.jobAiAssessmentInvitations &&
    candidate.jobAiAssessmentInvitations.length > 0;

  // Mutation for resending invitation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await supportCandidateManagementService.resendJobAiAssessmentInvitation(
        invitationId
      );
    },
    onSuccess: (data) => {
      if (data.processedCount > 0) {
        toast.success('Invitation resent successfully');
        // Refetch candidate data
        queryClient.invalidateQueries({
          queryKey: ['support-candidate', candidate.id],
        });
      } else if (data.failedCount > 0 && data.failedCandidates.length > 0) {
        toast.error(
          data.failedCandidates[0].reason || 'Failed to resend invitation'
        );
      }
      setResendingInvitationId(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to resend invitation');
      setResendingInvitationId(null);
    },
  });

  const handleResendInvitation = async (invitationId: string) => {
    setResendingInvitationId(invitationId);
    resendInvitationMutation.mutate(invitationId);
  };

  if (!hasApplications && !hasJobAiInvitations) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Briefcase className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          No Applications Found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This candidate has not submitted any job applications yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job AI Assessment Invitations */}
      {hasJobAiInvitations && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Mail className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Job AI Assessment Invitations
              <Badge variant="secondary" className="ml-2">
                {candidate.jobAiAssessmentInvitations?.length || 0}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              AI assessment invitations sent to this candidate
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {candidate.jobAiAssessmentInvitations?.map((invitation) => {
                const isExpiredStatus =
                  invitation.status === JobAiAssessmentInviteStatusEnum.EXPIRED;
                const isExpiredDate =
                  invitation.expiresAt &&
                  new Date(invitation.expiresAt) < new Date();
                const isExpired = isExpiredStatus || isExpiredDate;
                const isResending = resendingInvitationId === invitation.id;

                return (
                  <div
                    key={invitation.id}
                    className="group rounded-lg border border-gray-100 p-6 transition-all hover:border-[#6e55cf]/30 hover:shadow-md dark:border-gray-700 dark:hover:border-purple-400/30"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-2 dark:from-purple-900/20 dark:to-pink-900/20">
                            <Mail className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-[#6e55cf] dark:text-white dark:group-hover:text-purple-400">
                              {invitation.jobAiAssessment?.jobPosting?.title ||
                                'Job AI Assessment'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {invitation.jobAiAssessment?.jobPosting?.client
                                ?.company?.name || 'Company'}
                            </p>

                            {/* Invitation Details */}
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Expires: {formatDate(invitation.expiresAt)}
                                </span>
                              </div>
                              {invitation.createdAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Sent: {formatDate(invitation.createdAt)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${
                            isExpired
                              ? 'bg-red-500'
                              : invitation.status ===
                                  JobAiAssessmentInviteStatusEnum.ACCEPTED
                                ? 'bg-green-500'
                                : invitation.status ===
                                    JobAiAssessmentInviteStatusEnum.PENDING
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                          } px-3 py-1 text-xs font-medium text-white`}
                        >
                          {formatEnumValue(invitation.status)}
                        </Badge>
                        {isExpired && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleResendInvitation(invitation.id)
                            }
                            disabled={isResending}
                            className="flex items-center gap-2"
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`}
                            />
                            {isResending ? 'Resending...' : 'Resend'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Applications */}
      {candidate.applications && candidate.applications.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Briefcase className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Job Applications
              <Badge variant="secondary" className="ml-2">
                {candidate.applications.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              All job applications submitted by this candidate
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {candidate.applications.map((application) => (
                <div
                  key={application.id}
                  className="group rounded-lg border border-gray-100 p-6 transition-all hover:border-[#6e55cf]/30 hover:shadow-md dark:border-gray-700 dark:hover:border-purple-400/30"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-2 dark:from-blue-900/20 dark:to-purple-900/20">
                          <Building className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-[#6e55cf] dark:text-white dark:group-hover:text-purple-400">
                            {application.jobPosting.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {application.jobPosting.company.name}
                          </p>

                          {/* Job Details */}
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {(application.jobPosting as any)?.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {(application.jobPosting as any).location}
                                </span>
                              </div>
                            )}
                            {(application.jobPosting as any)
                              ?.employmentType && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatEnumValue(
                                    (application.jobPosting as any)
                                      .employmentType
                                  )}
                                </span>
                              </div>
                            )}
                            {(application.jobPosting as any)?.salaryRange && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>
                                  $
                                  {(
                                    application.jobPosting as any
                                  ).salaryRange.min?.toLocaleString()}{' '}
                                  - $
                                  {(
                                    application.jobPosting as any
                                  ).salaryRange.max?.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${getStatusColor(application.status)} px-3 py-1 text-xs font-medium text-white`}
                      >
                        {formatEnumValue(application.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Application Timeline */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                      <Calendar className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Applied
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(application.submittedAt)}
                        </p>
                      </div>
                    </div>

                    {(application as any)?.updatedAt &&
                      (application as any).updatedAt !==
                        application.submittedAt && (
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                          <Clock className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Last Updated
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatDate((application as any).updatedAt)}
                            </p>
                          </div>
                        </div>
                      )}

                    {(application.jobPosting.company as any)?.website && (
                      <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                        <ExternalLink className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Company
                          </p>
                          <a
                            href={
                              (application.jobPosting.company as any).website
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#6e55cf] hover:text-[#5a4ba8] dark:text-purple-400 dark:hover:text-purple-300"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Job Description Preview */}
                  {(application.jobPosting as any)?.description && (
                    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                      <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Job Description
                      </h4>
                      <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                        {(application.jobPosting as any).description}
                      </p>
                    </div>
                  )}

                  {/* Skills Required */}
                  {(application.jobPosting as any)?.requiredSkills &&
                    (application.jobPosting as any).requiredSkills.length >
                      0 && (
                      <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                        <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(application.jobPosting as any).requiredSkills
                            .slice(0, 6)
                            .map((skill: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          {(application.jobPosting as any).requiredSkills
                            .length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +
                              {(application.jobPosting as any).requiredSkills
                                .length - 6}{' '}
                              more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partner Applications */}
      {candidate.partnerApplications &&
        candidate.partnerApplications.length > 0 && (
          <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Users className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                Partner Applications
                <Badge variant="secondary" className="ml-2">
                  {candidate.partnerApplications.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                Applications through partner organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {candidate.partnerApplications.map((application, index) => (
                  <div
                    key={index}
                    className="group rounded-lg border border-gray-100 p-6 transition-all hover:border-[#6e55cf]/30 hover:shadow-md dark:border-gray-700 dark:hover:border-purple-400/30"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-2 dark:from-green-900/20 dark:to-blue-900/20">
                            <Users className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-[#6e55cf] dark:text-white dark:group-hover:text-purple-400">
                              Partner Application #{index + 1}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              Application through partner organization
                            </p>

                            {/* Application Details */}
                            <div className="mt-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Partner application details would be displayed
                                here based on the actual structure of the
                                partner application object.
                              </p>

                              {/* If partner application has specific fields, they would be displayed here */}
                              {typeof application === 'object' &&
                                application !== null && (
                                  <div className="mt-3 space-y-2">
                                    {Object.entries(application).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex items-center justify-between"
                                        >
                                          <span className="text-xs font-medium text-gray-700 capitalize dark:text-gray-300">
                                            {key
                                              .replace(/([A-Z])/g, ' $1')
                                              .replace(/^./, (str) =>
                                                str.toUpperCase()
                                              )}
                                          </span>
                                          <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {typeof value === 'string' ||
                                            typeof value === 'number'
                                              ? String(value)
                                              : typeof value === 'boolean'
                                                ? value
                                                  ? 'Yes'
                                                  : 'No'
                                                : 'Complex Data'}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          Partner Application
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Application Statistics */}
      {hasApplications && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Application Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#6e55cf] dark:text-purple-400">
                  {(candidate.applications?.length || 0) +
                    (candidate.partnerApplications?.length || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Applications
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {candidate.applications?.filter(
                    (app) => app.status === 'SHORTLISTED'
                  ).length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Shortlisted
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {candidate.applications?.filter(
                    (app) =>
                      app.status === 'REVIEWING' ||
                      app.status === 'UNDER_REVIEW'
                  ).length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Under Review
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {candidate.applications?.filter(
                    (app) => app.status === 'APPLIED'
                  ).length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Applied
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
