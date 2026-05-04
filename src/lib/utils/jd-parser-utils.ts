import {
  IJobParsed,
  WorkTypeEnum,
  WorkCommitmentEnum,
  WorkScheduleEnum,
  CompanyIndustryEnum,
  JobPostingStatusEnum,
  logger,
} from '@/lib/shared';

export interface ParsedJDFormData {
  title?: string;
  description?: string;
  jobType?: WorkTypeEnum;
  jobCommitment?: WorkCommitmentEnum;
  jobSchedule?: WorkScheduleEnum;
  industry?: CompanyIndustryEnum;
  totalExperience?: number;
  department?: string;
  teamSize?: number;
  reportingTo?: string;
  status?: JobPostingStatusEnum;
  numberOfOpenings?: number;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  equity?: boolean;
  responsibilities?: string[];
  benefits?: string[];
  tags?: string[];
  isRemote?: boolean;
  requiredSkills?: string[];
  preferredSkills?: string[];
  preferredUniversities?: string[];
  preferredDegrees?: string[];
  preferredLocations?: string[];
  preferredIndustries?: string[];
}

/**
 * Convert parsed JD data to form values that can be used in the JobForm
 */
export function convertParsedJDToFormData(
  parsedJD: IJobParsed
): ParsedJDFormData {
  const jd = parsedJD.parsedJob;

  const minSalary = jd.minSalary || 0;
  const maxSalary = jd.maxSalary || (minSalary > 0 ? minSalary * 1.5 : 0);

  const mapWorkType = (type?: string): WorkTypeEnum => {
    if (!type) return WorkTypeEnum.EMPLOYEE;
    const lowerType = type.toLowerCase();
    if (lowerType.includes('contract')) return WorkTypeEnum.CONTRACTOR;
    if (lowerType.includes('freelance')) return WorkTypeEnum.FREELANCER;
    if (lowerType.includes('intern')) return WorkTypeEnum.INTERN;
    if (lowerType.includes('volunteer')) return WorkTypeEnum.VOLUNTEER;
    if (lowerType.includes('apprentice')) return WorkTypeEnum.APPRENTICESHIP;
    return WorkTypeEnum.EMPLOYEE;
  };

  const mapWorkCommitment = (commitment?: string): WorkCommitmentEnum => {
    if (!commitment) return WorkCommitmentEnum.FULL_TIME;
    const lowerCommitment = commitment.toLowerCase();
    if (lowerCommitment.includes('part')) return WorkCommitmentEnum.PART_TIME;
    if (lowerCommitment.includes('hourly')) return WorkCommitmentEnum.HOURLY;
    if (lowerCommitment.includes('project'))
      return WorkCommitmentEnum.PROJECT_BASED;
    return WorkCommitmentEnum.FULL_TIME;
  };

  const mapIndustry = (industry?: string): CompanyIndustryEnum => {
    if (!industry) return CompanyIndustryEnum.TECHNOLOGY;
    const lowerIndustry = industry.toLowerCase();
    if (lowerIndustry.includes('finance') || lowerIndustry.includes('bank'))
      return CompanyIndustryEnum.FINANCE;
    if (lowerIndustry.includes('health') || lowerIndustry.includes('medical'))
      return CompanyIndustryEnum.HEALTHCARE;
    if (lowerIndustry.includes('education'))
      return CompanyIndustryEnum.EDUCATION;
    if (lowerIndustry.includes('retail') || lowerIndustry.includes('ecommerce'))
      return CompanyIndustryEnum.RETAIL;
    return CompanyIndustryEnum.TECHNOLOGY;
  };

  return {
    title: jd.title || '',
    description: jd.description || '',
    jobType: jd.jobType
      ? mapWorkType(jd.jobType.toString())
      : WorkTypeEnum.EMPLOYEE,
    jobCommitment: jd.jobCommitment
      ? mapWorkCommitment(jd.jobCommitment.toString())
      : WorkCommitmentEnum.FULL_TIME,
    jobSchedule: jd.jobSchedule || WorkScheduleEnum.REGULAR,
    industry: jd.industry
      ? mapIndustry(jd.industry.toString())
      : CompanyIndustryEnum.TECHNOLOGY,
    totalExperience: jd.totalExperience || 0,
    department: jd.department || '',
    teamSize: jd.teamSize,
    reportingTo: jd.reportingTo || '',
    status: JobPostingStatusEnum.DRAFT, // Always start as draft
    numberOfOpenings: jd.numberOfOpenings || 1,
    minSalary,
    maxSalary,
    salaryCurrency: jd.salaryCurrency || 'USD',
    equity: jd.equity || false,
    responsibilities: jd.responsibilities?.length ? jd.responsibilities : [''],
    benefits: jd.benefits?.length ? jd.benefits : [''],
    tags: jd.tags?.length ? jd.tags : [],
    isRemote: jd.isRemote || false,
    requiredSkills: jd.requiredSkills?.length ? jd.requiredSkills : [''],
    preferredSkills: jd.preferredSkills || [],
    preferredUniversities: jd.preferredUniversities || [],
    preferredDegrees: jd.preferredDegrees || [],
    preferredLocations: jd.preferredLocations || [],
    preferredIndustries: jd.preferredIndustries || [],
  };
}

/**
 * Store parsed JD data in localStorage for later use
 */
export function storeParsedJDData(parsedJD: IJobParsed): void {
  localStorage.setItem('pendingJDData', JSON.stringify(parsedJD));
}

/**
 * Load parsed JD data from localStorage
 */
export function loadParsedJDData(): IJobParsed | null {
  try {
    const storedData = localStorage.getItem('pendingJDData');
    if (!storedData) return null;

    const data = JSON.parse(storedData) as IJobParsed;
    return data;
  } catch (error) {
    logger.error('Error loading parsed JD data:', error);
    return null;
  }
}

/**
 * Clear parsed JD data from localStorage
 */
export function clearParsedJDData(): void {
  localStorage.removeItem('pendingJDData');
}

/**
 * Check if there is parsed JD data in localStorage
 */
export function hasParsedJDData(): boolean {
  try {
    const storedData = localStorage.getItem('pendingJDData');
    if (!storedData) return false;

    const data = JSON.parse(storedData) as IJobParsed;
    return data && data.parsedJob ? true : false;
  } catch (error) {
    logger.error('Error checking parsed JD data:', error);
    return false;
  }
}

/**
 * Load and convert parsed JD data to form values
 */
export function loadParsedJDFormData(): ParsedJDFormData | null {
  const parsedJD = loadParsedJDData();
  if (!parsedJD) return null;

  return convertParsedJDToFormData(parsedJD);
}
