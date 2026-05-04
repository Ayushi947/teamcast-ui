'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Star,
  ExternalLink,
  RefreshCw,
  Users,
  Zap,
  TrendingUp,
  Linkedin,
  FileChartColumnIncreasing,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Link,
} from 'lucide-react';
import { toast } from 'sonner';
import Indeed from '@/components/icons/IndeedIcon';
import { useRouter } from 'next/navigation';
import { UploadCandidateModal } from './upload-candidate-modal';
import { ImportedCandidatesDialog } from './imported-candidates-dialog';
import { CandidateImportApiService } from '@/lib/shared/services/client/candidate.import.api.service';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { useQueryClient } from '@tanstack/react-query';
import {
  JobInviteStatusEnum,
  IntegrationStatus,
  JobPostingStatusEnum,
} from '@/lib/shared';
import { clientJobInviteApiService } from '@/lib/services/services';
import { ClientIntegrationApiService } from '@/lib/shared/services/client/integration.api.service';

// Job board integration platforms
const jobBoardPlatforms = [
  {
    id: 'excel',
    name: 'Upload Excel',
    icon: (
      <img
        src="https://img.icons8.com/?size=100&id=117561&format=png&color=000000"
        alt="Excel"
        width={25}
        height={25}
        style={{ marginTop: '3px' }}
      />
    ),
    description: 'Upload outsourced candidate list',
    status: 'Upload File',
    features: [],
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    type: 'excel',
    connectUrl: '',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="h-5 w-5" />,
    description: 'Access millions of professional profiles',
    status: 'coming-soon',
    features: ['Profile matching', 'Direct messaging', 'Company insights'],
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    type: 'job-board',
    connectUrl: '/app/client/integrations/linkedin',
  },
  {
    id: 'workable',
    name: 'Workable',
    icon: (
      <img
        src="https://cdn.brandfetch.io/idZFaFXnOU/w/180/h/180/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1745005062571"
        alt="Workable"
        width={20}
        height={20}
        className="h-5 w-5"
      />
    ),
    description: 'Access millions of professional profiles',
    status: 'available',
    features: ['Profile matching', 'Direct messaging', 'Company insights'],
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    type: 'ats',
    connectUrl: '/app/client/integrations/workable',
  },
  {
    id: 'indeed',
    name: 'Indeed',
    icon: <Indeed size="20" />,
    description: 'Largest job search platform worldwide',
    status: 'coming-soon',
    features: ['Resume database', 'Job posting sync', 'Candidate alerts'],
    color: 'bg-green-100 text-green-700 border-green-200',
    type: 'job-board',
    connectUrl: '/app/client/integrations/indeed',
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    icon: (
      <img
        src="https://cdn.brandfetch.io/id2vGwzwTT/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1746504784525"
        alt="Glassdoor"
        width={20}
        height={20}
      />
    ),
    description: 'Company reviews and salary insights',
    status: 'coming-soon',
    features: ['Salary data', 'Company reviews', 'Interview insights'],
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    type: 'job-board',
    connectUrl: '/app/client/integrations/glassdoor',
  },
  {
    id: 'ziprecruiter',
    name: 'ZipRecruiter',
    icon: (
      <img
        src="https://cdn.brandfetch.io/idT-keGT39/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1668515940521"
        alt="ZipRecruiter"
        width={20}
        height={20}
      />
    ),
    description: 'Access millions of professional profiles',
    status: 'coming-soon',
    features: ['Profile matching', 'Direct messaging', 'Company insights'],
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    type: 'job-board',
    connectUrl: '/app/client/integrations/ziprecruiter',
  },
];

interface FinderCandidateTabProps {
  job?: any; // IClientJobPosting type
  onUploadSuccess?: () => void;
}

