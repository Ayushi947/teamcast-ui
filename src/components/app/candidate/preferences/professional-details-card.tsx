import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pencil,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Coins,
  Calendar,
  Code2,
  ListChecks,
} from 'lucide-react';
import { IResume } from '@/lib/shared';
import { enumToReadableText } from '@/lib/utils';
import { format } from 'date-fns';

export interface ProfessionalDetailsCardProps {
  resume: IResume;
  onEdit: () => void;
}

export function ProfessionalDetailsCard({
  resume,
  onEdit,
}: ProfessionalDetailsCardProps) {
  return (
    <div data-tour="professional-profile-section">
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-2">
          {/* Header with Edit Button */}
          <div className="flex flex-row items-start justify-between lg:col-span-2">
            <div className="space-y-1">
              <h3 className="text-foreground text-lg font-semibold">
                Professional Profile
              </h3>
              <div className="text-muted-foreground flex flex-col gap-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="text-muted-foreground h-3.5 w-3.5" />
                    {resume.currentJobTitle
                      ? `${resume.currentJobTitle}${
                          resume.currentCompany
                            ? ` at ${resume.currentCompany}`
                            : ''
                        }`
                      : 'No current position specified'}
                  </p>
                  <span className="text-muted-foreground">•</span>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="text-muted-foreground h-3.5 w-3.5" />
                    {resume.currentIndustry || 'Industry not specified'}
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

          {/* Professional Summary Section */}
          <div className="lg:col-span-2">
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <ListChecks className="text-muted-foreground h-4 w-4" />
              Professional Overview
            </h4>
            <p className="text-muted-foreground text-sm">
              {resume.summary || 'No professional summary provided'}
            </p>
          </div>

          {/* Skills & Expertise Section */}
          <div className="lg:col-span-2">
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <Code2 className="text-muted-foreground h-4 w-4" />
              Skills & Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {resume.resumeSkills?.length > 0 ? (
                resume.resumeSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary dark:bg-primary/20 rounded-full px-3 py-1 text-xs"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">
                  No skills listed
                </span>
              )}
            </div>
          </div>

          {/* Industry Experience Section */}
          <div className="lg:col-span-2">
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <Building2 className="text-muted-foreground h-4 w-4" />
              Industry Experience
            </h4>
            <div className="flex flex-wrap gap-2">
              {resume.industries?.length > 0 ? (
                resume.industries.map((industry, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary dark:bg-primary/20 rounded-full px-3 py-1 text-xs"
                  >
                    {industry}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">
                  No industry experience listed
                </span>
              )}
            </div>
          </div>

          {/* Current Role Details Section */}
          <div className="lg:col-span-1">
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <Briefcase className="text-muted-foreground h-4 w-4" />
              Current Position Details
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Work Location:
                </span>
                <span className="text-muted-foreground text-sm">
                  {resume.currentWorkLocation || 'Location not specified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Employment Type:
                </span>
                <span className="text-muted-foreground text-sm">
                  {resume.currentWorkType
                    ? enumToReadableText(resume.currentWorkType)
                    : 'Work type not specified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Current Compensation:
                </span>
                <span className="text-muted-foreground text-sm">
                  {resume.currentSalary
                    ? `${resume.currentSalaryCurrency} ${resume.currentSalary.toLocaleString()} per annum`
                    : 'Salary information not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Availability Section */}
          <div className="lg:col-span-1">
            <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
              <Calendar className="text-muted-foreground h-4 w-4" />
              Availability & Notice Period
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Available From:
                </span>
                <span className="text-muted-foreground text-sm">
                  {resume.availableFrom
                    ? format(new Date(resume.availableFrom), 'MMMM d, yyyy')
                    : 'Not specified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Notice Period:
                </span>
                <span className="text-muted-foreground text-sm">
                  {resume.noticePeriod
                    ? enumToReadableText(resume.noticePeriod)
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
