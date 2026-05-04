'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  MoreHorizontal,
  Briefcase,
  MapPin,
  Users,
  Edit,
  Eye,
  Trash2,
  Calendar,
  AlarmClock,
  LayoutGrid,
  List,
  Send,
  Building2,
  User,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  JobPostingStatusEnum,
  UserRoleEnum,
  UserTypeEnum,
} from '@/lib/shared/models/common/enums';
import { cn, formatEnumValue } from '@/lib/utils';
import { SupportJobInviteModal } from './support-job-invite-modal';
import { SupportRecruiterAssignmentModal } from './support-recruiter-assignment-modal';
import { useApp } from '@/lib/context/app-context';

interface SupportJobTableProps {
  jobs: any[];
  isLoading: boolean;
  searchQuery: string;
  sortBy: string;
  statusFilter: JobPostingStatusEnum | 'ALL';
  clientFilter?: string;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: string) => void;
  onStatusFilterChange: (status: JobPostingStatusEnum | 'ALL') => void;
  onClientFilterChange?: (clientId: string) => void;
  onViewDetails: (job: any) => void;
  onEditJob: (job: any) => void;
  onStatusChange: (
    jobId: string,
    status: JobPostingStatusEnum,
    jobTitle: string
  ) => void;
  onDeleteJob: (jobId: string, jobTitle: string) => void;
}

// Get status badge variant
const getStatusBadge = (status: JobPostingStatusEnum) => {
  switch (status) {
    case JobPostingStatusEnum.PUBLISHED:
      return (
        <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
          <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></div>
          Active
        </Badge>
      );
    case JobPostingStatusEnum.DRAFT:
      return (
        <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400">
          <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-400"></div>
          Draft
        </Badge>
      );
    case JobPostingStatusEnum.CLOSED:
      return (
        <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
          <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
          Closed
        </Badge>
      );
    case JobPostingStatusEnum.ARCHIVED:
      return (
        <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400">
          <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400"></div>
          Archived
        </Badge>
      );
    default:
      return (
        <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400">
          <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-400"></div>
          {status}
        </Badge>
      );
  }
};

const getLocationDisplay = (job: any) => {
  if (job.isRemote) {
    return 'Remote';
  }
  if (job.preferredLocations && job.preferredLocations.length > 0) {
    return job.preferredLocations[0];
  }
  return 'On-site';
};

function truncateWords(text: string, wordLimit: number = 25): string {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= wordLimit) {
    return text;
  }
  return words.slice(0, wordLimit).join(' ') + '...';
}

