import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface ShortlistCandidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  shortlistedAt: string;
  metadata?: {
    currentJobTitle?: string;
    company?: string;
    location?: string;
    experience?: number;
    matchScore?: number;
    salary?: number;
    phone?: string;
    linkedin?: string;
    github?: string;
    summary?: string;
    skills?: string[];
    education?: Array<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      level: string;
      duration: string;
      gpa: number;
      achievements: string[];
    }>;
    certifications?: string[];
    workExperience?: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
      technologies: string[];
      link?: string;
    }>;
    languages?: Array<{
      name: string;
      level: string;
    }>;
  };
}

export interface ShortlistOptions {
  showToast?: boolean;
  logActivity?: boolean;
}

// TEMPORARY: Local storage service until backend shortlist API is implemented
// TODO: Replace with backend API calls when shortlist service is available
class LocalShortlistService {
  private readonly STORAGE_KEY = 'teamcast_shortlisted_candidates';

  /**
   * Get all shortlisted candidates from localStorage
   */
  getShortlistedCandidates(): ShortlistCandidate[] {
    try {
      if (typeof window === 'undefined') return [];

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        // Initialize with sample data for testing
        const sampleData = this.getSampleData();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleData));
        return sampleData;
      }

      const candidates = JSON.parse(stored);
      return Array.isArray(candidates) ? candidates : [];
    } catch (error) {
      logger.error('Error loading shortlisted candidates:', error);
      return [];
    }
  }

  /**
   * Get sample data for testing (remove when backend is implemented)
   */
  private getSampleData(): ShortlistCandidate[] {
    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        jobId: 'job-1',
        jobTitle: 'Senior Frontend Developer',
        clientId: 'client-1',
        shortlistedAt: '2024-01-15T10:30:00Z',
        metadata: {
          currentJobTitle: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          experience: 5,
          matchScore: 0.95,
          salary: 120000,
          phone: '+1 (555) 123-4567',
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          github: 'https://github.com/sarahjohnson',
          summary:
            'Experienced frontend developer with a passion for creating intuitive user experiences.',
          skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
          education: [
            {
              institution: 'Stanford University',
              degree: 'Bachelor of Science',
              fieldOfStudy: 'Computer Science',
              level: 'Bachelor',
              duration: '2015-2019',
              gpa: 3.8,
              achievements: ['Magna Cum Laude', "Dean's List"],
            },
          ],
          certifications: ['AWS Certified Developer', 'React Certification'],
          workExperience: [
            {
              title: 'Senior Frontend Developer',
              company: 'TechCorp Inc.',
              duration: '2021-Present',
              description:
                'Led frontend development for multiple high-traffic applications.',
            },
          ],
          projects: [
            {
              name: 'E-commerce Platform',
              description:
                'Built a scalable e-commerce platform using React and Node.js',
              technologies: ['React', 'Node.js', 'MongoDB'],
              link: 'https://github.com/sarahjohnson/ecommerce',
            },
          ],
          languages: [
            { name: 'English', level: 'Native' },
            { name: 'Spanish', level: 'Conversational' },
          ],
        },
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        jobId: 'job-2',
        jobTitle: 'Full Stack Developer',
        clientId: 'client-1',
        shortlistedAt: '2024-01-14T14:20:00Z',
        metadata: {
          currentJobTitle: 'Full Stack Developer',
          company: 'StartupXYZ',
          location: 'New York, NY',
          experience: 3,
          matchScore: 0.88,
          salary: 95000,
          phone: '+1 (555) 987-6543',
          linkedin: 'https://linkedin.com/in/michaelchen',
          summary:
            'Full stack developer with experience in both frontend and backend technologies.',
          skills: ['JavaScript', 'Python', 'React', 'Django', 'PostgreSQL'],
          education: [
            {
              institution: 'MIT',
              degree: 'Master of Science',
              fieldOfStudy: 'Computer Science',
              level: 'Master',
              duration: '2019-2021',
              gpa: 3.9,
              achievements: ['Graduate Research Assistant'],
            },
          ],
          certifications: ['Google Cloud Certified'],
          workExperience: [
            {
              title: 'Full Stack Developer',
              company: 'StartupXYZ',
              duration: '2021-Present',
              description:
                'Developed and maintained web applications using modern technologies.',
            },
          ],
          projects: [
            {
              name: 'Task Management App',
              description: 'Built a collaborative task management application',
              technologies: ['React', 'Django', 'PostgreSQL'],
            },
          ],
          languages: [
            { name: 'English', level: 'Fluent' },
            { name: 'Mandarin', level: 'Native' },
          ],
        },
      },
    ];
  }

  /**
   * Get shortlisted candidate IDs only
   */
  getShortlistedCandidateIds(): string[] {
    return this.getShortlistedCandidates().map((c) => c.id);
  }

  /**
   * Check if a candidate is shortlisted
   */
  isShortlisted(candidateId: string): boolean {
    return this.getShortlistedCandidateIds().includes(candidateId);
  }

  /**
   * Get shortlisted candidates for a specific job
   */
  getShortlistedCandidatesForJob(jobId: string): ShortlistCandidate[] {
    return this.getShortlistedCandidates().filter((c) => c.jobId === jobId);
  }

  /**
   * Add a candidate to shortlist
   */
  async addToShortlist(
    candidate: ShortlistCandidate,
    options: ShortlistOptions = { showToast: true, logActivity: true }
  ): Promise<boolean> {
    try {
      const shortlistedCandidates = this.getShortlistedCandidates();

      // Check if already shortlisted
      if (shortlistedCandidates.some((c) => c.id === candidate.id)) {
        if (options.showToast) {
          toast.info(`${candidate.name} is already shortlisted`);
        }
        return false;
      }

      // Add to shortlist
      const updatedCandidates = [
        ...shortlistedCandidates,
        {
          ...candidate,
          shortlistedAt: new Date().toISOString(),
        },
      ];

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedCandidates));

      if (options.showToast) {
        toast.success(`${candidate.name} added to shortlist!`);
      }

      return true;
    } catch (error) {
      logger.error('Error adding candidate to shortlist:', error);
      if (options.showToast) {
        toast.error('Failed to add candidate to shortlist');
      }
      return false;
    }
  }

  /**
   * Remove a candidate from shortlist
   */
  async removeFromShortlist(
    candidateId: string,
    options: ShortlistOptions = { showToast: true, logActivity: true }
  ): Promise<boolean> {
    try {
      const shortlistedCandidates = this.getShortlistedCandidates();
      const candidate = shortlistedCandidates.find((c) => c.id === candidateId);

      if (!candidate) {
        if (options.showToast) {
          toast.info('Candidate is not in shortlist');
        }
        return false;
      }

      // Remove from shortlist
      const updatedCandidates = shortlistedCandidates.filter(
        (c) => c.id !== candidateId
      );

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedCandidates));

      if (options.showToast) {
        toast.success(`${candidate.name} removed from shortlist`);
      }

      return true;
    } catch (error) {
      logger.error('Error removing candidate from shortlist:', error);
      if (options.showToast) {
        toast.error('Failed to remove candidate from shortlist');
      }
      return false;
    }
  }

  /**
   * Toggle shortlist status for a candidate
   */
  async toggleShortlist(
    candidate: ShortlistCandidate,
    options: ShortlistOptions = { showToast: true, logActivity: true }
  ): Promise<boolean> {
    const isCurrentlyShortlisted = this.isShortlisted(candidate.id);

    if (isCurrentlyShortlisted) {
      return await this.removeFromShortlist(candidate.id, options);
    } else {
      return await this.addToShortlist(candidate, options);
    }
  }

  /**
   * Remove multiple candidates from shortlist
   */
  async removeMultipleFromShortlist(
    candidateIds: string[],
    options: ShortlistOptions = { showToast: true, logActivity: true }
  ): Promise<number> {
    let removedCount = 0;

    for (const candidateId of candidateIds) {
      const success = await this.removeFromShortlist(candidateId, {
        showToast: false,
        logActivity: options.logActivity,
      });
      if (success) removedCount++;
    }

    if (options.showToast && removedCount > 0) {
      toast.success(
        `${removedCount} candidate${removedCount > 1 ? 's' : ''} removed from shortlist`
      );
    }

    return removedCount;
  }

  /**
   * Clear all shortlisted candidates
   */
  async clearShortlist(
    options: ShortlistOptions = { showToast: true, logActivity: false }
  ): Promise<void> {
    try {
      const count = this.getShortlistedCandidates().length;
      localStorage.removeItem(this.STORAGE_KEY);

      if (options.showToast && count > 0) {
        toast.success(
          `Cleared ${count} candidate${count > 1 ? 's' : ''} from shortlist`
        );
      }
    } catch (error) {
      logger.error('Error clearing shortlist:', error);
      if (options.showToast) {
        toast.error('Failed to clear shortlist');
      }
    }
  }

  /**
   * Get shortlist statistics
   */
  getShortlistStats(): {
    total: number;
    byJob: Record<string, number>;
    recentlyAdded: number; // Last 24 hours
  } {
    const candidates = this.getShortlistedCandidates();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const byJob: Record<string, number> = {};
    let recentlyAdded = 0;

    candidates.forEach((candidate) => {
      // Count by job
      if (candidate.jobId) {
        byJob[candidate.jobId] = (byJob[candidate.jobId] || 0) + 1;
      }

      // Count recently added
      if (new Date(candidate.shortlistedAt) > yesterday) {
        recentlyAdded++;
      }
    });

    return {
      total: candidates.length,
      byJob,
      recentlyAdded,
    };
  }

  /**
   * Export shortlisted candidates to CSV
   */
  exportToCSV(): void {
    const candidates = this.getShortlistedCandidates();

    if (candidates.length === 0) {
      toast.info('No shortlisted candidates to export');
      return;
    }

    const csvContent = [
      [
        'Name',
        'Email',
        'Job Title',
        'Company',
        'Location',
        'Experience',
        'Salary',
        'Shortlisted Date',
      ].join(','),
      ...candidates.map((candidate) =>
        [
          candidate.name,
          candidate.email,
          candidate.jobTitle,
          candidate.metadata?.company || '',
          candidate.metadata?.location || '',
          candidate.metadata?.experience
            ? `${candidate.metadata.experience} years`
            : '',
          candidate.metadata?.salary
            ? `$${candidate.metadata.salary.toLocaleString()}`
            : '',
          new Date(candidate.shortlistedAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortlisted-candidates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Shortlist exported successfully');
  }
}

// Export the service instance
export const shortlistService = new LocalShortlistService();
