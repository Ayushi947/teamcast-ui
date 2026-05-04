import React from 'react';
import { IClientJobPosting } from '@/lib/shared';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Calendar, Star, Sparkles } from 'lucide-react';

interface PublicJobHeaderProps {
  jobPosting: IClientJobPosting;
}

export const PublicJobHeader: React.FC<PublicJobHeaderProps> = ({
  jobPosting,
}) => {
  const formatEnumValue = (value: string) => {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Salary not specified';
    if (min && !max) return `${currency || '$'}${min.toLocaleString()}+`;
    if (!min && max) return `Up to ${currency || '$'}${max.toLocaleString()}`;
    return `${currency || '$'}${min?.toLocaleString()} - ${currency || '$'}${max?.toLocaleString()}`;
  };

  const getLocationString = () => {
    if (jobPosting.isRemote) {
      return 'Remote';
    }
    return jobPosting.preferredLocations?.[0] || 'Location not specified';
  };

  return (
    <div className="border-border from-card via-card to-muted/20 dark:from-card dark:via-card dark:to-muted/10 relative overflow-hidden rounded-xl border bg-white p-6 shadow-lg backdrop-blur-sm">
      {/* Background decoration */}
      <div className="bg-primary/5 dark:bg-primary/10 absolute -top-4 -right-4 h-24 w-24 rounded-full blur-xl" />
      <div className="bg-accent/5 dark:bg-accent/10 absolute -bottom-3 -left-3 h-20 w-20 rounded-lg blur-lg" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 dark:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
                  {jobPosting.title}
                </h1>
                {/* Application Deadline - Positioned beside title */}
                {jobPosting.applicationDeadline && (
                  <Badge className="border-amber-200 bg-amber-50 text-xs text-amber-800">
                    <Calendar className="mr-1 h-2.5 w-2.5" />
                    Deadline:{' '}
                    {new Date(
                      jobPosting.applicationDeadline
                    ).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm lg:text-base">
                Discover exceptional opportunities and growth
              </p>
            </div>
          </div>

          {/* Subtitle with enhanced styling */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs lg:text-sm">
            <div className="bg-primary/60 h-0.5 w-6 rounded-full" />
            <span className="font-medium">
              Powered by AI-driven talent matching
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {jobPosting.isFeatured && (
            <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
              <Star className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Key Job Details */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex items-center gap-2">
          <MapPin className="text-primary h-4 w-4" />
          <div>
            <p className="font-medium text-gray-900">{getLocationString()}</p>
            <p className="text-sm text-gray-500">Location</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="text-primary h-4 w-4" />
          <div>
            <p className="font-medium text-gray-900">
              {formatEnumValue(jobPosting.jobCommitment)}
            </p>
            <p className="text-sm text-gray-500">Type</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="text-primary h-4 w-4" />
          <div>
            <p className="font-medium text-gray-900">
              {jobPosting.numberOfOpenings}
            </p>
            <p className="text-sm text-gray-500">Openings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="text-primary h-4 w-4" />
          <div>
            <p className="font-medium text-gray-900">
              {jobPosting.totalExperience}+ years
            </p>
            <p className="text-sm text-gray-500">Experience</p>
          </div>
        </div>
      </div>

      {/* Salary and Job Info */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary"
        >
          {formatSalary(
            jobPosting.minSalary,
            jobPosting.maxSalary,
            jobPosting.salaryCurrency
          )}
        </Badge>

        <Badge variant="outline">{formatEnumValue(jobPosting.jobType)}</Badge>

        <Badge variant="outline">
          {formatEnumValue(jobPosting.jobSchedule)}
        </Badge>

        <Badge variant="outline">{formatEnumValue(jobPosting.industry)}</Badge>

        {jobPosting.equity && (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            Equity Available
          </Badge>
        )}

        {jobPosting.isRemote && (
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary"
          >
            Remote Work
          </Badge>
        )}
      </div>
    </div>
  );
};
