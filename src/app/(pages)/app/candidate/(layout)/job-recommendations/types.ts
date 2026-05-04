import type { ICandidateJobPosting } from '@/lib/shared';

// Shared type definitions for job recommendations

export interface JobRecommendationItem {
  id: string;
  title: string;
  description: string;
  company?: {
    name: string;
    id: string;
  };
  preferredLocations?: string[];
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  jobType?: string;
  jobCommitment?: string;
  isRemote?: boolean;
  reportingTo?: string;
  matchScore: number;
  matchReason?: string[];
  matchDetails?: {
    semanticScore: number;
    titleScore: number;
    skillsScore: number;
  };
  totalExperience?: number;
}

export interface JobRecommendationResponse {
  items: JobRecommendationItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Maps a candidate job posting (from All Jobs API) to JobRecommendationItem
 * so the same card and apply dialog can be used for both recommended and all jobs.
 */
export function mapJobPostingToRecommendationItem(
  job: ICandidateJobPosting
): JobRecommendationItem {
  return {
    id: job.id,
    title: job.title,
    description: job.description ?? '',
    company: job.company
      ? { name: job.company.name, id: job.company.id }
      : undefined,
    preferredLocations: job.preferredLocations,
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    salaryCurrency: job.salaryCurrency,
    jobType: job.jobType as string,
    jobCommitment: job.jobCommitment as string,
    isRemote: job.isRemote,
    reportingTo: job.reportingTo,
    matchScore: 0,
    matchReason: [],
    totalExperience: job.totalExperience,
  };
}
