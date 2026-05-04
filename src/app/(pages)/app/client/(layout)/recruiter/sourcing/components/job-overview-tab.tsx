'use client';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Clock } from 'lucide-react';
import { IClientJobPosting } from '@/lib/shared';
import {
  BreifCaseIcon,
  CompanyCardIcon,
  CorrectTickIcon,
  DollarIcon,
  LocationIcon,
  UserItemCardIcons,
} from '@/components/icons';
import { JobAnalyticsTab } from './job-analytics-tab';
import { useQuery } from '@tanstack/react-query';
import { clientProfileService } from '@/lib/services/services';
import {
  Factory,
  Globe,
  MapPinned,
  CalendarRange,
  Building2,
  Users,
} from 'lucide-react';
import TourGuide from '@/components/tour/tour-guide';

interface JobOverviewTabProps {
  job: IClientJobPosting;
}

// Helper function to format enum values
const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function JobOverviewTab({ job }: JobOverviewTabProps) {
  // Fetch company profile using clientId from job
  const {
    data: company,
    isLoading: companyLoading,
    error: companyError,
  } = useQuery({
    queryKey: ['client-profile', job.clientId],
    queryFn: () => clientProfileService.getProfileById(job.clientId),
    enabled: !!job.clientId,
  });

  return (
    <>
      <JobAnalyticsTab job={job} />

      <div className="bg-card dark:bg-primary/10 mt-4 space-y-6 rounded-lg p-6">
        {/* Key Information Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#FFEFDF] dark:bg-blue-900">
                <BreifCaseIcon />
              </div>
              <div className="flex min-h-[40px] flex-1 items-center">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Type & Commitment
                  </Label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatEnumValue(job.jobType)}
                    <span className="ml-4">
                      • {formatEnumValue(job.jobCommitment)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100 dark:bg-green-900">
                <Clock className="h-5 w-5 text-black dark:text-green-400" />
              </div>
              <div className="flex min-h-[40px] flex-1 items-center">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experience Required
                  </Label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {job.totalExperience} years
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900">
                <DollarIcon />
              </div>
              <div className="flex min-h-[40px] flex-1 items-center">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Salary Range
                  </Label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {job.minSalary?.toLocaleString()} -{' '}
                    {job.maxSalary?.toLocaleString()} {job.salaryCurrency}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#DBFFE5] dark:bg-orange-900">
                <UserItemCardIcons />
              </div>
              <div className="flex min-h-[40px] flex-1 items-center">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Openings Available
                  </Label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {job.numberOfOpenings}{' '}
                    {job.numberOfOpenings === 1 ? 'position' : 'positions'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#E5E5FF] dark:bg-indigo-900">
                <LocationIcon />
              </div>
              <div className="flex min-h-[40px] flex-1 items-center">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Work Location
                  </Label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {job.preferredLocations.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {job.department && (
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#FFE5E5] dark:bg-teal-900">
                  <CompanyCardIcon />
                </div>
                <div className="flex min-h-[40px] flex-1 items-center">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {job.department}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Job Description */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Label className="text-base font-semibold text-gray-900 dark:text-white">
              Job Description
            </Label>
          </div>
          <div className="rounded-lg">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {job.description}
            </p>
          </div>
        </div>

        <Separator />
        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                Key Responsibilities
              </Label>
            </div>
            <div className="rounded-lg">
              <ul className="space-y-3">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CorrectTickIcon />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {responsibility}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Separator />

        {/* Required Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                Required Skills
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-500 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Preferred Skills */}
        {job.preferredSkills && job.preferredSkills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                Preferred Skills
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.preferredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-500 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                Benefits & Perks
              </Label>
            </div>
            <div className="rounded-lg">
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CorrectTickIcon />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* About Company Section */}
        <Separator />
        <div className="mt-4 bg-white p-2 dark:bg-gray-800">
          <h3 className="mb-1 text-lg font-semibold">About Company</h3>
          {companyLoading ? (
            <div className="text-gray-500 dark:text-gray-400">
              Loading company info...
            </div>
          ) : companyError ? (
            <div className="text-red-500">Failed to load company info.</div>
          ) : company ? (
            <>
              <div className="mb-4 flex flex-col items-center md:flex-row md:items-center md:gap-6">
                {company.basic.logoUrl && (
                  <img
                    src={company.basic.logoUrl}
                    alt={company.basic.name}
                    className="mb-3 h-16 w-16 rounded-lg border border-gray-200 bg-white object-contain md:mb-0 dark:border-gray-700 dark:bg-gray-900"
                  />
                )}
                <div className="text-center md:text-left">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {company.basic.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {company.basic.description ||
                      'No company description provided.'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                {company.basic.industry && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <Factory className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500">Industry</p>
                      <p className="text-sm">
                        {formatEnumValue(company.basic.industry)}
                      </p>
                    </div>
                  </div>
                )}
                {company.basic.companyType && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500">Company Type</p>
                      <p className="text-sm">
                        {formatEnumValue(company.basic.companyType)}
                      </p>
                    </div>
                  </div>
                )}
                {company.basic.size && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500">Company Size</p>
                      <p className="text-sm">
                        {formatEnumValue(company.basic.size)}
                      </p>
                    </div>
                  </div>
                )}
                {company.basic.foundedYear && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <CalendarRange className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500">Founded</p>
                      <p className="text-sm">{company.basic.foundedYear}</p>
                    </div>
                  </div>
                )}
                {company.basic.website && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/20">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500">Website</p>
                      <a
                        href={company.basic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        {company.basic.website}
                      </a>
                    </div>
                  </div>
                )}
                {(company.address?.address ||
                  company.address?.city ||
                  company.address?.state ||
                  company.address?.country) && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                      <MapPinned className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500">Location</p>
                      <p className="text-sm">
                        {[
                          company.address.address,
                          company.address.city,
                          company.address.state,
                          company.address.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
      <TourGuide
        tourKey="client_job_details_page_tour"
        autoStart={true}
        showProgress={false}
        showStepProgress={false}
      />
    </>
  );
}
