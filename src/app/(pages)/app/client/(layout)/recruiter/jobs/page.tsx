'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { JobForm } from './components/job-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { clientJobPostingService } from '@/lib/services/services';
import {
  IClientJobPosting,
  JobPostingStatusEnum,
  WorkCommitmentEnum,
  WorkTypeEnum,
  IPaginatedResponse,
} from '@/lib/shared';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// Helper function to format enum values
const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<IClientJobPosting | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    JobPostingStatusEnum | 'ALL'
  >('ALL');
  const [typeFilter, setTypeFilter] = useState<WorkTypeEnum | 'ALL'>('ALL');
  const [commitmentFilter, setCommitmentFilter] = useState<
    WorkCommitmentEnum | 'ALL'
  >('ALL');

  useEffect(() => {
    const openCreate = searchParams.get('openCreate');
    const hasPendingJD = localStorage.getItem('pendingJDData');

    if (openCreate === 'true' || hasPendingJD) {
      setIsCreateOpen(true);
      if (hasPendingJD) {
        toast.info('Opening job creation with your parsed job description...');
      }
    }
  }, [searchParams]);

  const {
    data: jobs,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<IClientJobPosting>>({
    queryKey: ['jobs'],
    queryFn: () => clientJobPostingService.getJobPostings(),
  });

  const filteredJobs = jobs?.items?.filter((job: IClientJobPosting) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || job.jobType === typeFilter;
    const matchesCommitment =
      commitmentFilter === 'ALL' || job.jobCommitment === commitmentFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCommitment;
  });

  const stats = {
    total: jobs?.items?.length || 0,
    active:
      jobs?.items?.filter(
        (job) => job.status === JobPostingStatusEnum.PUBLISHED
      ).length || 0,
    draft:
      jobs?.items?.filter((job) => job.status === JobPostingStatusEnum.DRAFT)
        .length || 0,
    closed:
      jobs?.items?.filter((job) => job.status === JobPostingStatusEnum.CLOSED)
        .length || 0,
  };

  const handleViewDetails = (job: IClientJobPosting) => {
    router.push(`/app/client/recruiting/jobs/${job.id}`);
  };

  const handleEdit = (job: IClientJobPosting) => {
    setSelectedJob(job);
    setIsCreateOpen(true);
  };

  const renderJobCard = (job: IClientJobPosting) => (
    <Card key={job.id} className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="line-clamp-2 text-xl font-semibold hover:line-clamp-none">
              {job.title}
            </CardTitle>
            <CardDescription>
              {job.department} • {job.isRemote ? 'Remote' : 'On-site'}
            </CardDescription>
          </div>
          <Badge
            variant={
              job.status === JobPostingStatusEnum.PUBLISHED
                ? 'default'
                : job.status === JobPostingStatusEnum.DRAFT
                  ? 'secondary'
                  : 'destructive'
            }
            className="ml-2 whitespace-nowrap"
          >
            {formatEnumValue(job.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground line-clamp-2 min-h-[2.5rem] text-sm">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formatEnumValue(job.jobType)}</Badge>
            <Badge variant="outline">
              {formatEnumValue(job.jobCommitment)}
            </Badge>
            {job.isRemote && <Badge variant="outline">Remote</Badge>}
            {job.isFeatured && <Badge variant="secondary">Featured</Badge>}
          </div>
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>
              {job.numberOfOpenings} opening
              {job.numberOfOpenings > 1 ? 's' : ''}
            </span>
            <span>Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="default"
              className="w-full"
              onClick={() => handleViewDetails(job)}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleEdit(job)}
            >
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your job postings
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Job
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.draft}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Closed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.closed}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
        <div className="relative md:w-1/2">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search jobs by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 md:w-1/2">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as JobPostingStatusEnum | 'ALL')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {Object.values(JobPostingStatusEnum).map((status) => (
                <SelectItem key={status} value={status}>
                  {formatEnumValue(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as WorkTypeEnum | 'ALL')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {Object.values(WorkTypeEnum).map((type) => (
                <SelectItem key={type} value={type}>
                  {formatEnumValue(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={commitmentFilter}
            onValueChange={(value) =>
              setCommitmentFilter(value as WorkCommitmentEnum | 'ALL')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Commitment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Commitments</SelectItem>
              {Object.values(WorkCommitmentEnum).map((commitment) => (
                <SelectItem key={commitment} value={commitment}>
                  {formatEnumValue(commitment)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredJobs?.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">No jobs found</p>
          </div>
        ) : (
          filteredJobs?.map(renderJobCard)
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedJob ? 'Edit Job Posting' : 'Create New Job Posting'}
            </DialogTitle>
          </DialogHeader>
          <JobForm
            job={selectedJob || undefined}
            onClose={() => {
              setIsCreateOpen(false);
              setSelectedJob(null);
            }}
            onSuccess={() => {
              const hadPendingJD = localStorage.getItem('pendingJDData');

              setIsCreateOpen(false);
              setSelectedJob(null);
              refetch();

              if (hadPendingJD) {
                localStorage.removeItem('pendingJDData');
                toast.success(
                  'Job posting created successfully from your parsed job description!'
                );
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}
