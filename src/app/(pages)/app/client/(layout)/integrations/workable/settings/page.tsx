'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { WorkableIcon } from '@/components/icons';
import {
  ChevronLeft,
  ExternalLink,
  MapPin,
  Calendar,
  RefreshCw,
  PlugZap,
  Loader2,
} from 'lucide-react';
import {
  workableService,
  integrationCommonService,
} from '@/lib/services/services';
import { toast } from 'sonner';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { IWorkableImportedJob, IWorkableAvailableJob } from '@/lib/shared';
import { formatDistance } from 'date-fns';
import SaasDataTable from '@/components/app/common/tables/saas-data-table';

// Extend the existing interface to include all the new fields
interface ExtendedWorkableAvailableJob extends IWorkableAvailableJob {
  shortcode: string;
  isRemote: boolean;
  state: string;
  numberOfOpenings: number;
  externalJobUrl: string;
  createdAt: Date;
}

interface SyncLog {
  id: string;
  timestamp: Date;
  type: 'job_import' | 'candidate_sync' | 'connection_test';
  status: 'success' | 'failed';
  details: string;
}

export default function WorkableIntegrationSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('jobs');
  const [isValidating, setIsValidating] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [_importedJobs, setImportedJobs] = useState<IWorkableImportedJob[]>([]);
  const [availableJobs, setAvailableJobs] = useState<
    ExtendedWorkableAvailableJob[]
  >([]);
  const [importingJobIds, setImportingJobIds] = useState<string[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  const tabs = [{ key: 'jobs', label: 'Jobs' }];

  useEffect(() => {
    validateConnection();
  }, []);

  const validateConnection = async () => {
    try {
      // Get integration details from API instead of localStorage
      const integrationDetails =
        await integrationCommonService.getIntegrationDataSummary();

      const workableIntegration = integrationDetails?.find(
        (integration) => integration.providerName.toLowerCase() === 'workable'
      );

      if (!workableIntegration?.integrationId) {
        throw new Error('No active Workable integration found');
      }

      const validationResult = await workableService.validateConnection(
        workableIntegration.integrationId
      );

      if (validationResult.isValid) {
        setIsConnected(true);
        await fetchJobs(workableIntegration.integrationId);
      }
    } catch (error) {
      toast.error('Connection Validation Failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Unable to validate connection',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const fetchJobs = async (integrationId?: string) => {
    try {
      setIsLoading(true);

      // Get integration ID if not provided
      let currentIntegrationId = integrationId;
      if (!currentIntegrationId) {
        const integrationDetails =
          await integrationCommonService.getIntegrationDataSummary();
        const workableIntegration = integrationDetails?.find(
          (integration) => integration.providerName.toLowerCase() === 'workable'
        );
        currentIntegrationId = workableIntegration?.integrationId;
      }

      if (!currentIntegrationId) {
        throw new Error('No active Workable integration found');
      }

      const jobImportResponse = await workableService.importJobs(
        currentIntegrationId,
        { sync: false }
      );

      if (jobImportResponse.jobs) {
        setImportedJobs(jobImportResponse.jobs);
      }

      if (jobImportResponse.availableJobs) {
        setAvailableJobs(
          jobImportResponse.availableJobs.map((job) => ({
            ...job,
            shortcode: job.shortcode || job.externalJobId,
            isRemote: job.isRemote || false,
            state: job.state || 'open',
            numberOfOpenings: job.numberOfOpenings || 1,
            externalJobUrl: job.externalJobUrl || '',
            createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
          })) as ExtendedWorkableAvailableJob[]
        );
      }
    } catch (error) {
      toast.error('Job Import Failed', {
        description:
          error instanceof Error ? error.message : 'Unable to fetch jobs',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSyncLogs = () => {
    // Remove mock logs and initialize with an empty array
    setSyncLogs([]);
  };

  const handleSingleJobImport = async (jobId: string) => {
    try {
      setImportingJobIds((prev) => [...prev, jobId]);

      // Get integration ID from API
      const integrationDetails =
        await integrationCommonService.getIntegrationDataSummary();
      const workableIntegration = integrationDetails?.find(
        (integration) => integration.providerName.toLowerCase() === 'workable'
      );

      if (!workableIntegration?.integrationId) {
        throw new Error('No active Workable integration found');
      }

      const response = await workableService.importSelectedJobs(
        workableIntegration.integrationId,
        { selectedJobIds: [jobId] }
      );

      if (response.success) {
        toast.success('Job Imported Successfully', {
          description: 'Imported 1 job',
        });
        await fetchJobs(workableIntegration.integrationId);
        fetchSyncLogs();
      } else {
        toast.error('Job Import Failed', {
          description: response.message || 'Unable to import selected job',
        });
      }
    } catch (error) {
      toast.error('Job Import Error', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    } finally {
      setImportingJobIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  // Prepare columns for SaasDataTable
  const jobColumns = [
    {
      key: 'title',
      label: 'Job Details',
      render: (job: ExtendedWorkableAvailableJob) => (
        <div className="flex flex-col">
          <div className="flex items-center font-medium">
            {job.title}
            <a
              href={job.externalJobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary ml-2"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <div className="text-muted-foreground flex items-center text-xs">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDistance(job.createdAt, new Date(), {
              addSuffix: true,
            })}
            <span className="mx-2">•</span>
            <span>Openings: {job.numberOfOpenings}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (job: ExtendedWorkableAvailableJob) => (
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4" />
          {job.location}
          {job.isRemote && (
            <Badge variant="outline" className="ml-2">
              Remote
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (job: ExtendedWorkableAvailableJob) =>
        job.createdAt.toLocaleDateString(),
    },
    {
      key: 'state',
      label: 'Status',
      render: (job: ExtendedWorkableAvailableJob) => (
        <Badge
          variant={
            job.alreadyImported
              ? 'secondary'
              : job.state === 'closed'
                ? 'destructive'
                : 'default'
          }
        >
          {job.alreadyImported
            ? 'Imported'
            : job.state === 'closed'
              ? 'Closed'
              : 'Available'}
        </Badge>
      ),
    },
  ];

  // Prepare actions for SaasDataTable
  const jobActions = [
    {
      key: 'import',
      label: 'Import',
      icon: <PlugZap className="h-4 w-4" />,
      onClick: (job: ExtendedWorkableAvailableJob) =>
        handleSingleJobImport(job.externalJobId),
      disabled: (job: ExtendedWorkableAvailableJob) =>
        job.alreadyImported ||
        job.state === 'closed' ||
        importingJobIds.includes(job.externalJobId),
    },
  ];

  if (isValidating) {
    return (
      <div className="flex min-h-[calc(100vh-300px)] items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <Loader2
            className="text-primary h-12 w-12 animate-spin"
            strokeWidth={2}
          />
          <p className="text-muted-foreground text-sm">
            Validating Workable connection...
          </p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <div>No active Workable integration found.</div>;
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center space-x-4 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/app/client/integrations')}
          className="mr-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 rounded-lg p-2">
            <WorkableIcon className="text-primary h-10 w-10" />
          </div>
          <div>
            <h1 className="flex items-center text-2xl font-bold">
              Workable Integration
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your Workable ATS integration settings
            </p>
          </div>
        </div>
      </div>

      <CustomTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-4"
      />

      {activeTab === 'jobs' && (
        <SaasDataTable
          data={availableJobs}
          columns={jobColumns}
          getRowKey={(job) => job.externalJobId}
          actions={jobActions}
          isLoading={isLoading}
          title="Available Jobs"
          description="Import jobs from Workable"
          onRefresh={() => fetchJobs()}
          containerClassName="space-y-2"
          emptyState={{
            title: 'No Jobs Available',
            description:
              'There are no jobs to import from Workable at the moment.',
          }}
          toolbarProps={{
            refreshButtonPosition: 'title',
          }}
        />
      )}

      {activeTab === 'sync_logs' && (
        <Card className="border-primary/10 w-full shadow-sm">
          <CardHeader className="border-primary/10 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-lg">
                  <RefreshCw className="text-primary mr-2 h-5 w-5" />
                  Sync Logs
                </CardTitle>
                <CardDescription className="text-sm">
                  Recent synchronization activities
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSyncLogs()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {syncLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'success' ? 'default' : 'destructive'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RefreshCw className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">No Sync Logs</h3>
                <p className="text-muted-foreground max-w-md">
                  No synchronization activities have been recorded yet. Sync
                  logs will appear here after performing integration actions.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fetchSyncLogs()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Logs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
