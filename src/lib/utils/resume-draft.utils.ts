import { candidateResumeService } from '@/lib/services/services';
import { logger } from '@/lib/logger';

/**
 * Shared constants for resume parsing
 */
export const POLLING_INTERVAL = 2000; // 2 seconds
export const MAX_POLL_ATTEMPTS = 150; // 5 minutes at 2-second intervals

/**
 * Shared processing messages for resume parsing
 */
export const RESUME_PROCESSING_MESSAGES = [
  'Extracting information from your resume...',
  'Analyzing your work experience...',
  'Identifying your skills and expertise...',
  'Processing your education history...',
  'Mapping your professional journey...',
  'Almost there, just a few more details...',
  'Organizing your achievements...',
  'Fine-tuning the details...',
];

/**
 * Shared utility functions for processing resume drafts
 */

export function mapResumeDraftToApi(draft: any): any {
  const parsedResume = draft.parsedResume || draft;

  let totalExperience = parsedResume.totalExperience;
  if (typeof totalExperience === 'string') {
    totalExperience = parseFloat(totalExperience);
  }
  if (
    typeof totalExperience === 'number' &&
    !Number.isInteger(totalExperience)
  ) {
    totalExperience = Math.floor(totalExperience);
  }
  if (typeof totalExperience !== 'number' || isNaN(totalExperience)) {
    totalExperience = 0;
  }

  let currentSalaryCurrency = parsedResume.currentSalaryCurrency;
  if (
    !currentSalaryCurrency ||
    typeof currentSalaryCurrency !== 'string' ||
    currentSalaryCurrency.length !== 3
  ) {
    currentSalaryCurrency = 'INR';
  } else {
    currentSalaryCurrency = currentSalaryCurrency.toUpperCase();
  }

  const resumeSkills =
    Array.isArray(parsedResume.resumeSkills) &&
    parsedResume.resumeSkills.length > 0
      ? parsedResume.resumeSkills.filter(
          (skill: string) => skill && skill.trim() !== ''
        )
      : ['Python'];

  const industries =
    Array.isArray(parsedResume.industries) && parsedResume.industries.length > 0
      ? parsedResume.industries.filter(
          (industry: string) => industry && industry.trim() !== ''
        )
      : ['Software Development'];

  const languages =
    Array.isArray(parsedResume.languages) && parsedResume.languages.length > 0
      ? parsedResume.languages.filter(
          (lang: string) => lang && lang.trim() !== ''
        )
      : ['English'];

  return {
    phone: parsedResume.phone || '',
    location: parsedResume.location || '',
    summary: parsedResume.summary || '',
    professionalSummary: parsedResume.summary || '',
    primaryIndustry: parsedResume.primaryIndustry || '',
    highestEducationLevel: parsedResume.highestEducationLevel || 'BACHELORS',
    totalExperience,
    currentJobTitle: parsedResume.currentJobTitle || '',
    currentCompany: parsedResume.currentCompany || '',
    currentIndustry: parsedResume.currentIndustry || '',
    currentWorkLocation: parsedResume.currentWorkLocation || '',
    currentWorkType: parsedResume.currentWorkType || 'EMPLOYEE',
    currentWorkCommitment: parsedResume.currentWorkCommitment || 'FULL_TIME',
    currentWorkSchedule: parsedResume.currentWorkSchedule || 'REGULAR',
    currentSalary: parsedResume.currentSalary || 0,
    currentSalaryCurrency,
    availableFrom: parsedResume.availableFrom,
    noticePeriod: parsedResume.noticePeriod || 'IMMEDIATE',
    resumeSkills,
    industries,
    languages,
    social: parsedResume.social,
    certifications: parsedResume.certifications || [],
    education: parsedResume.education || [],
    experience: parsedResume.experience || [],
  };
}

export function mapExperience(exp: any) {
  return {
    company: exp.company || '',
    position: exp.position || '',
    industry: exp.industry || '',
    startDate: exp.startDate,
    endDate: exp.endDate,
    currentlyWorking: exp.currentlyWorking,
    description: exp.description || '',
    type: exp.type || 'EMPLOYEE',
    commitment: exp.commitment || 'FULL_TIME',
    location: exp.location || '',
    skills: exp.skills || [],
    achievements: exp.achievements || [],
    responsibilities: exp.responsibilities || [],
  };
}

