'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import {
  IClientJobPosting,
  IClientJobApplication,
  IJobPostingRecommendation,
  JobPostingStatusEnum,
} from '@/lib/shared';
import { JobOverviewTab } from './job-overview-tab';
import { JobApplicationsTab } from './job-applications-tab';
import { JobRecommendationsTab } from './job-recommendations-tab';
import { JobOutsourceTab } from './job-outsource-tab';
import React from 'react';

interface JobDetailsPanelProps {
  selectedJob: IClientJobPosting | null;
  applications: IClientJobApplication[];
  recommendations?: IJobPostingRecommendation[] | null;
  applicationsLoading: boolean;
  recommendationsLoading: boolean;
  applicationStatusFilter: string;
  onApplicationStatusFilterChange: (status: string) => void;
  onEditJob: () => void;
  onViewJobDetails: () => void;
  onRecommendationsScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onLoadMoreRecommendations?: () => void;
  onUploadSuccess?: () => void;
}

// Helper function to format enum values

// Get status badge variant

export function JobDetailsPanel({
  selectedJob,
  applications,
  recommendations,
  applicationsLoading,
  recommendationsLoading,
  applicationStatusFilter,
  onApplicationStatusFilterChange,
  onRecommendationsScroll,
  onLoadMoreRecommendations,
  onUploadSuccess,
}: JobDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Check if recommendations should be disabled
  const isRecommendationsDisabled =
    selectedJob &&
    (selectedJob.status === JobPostingStatusEnum.DRAFT ||
      selectedJob.status === JobPostingStatusEnum.CLOSED ||
      selectedJob.status === JobPostingStatusEnum.ARCHIVED);

  // Auto-switch away from recommendations tab if it becomes disabled
  if (activeTab === 'recommendations' && isRecommendationsDisabled) {
    setActiveTab('overview');
  }

  // Tab definitions
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'applications', label: 'Applications', badge: applications.length },
    {
      key: 'recommendations',
      label: 'AI Recommendations',
      badge: recommendations?.length || 0,
      disabled: !!isRecommendationsDisabled,
    },
    { key: 'outsource', label: 'Outsource', badge: 0 },
  ];

  if (!selectedJob) {
    return (
      <Card className="flex min-h-[600px] items-center justify-center border-0 bg-white/90 shadow-md backdrop-blur-sm dark:bg-gray-900/90">
        <div className="p-8 text-center">
          <div className="bg-primary mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Briefcase className="h-10 w-10 text-white" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
            Select a Job Posting
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-gray-500 md:text-base dark:text-gray-400">
            Choose a job from the list to view detailed information, track
            applications, and discover candidate recommendations powered by AI
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-[calc(100vh-8rem)] flex-col border-0 bg-white/95 shadow-md backdrop-blur-sm dark:bg-gray-900/95">
      <CardContent className="flex-1 overflow-hidden p-0">
        {/* Chrome-like custom tab bar */}
        <div className="chrome-tabs-bar bg-muted/80 flex border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`chrome-tab px-6 py-2 text-sm font-medium transition-all duration-200 focus:outline-none ${
                activeTab === tab.key
                  ? 'chrome-tab-selected'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              } ${tab.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              disabled={tab.disabled}
              type="button"
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <Badge
                  variant="secondary"
                  className={`ml-2 text-xs ${tab.key === 'applications' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''} ${tab.key === 'recommendations' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''} ${tab.key === 'outsource' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : ''}`}
                >
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
        {/* Chrome-like tab content area */}
        <div className="chrome-tab-content h-full overflow-auto p-0">
          {activeTab === 'overview' && <JobOverviewTab job={selectedJob} />}
          {activeTab === 'applications' && (
            <JobApplicationsTab
              applications={applications || []}
              isLoading={applicationsLoading}
              statusFilter={applicationStatusFilter}
              onStatusFilterChange={onApplicationStatusFilterChange}
              job={selectedJob}
            />
          )}
          {activeTab === 'recommendations' && (
            <JobRecommendationsTab
              recommendations={(recommendations || []) as any}
              onViewProfile={() => {
                // Handle view profile
              }}
              onScroll={onRecommendationsScroll}
              onLoadMore={onLoadMoreRecommendations}
              isLoadingMore={recommendationsLoading}
              job={selectedJob}
            />
          )}
          {activeTab === 'outsource' && selectedJob && (
            <JobOutsourceTab
              job={selectedJob}
              onUploadSuccess={onUploadSuccess}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
