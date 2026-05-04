'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';

// Services
import { supportJobPostingService } from '@/lib/services/services';

// Hooks
import { useClientBatchLookup } from '@/lib/hooks/use-client-lookup';

// Types
import { JobPostingStatusEnum } from '@/lib/shared/models/common/enums';

// Components
import { SupportJobTable } from '../sourcing/components/support-job-table';
import { useRouter } from 'next/navigation';

// Job Postings Header Component
const JobPostingsHeader = ({
  onRefresh,
  isLoading,
}: {
  user: any;
  onRefresh: () => void;
  isLoading: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="">
        <div className="flex items-center gap-3">
          <h1 className="text-primary text-2xl font-bold">
            Account Manager Job Postings
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage job postings for your assigned clients and track recruitment
          activities
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-10 gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default function SupportJobPostingsPage() {
  const { user } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [statusFilter, setStatusFilter] = useState<
    JobPostingStatusEnum | 'ALL'
  >('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');

  // Fetch job postings for the account manager
  const {
    data: jobPostingsResponse,
    isLoading: jobPostingsLoading,
    error: jobPostingsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ['supportJobPostings'],
    queryFn: () => supportJobPostingService.getJobPostingsByAccountManagerId(),
  });

  const jobPostings = (jobPostingsResponse?.jobPostings as any[]) || [];

  // Extract unique client IDs for batch lookup
  const clientIds = useMemo(() => {
    const uniqueClientIds = [
      ...new Set(jobPostings.map((job: any) => job.clientId)),
    ];
    return uniqueClientIds.filter(Boolean);
  }, [jobPostings]);

  // Fetch client information in batch
  const { clientsMap, isLoading: clientsLoading } =
    useClientBatchLookup(clientIds);

  // Enhance job postings with client information
  const enhancedJobPostings = useMemo(() => {
    return jobPostings.map((job: any) => ({
      ...job,
      clientInfo: clientsMap.get(job.clientId) || {
        id: job.clientId,
        name: 'Unknown Client',
      },
    }));
  }, [jobPostings, clientsMap]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalJobs = enhancedJobPostings.length;
    const activeJobs = enhancedJobPostings.filter(
      (job: any) => job.status === JobPostingStatusEnum.PUBLISHED
    ).length;
    const draftJobs = enhancedJobPostings.filter(
      (job: any) => job.status === JobPostingStatusEnum.DRAFT
    ).length;
    const closedJobs = enhancedJobPostings.filter(
      (job: any) => job.status === JobPostingStatusEnum.CLOSED
    ).length;
    const totalApplications = enhancedJobPostings.reduce(
      (sum: number, job: any) => sum + (job.numberOfApplications || 0),
      0
    );
    const pendingApplications = Math.floor(totalApplications * 0.6); // Mock calculation
    const successRate =
      totalApplications > 0 ? Math.floor(totalApplications * 0.15) : 0;
    const avgApplicationsPerJob =
      totalJobs > 0 ? totalApplications / totalJobs : 0;

    return {
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      successRate,
      avgApplicationsPerJob,
    };
  }, [enhancedJobPostings]);

  // Event handlers
  const handleViewDetails = (job: any) => {
    // Navigate to job details page - use the unified route
    router.push(`/app/support/job-details/${job.id}`);
  };

  const handleEditJob = () => {
    // Placeholder for edit functionality
    toast.info('Edit functionality coming soon');
  };

  const handleStatusChange = async (
    _jobId: string,
    _status: JobPostingStatusEnum,
    _jobTitle: string
  ) => {
    // Placeholder for status change functionality
    toast.info('Status change functionality coming soon');
  };

  const handleDeleteJob = async (_jobId: string, _jobTitle: string) => {
    // Placeholder for delete functionality
    toast.info('Delete functionality coming soon');
  };

  const handleRefresh = () => {
    refetchJobs();
    toast.success('Data refreshed!');
  };

  // Error state
  if (jobPostingsError) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <RefreshCw className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Failed to Load Jobs
          </h3>
          <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">
            We encountered an error while loading your job postings. Please try
            again.
          </p>
          <Button onClick={handleRefresh} className="space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3">
      {/* Header */}
      <JobPostingsHeader
        user={user}
        onRefresh={handleRefresh}
        isLoading={jobPostingsLoading}
      />

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative h-[140px] overflow-hidden rounded-xl border-0 border-l-4 bg-[#F6AE66] shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/95">
          <CardContent className="flex h-full flex-col justify-between overflow-hidden p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-normal text-white transition-colors group-hover:text-gray-100 dark:text-white dark:group-hover:text-gray-100">
                Total Jobs
              </CardTitle>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F6AE66] p-2.5 transition-transform duration-300 group-hover:scale-110">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-[28px] font-bold text-white transition-colors dark:text-white">
              {stats.totalJobs}
            </div>
            <p className="text-sm leading-relaxed text-white dark:text-white">
              {stats.activeJobs} active, {stats.draftJobs} draft
            </p>
          </CardContent>
        </Card>

        <Card className="group relative h-[140px] overflow-hidden rounded-xl border-0 border-l-4 bg-[#52CD75] shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/95">
          <CardContent className="flex h-full flex-col justify-between overflow-hidden p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-normal text-white transition-colors group-hover:text-gray-100 dark:text-white dark:group-hover:text-gray-100">
                Applications
              </CardTitle>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#52CD75] p-2.5 transition-transform duration-300 group-hover:scale-110">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-[28px] font-bold text-white transition-colors dark:text-white">
              {stats.totalApplications}
            </div>
            <p className="text-sm leading-relaxed text-white dark:text-white">
              {stats.pendingApplications} pending review
            </p>
          </CardContent>
        </Card>

        <Card className="group relative h-[140px] overflow-hidden rounded-xl border-0 border-l-4 bg-[#52B1CD] shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/95">
          <CardContent className="flex h-full flex-col justify-between overflow-hidden p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-normal text-white transition-colors group-hover:text-gray-100 dark:text-white dark:group-hover:text-gray-100">
                Active Jobs
              </CardTitle>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#52B1CD] p-2.5 transition-transform duration-300 group-hover:scale-110">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-[28px] font-bold text-white transition-colors dark:text-white">
              {stats.activeJobs}
            </div>
            <p className="text-sm leading-relaxed text-white dark:text-white">
              Currently published
            </p>
          </CardContent>
        </Card>

        <Card className="group relative h-[140px] overflow-hidden rounded-xl border-0 border-l-4 bg-[#6E55CF] shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/95">
          <CardContent className="flex h-full flex-col justify-between overflow-hidden p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-normal text-white transition-colors group-hover:text-gray-100 dark:text-white dark:group-hover:text-gray-100">
                Avg per Job
              </CardTitle>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6E55CF] p-2.5 transition-transform duration-300 group-hover:scale-110">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-[28px] font-bold text-white transition-colors dark:text-white">
              {stats.avgApplicationsPerJob.toFixed(1)}
            </div>
            <p className="text-sm leading-relaxed text-white dark:text-white">
              Applications per posting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6 pb-8">
        <SupportJobTable
          jobs={enhancedJobPostings}
          isLoading={jobPostingsLoading || clientsLoading}
          searchQuery={searchQuery}
          sortBy={sortBy}
          statusFilter={statusFilter}
          clientFilter={clientFilter}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onStatusFilterChange={setStatusFilter}
          onClientFilterChange={setClientFilter}
          onViewDetails={handleViewDetails}
          onEditJob={handleEditJob}
          onStatusChange={handleStatusChange}
          onDeleteJob={handleDeleteJob}
        />
      </div>
    </div>
  );
}