export function normalizeGpa(gpa: any): number | undefined {
  if (gpa === null || gpa === undefined || gpa === '') return undefined;
  const numGpa = typeof gpa === 'string' ? parseFloat(gpa) : gpa;
  return !isNaN(numGpa) && numGpa >= 0 && numGpa <= 10 ? numGpa : undefined;
}

/**
 * Check if there's parsed resume data in localStorage
 */
export function hasParsedResumeData(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const resumeDraft = localStorage.getItem('candidateResumeDraft');
    if (!resumeDraft) return false;

    const parsed = JSON.parse(resumeDraft);
    return !!(parsed && (parsed.parsedResume || parsed.resumeSkills));
  } catch (error) {
    logger.error('Error checking parsed resume data:', error);
    return false;
  }
}

/**
 * Check if there's a pending resume parsing task
 */
export function hasPendingResumeTask(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('pendingResumeParsingTask');
}

/**
 * Get parsed resume data from localStorage
 */
export function getParsedResumeData(): any {
  if (typeof window === 'undefined') return null;

  try {
    const resumeDraft = localStorage.getItem('candidateResumeDraft');
    if (!resumeDraft) return null;

    return JSON.parse(resumeDraft);
  } catch (error) {
    logger.error('Error getting parsed resume data:', error);
    return null;
  }
}

/**
 * Clear all resume-related data from localStorage
 */
export function clearResumeData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('candidateResumeDraft');
  localStorage.removeItem('pendingResumeParsingTask');
}

/**
 * Store parsed resume data in localStorage
 */
export function storeParsedResumeData(data: any): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('candidateResumeDraft', JSON.stringify(data));
  } catch (error) {
    logger.error('Error storing parsed resume data:', error);
  }
}

/**
 * Store pending resume parsing task ID
 */
export function storePendingResumeTask(taskId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('pendingResumeParsingTask', taskId);
  } catch (error) {
    logger.error('Error storing pending resume task:', error);
  }
}

/**
 * Process resume draft and redirect appropriately
 * Returns the redirect path
 */
export async function processResumeDraftAndGetRedirectPath(): Promise<string> {
  const draft = localStorage.getItem('candidateResumeDraft');

  if (!draft) {
    return '/app/candidate/onboard/resume';
  }

  try {
    logger.info('Processing resume draft', {
      context: 'processResumeDraftAndGetRedirectPath',
    });

    const resumeDraft = JSON.parse(draft);

    if (resumeDraft.parsedResume || resumeDraft.resumeSkills) {
      // Use the mapping logic to convert draft to API format
      const resumeData = mapResumeDraftToApi(resumeDraft);
      await candidateResumeService.updateResume(resumeData);

      // Process education data
      if (resumeDraft.education && Array.isArray(resumeDraft.education)) {
        for (const edu of resumeDraft.education) {
          const { id, ...eduData } = edu;
          // Normalize GPA if present
          if (eduData.gpa !== undefined) {
            eduData.gpa = normalizeGpa(eduData.gpa);
          }
          await candidateResumeService.createEducation(eduData);
        }
      }

      // Process certifications
      if (
        resumeDraft.certifications &&
        Array.isArray(resumeDraft.certifications)
      ) {
        for (const cert of resumeDraft.certifications) {
          const { id, ...certData } = cert;
          await candidateResumeService.createCertification(certData);
        }
      }

      // Process experience
      if (resumeDraft.experience && Array.isArray(resumeDraft.experience)) {
        for (const exp of resumeDraft.experience) {
          const { id, ...expData } = exp;
          await candidateResumeService.createExperience(mapExperience(expData));
        }
      }

      logger.info('Resume draft processed successfully', {
        context: 'processResumeDraftAndGetRedirectPath',
      });

      // Clear the draft after successful processing
      localStorage.removeItem('candidateResumeDraft');

      // Redirect to profile onboarding since resume is already processed
      return '/app/candidate/onboard/profile';
    } else {
      // No parsed resume data, redirect to resume onboarding
      return '/app/candidate/onboard/resume';
    }
  } catch (resumeError) {
    logger.error('Failed to process resume draft', {
      error: resumeError,
      context: 'processResumeDraftAndGetRedirectPath',
    });

    // On error, redirect to resume onboarding to start fresh
    return '/app/candidate/onboard/resume';
  }
}
