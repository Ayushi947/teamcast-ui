import {
  ICandidateProfile,
  UserRoleEnum,
  CandidateStatusEnum,
  CandidateAssessmentStageEnum,
  ResumeAssessmentStatusEnum,
  OnboardingAssessmentStatusEnum,
  JobSearchStatusEnum,
  UserStatusEnum,
} from '@/lib/shared';

export class CandidateProfileService {
  private mockCandidates = {
    items: [
      {
        id: '1',
        candidateId: '1',
        name: 'Sarah Johnson',
        jobTitle: 'Senior Frontend Developer',
        email: 'sarah.johnson@example.com',
        phone: '+1 (650) 695-9495',
        location: 'San Francisco, CA',
        role: UserRoleEnum.INDIVIDUAL,
        candidateStatus: CandidateStatusEnum.NEW,
        assessmentStage: CandidateAssessmentStageEnum.ONBOARDING_ASSESSMENT,
        matchScore: 95,
        status: UserStatusEnum.ACTIVE,
        appliedDate: '2024-03-20',
        summary:
          'Results-driven Senior Frontend Developer with 5+ years of experience crafting exceptional web experiences.',
        resumeAssessmentStatus: ResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED,
        onboardingAssessmentStatus:
          OnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED,
        isPublished: true,
        completionPercentage: 85,
        jobSearchStatus: JobSearchStatusEnum.OPEN_TO_OPPORTUNITIES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workExperience: [
          {
            company: 'Tech Innovators Inc.',
            position: 'Senior Frontend Developer',
            duration: '2021 - Present',
            location: 'San Francisco, CA',
            achievements: [
              'Led the frontend development of a high-traffic e-commerce platform serving 1M+ monthly users',
              'Improved application performance by 40% through code optimization and lazy loading',
              'Mentored junior developers and established frontend best practices',
            ],
          },
        ],
        education: [
          {
            institution: 'Stanford University',
            degree: 'BS Computer Science',
            duration: '2014 - 2018',
            achievements: [
              'Graduated with Honors',
              'Senior thesis on Web Accessibility Patterns',
            ],
          },
        ],
        skills: [
          { name: 'React', level: 'Expert' },
          { name: 'TypeScript', level: 'Advanced' },
          { name: 'Next.js', level: 'Expert' },
          { name: 'CSS/SASS', level: 'Advanced' },
          { name: 'Web Accessibility', level: 'Expert' },
        ],
      },
    ],
  };

  async getMockCandidates() {
    return this.mockCandidates;
  }

  async getProfileById(id: string): Promise<ICandidateProfile> {
    const candidate = this.mockCandidates.items.find((c) => c.id === id);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    return candidate as any;
  }
}
