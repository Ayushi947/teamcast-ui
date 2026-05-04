'use client';

import { useApp } from '@/lib/context/app-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchService } from '@/lib/services/services';
import { ISearchResult, ISearchRequest, ISearchResponse } from '@/lib/shared';
import { Loader2 } from 'lucide-react';

// Import components
import { JobCard, Job } from './components/job-card';
import { ActionBar } from './components/apply-dialog';
import { EmptyState } from './components/empty-state';
import { Button } from '@/components/ui/button';
import { JobRecommendationBanner } from './components/job-recommended-banner';
import { SearchFilterSection } from './components/search-filter-section';
import Navbar from '@/app/(pages)/(website)/components/navbar';
import { HeroSection } from './components/HeroSection';

const MatchPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();
  const isLoggedIn = !!user;

  // Initialize state from URL params for proper deep linking
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('query') || ''
  );
  const [showJobDetails, setShowJobDetails] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [pageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [groundingInfo, setGroundingInfo] = useState<string | null>(null);

  const { data: searchJobsResponse, isLoading: isSearchLoading } =
    useQuery<ISearchResponse>({
      queryKey: ['searchJobs', searchQuery, page],
      queryFn: () => {
        const searchRequest: ISearchRequest = {
          query: searchQuery,
          limit: pageSize,
          page: page,
        };
        return SearchService.searchJobs(searchRequest);
      },
    });

  // Map search results to our job format
  const mappedJobs = useMemo(() => {
    return (
      searchJobsResponse?.results?.map((result: ISearchResult) => {
        const metadata = result.metadata || {};
        const job: Job = {
          id: result.id,
          title: result.jobTitle || '',
          company: result.companyName || 'Company',
          companyLogo: 'https://randomuser.me/api/portraits/men/1.jpg', // Default placeholder
          location: Array.isArray(metadata.locations)
            ? metadata.locations[0]
            : 'Remote',
          salary: metadata.salary
            ? `$${(metadata.salary.min / 1000).toFixed(0)}k - $${(metadata.salary.max / 1000).toFixed(0)}k`
            : 'Salary not specified',
          type: metadata.jobType || 'Full-time',
          description: result.description || 'No description provided',
          requirements: Array.isArray(metadata.requiredSkills)
            ? metadata.requiredSkills
            : [],
          matchScore: Number(result.score) || 0,
          score: Number(result.score) || 0,
          matchDetails: {
            skills: 85,
            experience: 80,
            education: 75,
          },
          employeeCount: '200 - 500 employees',
          postedTime: '2 hours ago',
          experienceLevel: '5+ Yrs',
        };
        return job;
      }) || []
    );
  }, [searchJobsResponse?.results]);

  useEffect(() => {
    if (searchJobsResponse?.overallGroundingInfo) {
      setGroundingInfo(searchJobsResponse.overallGroundingInfo);
    } else if (searchJobsResponse) {
      // Clear grounding info if response exists but has no grounding info
      setGroundingInfo(null);
    }
  }, [searchJobsResponse]);

  // Use mapped jobs directly since API already handles search filtering
  const filteredJobs = mappedJobs;

  // New: search only on Enter
  const handleSearchInputSubmit = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setPage(1);

      // Update URL params
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('query', value);
      } else {
        params.delete('query');
      }
      params.delete('page'); // Always reset page
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setPage(1);

    // Clear query param from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('query');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);

      // Update URL params with new page
      const params = new URLSearchParams(searchParams.toString());
      if (newPage > 1) {
        params.set('page', newPage.toString());
      } else {
        params.delete('page');
      }
      router.replace(`?${params.toString()}`, { scroll: false });

      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, router]
  );

  const toggleJobDetails = useCallback(
    (id: string, e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setShowJobDetails((prevId) => (prevId === id ? null : id));
    },
    []
  );

  const toggleJobSelection = useCallback(
    (jobId: string, e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setSelectedJobs((prev) => {
        if (prev.includes(jobId)) {
          return prev.filter((id) => id !== jobId);
        } else {
          return [...prev, jobId];
        }
      });
    },
    []
  );

  const applyToJobs = useCallback(() => {
    if (selectedJobs.length === 0) return;

    if (isLoggedIn) {
      // If logged in, go to application page
      router.push('/app/candidate/applications');
    } else {
      // If not logged in, go to signup page
      router.push('/app/candidate/signup/resume');
    }
  }, [selectedJobs, isLoggedIn, router]);

  const handleViewModeChange = useCallback((mode: 'list' | 'grid') => {
    setViewMode(mode);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="bg-primary/5 absolute top-64 left-[35%] z-0 h-96 w-96 rounded-full blur-3xl dark:hidden"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Sticky Search and Filter Section */}
      <div className="sticky top-20 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto w-full px-4 py-4 sm:w-[90%] sm:px-6 lg:px-8 xl:w-[70%]">
          <SearchFilterSection
            searchQuery={searchQuery}
            onSearchInputSubmit={handleSearchInputSubmit}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>
      </div>

      {/* Scrollable Job Content */}
      <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 xl:w-9/12">
        {isSearchLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin dark:text-indigo-400" />
          </div>
        ) : (
          <>
            {/* Job Recommendation Banner */}
            {groundingInfo && (
              <JobRecommendationBanner groundingInfo={groundingInfo} />
            )}
            {/* Job Grid */}
            <div
              className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${viewMode == 'list' ? 'xl:grid-cols-1' : 'xl:grid-cols-3'}`}
            >
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.id + index}
                  job={job}
                  isSelected={selectedJobs.includes(job.id)}
                  onSelect={toggleJobSelection}
                  onToggleDetails={toggleJobDetails}
                  showDetails={showJobDetails === job.id}
                />
              ))}
            </div>

            {/* No Results Message */}
            {filteredJobs.length === 0 && (
              <EmptyState type="no-results" onClearFilters={clearSearch} />
            )}

            {/* Pagination Controls */}
            {searchJobsResponse && searchJobsResponse.total > pageSize && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(page - 1, 1))}
                    disabled={page === 1 || isSearchLoading}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page {page} of{' '}
                    {Math.ceil(
                      searchJobsResponse.total / searchJobsResponse.pageSize
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(
                        Math.min(
                          page + 1,
                          Math.ceil(
                            searchJobsResponse.total /
                              searchJobsResponse.pageSize
                          )
                        )
                      )
                    }
                    disabled={
                      page >=
                        Math.ceil(
                          searchJobsResponse.total / searchJobsResponse.pageSize
                        ) || isSearchLoading
                    }
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Bar - Fixed at bottom */}
      {selectedJobs.length > 0 && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-800">
          <ActionBar
            selectedJobs={selectedJobs}
            onClearSelection={() => setSelectedJobs([])}
            onApply={applyToJobs}
          />
        </div>
      )}
    </div>
  );
};

// Loading fallback component
const MatchPageLoading = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-gray-600 dark:text-gray-300">
          Loading job search...
        </p>
      </div>
    </div>
  </div>
);

// Main component with Suspense boundary
const MatchPage = () => {
  return (
    <Suspense fallback={<MatchPageLoading />}>
      <MatchPageContent />
    </Suspense>
  );
};

export default MatchPage;
