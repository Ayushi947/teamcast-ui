'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  Phone,
  Linkedin,
  Github,
  Send,
  BookmarkPlus,
  Star,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  clientJobPostingService,
  activityLogService,
  clientCandidateShortlistService,
} from '@/lib/services/services';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  IClientJobPosting,
} from '@/lib/shared';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { formatEnumValue } from '@/lib/utils';

interface CandidateProfileModalProps {
  candidate: {
    id: string;
    candidateId?: string;
    name: string;
    email: string;
    image?: string;
    jobTitle?: string;
    currentJobTitle?: string;
    currentCompany?: string;
    location?: string;
    totalExperience?: number;
    resumeSkills?: string[];
    matchScore?: number;
    currentSalary?: number;
    jobSearchStatus?: string;
    phone?: string;
    summary?: string;
    completionPercentage?: number;
    isPublished?: boolean;
    resume?: {
      id: string;
      summary: string;
      currentJobTitle?: string;
      currentCompany?: string;
      currentWorkLocation?: string;
      currentSalary?: number;
      currentSalaryCurrency?: string;
      totalExperience?: number;
      resumeSkills?: string[];
      industries?: string[];
      languages?: string[];
      experience?: Array<{
        id: string;
        company: string;
        position: string;
        industry: string;
        startDate: Date;
        endDate?: Date;
        currentlyWorking?: boolean;
        description: string;
        type: string;
        commitment: string;
        location?: string;
        skills: string[];
        achievements: string[];
        responsibilities: string[];
        projects: Array<{
          id: string;
          name: string;
          description: string;
          startDate?: Date;
          endDate?: Date;
          currentlyWorking?: boolean;
          role: string;
          teamSize?: number;
          url?: string;
          githubUrl?: string;
          demoUrl?: string;
          skills: string[];
          responsibilities: string[];
          achievements: string[];
          challenges: string[];
          solutions: string[];
          impact: string[];
        }>;
      }>;
      education?: Array<{
        id: string;
        institution: string;
        level: string;
        degree: string;
        fieldOfStudy: string;
        startDate: Date;
        endDate?: Date;
        currentlyPursuing?: boolean;
        gpa?: number;
        achievements: string[];
      }>;
      certifications?: Array<{
        id: string;
        name: string;
        issuer: string;
        date: Date;
        level?: string;
        expiryDate?: Date;
        credentialUrl?: string;
      }>;
      social?: {
        id: string;
        linkedin?: string;
        twitter?: string;
        github?: string;
        portfolio?: string;
        leetcode?: string;
      };
    };
  };
  job: IClientJobPosting;
  isOpen: boolean;
  onClose: () => void;
  onShortlist?: () => void;
  onContact?: () => void;
  isInvited?: boolean;
}

