'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  activityLogService,
  clientJobPostingService,
  clientCandidateShortlistService,
} from '@/lib/services/services';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  CandidateShortlistStatusEnum,
  IClientCandidateShortlistWithCandidate,
} from '@/lib/shared';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import SaasDataTable, {
  columnRenderers,
  commonActions,
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
} from '@/components/app/common/tables/saas-data-table';

export default function ShortlistedCandidatesPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy] = useState<string>('shortlistedAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');

  const [_isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingShortlistId, setEditingShortlistId] = useState<string | null>(
    null
  );

  // Query client for cache management
  const queryClient = useQueryClient();

  // Get shortlisted candidates from the service
  const {
    data: shortlistedResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['shortlistedCandidates'],
    queryFn: async () => {
      try {
        const response =
          await clientCandidateShortlistService.listCandidateShortlists({
            status: CandidateShortlistStatusEnum.SHORTLISTED,
          });
        return response;
      } catch (error) {
        logger.error('Error fetching shortlisted candidates:', error);
        throw error;
      }
    },
  });

  // Extract the data array from the response - the API service already extracts response.data.data
  // The service returns IClientCandidateShortlistListData which has a data property
  let shortlistedData: IClientCandidateShortlistWithCandidate[] = [];

  if (shortlistedResponse) {
    // Try different possible structures
    if (Array.isArray(shortlistedResponse)) {
      shortlistedData = shortlistedResponse;
    } else if (
      shortlistedResponse.data &&
      Array.isArray(shortlistedResponse.data)
    ) {
      shortlistedData = shortlistedResponse.data;
    } else {
      logger.warn('Unexpected response structure:', shortlistedResponse);
    }
  }

  // Fetch jobs for filtering
  const { data: jobs, error: jobsError } = useQuery({
    queryKey: ['jobPostings'],
    queryFn: async () => {
      try {
        const response = await clientJobPostingService.getJobPostings();
        return response || { items: [] };
      } catch (error) {
        logger.error('Error fetching jobs:', error);
        throw error;
      }
    },
  });

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    if (!shortlistedData || !Array.isArray(shortlistedData)) return [];

    return shortlistedData
      .filter((shortlist) => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          shortlist.candidate.user.name?.toLowerCase().includes(searchLower) ||
          shortlist.candidate.resume?.currentJobTitle
            ?.toLowerCase()
            .includes(searchLower) ||
          shortlist.candidate.resume?.currentCompany
            ?.toLowerCase()
            .includes(searchLower);

        // Job filter
        const matchesJob =
          jobFilter === 'all' || shortlist.jobPostingId === jobFilter;

        // Experience filter
        const experience = shortlist.candidate.resume?.totalExperience || 0;
        const matchesExperience =
          experienceFilter === 'all' ||
          (experienceFilter === '0-2' && experience <= 2) ||
          (experienceFilter === '3-5' && experience >= 3 && experience <= 5) ||
          (experienceFilter === '6-10' &&
            experience >= 6 &&
            experience <= 10) ||
          (experienceFilter === '10+' && experience > 10);

        return matchesSearch && matchesJob && matchesExperience;
      })
      .sort((a, b) => {
        if (sortBy === 'shortlistedAt') {
          return sortOrder === 'desc'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'name') {
          const aName = `${a.candidate.user.name || ''}`.toLowerCase();
          const bName = `${b.candidate.user.name || ''}`.toLowerCase();
          return sortOrder === 'desc'
            ? bName.localeCompare(aName)
            : aName.localeCompare(bName);
        }
        if (sortBy === 'experience') {
          const aExp = a.candidate.resume?.totalExperience || 0;
          const bExp = b.candidate.resume?.totalExperience || 0;
          return sortOrder === 'desc' ? bExp - aExp : aExp - bExp;
        }
        return 0;
      });
  }, [
    shortlistedData,
    searchQuery,
    jobFilter,
    experienceFilter,
    sortBy,
    sortOrder,
  ]);

  // Show error state if either query fails
  if (error || jobsError) {
    return (
      <div className="space-y-6 p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-destructive mb-4 text-center">
              <p className="text-lg font-semibold">Error loading data</p>
              <p className="text-sm">
                {error instanceof Error
                  ? error.message
                  : jobsError instanceof Error
                    ? jobsError.message
                    : 'An unexpected error occurred'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ['shortlistedCandidates'],
                });
                queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRemoveFromShortlist = async (shortlistId: string) => {
    setIsRemoving(shortlistId);
    try {
      const response =
        await clientCandidateShortlistService.deleteCandidateShortlist(
          shortlistId
        );

      if (response.success) {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] });
        toast.success('Candidate removed from shortlist');
      }
    } catch (error) {
      toast.error('Failed to remove candidate from shortlist');
      logger.error('Error removing candidate from shortlist:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleUpdateNotes = async () => {
    if (!editingShortlistId) return;

    try {
      await clientCandidateShortlistService.updateCandidateShortlist(
        editingShortlistId,
        {
          notes,
        }
      );

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] });
      toast.success('Notes updated successfully');
      setShowNotesDialog(false);
      setEditingShortlistId(null);
      setNotes('');
    } catch (error) {
      toast.error('Failed to update notes');
      logger.error('Error updating notes:', error);
    }
  };

  const handleEditNotes = (
    shortlist: IClientCandidateShortlistWithCandidate
  ) => {
    setEditingShortlistId(shortlist.id);
    setNotes(shortlist.notes || '');
    setShowNotesDialog(true);
  };

  const handleSendInvite = async (
    shortlist: IClientCandidateShortlistWithCandidate
  ) => {
    try {
      if (!shortlist.jobPostingId) {
        toast.error('Job information not available');
        return;
      }

      const job = jobs?.items?.find((j) => j.id === shortlist.jobPostingId);
      if (!job) {
        toast.error('Job not found');
        return;
      }

      const response = await clientJobPostingService.inviteCandidate(
        shortlist.jobPostingId,
        {
          candidateId: shortlist.candidate.id,
          message: `We would like to invite you to apply for the ${job.title} position at our company.`,
          coverLetterUrl: 'Job Invitation',
        }
      );

      if (response) {
        toast.success(`Invitation sent to ${shortlist.candidate.user.name}!`);

        // Log activity
        await activityLogService.createActivityLog({
          entityType: ActivityEntityTypeEnum.CLIENT,
          entityId: job.clientId,
          module: ActivityModuleEnum.CLIENT,
          action: ActivityActionEnums.INVITE_CANDIDATE,
          description: `Invitation sent to ${shortlist.candidate.user.name} for ${job.title}`,
          metadata: {
            title: ActivityTitleEnum.INVITE_CANDIDATE,
            candidateId: shortlist.candidate.id,
            userName: `${shortlist.candidate.user.name}`,
            candidateEmail: shortlist.candidate.user.email,
            jobId: job.id,
            jobTitle: job.title,
          },
        });
      }
    } catch (error) {
      toast.error('Failed to send invitation');
      logger.error('Error sending invitation:', error);
    }
  };

  const handleContact = (shortlist: IClientCandidateShortlistWithCandidate) => {
    const subject = encodeURIComponent(
      `Regarding ${shortlist.jobPosting?.title || 'job opportunity'}`
    );
    const body = encodeURIComponent(
      `Hello ${shortlist.candidate.user.name},\n\nI hope this email finds you well. I came across your profile and I'm impressed with your background.\n\nWould you be interested in discussing this opportunity further?\n\nBest regards`
    );

    const mailtoUrl = `mailto:${shortlist.candidate.user.email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');

    toast.success('Email client opened');
  };

  const handleExportShortlist = () => {
    if (!filteredCandidates.length) {
      toast.error('No candidates to export');
      return;
    }

    try {
      // Define CSV headers and data
      const headers = [
        'Name',
        'Email',
        'Job Title',
        'Company',
        'Location',
        'Experience',
        'Skills',
        'Current Salary',
        'Work Type',
        'Work Schedule',
        'Job Search Status',
        'Shortlisted For',
        'Shortlisted Date',
        'Notes',
      ];

      const csvData = filteredCandidates.map((shortlist) => {
        const candidate = shortlist.candidate;
        const resume = candidate.resume;

        return {
          Name: `${candidate.user.name || ''}`,
          Email: candidate.user.email,
          'Job Title': resume?.currentJobTitle || 'N/A',
          Company: resume?.currentCompany || 'N/A',
          Location: resume?.currentWorkLocation || 'N/A',
          Experience: `${resume?.totalExperience || 0} years`,
          Skills: (resume?.resumeSkills || []).join(', '),
          'Current Salary': resume?.currentSalary
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: resume.currentSalaryCurrency || 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(resume.currentSalary)
            : 'N/A',
          'Work Type': resume?.currentWorkType || 'N/A',
          'Work Schedule': resume?.currentWorkSchedule || 'N/A',
          'Job Search Status': candidate.jobSearchStatus || 'N/A',
          'Shortlisted For': shortlist.jobPosting?.title || 'N/A',
          'Shortlisted Date': new Date(
            shortlist.createdAt
          ).toLocaleDateString(),
          Notes: shortlist.notes || '',
        };
      });

      // Convert to CSV format
      const csvContent = [
        headers.join(','),
        ...csvData.map((row) =>
          headers
            .map((header) => {
              const value = (row as Record<string, string>)[header] || '';
              // Escape special characters and wrap in quotes if needed
              return value.includes(',') ||
                value.includes('"') ||
                value.includes('\n')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(',')
        ),
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = URL.createObjectURL(blob);
      link.download = `shortlisted-candidates-${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Export completed successfully');
    } catch (error) {
      logger.error('Error exporting shortlist:', error);
      toast.error('Failed to export candidates');
    }
  };

  // Table columns definition
  const columns: SaasTableColumn<IClientCandidateShortlistWithCandidate>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (item) => item.candidate.user.name,
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      render: (item) => item.candidate.user.email,
    },
    {
      key: 'currentJobTitle',
      label: 'Job Title',
      render: (item) => item.candidate.resume?.currentJobTitle || 'N/A',
    },
    {
      key: 'currentCompany',
      label: 'Company',
      render: (item) => item.candidate.resume?.currentCompany || 'N/A',
    },
    {
      key: 'experience',
      label: 'Experience',
      render: (item) => `${item.candidate.resume?.totalExperience || 0} yrs`,
      sortable: true,
      align: 'center' as const,
    },
    {
      key: 'skills',
      label: 'Skills',
      render: (item) =>
        (item.candidate.resume?.resumeSkills || []).slice(0, 3).join(', '),
    },
    {
      key: 'shortlistedAt',
      label: 'Shortlisted Date',
      render: (item) => columnRenderers.date(item.createdAt),
      sortable: true,
    },
  ];

  // Table row actions
  const actions: SaasTableAction<IClientCandidateShortlistWithCandidate>[] = [
    {
      key: 'edit-notes',
      label: 'Edit Notes',
      icon: commonActions.edit,
      onClick: (item) => handleEditNotes(item),
    },
    {
      key: 'contact',
      label: 'Contact',
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: (item) => handleContact(item),
    },
    {
      key: 'invite',
      label: 'Send Invite',
      icon: <Send className="h-4 w-4" />,
      onClick: (item) => handleSendInvite(item),
    },
    {
      key: 'remove',
      label: 'Remove',
      icon: commonActions.delete,
      onClick: (item) => handleRemoveFromShortlist(item.id),
      variant: 'destructive',
    },
  ];

  // Table filters
  const filters: SaasTableFilter[] = [
    {
      key: 'job',
      label: 'Job',
      type: 'select',
      options: [
        { label: 'All Jobs', value: 'all' },
        ...(jobs?.items?.map((job) => ({ label: job.title, value: job.id })) ||
          []),
      ],
      value: jobFilter,
      onChange: (value) => setJobFilter(value as string),
      placeholder: 'Select job',
    },
    {
      key: 'experience',
      label: 'Experience',
      type: 'select',
      options: [
        { label: 'All', value: 'all' },
        { label: '0-2 years', value: '0-2' },
        { label: '3-5 years', value: '3-5' },
        { label: '6-10 years', value: '6-10' },
        { label: '10+ years', value: '10+' },
      ],
      value: experienceFilter,
      onChange: (value) => setExperienceFilter(value as string),
      placeholder: 'Select experience',
    },
  ];

  // Table row key
  const getRowKey = (item: IClientCandidateShortlistWithCandidate) => item.id;

  // Error message fallback
  const errorMessage =
    (error && (error as any).message) ||
    (jobsError && (jobsError as any).message) ||
    null;

  // Only render the SaasDataTable and Notes Dialog
  return (
    <div className="space-y-6 p-4">
      <SaasDataTable
        data={filteredCandidates}
        columns={columns}
        getRowKey={getRowKey}
        isLoading={isLoading}
        error={errorMessage}
        title="Shortlisted Candidates"
        description="Manage and review your shortlisted candidates across all job postings"
        searchable
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        actions={actions}
        onExport={handleExportShortlist}
        filters={filters}
      />
      {/* Notes Dialog remains unchanged */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{notes ? 'Edit Notes' : 'Add Notes'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Add your notes about this candidate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNotesDialog(false);
                  setEditingShortlistId(null);
                  setNotes('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateNotes}>Save Notes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
