'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  candidateRecommendationApiService,
  candidateJobPostingService,
} from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import { JobCards } from './components/job-cards';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Briefcase,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  JobRecommendationResponse,
  mapJobPostingToRecommendationItem,
} from './types';
import EmptyState from './components/empty-state';
import Image from 'next/image';
import { getUser } from '@/lib/utils/auth-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RECOMMENDED_PAGE_SIZE = 9;
const ALL_JOBS_PAGE_SIZE = 12;

function JobCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-2xl border shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-auto flex justify-between pt-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function JobRecommendationPage() {
  const user = getUser();
  const [candidateProfileIncomplete, setCandidateProfileIncomplete] =
    useState(false);
  const candidateId = user?.candidateId ?? '';
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [allJobsPage, setAllJobsPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [commitmentFilter, setCommitmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('recommended');

  const {
    data: jobRecommendationsResponse,
    isLoading: isRecommendationsLoading,
    error: recommendationsError,
  } = useQuery<JobRecommendationResponse>({
    queryKey: [
      'jobRecommendations',
      candidateId,
      recommendedPage,
      RECOMMENDED_PAGE_SIZE,
    ],
    queryFn: async () => {
      if (!candidateId) throw new Error('Missing candidate ID');
      const response =
        await candidateRecommendationApiService.getCandidateRecommendations(
          candidateId,
          {
            data: undefined,
            filters: {},
            pagination: {
              page: recommendedPage,
              limit: RECOMMENDED_PAGE_SIZE,
            },
          }
        );

      return {
        items: response.items.map((item: any) => ({
          id: item.jobPosting?.id || item.id,
          title: item.jobPosting?.title || 'Untitled Position',
          description: item.jobPosting?.description || '',
          company: item.jobPosting?.client?.company
            ? {
                name: item.jobPosting.client.company.name || 'Unknown Company',
                id: item.jobPosting.client.company.id || '',
              }
            : { name: 'Unknown Company', id: '' },
          preferredLocations: item.jobPosting?.preferredLocations || [],
          minSalary: item.jobPosting?.minSalary,
          maxSalary: item.jobPosting?.maxSalary,
          salaryCurrency: item.jobPosting?.salaryCurrency || 'USD',
          jobType: item.jobPosting?.jobType || '',
          jobCommitment: item.jobPosting?.jobCommitment || '',
          isRemote: item.jobPosting?.isRemote || false,
          reportingTo: item.jobPosting?.reportingTo || '',
          matchScore: item.score || 0,
          matchReason: item.matchReason || [],
          matchDetails: {
            semanticScore: item.score || 0,
            titleScore: 0,
            skillsScore: 0,
          },
          totalExperience: item.jobPosting?.totalExperience,
        })),
        pagination: response.pagination,
      };
    },
    enabled: !!candidateId,
  });

  const {
    data: allJobsResponse,
    isLoading: isAllJobsLoading,
    error: allJobsError,
  } = useQuery({
    queryKey: ['candidateAllJobs', allJobsPage, ALL_JOBS_PAGE_SIZE],
    queryFn: async () => {
      return candidateJobPostingService.getJobPostings({
        page: allJobsPage,
        limit: ALL_JOBS_PAGE_SIZE,
      });
    },
  });

  const recommendedItems = jobRecommendationsResponse?.items ?? [];
  const recommendedPagination = jobRecommendationsResponse?.pagination;
  const allJobsItems = (allJobsResponse?.items ?? []).map(
    mapJobPostingToRecommendationItem
  );
  const allJobsPagination = allJobsResponse?.pagination;

  useEffect(() => {
    if (
      (jobRecommendationsResponse as any)?.errorCode === 'NO_JOB_PREFERENCES'
    ) {
      setCandidateProfileIncomplete(true);
    }
  }, [jobRecommendationsResponse]);

  // Filter all jobs based on search and filters
  const filteredAllJobs = allJobsItems.filter((job) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(searchLower) ||
        job.company?.name.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Location filter
    if (locationFilter !== 'all') {
      if (locationFilter === 'remote' && !job.isRemote) return false;
      if (locationFilter === 'onsite' && job.isRemote) return false;
    }

    // Commitment filter
    if (commitmentFilter !== 'all') {
      if (job.jobCommitment !== commitmentFilter) return false;
    }

    return true;
  });

  const recommendedTotalPages = recommendedPagination?.total
    ? Math.ceil(recommendedPagination.total / RECOMMENDED_PAGE_SIZE)
    : 1;
  const allJobsTotalPages = allJobsPagination?.total
    ? Math.ceil(allJobsPagination.total / ALL_JOBS_PAGE_SIZE)
    : 1;

  return (
    <div className="h-full space-y-6 px-4 py-2">
      {/* Original simple header */}
      <div>
        <div className="mb-2 flex items-center">
          <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
            Jobs
          </h1>
        </div>
        <p className="text-md text-gray-600 dark:text-gray-400">
          Explore recommended roles that match your profile and browse all
          available jobs on the platform.
        </p>
      </div>

      {candidateProfileIncomplete && (
        <Card className="border-2 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="flex flex-col items-center py-8 text-center sm:py-12">
            <h2 className="text-foreground text-lg font-semibold sm:text-xl">
              Complete your profile
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              Add job preferences and skills to get personalized
              recommendations. You can still browse all jobs below.
            </p>
            <div className="mt-6">
              <Image
                src="/illustrations/resume_assessment_illustration.svg"
                alt=""
                width={180}
                height={180}
                className="object-contain opacity-90"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for better organization */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="recommended" className="cursor-pointer gap-2">
              <Sparkles className="h-4 w-4" />
              Recommended
              {!isRecommendationsLoading &&
                !recommendationsError &&
                recommendedPagination?.total != null && (
                  <span className="bg-primary/20 text-primary ml-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {recommendedPagination.total}
                  </span>
                )}
            </TabsTrigger>
            <TabsTrigger value="all" className="cursor-pointer gap-2">
              <Briefcase className="h-4 w-4" />
              All Jobs
              {!isAllJobsLoading &&
                !allJobsError &&
                allJobsPagination?.total != null && (
                  <span className="bg-primary/20 text-primary ml-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {allJobsPagination.total}
                  </span>
                )}
            </TabsTrigger>
          </TabsList>

          {/* Filters - only show when on All Jobs tab */}
          {activeTab === 'all' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={commitmentFilter}
                onValueChange={setCommitmentFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FULL_TIME">Full time</SelectItem>
                  <SelectItem value="PART_TIME">Part time</SelectItem>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="PROJECT_BASED">Project based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Recommended Jobs Tab */}
        <TabsContent value="recommended" className="mt-6 space-y-6">
          {isRecommendationsLoading && <JobCardSkeleton count={3} />}

          {recommendationsError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-8 text-center">
                <p className="text-destructive text-sm font-medium">
                  Could not load recommendations. Please try again.
                </p>
              </CardContent>
            </Card>
          )}

          {!isRecommendationsLoading &&
            !recommendationsError &&
            recommendedItems.length === 0 && (
              <div className="py-4">
                <EmptyState onBrowseJobs={() => setActiveTab('all')} />
              </div>
            )}

          {!isRecommendationsLoading &&
            !recommendationsError &&
            recommendedItems.length > 0 && (
              <>
                <JobCards recommendations={recommendedItems} />
                {recommendedTotalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRecommendedPage((p) => Math.max(1, p - 1))
                      }
                      disabled={recommendedPage === 1}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-muted-foreground min-w-[120px] text-center text-sm">
                      Page {recommendedPage} of {recommendedTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRecommendedPage((p) =>
                          Math.min(recommendedTotalPages, p + 1)
                        )
                      }
                      disabled={recommendedPage >= recommendedTotalPages}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
        </TabsContent>

        {/* All Jobs Tab */}
        <TabsContent value="all" className="mt-6 space-y-6">
          {isAllJobsLoading && <JobCardSkeleton count={6} />}

          {allJobsError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-8 text-center">
                <p className="text-destructive text-sm font-medium">
                  Could not load jobs. Please try again.
                </p>
              </CardContent>
            </Card>
          )}

          {!isAllJobsLoading &&
            !allJobsError &&
            filteredAllJobs.length === 0 && (
              <Card className="bg-muted/30">
                <CardContent className="py-12 text-center">
                  <Briefcase className="text-muted-foreground mx-auto h-12 w-12" />
                  <p className="text-foreground mt-3 text-sm font-medium">
                    {searchQuery ||
                    locationFilter !== 'all' ||
                    commitmentFilter !== 'all'
                      ? 'No jobs match your filters'
                      : 'No jobs available'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {searchQuery ||
                    locationFilter !== 'all' ||
                    commitmentFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Check back later for new openings'}
                  </p>
                </CardContent>
              </Card>
            )}

          {!isAllJobsLoading && !allJobsError && filteredAllJobs.length > 0 && (
            <>
              <div className="text-muted-foreground mb-4 flex items-center justify-between text-sm">
                <span>
                  Showing {filteredAllJobs.length} of {allJobsItems.length} jobs
                </span>
              </div>
              <JobCards recommendations={filteredAllJobs} skipProfileCheck />
              {allJobsTotalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllJobsPage((p) => Math.max(1, p - 1))}
                    disabled={allJobsPage === 1}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-muted-foreground min-w-[120px] text-center text-sm">
                    Page {allJobsPage} of {allJobsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setAllJobsPage((p) => Math.min(allJobsTotalPages, p + 1))
                    }
                    disabled={allJobsPage >= allJobsTotalPages}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
