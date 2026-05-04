'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  MapPin,
  Star,
  Upload,
  FileSpreadsheet,
  Users,
  Calendar,
  Briefcase,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { CandidateImportApiService } from '@/lib/shared/services/client/candidate.import.api.service';
import { ClientJobInviteApiService } from '@/lib/shared/services/client/job.invite.api.service';
import { ICandidateImportRecord } from '@/lib/shared/models/domain/client/candidate.import.domain';
import { apiClient } from '@/lib/api-client';
import { UploadCandidateModal } from './upload-candidate-modal';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { CandidateImportStatusEnum } from '@/lib/shared';

interface JobOutsourceTabProps {
  job: any; // IClientJobPosting type
  onUploadSuccess?: () => void;
}

export function JobOutsourceTab({
  job,
  onUploadSuccess,
}: JobOutsourceTabProps) {
  const [candidates, setCandidates] = useState<ICandidateImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [invitedCandidates, setInvitedCandidates] = useState<Set<string>>(
    new Set()
  );
  const [invitingCandidates, setInvitingCandidates] = useState<Set<string>>(
    new Set()
  );
  const [stats, setStats] = useState({
    totalInvites: 0,
    totalCandidates: 0,
    totalUploads: 0,
    totalSourced: 0,
  });

  // Stats configuration
  const statsConfig = [
    {
      key: 'totalInvites',
      label: 'Total Invites',
      icon: 'Mail',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      key: 'totalCandidates',
      label: 'Total Candidates',
      icon: 'Users',
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      key: 'totalUploads',
      label: 'Total Uploads',
      icon: 'Upload',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      key: 'totalSourced',
      label: 'Total Sourced',
      icon: 'Star',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  const candidateImportService = new CandidateImportApiService(apiClient);
  const jobInviteService = new ClientJobInviteApiService(apiClient);

  const fetchStatistics = async () => {
    try {
      const response = await candidateImportService.getImportStatistics({
        data: undefined,
        filters: {
          jobPostingId: job.id,
        },
        params: {},
        pagination: {
          page: 1,
          limit: 10,
        },
      });

      const statistics = response;

      if (statistics) {
        setStats({
          totalInvites: statistics.invitedCandidates || 0,
          totalCandidates: statistics.totalCandidates || 0,
          totalUploads: statistics.totalUploads || 0,
          totalSourced: 0,
        });
      }
    } catch (error) {
      logger.error('Failed to fetch statistics:', error);
      // Keep default values if API fails
    }
  };

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await candidateImportService.listImportedCandidates(
        job.id,
        { limit: 100 }
      );

      // Handle the response structure properly
      const items = response?.items || [];

      setCandidates(items);

      // Initialize invited candidates from API status
      const alreadyInvited = new Set<string>();
      items.forEach((candidate) => {
        if (candidate.status === CandidateImportStatusEnum.INVITED) {
          alreadyInvited.add(candidate.id);
        }
      });
      setInvitedCandidates(alreadyInvited);
    } catch (_error) {
      toast.error('Failed to load imported candidates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (job?.id) {
      fetchCandidates();
      fetchStatistics();
    }
  }, [job?.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-green-500';
    }
  };

  const handleInviteCandidate = async (candidate: ICandidateImportRecord) => {
    try {
      // Check if candidate has required fields
      if (!candidate.email?.trim() || !candidate.name?.trim()) {
        toast.error('Candidate email and name are required');
        return;
      }

      // Add candidate to inviting state
      setInvitingCandidates((prev) => new Set(prev).add(candidate.id));

      const inviteData = {
        candidates: [
          {
            name: candidate.name.trim(),
            email: candidate.email.trim(),
          },
        ],
        jobTitle: job?.title || 'Job Position',
        jobId: job?.id || '',
      };

      await jobInviteService.createJobInvite(inviteData);

      // Mark candidate as invited
      setInvitedCandidates((prev) => new Set(prev).add(candidate.id));

      // Update statistics
      setStats((prev) => ({
        ...prev,
        totalInvites: prev.totalInvites + 1,
      }));

      toast.success(`Invitation sent to ${candidate.name}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invitation'
      );
    } finally {
      // Remove from inviting state
      setInvitingCandidates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(candidate.id);
        return newSet;
      });
    }
  };

  const handleInviteClick = (candidate: ICandidateImportRecord) => {
    // Check both API status and local state for invited status
    const isInvitedFromApi =
      candidate.status === CandidateImportStatusEnum.INVITED;
    const isInvitedFromState = invitedCandidates.has(candidate.id);
    const isInvited = isInvitedFromApi || isInvitedFromState;

    // Prevent multiple clicks
    if (invitingCandidates.has(candidate.id) || isInvited) {
      return;
    }

    // Check if candidate has email
    if (!candidate.email?.trim()) {
      toast.error('Candidate email is required');
      return;
    }

    handleInviteCandidate(candidate);
  };

  const getInviteButtonState = (candidate: ICandidateImportRecord) => {
    const isInvited = invitedCandidates.has(candidate.id);
    const isInviting = invitingCandidates.has(candidate.id);
    const hasNoEmail = !candidate.email?.trim();

    if (isInvited) {
      return {
        text: 'Invited',
        icon: Check,
        disabled: true,
        className:
          'bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md',
      };
    }

    if (isInviting) {
      return {
        text: 'Inviting...',
        icon: Mail,
        disabled: true,
        className: 'bg-primary/80 text-white cursor-not-allowed',
      };
    }

    if (hasNoEmail) {
      return {
        text: 'No Email',
        icon: Mail,
        disabled: true,
        className:
          'bg-gray-100 text-gray-600 border border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
      };
    }

    return {
      text: 'Invite',
      icon: Mail,
      disabled: false,
      className:
        'bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md',
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="mb-2 h-6 w-20" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))}
        </div>

        {/* Candidates Skeleton */}
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
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Outsourced Candidates
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage candidates imported from external sources
          </p>
        </div>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#6E55CF] hover:bg-violet-800"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Candidates
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {statsConfig.map((stat) => {
          const getIconComponent = (iconName: string) => {
            switch (iconName) {
              case 'Mail':
                return Mail;
              case 'Users':
                return Users;
              case 'Upload':
                return Upload;
              case 'Star':
                return Star;
              default:
                return Users;
            }
          };

          const IconComponent = getIconComponent(stat.icon);

          return (
            <Card key={stat.key} className="p-4">
              <div className="flex items-center gap-2 py-4">
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats[stat.key as keyof typeof stats]}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <FileSpreadsheet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No imported candidates yet
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Upload an Excel file to import candidates from external sources
          </p>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Excel File
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => {
            const buttonState = getInviteButtonState(candidate);
            const IconComponent = buttonState.icon;

            return (
              <Card
                key={candidate.id}
                className="border-0 bg-white shadow-sm dark:bg-gray-900"
              >
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="ring-primary/10 h-14 w-14 ring-2">
                            <AvatarImage src="" alt={candidate.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                              {getInitials(candidate.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              'absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900',
                              getStatusColor('available')
                            )}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                            {candidate.name}
                          </h3>
                          {candidate.jobTitle && (
                            <p className="flex items-center gap-1 truncate text-sm text-gray-600 dark:text-gray-400">
                              <Briefcase className="h-3 w-3" />
                              {candidate.jobTitle}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            {/* Rating can be added here if available in the future */}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2">
                      {candidate.email && (
                        <div className="hover:text-primary flex items-center gap-2 text-sm text-gray-600 transition-colors duration-200 dark:text-gray-400">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="hover:text-primary flex items-center gap-2 text-sm text-gray-600 transition-colors duration-200 dark:text-gray-400">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      {candidate.location && (
                        <div className="hover:text-primary flex items-center gap-2 text-sm text-gray-600 transition-colors duration-200 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{candidate.location}</span>
                        </div>
                      )}
                      {candidate.experience && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{candidate.experience}+ years experience</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-xs transition-colors duration-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge
                              variant="outline"
                              className="border-gray-300 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-400"
                            >
                              +{candidate.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {candidate.errorMessage && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        Error: {candidate.errorMessage}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleInviteClick(candidate)}
                        disabled={buttonState.disabled}
                        className={cn(
                          'flex-1 text-sm font-medium transition-all duration-200',
                          buttonState.className
                        )}
                        size="sm"
                        type="button"
                      >
                        <IconComponent className="mr-2 h-3.5 w-3.5" />
                        {buttonState.text}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <UploadCandidateModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        jobPostingId={job.id}
        onUploadSuccess={() => {
          fetchCandidates();
          fetchStatistics();
          toast.success('Candidates uploaded successfully!');
          onUploadSuccess?.();
        }}
      />
    </div>
  );
}
