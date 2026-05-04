'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  MoreHorizontal,
  Briefcase,
  MapPin,
  Users,
  Plus,
  Edit,
  Eye,
  PlayCircle,
  XCircle,
  Trash2,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  IClientJobPosting,
  JobPostingStatusEnum,
  WorkCommitmentEnum,
} from '@/lib/shared';
import { useEffect } from 'react';

interface JobListPanelProps {
  jobs: IClientJobPosting[];
  isLoading: boolean;
  selectedJob: IClientJobPosting | null;
  searchQuery: string;
  sortBy: string;
  statusFilter: JobPostingStatusEnum | 'ALL';
  onJobSelect: (job: IClientJobPosting) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: string) => void;
  onStatusFilterChange: (status: JobPostingStatusEnum | 'ALL') => void;
  onCreateJob: () => void;
  onEditJob: (job: IClientJobPosting) => void;
  onViewJob: (job: IClientJobPosting) => void;
  onStatusChange: (jobId: string, status: JobPostingStatusEnum) => void;
  onDeleteJob: (jobId: string) => void;
}

// Get status badge variant
const getStatusBadge = (status: JobPostingStatusEnum) => {
  switch (status) {
    case JobPostingStatusEnum.PUBLISHED:
      return (
        <Badge className="flex items-center gap-2 border-green-200 bg-green-100 text-xs text-green-700">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          Active
        </Badge>
      );
    case JobPostingStatusEnum.DRAFT:
      return (
        <Badge variant="secondary" className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
          Draft
        </Badge>
      );
    case JobPostingStatusEnum.CLOSED:
      return (
        <Badge
          variant="destructive"
          className="flex items-center gap-2 text-xs"
        >
          <div className="h-2 w-2 rounded-full bg-white"></div>
          Closed
        </Badge>
      );
    case JobPostingStatusEnum.ARCHIVED:
      return (
        <Badge variant="outline" className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-black"></div>
          Archived
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
};

export function JobListPanel({
  jobs,
  isLoading,
  selectedJob,
  searchQuery,
  sortBy,
  statusFilter,
  onJobSelect,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onCreateJob,
  onEditJob,
  onViewJob,
  onStatusChange,
  onDeleteJob,
}: JobListPanelProps) {
  useEffect(() => {
    if (!selectedJob && jobs && jobs.length > 0) {
      onJobSelect(jobs[0]);
    }
  }, [jobs, selectedJob, onJobSelect]);

  return (
    <Card className="flex h-[calc(100vh-8rem)] flex-col border-0 shadow-none">
      <CardHeader className="bg-white px-4 py-3 dark:bg-gray-800/70">
        <div className="space-y-3">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Job Postings
                </CardTitle>
                <p className="text-base text-gray-900 dark:text-gray-400">
                  Total {jobs.length} positions
                </p>
              </div>
            </div>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="h-10 w-28 border-gray-200 bg-white text-xs font-medium dark:border-gray-700 dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>Created</span>
                  </div>
                </SelectItem>
                <SelectItem value="updatedAt">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>Updated</span>
                  </div>
                </SelectItem>
                <SelectItem value="applications">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    <span>Apps</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-300" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 border-gray-200 bg-white pl-8 text-xs text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-10 w-20 border-gray-200 bg-white text-xs font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value={JobPostingStatusEnum.PUBLISHED}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value={JobPostingStatusEnum.DRAFT}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-500"></div>
                    <span>Draft</span>
                  </div>
                </SelectItem>
                <SelectItem value={JobPostingStatusEnum.CLOSED}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    <span>Closed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-white">
                No jobs found
              </h3>
              <p className="mb-4 max-w-xs text-xs text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first job posting to get started'}
              </p>
              <Button size="sm" onClick={onCreateJob} className="text-xs">
                <Plus className="mr-1 h-3 w-3" />
                Create Job
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`group cursor-pointer rounded-l-lg p-3 transition-all dark:hover:bg-gray-800/50 ${
                    selectedJob?.id === job.id
                      ? 'border-primary border border-r-0 bg-white shadow-sm dark:border-blue-600 dark:bg-blue-900/20'
                      : 'bg-transparent dark:border-gray-700 dark:bg-gray-800'
                  }`}
                  onClick={() => onJobSelect(job)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2.5">
                      {/* Title and status */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="line-clamp-1 flex-1 truncate text-lg font-medium text-gray-900 dark:text-white">
                          {job.title}
                        </h3>

                        {getStatusBadge(job.status as JobPostingStatusEnum)}
                      </div>

                      {/* Job details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {/* {job.department && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span className="max-w-[80px] truncate">
                              {job.department}
                            </span>
                          </div>
                        )} */}

                        {job.preferredLocations && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[80px] truncate text-sm">
                              {job.preferredLocations}
                            </span>
                          </div>
                        )}

                        {job.jobType && (
                          <div className="flex items-center gap-1 text-sm">
                            <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                            <span>
                              {job.jobCommitment ===
                              WorkCommitmentEnum.FULL_TIME
                                ? 'Full-time'
                                : job.jobCommitment ===
                                    WorkCommitmentEnum.PART_TIME
                                  ? 'Part-time'
                                  : job.jobCommitment ===
                                      WorkCommitmentEnum.HOURLY
                                    ? 'Hourly'
                                    : job.jobCommitment ===
                                        WorkCommitmentEnum.PROJECT_BASED
                                      ? 'Project-based'
                                      : job.jobCommitment}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Applications and date */}
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="h-3 w-3" />
                          <span>
                            {job.numberOfApplications || 0} applications
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                          Posted {format(new Date(job.createdAt), 'MMM d')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-2 flex">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full opacity-70 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewJob(job);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditJob(job);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Job</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {job.status === JobPostingStatusEnum.DRAFT && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(
                                  job.id,
                                  JobPostingStatusEnum.PUBLISHED
                                );
                              }}
                            >
                              <PlayCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Publish Job</span>
                            </DropdownMenuItem>
                          )}

                          {job.status === JobPostingStatusEnum.PUBLISHED && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(
                                  job.id,
                                  JobPostingStatusEnum.CLOSED
                                );
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              <span>Close Job</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-950/50 dark:focus:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteJob(job.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Job</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
