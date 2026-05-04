'use client';
import { BreifCaseIcon } from '@/components/icons';
import { ArrowLeft, Clock } from 'lucide-react';
import {
  CorrectTickIcon,
  DollarIcon,
  UserItemCardIcons,
  LocationIcon,
  CompanyCardIcon,
} from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clientJobPostingService } from '@/lib/services/services';
import { Label } from '@/components/ui/label';
import { useParams, useRouter } from 'next/navigation';
import { formatEnumValue } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context/app-context';
import { UserRoleEnum } from '@/lib/shared/models/common/enums';
import { useState, useEffect } from 'react';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { SupportJobRecommendationsTab } from './components/support-job-recommendations-tab';
import { SupportJobRecommendationPreviewTab } from './components/support-job-recommendation-preview-tab';
import { SupportJobApplicationsTab } from './components/support-job-applications-tab';
import { SupportImportedCandidatesTab } from './components/support-imported-candidates-tab';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useApp();
  const jobId = params['job-id'] as string;

  // Check if user is a recruiter or account manager
  const isRecruiter = user?.role === UserRoleEnum.RECRUITER;
  const isAccountManager = user?.role === UserRoleEnum.ACCOUNT_MANAGER;
  const hasRecommendationAccess = isRecruiter || isAccountManager;

  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Define tabs - show applications, recommendations, and imported candidates tabs for recruiters and account managers
  const tabs = hasRecommendationAccess
    ? [
        { label: 'Overview', key: 'overview' },
        { label: 'Applications', key: 'applications' },
        { label: 'Recommendations', key: 'recommendations' },
        { label: 'Suggested Recommendations', key: 'recommendation-preview' },
        { label: 'Integrations Invites', key: 'imported-candidates' },
      ]
    : [{ label: 'Overview', key: 'overview' }];

  const handleBackFromDetails = () => {
    // Navigate back based on user role
    if (isRecruiter) {
      router.push('/app/support/sourcing');
    } else if (isAccountManager) {
      router.push('/app/support/job-postings');
    } else {
      router.back();
    }
  };

  const queryClient = useQueryClient();

  const { data: jobDetails, isLoading } = useQuery({
    queryKey: ['job-details', jobId],
    queryFn: () => clientJobPostingService.getJobPosting(jobId),
  });

  // Invalidate stored recommendations query when switching to recommendations tab
  useEffect(() => {
    if (activeTab === 'recommendations' && jobId) {
      queryClient.invalidateQueries({
        queryKey: ['support-job-stored-recommendations', jobId],
      });
    }
  }, [activeTab, jobId, queryClient]);

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-primary/10 mt-4 space-y-6 rounded-lg p-6">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="bg-card dark:bg-primary/10 mt-4 space-y-6 rounded-lg p-6">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
            <ArrowLeft className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Job Not Found
          </h3>
          <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">
            The requested job posting could not be found or you don&apos;t have
            access to view it.
          </p>
          <Button onClick={handleBackFromDetails} className="space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-primary/10 mt-4 space-y-6 rounded-lg p-6">
      {/* Key Information Grid */}
      <div className="mb-3 flex items-center">
        <Button
          variant="outline"
          onClick={handleBackFromDetails}
          className="bg-secondary text-secondary-foreground gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isRecruiter
            ? 'Back to Sourcing'
            : isAccountManager
              ? 'Back to Job Postings'
              : 'Back to Job Postings'}
        </Button>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center">
            <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
              {jobDetails?.title}
            </h1>
          </div>
          <p className="text-md text-gray-600 dark:text-gray-400">
            Details for {jobDetails?.title}.
          </p>
        </div>
      </div>

      {/* Tabs for Recruiters */}
      {hasRecommendationAccess && (
        <div className="mb-6">
          <CustomTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
            }}
          />
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#FFEFDF] dark:bg-blue-900">
                  <BreifCaseIcon />
                </div>
                <div className="flex min-h-[40px] flex-1 items-center">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Type & Commitment
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatEnumValue(jobDetails?.jobType ?? 'N/A')}
                      <span className="ml-4">
                        • {formatEnumValue(jobDetails?.jobCommitment ?? 'N/A')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100 dark:bg-green-900">
                  <Clock className="h-5 w-5 text-black dark:text-green-400" />
                </div>
                <div className="flex min-h-[40px] flex-1 items-center">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Experience Required
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {jobDetails?.totalExperience} years
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900">
                  <DollarIcon />
                </div>
                <div className="flex min-h-[40px] flex-1 items-center">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Salary Range
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {jobDetails?.minSalary?.toLocaleString()} -
                      {jobDetails?.maxSalary?.toLocaleString()}{' '}
                      {jobDetails?.salaryCurrency}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#DBFFE5] dark:bg-orange-900">
                  <UserItemCardIcons />
                </div>
                <div className="flex min-h-[40px] flex-1 items-center">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Openings Available
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {jobDetails?.numberOfOpenings}{' '}
                      {jobDetails?.numberOfOpenings === 1
                        ? 'position'
                        : 'positions'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#E5E5FF] dark:bg-indigo-900">
                  <LocationIcon />
                </div>
                <div className="flex min-h-[40px] flex-1 items-center">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Work Location
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {jobDetails?.preferredLocations?.join(', ') ||
                        'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {jobDetails?.department && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#FFE5E5] dark:bg-teal-900">
                    <CompanyCardIcon />
                  </div>
                  <div className="flex min-h-[40px] flex-1 items-center">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Department
                      </Label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {jobDetails?.department}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-base font-semibold text-gray-900 dark:text-white">
                Job Description
              </Label>
            </div>
            <div className="rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {jobDetails?.description}
              </p>
            </div>
          </div>

          <Separator />
          {/* Responsibilities */}
          {jobDetails?.responsibilities &&
            jobDetails?.responsibilities.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Key Responsibilities
                  </Label>
                </div>
                <div className="rounded-lg">
                  <ul className="space-y-3">
                    {jobDetails?.responsibilities.map(
                      (responsibility: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CorrectTickIcon />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {responsibility}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            )}

          <Separator />

          {/* Required Skills */}
          {jobDetails?.requiredSkills &&
            jobDetails?.requiredSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Required Skills
                  </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobDetails?.requiredSkills.map(
                    (skill: string, index: number) => (
                      <div
                        key={index}
                        className="bg-card rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-500 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      >
                        {skill}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          <Separator />

          {/* Preferred Skills */}
          {jobDetails?.preferredSkills &&
            jobDetails?.preferredSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Preferred Skills
                  </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobDetails?.preferredSkills.map(
                    (skill: string, index: number) => (
                      <div
                        key={index}
                        className="bg-card rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-500 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      >
                        {skill}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          <Separator />

          {/* Benefits */}
          {jobDetails?.benefits && jobDetails?.benefits.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                  Benefits & Perks
                </Label>
              </div>
              <div className="rounded-lg">
                <ul className="space-y-2">
                  {jobDetails?.benefits.map(
                    (benefit: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CorrectTickIcon />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {benefit}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Applications Tab Content */}
      {activeTab === 'applications' && hasRecommendationAccess && (
        <div className="space-y-6">
          <SupportJobApplicationsTab job={jobDetails} />
        </div>
      )}

      {/* Recommendations Tab Content */}
      {activeTab === 'recommendations' && hasRecommendationAccess && (
        <div className="space-y-6">
          <SupportJobRecommendationsTab job={jobDetails} />
        </div>
      )}

      {/* Recommendation Preview Tab Content */}
      {activeTab === 'recommendation-preview' && hasRecommendationAccess && (
        <div className="space-y-6">
          <SupportJobRecommendationPreviewTab
            job={jobDetails}
            onRecommendationStored={() => setActiveTab('recommendations')}
          />
        </div>
      )}

      {/* Imported Candidates Tab Content */}
      {activeTab === 'imported-candidates' && hasRecommendationAccess && (
        <div className="space-y-6">
          <SupportImportedCandidatesTab job={jobDetails} />
        </div>
      )}
    </div>
  );
}
