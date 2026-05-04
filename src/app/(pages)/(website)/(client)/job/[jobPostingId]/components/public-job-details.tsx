import React from 'react';
import { IClientJobPosting } from '@/lib/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  GraduationCap,
  MapPin,
  Building2,
  Star,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface PublicJobDetailsProps {
  jobPosting: IClientJobPosting;
}

export const PublicJobDetails: React.FC<PublicJobDetailsProps> = ({
  jobPosting,
}) => {
  const formatEnumValue = (value: string) => {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="group from-card via-card to-background/50 relative h-full overflow-hidden bg-gradient-to-br shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Background decoration */}
      <div className="bg-secondary/5 group-hover:bg-secondary/10 dark:bg-secondary/10 dark:group-hover:bg-secondary/20 absolute -top-6 -right-6 h-24 w-24 rounded-full blur-xl transition-all duration-500" />

      <div className="relative flex h-full flex-col p-6">
        {/* Header */}
        <div className="border-border/50 flex items-center gap-3 border-b pb-4">
          <div className="bg-secondary/10 dark:bg-secondary/20 flex h-10 w-10 items-center justify-center rounded-lg">
            <Code className="text-secondary-foreground h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-xl font-bold">
              Requirements & Preferences
            </h3>
            <p className="text-muted-foreground text-sm">
              Skills, experience, and qualifications needed
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-6">
          {/* Required Skills */}
          {jobPosting.requiredSkills &&
            jobPosting.requiredSkills.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Code className="text-primary h-5 w-5" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobPosting.requiredSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Preferred Skills */}
          {jobPosting.preferredSkills &&
            jobPosting.preferredSkills.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Preferred Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobPosting.preferredSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="border-yellow-200 bg-yellow-50 text-yellow-700"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Preferred Universities */}
          {jobPosting.preferredUniversities &&
            jobPosting.preferredUniversities.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <GraduationCap className="text-primary h-5 w-5" />
                  Preferred Universities
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {jobPosting.preferredUniversities.map((university, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        {university}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Preferred Degrees */}
          {jobPosting.preferredDegrees &&
            jobPosting.preferredDegrees.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <GraduationCap className="text-primary h-5 w-5" />
                  Preferred Degrees
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobPosting.preferredDegrees.map((degree, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {degree}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Preferred Locations */}
          {jobPosting.preferredLocations &&
            jobPosting.preferredLocations.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <MapPin className="text-primary h-5 w-5" />
                  Preferred Locations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobPosting.preferredLocations.map((location, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Preferred Industries */}
          {jobPosting.preferredIndustries &&
            jobPosting.preferredIndustries.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Building2 className="text-primary h-5 w-5" />
                  Preferred Industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobPosting.preferredIndustries.map((industry, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {formatEnumValue(industry)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Work Schedule & Type Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Work Arrangement
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium text-gray-500">
                    Work Type
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {formatEnumValue(jobPosting.jobType)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium text-gray-500">
                    Schedule
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {formatEnumValue(jobPosting.jobSchedule)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium text-gray-500">
                    Remote Work
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {jobPosting.isRemote ? 'Available' : 'Not Available'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium text-gray-500">
                    Industry
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {formatEnumValue(jobPosting.industry)}
                </p>
              </div>
            </div>
          </div>

          {/* Experience & Team Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Experience & Team
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">
                  Experience Required
                </p>
                <p className="text-sm text-gray-900">
                  {jobPosting.totalExperience}+ years
                </p>
              </div>

              {jobPosting.teamSize && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Team Size</p>
                  <p className="text-sm text-gray-900">
                    {jobPosting.teamSize} people
                  </p>
                </div>
              )}

              {jobPosting.department && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Department
                  </p>
                  <p className="text-sm text-gray-900">
                    {jobPosting.department}
                  </p>
                </div>
              )}

              {jobPosting.reportingTo && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Reports To
                  </p>
                  <p className="text-sm text-gray-900">
                    {jobPosting.reportingTo}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
