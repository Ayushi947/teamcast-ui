'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { clientJobPostingService } from '@/lib/services/services';
import { IClientJobPosting, logger } from '@/lib/shared';
import { PublicJobHeader } from './components/public-job-header';
import { TeamcastShortIcon } from '@/components/icons';
import { PublicJobLoading } from './components/public-job-loading';
import { PublicJobNotFound } from './components/public-job-not-found';
import { PublicJobCard } from './components/public-job-card';
import { PublicJobDescription } from './components/public-job-description';
import { PublicJobDetails } from './components/public-job-details';
import { PublicJobCompany } from './components/public-job-company';

const PublicJobPostingPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobPostingId = params?.jobPostingId as string;

  const {
    data: jobPosting,
    isLoading,
    error,
  } = useQuery<IClientJobPosting>({
    queryKey: ['public-job-posting', jobPostingId],
    queryFn: async (): Promise<IClientJobPosting> => {
      try {
        const response =
          await clientJobPostingService.getPublicJobPosting(jobPostingId);
        if (!response) {
          throw new Error('Invalid response from API');
        }
        return response;
      } catch (error) {
        logger.warn(
          'Public job posting API not available, falling back to mock data:',
          error
        );
        logger.warn(
          'Using fallback mock data for job posting ID:',
          jobPostingId
        );
        throw new Error(`Job posting not found for ID: ${jobPostingId}`);
      }
    },
    enabled: !!jobPostingId,
    retry: false,
  });

  // Update document title and URL query params for SEO when job loads
  useEffect(() => {
    if (jobPosting?.title) {
      // Update document title
      document.title = `${jobPosting.title} - Teamcast`;

      // Add job title to URL query params for SEO
      const currentParams = new URLSearchParams(searchParams);
      const currentTitle = currentParams.get('title');

      // Only update if title is different to avoid unnecessary navigation
      if (currentTitle !== jobPosting.title) {
        currentParams.set('title', jobPosting.title);
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        router.replace(newUrl, { scroll: false });
      }
    } else {
      document.title = 'Job Posting - Teamcast';
    }
  }, [jobPosting?.title, router, searchParams]);

  if (isLoading) {
    return <PublicJobLoading />;
  }

  if (error || !jobPosting) {
    return <PublicJobNotFound />;
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Background pattern */}
      <div className="bg-grid-pattern pointer-events-none fixed inset-0 opacity-[0.02]" />

      <div className="relative">
        {/* Navigation padding for fixed header */}
        <div className="h-14 md:h-16" />

        {/* Main content */}
        <div className="mx-auto w-[70%] px-3 pb-12 sm:px-4 lg:px-6">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="pt-6 md:pt-8">
              <PublicJobHeader jobPosting={jobPosting} />
            </div>

            {/* Job Content Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
              {/* Left Sidebar - Job Overview Card */}
              <div className="lg:col-span-4">
                <div className="sticky top-20">
                  <PublicJobCard jobPosting={jobPosting} />
                </div>
              </div>

              {/* Right Content - Scrollable Job Details */}
              <div className="lg:col-span-8">
                <div className="space-y-6">
                  <PublicJobDescription jobPosting={jobPosting} />
                  <PublicJobDetails jobPosting={jobPosting} />
                  <PublicJobCompany jobPosting={jobPosting} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-border/50 mt-5 pt-5">
            <div className="mx-auto max-w-7xl">
              <div className="from-card via-card to-muted/20 rounded-xl bg-gradient-to-br p-6 text-center shadow-lg">
                <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <TeamcastShortIcon className="h-6 w-6" />
                </div>
                <h4 className="text-foreground mb-2 text-lg font-bold">
                  Powered by Teamcast
                </h4>
                <p className="text-muted-foreground mb-3 text-sm">
                  AI-driven talent matching platform connecting exceptional
                  professionals with leading companies
                </p>
                <a
                  href="/"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about Teamcast
                  <svg
                    className="h-3.5 w-3.5"
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

export default PublicJobPostingPage;
