'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { candidateProfileService } from '@/lib/services/services';
import { logger, ICandidateProfileAndResume } from '@/lib/shared';
import { PublicProfileHeader } from './components/public-profile-header';
import { PublicProfileCard } from './components/public-profile-card';
import { PublicProfessionalSummary } from './components/public-professional-summary';
import { PublicProfessionalDetails } from './components/public-professional-details';
import { PublicAssessmentCards } from './components/public-assessment-cards';

import { PublicProfileNotFound } from './components/public-profile-not-found';
import { PublicProfileLoading } from './components/public-profile-loading';
import { TeamcastShortIcon } from '@/components/icons';

const PublicCandidateProfilePage = () => {
  const params = useParams();
  const candidateId = params?.candidateId as string;

  const {
    data: publicProfile,
    isLoading,
    error,
  } = useQuery<ICandidateProfileAndResume>({
    queryKey: ['public-candidate-profile', candidateId],
    queryFn: async (): Promise<ICandidateProfileAndResume> => {
      try {
        // First try the public API endpoint
        const response =
          await candidateProfileService.getPublicProfileAndResume(candidateId);

        // Handle the actual API response structure
        if (!response || !response.profile || !response.resume) {
          throw new Error('Invalid response from API');
        }

        return response;
      } catch (error) {
        logger.warn(
          'Public profile API not available, falling back to client-side masking:',
          error
        );

        // Fallback: Try to create a demo profile for testing or use mock data
        logger.warn('Using fallback mock data for candidate ID:', candidateId);

        // For any other candidate ID that doesn't exist, throw an error
        throw new Error(`Candidate profile not found for ID: ${candidateId}`);
      }
    },
    enabled: !!candidateId,
    retry: false,
  });

  if (isLoading) {
    return <PublicProfileLoading />;
  }

  if (error || !publicProfile) {
    return <PublicProfileNotFound />;
  }

  const { profile, resume, onboardingAssessment, resumeAssessment } =
    publicProfile;

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Background pattern */}
      <div className="bg-grid-pattern pointer-events-none fixed inset-0 opacity-[0.02]" />

      <div className="relative">
        {/* Navigation padding for fixed header */}
        <div className="h-14 md:h-16" />

        {/* Main content */}
        <div className="mx-auto w-full max-w-7xl px-3 pb-12 sm:px-4 md:px-6 lg:px-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Header Section */}
            <div className="pt-4 sm:pt-6 md:pt-8">
              <PublicProfileHeader profile={profile} />
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-20">
                  <PublicProfileCard profile={profile} resume={resume} />
                </div>
              </div>

              {/* Right Column - Professional Summary & Details */}
              <div className="lg:col-span-8">
                <div className="space-y-4 sm:space-y-6">
                  {/* Professional Summary */}
                  <PublicProfessionalSummary
                    profile={profile}
                    resume={resume}
                  />

                  {/* Professional Details */}
                  <PublicProfessionalDetails
                    profile={profile}
                    resume={resume}
                  />

                  {/* Assessment Cards */}
                  <PublicAssessmentCards
                    profile={profile}
                    resumeAssessment={resumeAssessment}
                    onboardingAssessment={onboardingAssessment}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-border/50 mt-4 pt-4 sm:mt-5 sm:pt-5">
            <div className="mx-auto max-w-7xl">
              <div className="from-card via-card to-muted/20 rounded-xl bg-gradient-to-br p-4 text-center shadow-lg sm:p-6">
                <div className="bg-primary/10 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12">
                  <TeamcastShortIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h4 className="text-foreground mb-2 text-base font-bold sm:text-lg">
                  Powered by Teamcast
                </h4>
                <p className="text-muted-foreground mb-3 text-xs sm:text-sm">
                  AI-driven talent matching platform connecting exceptional
                  professionals with leading companies
                </p>
                <a
                  href="/"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-xs font-semibold transition-colors duration-200 sm:text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about Teamcast
                  <svg
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PublicCandidateProfilePage;
