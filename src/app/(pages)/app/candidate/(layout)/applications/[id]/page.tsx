'use client';

import { candidateJobPostingService } from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Factory,
  Users,
  Globe,
  CalendarRange,
  MapPinned,
  Clock,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import {
  BreifCaseIcon,
  CompanyCardIcon,
  CorrectTickIcon,
  DollarIcon,
  LocationIcon,
  UserItemCardIcons,
} from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { ICandidateJobPosting } from '@/lib/shared';
import { logger } from '@/lib/logger';
import { formatEnumValue } from '@/lib/utils';

function ApplicationDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  // Ensure id is a string
  const jobPostingId = Array.isArray(id) ? id[0] : id;

  const { data: jobPosting } = useQuery<ICandidateJobPosting>({
    queryKey: ['jobPosting', jobPostingId],
    queryFn: async () => {
      try {
        const result = await candidateJobPostingService.getJobPosting(
          jobPostingId!
        );
        return result;
      } catch (apiError) {
        logger.error('API call failed:', {
          error: apiError,
        });
        throw apiError;
      }
    },
    enabled: !!jobPostingId,
  });

  if (!jobPosting) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="space-y-2 text-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-2">
        <div className="mb-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
              Job Details
            </h1>
            <p className="text-md text-gray-600 dark:text-gray-400">
              Details for the job posting
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card dark:bg-primary/10 mt-4 ml-3 space-y-6 rounded-lg p-6 px-4">
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
                    {formatEnumValue(jobPosting.jobType)}
                    <span className="ml-4">
                      • {formatEnumValue(jobPosting.jobCommitment)}
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
                    {jobPosting.totalExperience} years
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
                    {jobPosting.minSalary?.toLocaleString()} -
                    {jobPosting.maxSalary?.toLocaleString()}{' '}
                    {jobPosting.salaryCurrency}
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
                    {jobPosting.numberOfOpenings}{' '}
                    {jobPosting.numberOfOpenings === 1
                      ? 'position'
                      : 'positions'}
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
                    {jobPosting.preferredLocations.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {jobPosting.department && (
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
                      {jobPosting.department}
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
              {jobPosting.description}
            </p>
          </div>
        </div>

        <Separator />
        {/* Responsibilities */}
        {jobPosting.responsibilities &&
          jobPosting.responsibilities.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                  Key Responsibilities
                </Label>
              </div>
              <div className="rounded-lg">
                <ul className="space-y-3">
                  {jobPosting.responsibilities.map((responsibility, index) => (
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
        {jobPosting.requiredSkills && jobPosting.requiredSkills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                Required Skills
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {jobPosting.requiredSkills.map((skill, index) => (
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
        {jobPosting.preferredSkills &&
          jobPosting.preferredSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                  Preferred Skills
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobPosting.preferredSkills.map((skill, index) => (
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
        {jobPosting.benefits && jobPosting.benefits.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                Benefits & Perks
              </Label>
            </div>
            <div className="rounded-lg">
              <ul className="space-y-2">
                {jobPosting.benefits.map((benefit, index) => (
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

        <Separator />

        <div className="rounded-lg border bg-white p-6 dark:bg-gray-800">
          <h3 className="mb-1 text-lg font-semibold">
            About{' '}
            <span className="text-primary dark:text-muted-foreground">
              {jobPosting.company.name}
            </span>
          </h3>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              {jobPosting.company.description}
            </p>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Factory className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500">Industry</p>
                  <p className="text-base">
                    {formatEnumValue(jobPosting.company.industry)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Building2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500">Company Type</p>
                  <p className="text-base">
                    {formatEnumValue(jobPosting.company.companyType)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Users className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500">Company Size</p>
                  <p className="text-base">
                    {formatEnumValue(jobPosting.company.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <CalendarRange className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500">Founded</p>
                  <p className="text-base">{jobPosting.company.foundedYear}</p>
                </div>
              </div>

              {jobPosting.company.website && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                    <Globe className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-500">Website</p>
                    <a
                      href={jobPosting.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-base"
                    >
                      {jobPosting.company.website}
                    </a>
                  </div>
                </div>
              )}
              {jobPosting.company.location && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                    <MapPinned className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-500">Location</p>
                    <p className="text-base">{jobPosting.company.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicationDetailsPage;
