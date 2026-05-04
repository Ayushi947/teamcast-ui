'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  CandidateResumeAssessmentStatusEnum,
  CandidateOnboardingAssessmentStatusEnum,
  IPartnerCandidateDetailed,
} from '@/lib/shared';
import { formatEnumValue, formatScore } from '@/lib/utils';

interface AssessmentsTabProps {
  candidate: IPartnerCandidateDetailed;
}

export function AssessmentsTab({ candidate }: AssessmentsTabProps) {
  const hasResumeAssessment = candidate.resumeAssessment;

  if (!hasResumeAssessment) {
    return (
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <Brain className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No Assessments Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This candidate has not completed any assessments yet.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resume Assessment */}
      {candidate.resumeAssessment && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                  Resume Assessment
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Score: {formatScore(candidate.resumeAssessment.score)}% •
                  Status:{' '}
                  {formatEnumValue(candidate.resumeAssessment.status || '')} •
                  Result:{' '}
                  {formatEnumValue(candidate.resumeAssessment.result || '')}
                </CardDescription>
              </div>
              <Badge className="bg-[#6e55cf] px-3 py-1 text-xs font-medium text-white">
                {formatEnumValue(
                  candidate.resumeAssessment.recommendation || 'Not Available'
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Assessment Results
              </h3>
              <div>
                <div className="space-y-3 rounded-lg border border-gray-100 bg-gradient-to-br from-[#6e55cf]/5 to-[#6e55cf]/10 p-4 hover:border-[#6e55cf]/30 dark:border-gray-700 dark:from-purple-900/20 dark:to-purple-800/20 dark:hover:border-purple-400/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Result
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatEnumValue(candidate.resumeAssessment.result || '')}
                    </span>
                  </div>
                  {candidate.resumeAssessment.overallFeedback && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {candidate.resumeAssessment.overallFeedback}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Assessment Score Card */}
            <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:border-gray-700 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Overall Score
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resume Assessment Performance
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#6e55cf] dark:text-purple-400">
                    {formatScore(candidate.resumeAssessment.score)}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {candidate.resumeAssessment.score >= 70
                      ? 'Excellent'
                      : candidate.resumeAssessment.score >= 50
                        ? 'Good'
                        : 'Needs Improvement'}
                  </p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            {(() => {
              const strengths = Array.isArray(
                candidate.resumeAssessment?.strengths
              )
                ? candidate.resumeAssessment.strengths.filter(
                    (s) => typeof s === 'string' && s.trim() !== ''
                  )
                : [];

              return (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Strengths
                  </h3>
                  {strengths.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {strengths.map((strength, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {strength}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Not available
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Areas for Improvement */}
            {(() => {
              const rawAreas = candidate.resumeAssessment?.areasForImprovement;
              const areas =
                Array.isArray(rawAreas) && rawAreas.length > 0
                  ? rawAreas.filter(
                      (a) =>
                        typeof a === 'string' &&
                        a.trim() !== '' &&
                        a.trim() !== '00'
                    )
                  : [];

              return (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Areas for Improvement
                  </h3>
                  {areas.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {areas.map((area, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20"
                        >
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {area}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Not available
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Assessment Status Overview */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Assessment Status
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Resume Assessment
                  </span>
                  <Badge
                    variant={
                      candidate.resumeAssessmentStatus ===
                      CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {formatEnumValue(candidate.resumeAssessmentStatus)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Onboarding Assessment
                  </span>
                  <Badge
                    variant={
                      candidate.onboardingAssessmentStatus ===
                      CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {formatEnumValue(candidate.onboardingAssessmentStatus)}
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Summary */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Target className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Assessment Summary
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Overview of candidate assessment performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Current Assessment Stage
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatEnumValue(candidate.assessmentStage)}
                  </p>
                </div>
                <div className="rounded-full bg-[#6e55cf]/10 p-2">
                  <TrendingUp className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                </div>
              </div>
            </div>

            {candidate.resumeAssessment && (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Resume Assessment Complete
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Score: {formatScore(candidate.resumeAssessment.score)}%
                    </p>
                  </div>
                  <Badge
                    variant={
                      candidate.resumeAssessment.score >= 70
                        ? 'default'
                        : candidate.resumeAssessment.score >= 50
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {candidate.resumeAssessment.score >= 70
                      ? 'Excellent'
                      : candidate.resumeAssessment.score >= 50
                        ? 'Good'
                        : 'Needs Review'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
