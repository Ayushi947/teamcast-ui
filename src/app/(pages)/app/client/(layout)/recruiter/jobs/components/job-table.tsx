'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Eye,
  Users,
  FileText,
  Archive,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { IClientJobPosting, JobPostingStatusEnum, logger } from '@/lib/shared';
import { clientJobPostingService } from '@/lib/services/services';
import { toast } from 'sonner';
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
import { JobForm } from './job-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { useRouter } from 'next/navigation';

interface JobTableProps {
  jobs: IClientJobPosting[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onJobUpdated: () => void;
  onJobDeleted: () => void;
}

export function JobTable({
  jobs,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onSearchChange,
  onJobUpdated,
  onJobDeleted,
}: JobTableProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<IClientJobPosting | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const handleEdit = (job: IClientJobPosting) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (job: IClientJobPosting) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleArchive = (job: IClientJobPosting) => {
    setSelectedJob(job);
    setIsArchiveDialogOpen(true);
  };

  const handleView = (job: IClientJobPosting) => {
    router.push(`/app/client/recruiting/jobs/${job.id}`);
  };

  const handleViewApplications = (job: IClientJobPosting) => {
    router.push(`/app/client/recruiting/jobs/${job.id}/applications`);
  };

  const handleViewCandidates = (job: IClientJobPosting) => {
    router.push(`/app/client/recruiting/jobs/${job.id}/candidates`);
  };

  const confirmDelete = async () => {
    if (!selectedJob) return;

    try {
      await clientJobPostingService.deleteJobPosting(selectedJob.id);
      onJobDeleted();
      toast.success('Job posting deleted successfully.');
    } catch (error) {
      logger.error('Error deleting job:', error);
      toast.error('Failed to delete job posting. Please try again.');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
    }
  };

  const confirmArchive = async () => {
    if (!selectedJob) return;

    try {
      await clientJobPostingService.updateJobPostingStatus(selectedJob.id, {
        status: JobPostingStatusEnum.CLOSED,
      });
      onJobUpdated();
      toast.success('Job posting archived successfully.');
    } catch (error) {
      logger.error('Error archiving job:', error);
      toast.error('Failed to archive job posting. Please try again.');
    } finally {
      setIsArchiveDialogOpen(false);
      setSelectedJob(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case JobPostingStatusEnum.PUBLISHED:
        return 'default';
      case JobPostingStatusEnum.DRAFT:
        return 'secondary';
      case JobPostingStatusEnum.CLOSED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            className="pl-8"
            onChange={onSearchChange}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Commitment</TableHead>
              <TableHead>Openings</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {job.title}
                      {job.isFeatured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {job.isRemote && <Badge variant="outline">Remote</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.jobType}</TableCell>
                  <TableCell>{job.jobCommitment}</TableCell>
                  <TableCell>{job.numberOfOpenings}</TableCell>
                  <TableCell>
                    {job.applicationDeadline
                      ? format(new Date(job.applicationDeadline), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(job.status)}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(job)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewApplications(job)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Applications
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewCandidates(job)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Candidates
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(job)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(job)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(job)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          {selectedJob && (
            <JobForm
              job={selectedJob}
              onClose={() => {
                setIsEditDialogOpen(false);
                setSelectedJob(null);
              }}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedJob(null);
                onJobUpdated();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job
              posting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Job Posting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this job posting? This will close
              the position and prevent new applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