export function FinderCandidateTab({
  job,
  onUploadSuccess,
}: FinderCandidateTabProps) {
  const [isLoading, _setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isOverallStatsLoading, setIsOverallStatsLoading] = useState(false);
  const [isStatisticsButtonLoading, setIsStatisticsButtonLoading] =
    useState(false);
  const [isViewDetailsButtonLoading, setIsViewDetailsButtonLoading] =
    useState(false);
  const [selectedPlatform, _setSelectedPlatform] = useState<string | null>(
    null
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isViewDetailsExpanded, setIsViewDetailsExpanded] = useState(false);
  const [stats, setStats] = useState({
    totalInvites: 0,
    totalCandidates: 0,
    totalUploads: 0,
    failedImports: 0,
  });
  const [overallStats, setOverallStats] = useState({
    totalInvites: 0,
    acceptedInvites: 0,
    pendingInvites: 0,
    activeIntegrations: 0,
  });
  const [hasExcelData, setHasExcelData] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const candidateImportService = new CandidateImportApiService(apiClient);
  const integrationService = new ClientIntegrationApiService(apiClient);

  // Fetch initial statistics to check if Excel data exists
  useEffect(() => {
    if (job?.id) {
      fetchStatistics();
      fetchOverallStatistics();
    }
  }, [job?.id]);

  const handleConnectPlatform = (platformId: string) => {
    if (platformId === 'excel') {
      setIsUploadModalOpen(true);
      return;
    }

    const platform = jobBoardPlatforms.find((p) => p.id === platformId);
    if (platform?.connectUrl) {
      router.push(platform.connectUrl);
    } else {
      toast.error('Integration link not found.');
    }
  };

  const fetchOverallStatistics = useCallback(async () => {
    setIsOverallStatsLoading(true);
    try {
      // Make all API calls in parallel for better performance
      const [
        totalInvitesResponse,
        acceptedInvitesResponse,
        pendingInvitesResponse,
        integrationsResponse,
      ] = await Promise.allSettled([
        // Fetch total invites (all statuses) - use limit 1 since we only need count
        clientJobInviteApiService.getImportedCandidateJobInvitesByJobId(
          job?.id,
          {
            page: 1,
            limit: 1, // Only need count, not actual data
          }
        ),
        // Fetch accepted candidates count
        clientJobInviteApiService.getImportedCandidateJobInvitesByJobId(
          job?.id,
          {
            status: [JobInviteStatusEnum.ACCEPTED],
            page: 1,
            limit: 1, // Only need count, not actual data
          }
        ),
        // Fetch pending invites count
        clientJobInviteApiService.getImportedCandidateJobInvitesByJobId(
          job?.id,
          {
            status: [JobInviteStatusEnum.PENDING],
            page: 1,
            limit: 1, // Only need count, not actual data
          }
        ),
        // Fetch active integrations count
        integrationService.getClientIntegrations({
          status: IntegrationStatus.ACTIVE,
          page: 1,
          limit: 1, // Only need count, not actual data
        }),
      ]);

      // Extract counts from responses, handling rejected promises
      const totalInvitesCount =
        totalInvitesResponse.status === 'fulfilled'
          ? totalInvitesResponse.value?.pagination?.total || 0
          : 0;

      const acceptedCandidatesCount =
        acceptedInvitesResponse.status === 'fulfilled'
          ? acceptedInvitesResponse.value?.pagination?.total || 0
          : 0;

      const pendingInvitesCount =
        pendingInvitesResponse.status === 'fulfilled'
          ? pendingInvitesResponse.value?.pagination?.total || 0
          : 0;

      const activeIntegrationsCount =
        integrationsResponse.status === 'fulfilled'
          ? integrationsResponse.value?.pagination?.total || 0
          : 0;

      // Log any failed requests for debugging
      if (totalInvitesResponse.status === 'rejected') {
        logger.error(
          'Failed to fetch total invites count:',
          totalInvitesResponse.reason
        );
      }
      if (acceptedInvitesResponse.status === 'rejected') {
        logger.error(
          'Failed to fetch accepted candidates count:',
          acceptedInvitesResponse.reason
        );
      }
      if (pendingInvitesResponse.status === 'rejected') {
        logger.error(
          'Failed to fetch pending invites count:',
          pendingInvitesResponse.reason
        );
      }
      if (integrationsResponse.status === 'rejected') {
        logger.error(
          'Failed to fetch active integrations count:',
          integrationsResponse.reason
        );
      }

      setOverallStats({
        totalInvites: totalInvitesCount,
        acceptedInvites: acceptedCandidatesCount,
        pendingInvites: pendingInvitesCount,
        activeIntegrations: activeIntegrationsCount,
      });
    } catch (error) {
      logger.error('Failed to fetch overall statistics:', error);
      // Set default values on error to prevent UI issues
      setOverallStats({
        totalInvites: 0,
        acceptedInvites: 0,
        pendingInvites: 0,
        activeIntegrations: 0,
      });
    } finally {
      setIsOverallStatsLoading(false);
    }
  }, [job?.id]);

  const fetchStatistics = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      // Make API calls in parallel for better performance
      const [importStatisticsResponse, acceptedInvitesResponse] =
        await Promise.allSettled([
          // Fetch import statistics
          candidateImportService.getImportStatistics({
            data: undefined,
            filters: {
              jobPostingId: job?.id,
            },
            params: {},
            pagination: {
              page: 1,
              limit: 10,
            },
          }),
          // Fetch accepted candidates count from job invites
          clientJobInviteApiService.getImportedCandidateJobInvitesByJobId(
            job?.id,
            {
              status: [JobInviteStatusEnum.ACCEPTED],
              page: 1,
              limit: 1, // Only need count, not actual data
            }
          ),
        ]);

      // Extract data from responses, handling rejected promises
      const statistics =
        importStatisticsResponse.status === 'fulfilled'
          ? importStatisticsResponse.value
          : null;

      const acceptedCandidatesCount =
        acceptedInvitesResponse.status === 'fulfilled'
          ? acceptedInvitesResponse.value?.pagination?.total || 0
          : 0;

      // Log any failed requests for debugging
      if (importStatisticsResponse.status === 'rejected') {
        logger.error(
          'Failed to fetch import statistics:',
          importStatisticsResponse.reason
        );
      }
      if (acceptedInvitesResponse.status === 'rejected') {
        logger.error(
          'Failed to fetch accepted candidates count:',
          acceptedInvitesResponse.reason
        );
      }

      if (statistics) {
        setStats({
          totalInvites: statistics.totalCandidates || 0, // Show total candidates as total invites
          totalCandidates: acceptedCandidatesCount, // Show accepted candidates count
          totalUploads: statistics.totalUploads || 0,
          failedImports: statistics.failedImports || 0,
        });

        // Check if there's any Excel data
        const hasData =
          (statistics.totalCandidates || 0) > 0 ||
          (statistics.totalUploads || 0) > 0;
        setHasExcelData(hasData);
      }
    } catch (error) {
      logger.error('Failed to fetch statistics:', error);
    } finally {
      setIsStatsLoading(false);
    }
  }, [job?.id]);

  const handleViewDetails = async (platformId: string) => {
    if (platformId === 'excel') {
      setIsViewDetailsButtonLoading(true);
      try {
        await queryClient.invalidateQueries({
          queryKey: ['clientImportedCandidates', job?.id],
        });

        // Small delay to ensure invalidation is processed
        await new Promise((resolve) => setTimeout(resolve, 200));

        setIsViewDetailsDialogOpen(true);
      } catch (error) {
        logger.error('Failed to refresh data before opening dialog:', error);
        toast.error('Failed to load latest data. Please try again.');
      } finally {
        setIsViewDetailsButtonLoading(false);
      }
    } else {
      toast.info('View details for ' + platformId);
    }
  };

  const handleViewStatistics = async (platformId: string) => {
    if (platformId === 'excel') {
      if (!isViewDetailsExpanded) {
        setIsStatisticsButtonLoading(true);
        try {
          // Directly fetch fresh statistics with loading state
          await fetchStatistics();
          setIsViewDetailsExpanded(true);
          toast.success('Statistics refreshed successfully!');
        } catch (error) {
          logger.error('Failed to fetch statistics:', error);
          toast.error('Failed to load statistics. Please try again.');
        } finally {
          setIsStatisticsButtonLoading(false);
        }
      } else {
        // Just hide the expanded view
        setIsViewDetailsExpanded(false);
      }
    } else {
      toast.info('View statistics for ' + platformId);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-primary/10 space-y-6 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Job Board Integrations
          </h3>
          <p className="text-md text-gray-600 dark:text-gray-400">
            Connect with external job platforms to expand your candidate pool
          </p>
        </div>
      </div>

      {/* Overall Integration Statistics */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              key: 'totalInvites',
              label: 'Total Invites',
              icon: Users,
              color: 'text-blue-600 dark:text-blue-400',
              bgColor: 'bg-blue-100 dark:bg-blue-900/30',
              description: 'Total invites sent',
            },
            {
              key: 'acceptedInvites',
              label: 'Accepted Invites',
              icon: CheckCircle,
              color: 'text-green-600 dark:text-green-400',
              bgColor: 'bg-green-100 dark:bg-green-900/30',
              description: 'Invites accepted',
            },
            {
              key: 'pendingInvites',
              label: 'Pending Invites',
              icon: Clock,
              color: 'text-orange-600 dark:text-orange-400',
              bgColor: 'bg-orange-100 dark:bg-orange-900/30',
              description: 'Invites pending',
            },
            {
              key: 'activeIntegrations',
              label: 'Active Integrations',
              icon: Link,
              color: 'text-purple-600 dark:text-purple-400',
              bgColor: 'bg-purple-100 dark:bg-purple-900/30',
              description: 'Active connections',
            },
          ].map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.key} className="bg-card rounded-lg p-4">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-base font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex h-[68px] flex-col justify-between">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isOverallStatsLoading ? (
                      <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></span>
                    ) : (
                      overallStats[stat.key as keyof typeof overallStats]
                    )}
                  </div>
                  <span className="text-primary dark:text-primary text-sm font-medium">
                    {stat.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Platforms */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Available Platforms
        </h4>

        <div className="grid gap-4">
          {jobBoardPlatforms.map((platform) => (
            <Card
              key={platform.id}
              className="bg-card dark:bg-background/30 border border-gray-200 transition-shadow hover:shadow-md dark:border-gray-700"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{platform.icon}</div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {platform.name}
                        </h5>
                        <Badge
                          variant="outline"
                          className={`text-xs ${platform.color}`}
                        >
                          {platform.status === 'coming-soon'
                            ? 'Coming Soon'
                            : 'Available'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${platform.color}`}
                        >
                          {platform.type === 'job-board' ? 'Job Board' : 'ATS'}
                        </Badge>
                      </div>
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        {platform.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {platform.features.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-100 text-xs dark:bg-gray-800"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {platform.id === 'excel' && hasExcelData && (
                      <>
                        <Button
                          size="sm"
                          onClick={async () =>
                            await handleViewStatistics(platform.id)
                          }
                          disabled={isStatisticsButtonLoading}
                          className="flex-1"
                        >
                          {isStatisticsButtonLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : isViewDetailsExpanded ? (
                            'Hide Statistics'
                          ) : (
                            'Statistics'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () =>
                            await handleViewDetails(platform.id)
                          }
                          disabled={isViewDetailsButtonLoading}
                          className="flex-1"
                        >
                          {isViewDetailsButtonLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'View Details'
                          )}
                        </Button>
                      </>
                    )}
                    {job?.status !== JobPostingStatusEnum.PUBLISHED ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-block w-full">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleConnectPlatform(platform.id)
                                }
                                disabled={
                                  platform.status === 'coming-soon' ||
                                  selectedPlatform === platform.id ||
                                  job?.status !== JobPostingStatusEnum.PUBLISHED
                                }
                                className={
                                  platform.id === 'excel' ? 'flex-1' : 'w-full'
                                }
                              >
                                {platform.status === 'coming-soon' ? (
                                  <>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Coming Soon
                                  </>
                                ) : selectedPlatform === platform.id ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                  </>
                                ) : platform.id === 'excel' ? (
                                  <>
                                    <FileChartColumnIncreasing className="mr-2 h-4 w-4" />
                                    Import
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Connect
                                  </>
                                )}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Job is not published</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnectPlatform(platform.id)}
                        disabled={
                          platform.status === 'coming-soon' ||
                          selectedPlatform === platform.id ||
                          job?.status !== JobPostingStatusEnum.PUBLISHED
                        }
                        className={
                          platform.id === 'excel' ? 'flex-1' : 'w-full'
                        }
                      >
                        {platform.status === 'coming-soon' ? (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Coming Soon
                          </>
                        ) : selectedPlatform === platform.id ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : platform.id === 'excel' ? (
                          <>
                            <FileChartColumnIncreasing className="mr-2 h-4 w-4" />
                            Import
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expandable Statistics Section for Excel */}
                {platform.id === 'excel' && isViewDetailsExpanded && (
                  <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                          Import Statistics
                        </h4>
                        {isStatsLoading && (
                          <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Overview of your imported candidates and activities
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {[
                        {
                          key: 'totalInvites',
                          label: 'Total Invites',
                          icon: Users,
                          color: 'text-blue-500',
                          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                        },
                        {
                          key: 'totalCandidates',
                          label: 'Accepted Invites',
                          icon: CheckCircle,
                          color: 'text-green-500',
                          bgColor: 'bg-green-100 dark:bg-green-900/30',
                        },
                        {
                          key: 'totalUploads',
                          label: 'Total Uploads',
                          icon: Upload,
                          color: 'text-purple-500',
                          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
                        },
                        {
                          key: 'failedImports',
                          label: 'Failed Imports',
                          icon: AlertTriangle,
                          color: 'text-red-500',
                          bgColor: 'bg-red-100 dark:bg-red-900/30',
                        },
                      ].map((stat) => {
                        const IconComponent = stat.icon;
                        return (
                          <Card key={stat.key} className="p-4">
                            <div className="flex items-center gap-2 py-2">
                              <div
                                className={`rounded-full p-2 ${stat.bgColor}`}
                              >
                                <IconComponent
                                  className={`h-5 w-5 ${stat.color}`}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {stat.label}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {isStatsLoading ? (
                                <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></span>
                              ) : (
                                stats[stat.key as keyof typeof stats]
                              )}
                            </p>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
        <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
          Why Integrate with Job Boards?
        </h4>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/30">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Larger Candidate Pool
              </h5>
              <p className="text-gray-600 dark:text-gray-400">
                Access millions of active job seekers across multiple platforms
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
              <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Better Matching
              </h5>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered algorithms find the most relevant candidates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-purple-100 p-1.5 dark:bg-purple-900/30">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Faster Hiring
              </h5>
              <p className="text-gray-600 dark:text-gray-400">
                Reduce time-to-hire with automated candidate sourcing
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-orange-100 p-1.5 dark:bg-orange-900/30">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Cost Effective
              </h5>
              <p className="text-gray-600 dark:text-gray-400">
                Reduce recruitment costs with targeted candidate sourcing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Candidate Modal */}
      <UploadCandidateModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        jobPostingId={job?.id || ''}
        onUploadSuccess={async () => {
          // Handle upload success - show success message and enable buttons
          toast.success(
            'Candidates uploaded successfully! Click Statistics or View Details to see the latest data.'
          );
          // Set hasExcelData to true immediately after successful upload to show buttons
          setHasExcelData(true);

          // Call parent callback if provided
          onUploadSuccess?.();
        }}
      />

      {/* Imported Candidates Dialog */}
      <ImportedCandidatesDialog
        isOpen={isViewDetailsDialogOpen}
        onClose={() => setIsViewDetailsDialogOpen(false)}
        jobId={job?.id || ''}
      />
    </div>
  );
}
