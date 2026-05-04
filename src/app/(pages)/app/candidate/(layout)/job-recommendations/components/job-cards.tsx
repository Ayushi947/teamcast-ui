'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { candidateProfileService } from '@/lib/services/services';
import { ICandidateProfile } from '@/lib/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, Share2 } from 'lucide-react';
import { CardLocationIcon, CompanyCardIcon } from '@/components/icons';
import { ApplyJobDialog } from './apply-job';
import { JobRecommendationItem } from '../types';

/** Format API enum value for display (e.g. FULL_TIME → "Full time") */
function formatJobCommitment(value?: string): string {
  if (!value) return 'Full time';
  return value
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

/** Prefer Remote when isRemote; otherwise first valid location or fallback */
function formatLocation(
  preferredLocations?: string[],
  isRemote?: boolean
): string {
  if (isRemote) return 'Remote';
  const first = preferredLocations?.[0];
  if (!first || first === 'Failed to get address')
    return 'Location not specified';
  return first;
}

interface JobCardProps {
  job: JobRecommendationItem;
  onApply: (job: JobRecommendationItem) => void;
}

const JobCard = ({ job, onApply }: JobCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleApply = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onApply(job);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle share functionality
  };

  // Format salary range
  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Salary not specified';

    const formatValue = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    };

    if (min && max) {
      return `${formatValue(min)} - ${formatValue(max)}`;
    } else if (min) {
      return `${formatValue(min)}+`;
    } else if (max) {
      return `Up to ${formatValue(max)}`;
    }

    return 'Salary not specified';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group border-border bg-card hover:shadow-primary/30 relative cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-2xl"
    >
      {/* Card Content */}
      <div className="flex h-full flex-col gap-4 p-6">
        {/* Header with company icon and basic info */}
        <div className="flex items-center gap-4">
          <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-lg">
            <CompanyCardIcon />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground truncate text-lg leading-tight font-semibold">
              {job.title}
            </h3>
            <p className="text-muted-foreground truncate text-base font-medium">
              {job.company?.name || 'Unknown Company'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border my-1 border-b" />

        {/* Location and employment type */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <div className="flex items-center gap-1">
            <CardLocationIcon />
            <span>{formatLocation(job.preferredLocations, job.isRemote)}</span>
          </div>
          <span className="text-border text-xs">•</span>
          <div className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium">
            {formatJobCommitment(job.jobCommitment)}
          </div>
        </div>

        {/* Experience level */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Experience Level:</span>
          <span className="text-foreground font-semibold">
            {job.totalExperience != null
              ? `${job.totalExperience}+ Yrs`
              : 'Not specified'}
          </span>
        </div>

        {/* Job description */}
        <div className="flex-1">
          <p className="text-muted-foreground line-clamp-4 min-h-[80px] text-base leading-relaxed">
            {job.description || 'No description provided'}
          </p>
        </div>

        {/* Divider */}
        <div className="border-border my-1 border-b" />

        {/* Salary and actions */}
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-muted-foreground mb-1 text-xs">Salary</p>
            <p className="text-primary text-xl leading-tight font-bold">
              {formatSalary(job.minSalary, job.maxSalary, job.salaryCurrency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleApply}
              className="bg-primary rounded-lg px-5 py-2 font-semibold text-white shadow-none hover:shadow-sm"
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBookmark}
              className={`transition-colors ${
                isBookmarked ? 'text-primary border-primary bg-primary/10' : ''
              }`}
              aria-label="Bookmark job"
            >
              <Bookmark
                className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              aria-label="Share job"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface JobCardsProps {
  recommendations: JobRecommendationItem[];
  /** When true, skip profile check so All Jobs always displays (e.g. browse without published profile) */
  skipProfileCheck?: boolean;
}

export const JobCards = ({
  recommendations,
  skipProfileCheck = false,
}: JobCardsProps) => {
  const [selectedJob, setSelectedJob] = useState<JobRecommendationItem | null>(
    null
  );
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<ICandidateProfile, Error>({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateProfileService.getProfile(),
    retry: 1,
    enabled: !skipProfileCheck,
  });

  const handleApply = (job: JobRecommendationItem) => {
    setSelectedJob(job);
    setIsApplyDialogOpen(true);
  };

  if (!skipProfileCheck) {
    if (isLoading) {
      return (
        <Card className="w-full">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Loading...</p>
          </CardContent>
        </Card>
      );
    }
    if (error) {
      return (
        <Card className="w-full">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Error loading profile information
            </p>
          </CardContent>
        </Card>
      );
    }
    if (profile?.isPublished === false) {
      return (
        <Card className="w-full">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Complete and publish your profile to see recommended jobs here.
            </p>
          </CardContent>
        </Card>
      );
    }
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="w-full">
        <div className="pt-6">
          <p className="text-muted-foreground text-center">
            No job recommendations found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((job) => (
          <JobCard key={job.id} job={job} onApply={handleApply} />
        ))}
      </div>

      {selectedJob && (
        <ApplyJobDialog
          job={selectedJob}
          open={isApplyDialogOpen}
          onOpenChange={setIsApplyDialogOpen}
        />
      )}
    </>
  );
};
