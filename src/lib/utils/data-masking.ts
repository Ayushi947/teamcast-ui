import { ICandidateProfile, IResume } from '@/lib/shared';

/**
 * Masks sensitive personal information for public profiles
 */
export const maskPersonalData = {
  /**
   * Masks email address - shows first character and domain
   * e.g., "john.doe@example.com" -> "j***@example.com"
   */
  email: (email: string): string => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    return `${username.charAt(0)}***@${domain}`;
  },

  /**
   * Masks phone number - shows last 4 digits only
   * e.g., "+1234567890" -> "***-***-7890"
   */
  phone: (phone: string): string => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***';
    const lastFour = digits.slice(-4);
    return `***-***-${lastFour}`;
  },

  /**
   * Masks exact location - shows city/state only, removes specific addresses
   * e.g., "123 Main St, San Francisco, CA 94102" -> "San Francisco, CA"
   */
  location: (location: string): string => {
    if (!location) return '';
    // Remove specific address details, keep general location
    const parts = location.split(',').map((part) => part.trim());
    if (parts.length >= 2) {
      // Return last two parts (city, state) or similar
      return parts.slice(-2).join(', ');
    }
    return location;
  },

  /**
   * Masks full name - shows first name and last initial
   * e.g., "John Doe Smith" -> "John S."
   */
  name: (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0);
    return `${firstName} ${lastInitial}.`;
  },

  /**
   * Masks birth date - shows only year
   * e.g., "1990-05-15" -> "Born in 1990"
   */
  birthDate: (birthDate: Date | string): string => {
    if (!birthDate) return '';
    const date = new Date(birthDate);
    return `Born in ${date.getFullYear()}`;
  },

  /**
   * Masks salary information - shows range instead of exact amount
   */
  salary: (salary: number, currency: string = 'USD'): string => {
    if (!salary) return '';
    // Create salary ranges
    const ranges = [
      { min: 0, max: 50000, label: '$0 - $50k' },
      { min: 50000, max: 75000, label: '$50k - $75k' },
      { min: 75000, max: 100000, label: '$75k - $100k' },
      { min: 100000, max: 150000, label: '$100k - $150k' },
      { min: 150000, max: 200000, label: '$150k - $200k' },
      { min: 200000, max: Infinity, label: '$200k+' },
    ];

    const range = ranges.find((r) => salary >= r.min && salary < r.max);
    return range?.label || `${currency} ${Math.floor(salary / 10000) * 10}k+`;
  },
};

/**
 * Creates a public-safe version of candidate profile data
 */