export function SupportJobTable({
  jobs,
  isLoading,
  searchQuery,
  sortBy,
  statusFilter,
  clientFilter = 'ALL',
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onClientFilterChange,
  onViewDetails,
  onEditJob,
  onDeleteJob,
}: SupportJobTableProps) {
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedJobForInvite, setSelectedJobForInvite] = useState<any>(null);
  const [recruiterAssignmentModalOpen, setRecruiterAssignmentModalOpen] =
    useState(false);
  const [
    selectedJobForRecruiterAssignment,
    setSelectedJobForRecruiterAssignment,
  ] = useState<any>(null);
  const { user } = useApp();

  // Get unique clients for filter dropdown
  const uniqueClients = jobs.reduce(
    (acc, job) => {
      if (job.clientInfo && !acc.find((c: any) => c.id === job.clientInfo.id)) {
        acc.push({
          id: job.clientInfo.id,
          name: job.clientInfo.name,
        });
      }
      return acc;
    },
    [] as { id: string; name: string }[]
  );

  // Check if user is support-recruiter or account manager (support users with RECRUITER or ACCOUNT_MANAGER role can invite)
  const canInvite =
    user?.type === UserTypeEnum.SUPPORT &&
    (user?.role === UserRoleEnum.RECRUITER ||
      user?.role === UserRoleEnum.ACCOUNT_MANAGER);

  // Check if user is a recruiter or account manager (for hiding edit/delete actions)
  const isRecruiter = user?.role === UserRoleEnum.RECRUITER;
  const isAccountManager = user?.role === UserRoleEnum.ACCOUNT_MANAGER;
  const shouldHideEditDelete = isRecruiter || isAccountManager;

  // Check if user can assign/change recruiters (only support account managers)
  const canAssignRecruiter =
    user?.type === UserTypeEnum.SUPPORT &&
    user?.role === UserRoleEnum.ACCOUNT_MANAGER;

  const handleDeleteConfirm = async () => {
    if (!deleteJobId) return;

    setIsDeleting(true);
    try {
      await onDeleteJob(
        deleteJobId,
        jobs.find((job) => job.id === deleteJobId)?.title || ''
      );
      setDeleteJobId(null);
    } catch (_error) {
      // Error handling for job deletion
      // TODO: Add proper error logging service
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInviteClick = (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedJobForInvite(job);
    setInviteModalOpen(true);
  };

  const handleRecruiterAssignmentClick = (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedJobForRecruiterAssignment(job);
    setRecruiterAssignmentModalOpen(true);
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = jobs
    .filter((job) => {
      const matchesSearch =
        searchQuery === '' ||
        (job.title &&
          job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.description &&
          job.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.department &&
          job.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.clientInfo?.name &&
          job.clientInfo.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' || job.status === statusFilter;

      const matchesClient =
        clientFilter === 'ALL' || job.clientInfo?.id === clientFilter;

      return matchesSearch && matchesStatus && matchesClient;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case 'updatedAt':
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
        case 'applications':
          return (b.numberOfApplications || 0) - (a.numberOfApplications || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0 && !isLoading) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8">
          <div className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No Job Postings Found
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              There are no job postings available for your assigned clients at
              the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-none">
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
                    Total {filteredAndSortedJobs.length} positions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="dark:bg-primary/10 h-10 w-40 rounded-lg border-gray-300 bg-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-primary/10 rounded-lg">
                    <SelectItem value="createdAt">
                      <div className="flex items-center gap-2 rounded-lg">
                        <Calendar className="h-4 w-4" />
                        <span>Created Date</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="updatedAt">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Updated Date</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="applications">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Applications</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewType === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewType('grid')}
                    className="h-10 w-10"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewType === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewType('list')}
                    className="h-10 w-10"
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search jobs by title, department, client, or skills..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="dark:bg-primary/10 rounded-lg border-gray-300 bg-white pl-9 dark:border-gray-600"
                />
              </div>

              {/* Client Filter */}
              {onClientFilterChange && uniqueClients.length > 0 && (
                <Select
                  value={clientFilter}
                  onValueChange={onClientFilterChange}
                >
                  <SelectTrigger className="dark:bg-primary/10 w-48 rounded-lg border-gray-300 bg-white dark:border-gray-600">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="ALL">All Clients</SelectItem>
                    {uniqueClients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{client.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="dark:bg-primary/10 w-40 rounded-lg border-gray-300 bg-white dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value={JobPostingStatusEnum.PUBLISHED}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Active</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={JobPostingStatusEnum.DRAFT}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <span>Draft</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={JobPostingStatusEnum.CLOSED}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span>Closed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={JobPostingStatusEnum.ARCHIVED}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                      <span>Archived</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Job Cards */}
      <div
        className={cn(
          'space-y-2',
          viewType === 'grid' &&
            'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}
      >
        {filteredAndSortedJobs.map((job, index) => (
          <Card
            onClick={() => onViewDetails(job)}
            key={job.id + index}
            className={cn(
              'group hover:border-primary/20 dark:hover:border-primary/30 cursor-pointer rounded-xl border border-gray-200 bg-white shadow-none transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800/50',
              viewType === 'grid' && 'flex h-full flex-col hover:scale-[1.02]',
              viewType === 'list' && 'mb-3'
            )}
          >
            <CardContent
              className={cn(
                'relative w-full flex-1 overflow-hidden p-0',
                viewType === 'grid' && 'flex h-full flex-col'
              )}
            >
              <div
                className={cn(
                  'flex w-full items-start justify-between p-6',
                  viewType === 'grid' && 'h-full flex-col'
                )}
              >
                <div
                  className={cn(
                    'flex w-full items-start gap-4',
                    viewType === 'grid' && 'w-full'
                  )}
                >
                  <div className="flex-1">
                    <div
                      className={cn(
                        'flex w-full items-start gap-4',
                        viewType === 'grid' && 'w-full flex-col'
                      )}
                    >
                      <div
                        className={cn(
                          'w-full space-y-2',
                          viewType === 'grid' && 'relative'
                        )}
                      >
                        {viewType === 'grid' && (
                          <div className="absolute top-0 right-0">
                            {getStatusBadge(job.status)}
                          </div>
                        )}
                        <div
                          className={cn(
                            'flex items-center gap-2',
                            viewType === 'list' && 'justify-between'
                          )}
                        >
                          <h3
                            className={cn(
                              'group-hover:text-primary bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-lg font-semibold text-gray-900 transition-colors dark:text-white dark:group-hover:text-blue-100',
                              viewType === 'grid' && 'text-left'
                            )}
                          >
                            {job.title || 'Untitled Job'}
                          </h3>
                          {viewType === 'list' && (
                            <div className="flex items-center gap-3">
                              {/* Client Information */}
                              <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800/50">
                                <Building2 className="text-primary flex h-3.5 w-3.5" />
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                  Client:
                                </span>
                                <span className="text-primary text-xs font-bold">
                                  {job.clientInfo?.name || 'Unknown Client'}
                                </span>
                              </div>

                              {/* Recruiter Information */}
                              {job.recruiter && (
                                <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800/50">
                                  <User className="text-primary flex h-3.5 w-3.5" />
                                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    Recruiter:
                                  </span>
                                  <span className="text-primary text-xs font-bold">
                                    {job.recruiter.name}
                                  </span>
                                </div>
                              )}

                              {getStatusBadge(job.status)}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewDetails(job);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>

                                  {/* Recruiter Assignment/Change Button */}
                                  {canAssignRecruiter && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRecruiterAssignmentClick(job, e);
                                      }}
                                    >
                                      <User className="mr-2 h-4 w-4" />
                                      {job.recruiter
                                        ? 'Change Recruiter'
                                        : 'Assign Recruiter'}
                                    </DropdownMenuItem>
                                  )}

                                  {!shouldHideEditDelete && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditJob(job);
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Job
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteJobId(job.id);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Job
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {job.status ===
                                    JobPostingStatusEnum.PUBLISHED &&
                                    canInvite && (
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleInviteClick(job, e);
                                        }}
                                      >
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Invite
                                      </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>

                        {/* Client and Recruiter Information for Grid View */}
                        {viewType === 'grid' && (
                          <div className="mt-2 flex flex-col gap-1.5">
                            {/* Client Information for Grid View */}
                            <div className="flex w-fit items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800/50">
                              <Building2 className="text-primary flex h-3.5 w-3.5" />
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                Client:
                              </span>
                              <span className="text-primary text-xs font-bold">
                                {job.clientInfo?.name || 'Unknown Client'}
                              </span>
                            </div>

                            {/* Recruiter Information for Grid View */}
                            {job.recruiter && (
                              <div className="flex w-fit items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800/50">
                                <User className="text-primary flex h-3.5 w-3.5" />
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                  Recruiter:
                                </span>
                                <span className="text-primary text-xs font-bold">
                                  {job.recruiter.name}
                                </span>
                                {canAssignRecruiter && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={(e) =>
                                      handleRecruiterAssignmentClick(job, e)
                                    }
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Job Description Preview */}
                        {job.description && (
                          <p className="mt-2 line-clamp-2 max-w-3xl overflow-hidden text-sm leading-relaxed break-words whitespace-normal text-gray-600 dark:text-gray-400">
                            {truncateWords(job.description, 25)}
                          </p>
                        )}
                        <div
                          className={cn(
                            'mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4',
                            viewType === 'grid' && 'items-start text-left'
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <MapPin className="flex h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {getLocationDisplay(job)}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:gap-4 dark:text-gray-400',
                              viewType === 'grid' && 'justify-start'
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="flex h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-600 dark:text-gray-300">
                                {job.jobType
                                  ? formatEnumValue(job.jobType)
                                  : 'Full-time'}{' '}
                                {`(${
                                  job.jobCommitment &&
                                  formatEnumValue(job.jobCommitment)
                                })`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="flex h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-600 dark:text-gray-300">
                                {job.totalExperience || 'N/A'} years experience
                              </span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              'flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-3 dark:text-gray-400',
                              viewType === 'grid' && 'justify-start'
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <Calendar className="flex h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-600 dark:text-gray-300">
                                Added on{' '}
                                {job.createdAt
                                  ? format(
                                      new Date(job.createdAt),
                                      'MMM dd, yyyy'
                                    )
                                  : 'N/A'}
                              </span>
                            </div>
                            {job?.applicationDeadline && (
                              <div className="flex items-center gap-1.5">
                                <AlarmClock className="flex h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-600 dark:text-gray-300">
                                  Expires on:{' '}
                                  {format(
                                    new Date(job?.applicationDeadline || ''),
                                    'MMM dd, yyyy'
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid View Actions & Stats */}
                {viewType === 'grid' && (
                  <div className="mt-2 w-full border-t border-gray-200 dark:border-gray-700"></div>
                )}
                {viewType === 'grid' && (
                  <div className="mt-3 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {(job.numberOfApplications || 0) > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary flex items-center gap-1 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {job.numberOfApplications || 0} Applications
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(job);
                        }}
                        className="h-8 gap-1.5 px-2.5 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      {canAssignRecruiter && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecruiterAssignmentClick(job, e);
                          }}
                          className="h-8 gap-1.5 px-2.5 text-xs"
                        >
                          <User className="h-3 w-3" />
                          {job.recruiter
                            ? 'Change Recruiter'
                            : 'Assign Recruiter'}
                        </Button>
                      )}
                      {job.status === JobPostingStatusEnum.PUBLISHED &&
                        canInvite && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInviteClick(job, e);
                            }}
                            className="h-8 gap-1.5 px-2.5 text-xs"
                          >
                            <Send className="h-3 w-3" />
                            Invite
                          </Button>
                        )}
                    </div>
                  </div>
                )}

                {/* List View Action Buttons */}
                {viewType === 'list' && (
                  <div
                    className={cn(
                      'flex items-center gap-2',
                      'absolute right-6 bottom-6 justify-end'
                    )}
                  >
                    {/* Edit Button - Only for DRAFT jobs and non-recruiters */}
                    {job.status === JobPostingStatusEnum.DRAFT &&
                      !shouldHideEditDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 px-2.5 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditJob(job);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      )}

                    {job.status === JobPostingStatusEnum.PUBLISHED &&
                      canInvite && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 px-2.5 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteClick(job, e);
                          }}
                        >
                          <Send className="h-3.5 w-3.5" />
                          Invite
                        </Button>
                      )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteJobId}
        onOpenChange={() => setDeleteJobId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job posting? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Modal */}
      {selectedJobForInvite && (
        <SupportJobInviteModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          job={selectedJobForInvite}
        />
      )}

      {/* Recruiter Assignment Modal */}
      {selectedJobForRecruiterAssignment && (
        <SupportRecruiterAssignmentModal
          open={recruiterAssignmentModalOpen}
          onOpenChange={setRecruiterAssignmentModalOpen}
          job={selectedJobForRecruiterAssignment}
          mode={
            selectedJobForRecruiterAssignment.recruiter ? 'reassign' : 'assign'
          }
        />
      )}
    </>
  );
}
