import React from 'react';
import { IClientJobPosting } from '@/lib/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  Users,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  Send,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PublicJobCardProps {
  jobPosting: IClientJobPosting;
}

export const PublicJobCard: React.FC<PublicJobCardProps> = ({ jobPosting }) => {
  const formatEnumValue = (value: string) => {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
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

  const handleApply = () => {
    if (jobPosting.applicationUrl) {
      window.open('/app/auth/login?user_type=candidate', '_blank');
    } else {
      window.open('/contact', '_blank');
    }
  };

  return (
    <div className="bg-card border-border/60 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Header with job overview */}
      <div className="relative px-8 pt-8 pb-6">
        <div className="text-center">
          <div className="relative mb-6 inline-block">
            <div className="border-primary/20 h-32 w-32 overflow-hidden rounded-full border-2 shadow-md">
              {jobPosting.company?.logo ? (
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={jobPosting.company.logo}
                    alt={jobPosting.company.name}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary h-full w-full text-2xl font-semibold">
                    {jobPosting.company.name
                      ?.split(' ')
                      .filter(Boolean)
                      .map((n) => n[0]?.toUpperCase())
                      .join('') || ''}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-primary/10 text-primary h-full w-full text-4xl font-semibold">
                    {jobPosting.company?.name
                      ?.split(' ')
                      .filter(Boolean)
                      .map((n) => n[0]?.toUpperCase())
                      .join('') || ''}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-foreground text-xl font-semibold tracking-tight">
              Job Overview
            </h3>
            <p className="text-primary font-medium">{jobPosting.title}</p>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="px-8 pb-6">
        <div className="space-y-3">
          <Button
            onClick={handleApply}
            className="bg-primary hover:bg-primary/90 w-full rounded-full font-medium text-white"
            size="lg"
          >
            <Send className="mr-2 h-4 w-4" />
            Apply Now
          </Button>
        </div>
      </div>

      {/* Key Details */}
      <div className="px-8 pb-6">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <MapPin className="text-primary h-4 w-4" />
            </div>
            <div>
              <div className="text-foreground text-sm font-medium">
                {getLocationString()}
              </div>
              <div className="text-muted-foreground text-xs">Location</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <Clock className="text-primary h-4 w-4" />
            </div>
            <div>
              <div className="text-foreground text-sm font-medium">
                {formatEnumValue(jobPosting.jobCommitment)}
              </div>
              <div className="text-muted-foreground text-xs">Work Type</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Users className="text-secondary-foreground h-4 w-4" />
            </div>
            <div>
              <div className="text-foreground text-sm font-medium">
                {jobPosting.numberOfOpenings}
              </div>
              <div className="text-muted-foreground text-xs">
                Open Positions
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Calendar className="text-accent-foreground h-4 w-4" />
            </div>
            <div>
              <div className="text-foreground text-sm font-medium">
                {jobPosting.totalExperience}+ years
              </div>
              <div className="text-muted-foreground text-xs">
                Experience Required
              </div>
            </div>
          </div>

          {jobPosting.department && (
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Building2 className="text-accent-foreground h-4 w-4" />
              </div>
              <div>
                <div className="text-foreground text-sm font-medium">
                  {jobPosting.department}
                </div>
                <div className="text-muted-foreground text-xs">Department</div>
              </div>
            </div>
          )}

          {jobPosting.teamSize && (
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Briefcase className="text-accent-foreground h-4 w-4" />
              </div>
              <div>
                <div className="text-foreground text-sm font-medium">
                  {jobPosting.teamSize} people
                </div>
                <div className="text-muted-foreground text-xs">Team Size</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Salary Information */}
      <div className="px-8 pb-6">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Compensation</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="text-primary h-4 w-4" />
              <span className="text-sm font-medium text-gray-900">
                {formatSalary(
                  jobPosting.minSalary,
                  jobPosting.maxSalary,
                  jobPosting.salaryCurrency
                )}
              </span>
            </div>

            {jobPosting.equity && (
              <Badge
                variant="secondary"
                className="w-fit bg-green-100 text-green-800"
              >
                Equity Available
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Job Type Details */}
      <div className="px-8 pb-8">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Job Details</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {formatEnumValue(jobPosting.jobType)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatEnumValue(jobPosting.jobSchedule)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatEnumValue(jobPosting.industry)}
            </Badge>
            {jobPosting.isRemote && (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary text-xs"
              >
                Remote
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
