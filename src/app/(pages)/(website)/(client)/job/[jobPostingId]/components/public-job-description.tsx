import React from 'react';
import { IClientJobPosting } from '@/lib/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Target, CheckCircle } from 'lucide-react';

interface PublicJobDescriptionProps {
  jobPosting: IClientJobPosting;
}

export const PublicJobDescription: React.FC<PublicJobDescriptionProps> = ({
  jobPosting,
}) => {
  return (
    <Card className="group from-card via-card to-background/50 relative h-full overflow-hidden bg-gradient-to-br shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Background decoration */}
      <div className="bg-accent/5 group-hover:bg-accent/10 dark:bg-accent/10 dark:group-hover:bg-accent/20 absolute -top-6 -left-6 h-24 w-24 rounded-full blur-xl transition-all duration-500" />

      <div className="relative flex h-full flex-col p-6">
        {/* Header */}
        <div className="border-border/50 flex items-center gap-3 border-b pb-4">
          <div className="bg-primary/10 dark:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
            <FileText className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-xl font-bold">
              Job Description
            </h3>
            <p className="text-muted-foreground text-sm">
              Role details, responsibilities, and requirements
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-6">
          {/* Main Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              About This Role
            </h3>
            <div className="prose prose-gray max-w-none">
              <p className="leading-relaxed text-gray-700">
                {jobPosting.description}
              </p>
            </div>
          </div>

          {/* Responsibilities */}
          {jobPosting.responsibilities &&
            jobPosting.responsibilities.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Target className="text-primary h-5 w-5" />
                  Key Responsibilities
                </h3>
                <ul className="space-y-2">
                  {jobPosting.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Benefits */}
          {jobPosting.benefits && jobPosting.benefits.length > 0 && (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Benefits & Perks
              </h3>
              <div className="flex flex-wrap gap-2">
                {jobPosting.benefits.map((benefit, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {jobPosting.tags && jobPosting.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Job Tags</h3>
              <div className="flex flex-wrap gap-2">
                {jobPosting.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Additional Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {jobPosting.reportingTo && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Reports To
                  </p>
                  <p className="text-sm text-gray-900">
                    {jobPosting.reportingTo}
                  </p>
                </div>
              )}

              {jobPosting.availableFrom && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Available From
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(jobPosting.availableFrom).toLocaleDateString()}
                  </p>
                </div>
              )}

              {jobPosting.hiring_manager_email && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Hiring Manager
                  </p>
                  <p className="text-sm text-gray-900">
                    {jobPosting.hiring_manager_email}
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