export const createPublicProfile = (
  profile: ICandidateProfile,
  resume?: IResume,
  options: {
    showEmail?: boolean;
    showPhone?: boolean;
    showExactLocation?: boolean;
    showFullName?: boolean;
    showSalary?: boolean;
    showPersonalDetails?: boolean;
  } = {}
): { profile: Partial<ICandidateProfile>; resume?: Partial<IResume> } => {
  const {
    showEmail = false,
    showPhone = false,
    showExactLocation = false,
    showFullName = false,
    showSalary = false,
    showPersonalDetails = false,
  } = options;

  // Create masked profile
  const maskedProfile: Partial<ICandidateProfile> = {
    candidateId: profile.candidateId,
    name: showFullName ? profile.name : maskPersonalData.name(profile.name),
    email: showEmail ? profile.email : maskPersonalData.email(profile.email),
    jobTitle: profile.jobTitle,
    image: profile.image,
    completionPercentage: profile.completionPercentage,
    isPublished: profile.isPublished,
    jobSearchStatus: profile.jobSearchStatus,
    // Remove sensitive personal details unless explicitly allowed
    ...(showPersonalDetails && {
      sex: profile.sex,
      maritalStatus: profile.maritalStatus,
      birthDate: profile.birthDate,
    }),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  // Create masked resume if available
  let maskedResume: Partial<IResume> | undefined;
  if (resume) {
    maskedResume = {
      id: resume.id,
      candidateId: resume.candidateId,
      name: showFullName ? resume.name : maskPersonalData.name(resume.name),
      email: showEmail ? resume.email : maskPersonalData.email(resume.email),
      jobTitle: resume.jobTitle,
      image: resume.image,
      phone: showPhone
        ? resume.phone
        : resume.phone
          ? maskPersonalData.phone(resume.phone)
          : undefined,
      location: showExactLocation
        ? resume.location
        : resume.location
          ? maskPersonalData.location(resume.location)
          : undefined,
      summary: resume.summary,
      primaryIndustry: resume.primaryIndustry,
      totalExperience: resume.totalExperience,
      currentJobTitle: resume.currentJobTitle,
      currentCompany: resume.currentCompany,
      currentIndustry: resume.currentIndustry,
      currentWorkLocation: showExactLocation
        ? resume.currentWorkLocation
        : resume.currentWorkLocation
          ? maskPersonalData.location(resume.currentWorkLocation)
          : undefined,
      currentWorkType: resume.currentWorkType,
      currentWorkCommitment: resume.currentWorkCommitment,
      currentWorkSchedule: resume.currentWorkSchedule,
      // Mask salary unless specifically allowed
      ...(showSalary && {
        currentSalary: resume.currentSalary,
        currentSalaryCurrency: resume.currentSalaryCurrency,
      }),
      ...(!showSalary &&
        resume.currentSalary && {
          currentSalary: undefined,
          currentSalaryCurrency: undefined,
          // Add salary range instead
          salaryRange: maskPersonalData.salary(
            resume.currentSalary,
            resume.currentSalaryCurrency
          ),
        }),
      highestEducationLevel: resume.highestEducationLevel,
      resumeSkills: resume.resumeSkills,
      industries: resume.industries,
      languages: resume.languages,
      social: resume.social,
      // Public-safe education (remove specific details if needed)
      education: resume.education?.map((edu) => ({
        id: edu.id,
        institution: edu.institution,
        level: edu.level,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        currentlyPursuing: edu.currentlyPursuing,
        // Remove GPA and other sensitive academic details
        gpa: undefined,
        achievements: edu.achievements,
      })),
      // Public-safe experience (remove salary details)
      experience: resume.experience?.map((exp) => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        industry: exp.industry,
        startDate: exp.startDate,
        endDate: exp.endDate,
        currentlyWorking: exp.currentlyWorking,
        description: exp.description,
        type: exp.type,
        commitment: exp.commitment,
        location: showExactLocation
          ? exp.location
          : exp.location
            ? maskPersonalData.location(exp.location)
            : undefined,
        skills: exp.skills,
        achievements: exp.achievements,
        responsibilities: exp.responsibilities,
        projects: exp.projects?.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          currentlyWorking: project.currentlyWorking,
          role: project.role,
          teamSize: project.teamSize,
          url: project.url,
          githubUrl: project.githubUrl,
          demoUrl: project.demoUrl,
          skills: project.skills,
          responsibilities: project.responsibilities,
          achievements: project.achievements,
          challenges: project.challenges,
          solutions: project.solutions,
          impact: project.impact,
        })),
      })),
      certifications: resume.certifications,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  }

  return { profile: maskedProfile, resume: maskedResume };
};

/**
 * Determines what data should be shown publicly based on user preferences
 */
export const getPublicProfileVisibility = (_profile: ICandidateProfile) => {
  // Default conservative settings - only show professional information
  return {
    showEmail: false,
    showPhone: false,
    showExactLocation: false,
    showFullName: false,
    showSalary: false,
    showPersonalDetails: false,
    // Could be extended to read from profile.settings.publicProfileSettings
  };
};

/**
 * Generates a shareable URL for the public profile
 */
export const generatePublicProfileUrl = (
  candidateId: string,
  baseUrl?: string
): string => {
  const base =
    baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/candidate/profile/${candidateId}`;
};

/**
 * Validates if a profile should be publicly accessible
 */
export const isProfilePubliclyAccessible = (
  profile: ICandidateProfile
): boolean => {
  return profile.isPublished && profile.completionPercentage >= 70; // Minimum 70% completion
};

export function getDateDifferenceInDays(dateString: Date): number {
  const providedDate = new Date(dateString);
  const currentDate = new Date();

  // Set hours to 0 to compare only dates (not time part)
  providedDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  const diffInMs = currentDate.getTime() - providedDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return Math.max(0, Math.floor(diffInDays));
}
