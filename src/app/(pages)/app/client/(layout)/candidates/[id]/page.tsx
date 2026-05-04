'use client';

import { Button } from '@/components/ui/button';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { ArrowLeft, Briefcase, CalendarDays, MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  candidateJobAiAssessmentService,
  candidateOnboardingAssessmentService,
  candidateProfileService,
  candidateResumeAssessmentService,
  candidateResumeService,
  clientJobApplicationService,
} from '@/lib/services/services';
import {
  ICandidateOnboardingAssessment,
  ICandidateProfile,
  ICandidateJobAiAssessment,
  IClientJobApplication,
  IClientJobApplicationAiAssessment,
  IResume,
  IResumeAssessment,
} from '@/lib/shared';
import { IPaginatedResponse } from '@/lib/shared/models/api/common/common.api';

import { AssessmentTab } from '@/components/app/client/candidate/assessment-tab';
import { OverviewTab } from '@/components/app/client/candidate/overview-tab';

const ApplicationPage = () => {
  const params = useParams();
  const candidateId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');

  const { data: profile } = useQuery<ICandidateProfile>({
    queryKey: ['candidate-profile', candidateId],
    queryFn: () =>
      candidateProfileService.getProfileById(candidateId as string),
  });

  const { data: onboardingAssessment } = useQuery({
    queryKey: ['onboarding-assessment', candidateId],
    queryFn: () =>
      candidateOnboardingAssessmentService.getLatestAssessmentByCandidateId(
        candidateId as string
      ),
  });

  const { data: resumeAssessment } = useQuery({
    queryKey: ['resumeAssessment', candidateId],
    queryFn: () =>
      candidateResumeAssessmentService.getLatestAssessmentByCandidateId(
        candidateId as string
      ),
    enabled: !!candidateId,
  });

  const { data: jobAssessmentDetails } = useQuery<ICandidateJobAiAssessment>({
    queryKey: ['jobAssessment', candidateId],
    queryFn: () =>
      candidateJobAiAssessmentService.getLatestJobAiAssessmentByCandidateId(
        candidateId as string
      ),
    enabled: !!candidateId,
  });

  const { data: candidateJobApplications } = useQuery<
    IPaginatedResponse<IClientJobApplication>
  >({
    queryKey: ['candidateJobApplications', candidateId],
    queryFn: () =>
      clientJobApplicationService.getJobApplications({
        userId: candidateId,
        page: 1,
        limit: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!candidateId,
  });

  const latestCandidateApplication = candidateJobApplications?.items?.[0];
  const latestApplicationId = latestCandidateApplication?.id;

  const { data: clientJobApplicationAiAssessment } =
    useQuery<IClientJobApplicationAiAssessment | null>({
      queryKey: ['clientJobApplicationAiAssessment', latestApplicationId],
      queryFn: () =>
        clientJobApplicationService.getJobApplicationAiAssessment(
          latestApplicationId as string
        ),
      enabled: !!latestApplicationId,
    });

  const handleBackFromDetails = () => {
    window.history.back();
  };

  const { data: candidateResumeData } = useQuery({
    queryKey: ['candidateResume', candidateId],
    queryFn: () =>
      candidateResumeService.getPublicResume(candidateId as string),
    enabled: !!candidateId,
  });

  // Define tabs configuration
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'assessments', label: 'Assessments' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab candidateResumeData={candidateResumeData as IResume} />
        );

      case 'assessments':
        return (
          <AssessmentTab
            clientJobApplicationAiAssessment={
              clientJobApplicationAiAssessment || undefined
            }
            onboardingAssessment={
              onboardingAssessment as ICandidateOnboardingAssessment
            }
            resumeAssessment={resumeAssessment as IResumeAssessment}
            jobAssessmentDetails={jobAssessmentDetails}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 p-4 backdrop-blur-3xl dark:bg-gray-900">
        <div className="mx-auto">
          <div className="space-y-4">
            <div className="mb-3 flex items-center">
              <Button
                variant="outline"
                onClick={handleBackFromDetails}
                className="bg-secondary text-secondary-foreground gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Recommendations
              </Button>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center">
                  <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
                    Candidate Details
                  </h1>
                </div>
                <p className="text-md text-gray-600 dark:text-gray-400">
                  Review and manage the application details for this candidate.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-lg bg-white px-8 py-4 lg:flex-row lg:items-start lg:justify-between dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <Avatar className="border-gray-250 h-24 w-24 rounded-full border-4 dark:border-gray-600">
                    <AvatarImage
                      src={profile?.image || ''}
                      alt={candidateResumeData?.name || 'Candidate'}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-base font-semibold text-white">
                      {candidateResumeData?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'CA'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="">
                    <div className="flex gap-4">
                      <h1 className="truncate text-lg font-semibold text-black dark:text-white">
                        {candidateResumeData?.name}
                      </h1>
                    </div>
                    <div className="mt-2 flex items-center gap-6">
                      <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <Briefcase className="h-4 w-4" />
                        {candidateResumeData?.jobTitle}
                      </p>

                      <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4" />
                        {candidateResumeData?.location}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="h-4 w-4" />
                        {candidateResumeData?.totalExperience} years of
                        experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Menu in Sticky Header */}
            <CustomTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto">
          <div className="space-y-4">
            {/* Tab Content */}
            <div className="space-y-4">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
