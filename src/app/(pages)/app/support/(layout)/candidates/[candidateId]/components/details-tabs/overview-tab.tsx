'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Mail,
  Phone,
  User,
  Briefcase,
  TrendingUp,
  Award,
  MapPin,
  Users,
  Building,
  Target,
  Clock,
} from 'lucide-react';
import { ISupportCandidate } from '@/lib/shared';
import { format } from 'date-fns';
import { formatEnumValue, formatScore } from '@/lib/utils';
import { CommonTags } from '@/components/ui/common-tags';
import { getLatestOnboardingAssessment } from '@/lib/utils/assessment.utils';

interface OverviewTabProps {
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

export function OverviewTab({ candidate }: OverviewTabProps) {
  // Get the latest onboarding assessment
  const latestOnboardingAssessment = useMemo(() => {
    return getLatestOnboardingAssessment(candidate);
  }, [candidate]);

  // Main assessment scores are already in percentage format (0-100)
  const resumeScore = candidate.resumeAssessments?.[0]?.score || 0;
  const onboardingScore = latestOnboardingAssessment?.score || 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Resume Assessment Score
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatScore(resumeScore)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {resumeScore >= 70
                    ? 'Excellent'
                    : resumeScore >= 50
                      ? 'Good'
                      : 'Needs Improvement'}
                </p>
              </div>
              <div className="rounded-full bg-green-200 p-2 dark:bg-green-800">
                <Award className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
            </div>
            <Progress value={formatScore(resumeScore)} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Screening Assessment Score
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatScore(onboardingScore)}%
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {onboardingScore >= 70
                    ? 'Excellent'
                    : onboardingScore >= 50
                      ? 'Good'
                      : 'Needs Improvement'}
                </p>
              </div>
              <div className="rounded-full bg-blue-200 p-2 dark:bg-blue-800">
                <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
            <Progress
              value={formatScore(onboardingScore)}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Profile Complete
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {candidate.completionPercentage || 0}%
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {(candidate.completionPercentage || 0) >= 80
                    ? 'Complete'
                    : 'In Progress'}
                </p>
              </div>
              <div className="rounded-full bg-purple-200 p-2 dark:bg-purple-800">
                <Target className="h-5 w-5 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
            <Progress
              value={candidate.completionPercentage || 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Applications
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {candidate.applications?.length || 0}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {(candidate.applications?.length || 0) > 0
                    ? 'Active'
                    : 'No Applications'}
                </p>
              </div>
              <div className="rounded-full bg-orange-200 p-2 dark:bg-orange-800">
                <Briefcase className="h-5 w-5 text-orange-700 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Profile Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Professional Summary */}
          <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {candidate.resume?.summary ? (
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {candidate.resume.summary}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic dark:text-gray-400">
                    No professional summary available
                  </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total Experience
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.resume?.totalExperience || 0} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Education Level
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.resume?.highestEducationLevel
                          ? formatEnumValue(
                              candidate.resume.highestEducationLevel
                            )
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Position & Status */}
          <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Briefcase className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                Current Status & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Status
                    </span>
                    <Badge
                      variant={
                        candidate.status === 'ONBOARDED'
                          ? 'default'
                          : candidate.status === 'REJECTED'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {formatEnumValue(candidate.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Search Status
                    </span>
                    <Badge
                      variant="outline"
                      className="border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400"
                    >
                      {formatEnumValue(candidate.jobSearchStatus)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assessment Stage
                    </span>
                    <Badge variant="outline">
                      {formatEnumValue(candidate.assessmentStage)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Published
                    </span>
                    <Badge
                      variant={candidate.isPublished ? 'default' : 'secondary'}
                    >
                      {candidate.isPublished ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Has Unsaved Changes
                    </span>
                    <Badge
                      variant={candidate.isDirty ? 'destructive' : 'default'}
                    >
                      {candidate.isDirty ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Joined Date
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(candidate.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Work Experience */}
          {candidate.resume?.experience &&
            candidate.resume.experience.length > 0 && (
              <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <Building className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                    Latest Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {candidate.resume.experience.slice(0, 2).map((exp, index) => (
                    <div
                      key={exp.id}
                      className={`${index > 0 ? 'mt-4 border-t border-gray-100 pt-4 dark:border-gray-700' : ''}`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {exp.title}
                          </h3>
                          <p className="text-sm font-medium text-[#6e55cf] dark:text-purple-400">
                            {exp.company}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(exp.startDate)} -{' '}
                          {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </Badge>
                      </div>
                      {exp.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                          {exp.description}
                        </p>
                      )}
                      {exp.projects && exp.projects.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Key Projects:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {exp.projects.slice(0, 3).map((project, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {project.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="rounded-full bg-[#6e55cf]/10 p-2">
                  <Mail className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="truncate text-sm text-gray-700 dark:text-gray-300">
                    {candidate.email}
                  </p>
                </div>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="rounded-full bg-[#6e55cf]/10 p-2">
                    <Phone className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {candidate.phone}
                    </p>
                  </div>
                </div>
              )}
              {candidate.preferences?.preferredLocations &&
                candidate.preferences.preferredLocations.length > 0 && (
                  <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="rounded-full bg-[#6e55cf]/10 p-2">
                      <MapPin className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Preferred Locations
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {candidate.preferences.preferredLocations
                          .slice(0, 2)
                          .join(', ')}
                        {candidate.preferences.preferredLocations.length > 2 &&
                          ` +${candidate.preferences.preferredLocations.length - 2} more`}
                      </p>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Key Skills */}
          <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Key Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {candidate.resume?.skills &&
                candidate.resume.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <CommonTags
                      values={candidate.resume.skills}
                      maxVisible={4}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No skills listed
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Industries */}
          {candidate.resume?.industries &&
            candidate.resume.industries.length > 0 && (
              <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                    Industry Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <CommonTags
                      values={candidate.resume.industries}
                      className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300"
                      maxVisible={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

          {/* USA Work Authorization */}
          {(candidate.resume?.isUSWorkAuthorized !== undefined ||
            candidate.resume?.requiresUSVisaSponsorship !== undefined ||
            candidate.resume?.usWorkAuthorizationStatus) && (
            <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  <Target className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  USA Work Authorization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.resume?.isUSWorkAuthorized !== undefined &&
                  candidate.resume?.isUSWorkAuthorized !== null && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Authorized to Work
                      </span>
                      <Badge
                        variant={
                          candidate.resume.isUSWorkAuthorized
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          candidate.resume.isUSWorkAuthorized
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                        }
                      >
                        {candidate.resume.isUSWorkAuthorized ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  )}

                {candidate.resume?.requiresUSVisaSponsorship !== undefined &&
                  candidate.resume?.requiresUSVisaSponsorship !== null && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Requires Sponsorship
                      </span>
                      <Badge
                        variant={
                          candidate.resume.requiresUSVisaSponsorship
                            ? 'destructive'
                            : 'default'
                        }
                        className={
                          !candidate.resume.requiresUSVisaSponsorship
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                        }
                      >
                        {candidate.resume.requiresUSVisaSponsorship
                          ? 'Yes'
                          : 'No'}
                      </Badge>
                    </div>
                  )}

                {candidate.resume?.usWorkAuthorizationStatus && (
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      Authorization Status
                    </p>
                    <Badge
                      variant="outline"
                      className="border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400"
                    >
                      {formatEnumValue(
                        candidate.resume.usWorkAuthorizationStatus
                      )}
                    </Badge>
                  </div>
                )}

                {candidate.resume?.usWorkAuthorizationDetails && (
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      Additional Details
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {candidate.resume.usWorkAuthorizationDetails}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Partner Information */}
          {candidate.partner && (
            <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  <Users className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  Partner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {candidate.partner.company?.name ||
                        candidate.partner.name}
                    </p>
                    {candidate.partner.company?.contactEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {candidate.partner.company.contactEmail}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