// Profile Card Component
const ProfileCard = ({ candidate }: { candidate: any }) => {
  const getJobSearchStatusDisplay = (status: string) => {
    switch (status) {
      case 'OPEN_TO_OPPORTUNITIES':
        return 'Open to Work';
      case 'ACTIVELY_LOOKING':
        return 'Actively Looking';
      case 'NOT_LOOKING':
        return 'Not Looking';
      case 'PASSIVE':
        return 'Passive';
      default:
        return status || 'Unknown';
    }
  };

  // Safely get candidate data with fallbacks
  const candidateName = candidate?.name || 'Unknown Candidate';
  const candidateImage = candidate?.image || '';
  const candidateMatchScore = candidate?.matchScore || 0;
  const candidateJobTitle =
    candidate?.currentJobTitle ||
    candidate?.jobTitle ||
    candidate?.resume?.currentJobTitle ||
    'No title available';
  const candidateLocation =
    candidate?.location ||
    candidate?.resume?.currentWorkLocation ||
    'Location not specified';
  const candidateExperience =
    candidate?.totalExperience || candidate?.resume?.totalExperience || 0;
  const candidateJobStatus =
    candidate?.jobSearchStatus || 'OPEN_TO_OPPORTUNITIES';

  return (
    <Card className="relative flex h-[280px] flex-1 flex-col items-center justify-center bg-white p-4 dark:bg-gray-800">
      <div className="flex flex-col items-center gap-4">
        {/* Profile photo */}
        <div className="relative h-36 w-36">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white p-0.5 dark:border-gray-700">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={candidateImage}
                  alt={candidateName}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-2xl">
                  {candidateName
                    .split(' ')
                    .filter(Boolean)
                    .map((n: string) => n[0]?.toUpperCase())
                    .join('') || ''}
                </AvatarFallback>
              </Avatar>
            </div>
            {candidateMatchScore > 0 && (
              <div className="bg-primary dark:bg-primary-600 absolute -bottom-1 z-20 rounded-full px-4 py-1 text-xs font-semibold text-white shadow">
                {Math.round(candidateMatchScore / 100)}%
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            <p className="text-foreground text-lg font-bold dark:text-white">
              {candidateName}
            </p>
          </div>

          <div className="text-muted-foreground flex flex-col flex-wrap items-center justify-center gap-1.5 text-sm dark:text-gray-400">
            {candidateJobTitle && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{candidateJobTitle}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {candidateExperience > 0 && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {candidateExperience} years of experience
                </div>
              )}

              {candidateLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {candidateLocation}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-3 right-3">
        <div className="border-primary text-primary dark:border-primary-400 dark:text-primary-400 w-auto rounded-full border px-2 py-0.5 text-center text-xs">
          <p className="flex items-center justify-center gap-1">
            <Star className="h-4 w-4" />
            {getJobSearchStatusDisplay(candidateJobStatus)}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Professional Summary Component
const ProfessionalSummary = ({ candidate }: { candidate: any }) => {
  const resume = candidate?.resume;

  // Safely get candidate data with fallbacks
  const candidateSummary = candidate?.summary || resume?.summary || '';
  const candidateJobTitle =
    candidate?.currentJobTitle ||
    candidate?.jobTitle ||
    resume?.currentJobTitle ||
    'professional';
  const candidateExperience =
    candidate?.totalExperience || resume?.totalExperience || 0;
  const candidateSkills = candidate?.resumeSkills || resume?.resumeSkills || [];

  // Generate fallback summary if none exists
  const fallbackSummary = `Experienced ${candidateJobTitle} with ${candidateExperience} years of expertise. Proven track record of delivering results and strong background in ${candidateSkills.slice(0, 3).join(', ')}.`;

  return (
    <Card className="flex h-[280px] flex-1 flex-col bg-white p-4 dark:bg-gray-800">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold dark:text-white">
              Professional Summary
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {candidateSummary || fallbackSummary}
          </p>
        </div>
        <div>
          {candidateSkills && candidateSkills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 font-semibold dark:text-white">Skills</p>
              <div className="flex flex-wrap gap-2">
                {candidateSkills
                  .slice(0, 8)
                  .map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="text-muted-foreground rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300"
                    >
                      {formatEnumValue(skill)}
                    </div>
                  ))}
                {candidateSkills.length > 8 && (
                  <div className="rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300">
                    +{candidateSkills.length - 8} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {resume?.industries && resume.industries.length > 0 && (
              <div>
                <p className="mb-2 font-semibold dark:text-white">Industries</p>
                <div className="flex flex-wrap gap-2">
                  {resume.industries
                    .slice(0, 4)
                    .map((industry: string, index: number) => (
                      <div
                        key={index}
                        className="text-muted-foreground rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300"
                      >
                        {formatEnumValue(industry)}
                      </div>
                    ))}
                  {resume.industries.length > 4 && (
                    <div className="rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300">
                      +{resume.industries.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {resume?.languages && resume.languages.length > 0 && (
              <div>
                <p className="mb-2 font-semibold dark:text-white">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {resume.languages
                    .slice(0, 4)
                    .map((language: string, index: number) => (
                      <div
                        key={index}
                        className="text-muted-foreground rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300"
                      >
                        {formatEnumValue(language)}
                      </div>
                    ))}
                  {resume.languages.length > 4 && (
                    <div className="text-muted-foreground rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300">
                      +{resume.languages.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Professional Details Component
const ProfessionalDetails = ({ candidate }: { candidate: any }) => {
  const [activeTab, setActiveTab] = useState('experience');
  const resume = candidate.resume;

  const tabs = [
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'contact', label: 'Contact' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'experience':
        return (
          <Card className="border-border shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-base font-bold">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <Briefcase className="text-primary-foreground h-4 w-4" />
                </div>
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(resume?.experience || []).length > 0 ? (
                (resume.experience || []).map((exp: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
                      <Briefcase className="text-primary-foreground h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-foreground text-base font-bold">
                          {exp.position}
                        </h3>
                        <p className="text-primary font-semibold">
                          {exp.company}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4" />
                          {exp.startDate && (
                            <>
                              {new Date(exp.startDate).getFullYear()} -
                              {exp.currentlyWorking
                                ? 'Present'
                                : exp.endDate
                                  ? new Date(exp.endDate).getFullYear()
                                  : 'Present'}
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Briefcase className="text-muted-foreground h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground text-base font-medium">
                    No work experience data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'education':
        return (
          <Card className="border-border shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-base font-bold">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <GraduationCap className="text-primary-foreground h-4 w-4" />
                </div>
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(resume?.education || []).length > 0 ? (
                (resume.education || []).map((edu: any, index: number) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-4">
                    <h4 className="text-foreground font-bold">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h4>
                    <p className="text-primary font-semibold">
                      {edu.institution}
                    </p>
                    <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {edu.startDate && (
                          <>
                            {new Date(edu.startDate).getFullYear()} -
                            {edu.currentlyPursuing
                              ? 'Present'
                              : edu.endDate
                                ? new Date(edu.endDate).getFullYear()
                                : 'Present'}
                          </>
                        )}
                      </div>
                      {edu.gpa && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          GPA: {edu.gpa}
                        </div>
                      )}
                    </div>
                    {edu.achievements && edu.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-foreground mb-2 text-sm font-semibold">
                          Achievements:
                        </p>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          {edu.achievements.map(
                            (achievement: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ChevronRight className="text-primary mt-0.5 h-3 w-3" />
                                {achievement}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <GraduationCap className="text-muted-foreground h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground text-base font-medium">
                    No education data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'certifications':
        return (
          <Card className="border-border shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-base font-bold">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <Award className="text-primary-foreground h-4 w-4" />
                </div>
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resume?.certifications && resume.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resume.certifications.map((cert: any, index: number) => (
                    <Badge
                      key={index}
                      className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium"
                    >
                      {cert.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Award className="text-muted-foreground h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground text-base font-medium">
                    No certifications available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'contact':
        return (
          <Card className="border-border shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-base font-bold">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <MessageSquare className="text-primary-foreground h-4 w-4" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <a
                  href={`mailto:${candidate.email}`}
                  className="text-foreground hover:bg-muted/50 flex items-center gap-3 rounded-md p-3 transition-colors"
                >
                  <Mail className="text-primary h-5 w-5" />
                  <span>{candidate.email}</span>
                </a>
                {candidate.phone && (
                  <a
                    href={`tel:${candidate.phone}`}
                    className="text-foreground hover:bg-muted/50 flex items-center gap-3 rounded-md p-3 transition-colors"
                  >
                    <Phone className="text-primary h-5 w-5" />
                    <span>{candidate.phone}</span>
                  </a>
                )}
                {resume?.social?.linkedin && (
                  <a
                    href={resume.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:bg-muted/50 flex items-center gap-3 rounded-md p-3 transition-colors"
                  >
                    <Linkedin className="text-primary h-5 w-5" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {resume?.social?.github && (
                  <a
                    href={resume.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:bg-muted/50 flex items-center gap-3 rounded-md p-3 transition-colors"
                  >
                    <Github className="text-primary h-5 w-5" />
                    <span>GitHub Profile</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-xl font-bold dark:text-white">
        Professional Details
      </h2>
      <p className="text-muted-foreground mb-4 text-sm dark:text-gray-400">
        Detailed information about the candidate&apos;s professional background.
      </p>

      {/* Custom Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'border-b-2 px-1 py-2 text-sm font-medium',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
};

export function CandidateProfileModal({
  candidate,
  job,
  isOpen,
  onClose,
  onShortlist,
  onContact,
  isInvited,
}: CandidateProfileModalProps) {
  const [isInviting, setIsInviting] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const queryClient = useQueryClient();

  // Early return if no candidate data
  if (!candidate) {
    return null;
  }

  // Log candidate data for debugging
  logger.info('Candidate data received:', {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    hasResume: !!candidate.resume,
    resumeSkills: candidate.resumeSkills?.length || 0,
    experience: candidate.resume?.experience?.length || 0,
    education: candidate.resume?.education?.length || 0,
  });

  const handleSendInvite = async () => {
    if (!job || !candidate) {
      toast.error('Missing job or candidate information');
      return;
    }

    setIsInviting(true);
    try {
      const response = await clientJobPostingService.inviteCandidate(job.id, {
        candidateId: candidate.id,
        message: `We would like to invite you to apply for the ${job.title} position at our company. Based on your profile, we believe you would be a great fit for this role.`,
        coverLetterUrl: 'Job Invitation',
      });

      if (response) {
        toast.success(`Invitation sent to ${candidate.name}!`);

        // Refresh recommendations and job applications data
        queryClient.invalidateQueries({
          queryKey: ['job-recommendations', job.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['job-applications', job.id],
        });

        // Log activity
        await activityLogService.createActivityLog({
          entityType: ActivityEntityTypeEnum.CLIENT,
          entityId: job.clientId,
          module: ActivityModuleEnum.CLIENT,
          action: ActivityActionEnums.INVITE_CANDIDATE,
          description: `Invitation sent to ${candidate.name} for ${job.title}`,
          metadata: {
            title: ActivityTitleEnum.INVITE_CANDIDATE,
            candidateId: candidate.id,
            userName: candidate.name,
            candidateEmail: candidate.email,
            jobId: job.id,
            jobTitle: job.title,
            candidatePhone: candidate.phone,
            candidateLinkedin: candidate.resume?.social?.linkedin,
            candidateGithub: candidate.resume?.social?.github,
            candidateSummary: candidate.summary,
          },
        });

        // Close modal after successful invite
        onClose();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invitation'
      );
      logger.error('Error sending invitation:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleShortlist = async () => {
    setIsShortlisting(true);

    try {
      const result =
        await clientCandidateShortlistService.createCandidateShortlist({
          candidateId: candidate.id,
          jobPostingId: job.id,
        });

      if (result) {
        toast.success(`${candidate.name} added to shortlist!`);
        // Call the parent's shortlist handler if provided
        if (onShortlist) {
          onShortlist();
        }
      }
    } catch (error) {
      toast.error('Failed to shortlist candidate');
      logger.error('Error shortlisting candidate:', error);
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleContact = () => {
    // Open email client with pre-filled email
    const subject = encodeURIComponent(`Regarding ${job.title} position`);
    const body = encodeURIComponent(
      `Hello ${candidate.name},\n\nI hope this email finds you well. I came across your profile and I'm impressed with your background in ${candidate.currentJobTitle || candidate.jobTitle || candidate.resume?.currentJobTitle}.\n\nWe have an exciting opportunity for a ${job.title} position at our company that I believe would be a great fit for your skills and experience.\n\nWould you be interested in discussing this opportunity further?\n\nBest regards`
    );

    const mailtoUrl = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');

    // Log activity for contact
    activityLogService
      .createActivityLog({
        entityType: ActivityEntityTypeEnum.CLIENT,
        entityId: job.clientId,
        module: ActivityModuleEnum.CLIENT,
        action: ActivityActionEnums.SEND_EMAIL,
        description: `Contacted ${candidate.name} via email for ${job.title}`,
        metadata: {
          title: ActivityTitleEnum.EMAIL_SENT_TO_CANDIDATE,
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobId: job.id,
          jobTitle: job.title,
          candidatePhone: candidate.phone,
          candidateLinkedin: candidate.resume?.social?.linkedin,
          candidateGithub: candidate.resume?.social?.github,
          candidateSummary: candidate.summary,
        },
      })
      .catch((error) => {
        logger.error('Error logging contact activity:', error);
      });

    toast.success('Email client opened with pre-filled message');

    // Call the parent's contact handler if provided
    if (onContact) {
      onContact();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto p-0">
        <div className="flex h-full flex-col">
          <DialogHeader className="border-border border-b p-6">
            <DialogTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
              <Sparkles className="text-primary h-5 w-5" />
              Candidate Profile
            </DialogTitle>
            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSendInvite}
                disabled={isInviting || isInvited}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="mr-2 h-4 w-4" />
                {isInviting
                  ? 'Sending...'
                  : isInvited
                    ? 'Invited'
                    : 'Send Invite'}
              </Button>
              <Button
                variant="outline"
                onClick={handleShortlist}
                disabled={isShortlisting}
                className="border-border text-foreground hover:bg-muted"
              >
                <BookmarkPlus className="mr-2 h-4 w-4" />
                {isShortlisting ? 'Adding...' : 'Shortlist'}
              </Button>
              <Button
                variant="outline"
                onClick={handleContact}
                className="border-border text-foreground hover:bg-muted"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </div>
          </DialogHeader>

          <div className="w-full space-y-3 px-6 pt-6 pb-10">
            {/* Profile info and Professional summary */}
            <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:gap-4">
              {/* Profile info */}
              <div className="w-full md:w-1/3 md:max-w-sm">
                <ProfileCard candidate={candidate} />
              </div>
              {/* Professional Summary */}
              <div className="w-full flex-1 md:w-2/3">
                <ProfessionalSummary candidate={candidate} />
              </div>
            </div>

            {/* Professional Details */}
            <ProfessionalDetails candidate={candidate} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
