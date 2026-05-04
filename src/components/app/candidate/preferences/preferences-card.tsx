import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pencil,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  DollarSign,
  Award,
  ListChecks,
  Coins,
  Tag,
} from 'lucide-react';
import { ICandidatePreferences } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';

export interface PreferencesCardProps {
  preferences: ICandidatePreferences;
  onEdit: () => void;
}

export function PreferencesCard({ preferences, onEdit }: PreferencesCardProps) {
  return (
    <div data-tour="job-preferences-section">
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-2">
          {/* Header with Edit Button */}
          <div className="flex flex-row items-start justify-between lg:col-span-2">
            <div className="space-y-1">
              <h3 className="text-foreground text-lg font-semibold">
                Job Preferences
              </h3>
              <div className="text-muted-foreground flex flex-col gap-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="text-muted-foreground h-3.5 w-3.5" />
                    {preferences.preferredJobTitles &&
                    preferences.preferredJobTitles.length > 0
                      ? preferences.preferredJobTitles
                          .map((title) => formatEnumValue(title))
                          .join(', ')
                      : 'No preferred job titles specified'}
                  </p>
                  <span className="text-muted-foreground">•</span>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="text-muted-foreground h-3.5 w-3.5" />
                    {preferences.preferredIndustries?.length > 0
                      ? preferences.preferredIndustries
                          .map((industry) => formatEnumValue(industry))
                          .join(', ')
                      : 'No preferred industries specified'}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          {/* Additional Preferences Section */}
          <div className="lg:col-span-1">
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <Tag className="text-muted-foreground h-4 w-4" />
              Additional Preferences
            </h4>
            <div className="flex items-start gap-2">
              <Tag className="text-muted-foreground mt-1 h-4 w-4" />
              <div>
                <h5 className="text-foreground text-sm font-medium">
                  Preferred Tags
                </h5>
                <div className="mt-1 flex flex-wrap gap-2">
                  {preferences.preferredTags &&
                  preferences.preferredTags.length > 0 ? (
                    preferences.preferredTags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary dark:bg-primary/20 rounded-full px-3 py-1 text-xs"
                      >
                        {formatEnumValue(tag)}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No additional preferences specified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Role Details Section */}
          <div className="lg:col-span-1">
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <ListChecks className="text-muted-foreground h-4 w-4" />
              Role Details
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <ListChecks className="text-muted-foreground mt-1 h-4 w-4" />
                <div>
                  <h5 className="text-foreground text-sm font-medium">
                    Preferred Responsibilities
                  </h5>
                  {preferences.preferredResponsibilities &&
                  preferences.preferredResponsibilities.length > 0 ? (
                    <ul className="text-muted-foreground mt-1 list-inside list-disc text-sm">
                      {preferences.preferredResponsibilities.map(
                        (responsibility, index) => (
                          <li key={index}>{formatEnumValue(responsibility)}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No preferred responsibilities specified
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Work Arrangement Section */}
          <div>
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <Clock className="text-muted-foreground h-4 w-4" />
              Work Arrangement
            </h4>
            <div className="grid gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="text-muted-foreground mt-1 h-4 w-4" />
                <div>
                  <h5 className="text-foreground text-sm font-medium">
                    Preferred Locations
                  </h5>
                  <p className="text-muted-foreground text-sm">
                    {preferences.preferredLocations?.length > 0
                      ? preferences.preferredLocations
                          .map((location) => formatEnumValue(location))
                          .join(', ')
                      : 'No preferred locations specified'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="text-muted-foreground mt-1 h-4 w-4" />
                <div>
                  <h5 className="text-foreground text-sm font-medium">
                    Work Types
                  </h5>
                  <p className="text-muted-foreground text-sm">
                    {preferences.preferredWorkTypes?.length > 0
                      ? preferences.preferredWorkTypes
                          .map((type) => formatEnumValue(type))
                          .join(', ')
                      : 'No preferred work types specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compensation & Benefits Section */}
          <div>
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <DollarSign className="text-muted-foreground h-4 w-4" />
              Compensation & Benefits
            </h4>
            <div className="grid gap-4">
              <div className="flex items-start gap-2">
                <Coins className="text-muted-foreground mt-1 h-4 w-4" />
                <div>
                  <h5 className="text-foreground text-sm font-medium">
                    Salary Range
                  </h5>
                  <p className="text-muted-foreground text-sm">
                    {preferences.preferredSalaryMin &&
                    preferences.preferredSalaryMax
                      ? `${preferences.preferredSalaryCurrency} ${preferences.preferredSalaryMin.toLocaleString()} - ${preferences.preferredSalaryMax.toLocaleString()}`
                      : 'No salary range specified'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Award className="text-muted-foreground mt-1 h-4 w-4" />
                <div>
                  <h5 className="text-foreground text-sm font-medium">
                    Preferred Benefits
                  </h5>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {preferences.preferredBenefits &&
                    preferences.preferredBenefits.length > 0 ? (
                      preferences.preferredBenefits.map((benefit, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary dark:bg-primary/20 rounded-full px-3 py-1 text-xs"
                        >
                          {formatEnumValue(benefit)}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No preferred benefits specified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
