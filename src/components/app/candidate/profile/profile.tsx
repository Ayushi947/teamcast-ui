'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  candidateProfileService,
  candidateResumeService,
} from '@/lib/services/services';
import {
  ICandidateProfile,
  ICandidateProfileBasicUpdate,
  IResume,
  IResumeUpdate,
  IResumeSocial,
  IResumeSocialUpdate,
} from '@/lib/shared';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  getParsedResumeData,
  clearResumeData,
} from '@/lib/utils/resume-draft.utils';
import { getIsUSBasedJob } from '@/lib/utils/job-invite-context.utils';
import { ProfileCard } from './profile-card';
import { ProfileForm } from './profile-form';
import { USAWorkAuthorizationCard } from './usa-work-authorization-card';

interface ProfileProps {
  onUSAAuthCompleted?: (isCompleted: boolean) => void;
}

export function Profile({ onUSAAuthCompleted }: ProfileProps) {
  // Check if this is a USA-based job from secure session storage
  const isUSBasedJob = getIsUSBasedJob();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ICandidateProfile>();
  const [selectedResume, setSelectedResume] = useState<IResume>();
  const [selectedSocial, setSelectedSocial] = useState<IResumeSocial>();

  const queryClient = useQueryClient();

  // Memoized callback for USA auth completion to prevent unnecessary re-renders
  const handleUSAAuthCompleted = useCallback(
    (isCompleted: boolean) => {
      if (onUSAAuthCompleted) {
        onUSAAuthCompleted(isCompleted);
      }
    },
    [onUSAAuthCompleted]
  );

  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } =
    useQuery<ICandidateProfile>({
      queryKey: ['candidate-profile'],
      queryFn: () => candidateProfileService.getProfile(),
    });

  // Fetch resume data
  const { data: resume, isLoading: isResumeLoading } = useQuery<IResume>({
    queryKey: ['candidate-resume'],
    queryFn: () => candidateResumeService.getResume(),
  });

  // Fetch social links data
  const { data: social, isLoading: isSocialLoading } = useQuery<IResumeSocial>({
    queryKey: ['candidate-resume-social'],
    queryFn: () => candidateResumeService.getSocialLinks(),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ICandidateProfileBasicUpdate) =>
      candidateProfileService.updateBasicProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      logger.error('Failed to update profile', { error });
    },
  });

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: (data: IResumeUpdate) =>
      candidateResumeService.updateResume(data),
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['candidate-resume'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });

      // Force refetch to update UI immediately - wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
      ]);
    },
    onError: (error) => {
      toast.error('Failed to update resume');
      logger.error('Failed to update resume', { error });
    },
  });

  // Update resume social links mutation
  const updateResumeSocialLinksMutation = useMutation({
    mutationFn: (data: IResumeSocialUpdate) =>
      candidateResumeService.updateSocialLinks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-resume-social'] });
    },
    onError: (error) => {
      toast.error('Failed to update resume social links');
      logger.error('Failed to update resume social links', { error });
    },
  });

  // Prepopulate from parsed resume if available
  useEffect(() => {
    if (!isProfileModalOpen) return;
    const resumeDraft = getParsedResumeData();
    if (resumeDraft) {
      try {
        const parsedResume = resumeDraft.parsedResume || resumeDraft;

        // Create enhanced profile data with parsed resume information
        const enhancedProfile = profile
          ? {
              ...profile,
              name: parsedResume.name || profile.name || '',
              email: parsedResume.email || profile.email || '',
            }
          : undefined;

        // Create enhanced resume data with parsed resume information
        const enhancedResume = resume
          ? {
              ...resume,
              phone: parsedResume.phone || resume.phone || '',
              location: parsedResume.location || resume.location || '',
              summary: parsedResume.summary || resume.summary || '',
              primaryIndustry:
                parsedResume.primaryIndustry || resume.primaryIndustry || '',
              totalExperience:
                parsedResume.totalExperience || resume.totalExperience || '',
              currentJobTitle:
                parsedResume.currentJobTitle || resume.currentJobTitle || '',
              currentCompany:
                parsedResume.currentCompany || resume.currentCompany || '',
              currentIndustry:
                parsedResume.currentIndustry || resume.currentIndustry || '',
              currentWorkLocation:
                parsedResume.currentWorkLocation ||
                resume.currentWorkLocation ||
                '',
              resumeSkills:
                parsedResume.resumeSkills || resume.resumeSkills || [],
              industries: parsedResume.industries || resume.industries || [],
              languages: parsedResume.languages || resume.languages || [],
              certifications:
                parsedResume.certifications || resume.certifications || [],
              education: parsedResume.education || resume.education || [],
              experience: parsedResume.experience || resume.experience || [],
            }
          : undefined;

        // Create enhanced social data with parsed resume information
        const enhancedSocial = social
          ? {
              ...social,
              linkedin: parsedResume.social?.linkedin || social.linkedin || '',
              github: parsedResume.social?.github || social.github || '',
              portfolio:
                parsedResume.social?.portfolio || social.portfolio || '',
              twitter: parsedResume.social?.twitter || social.twitter || '',
              leetcode: parsedResume.social?.leetcode || social.leetcode || '',
            }
          : undefined;

        setSelectedProfile(enhancedProfile);
        setSelectedResume(enhancedResume);
        setSelectedSocial(enhancedSocial);

        // Show success message
        toast.success('Resume data has been pre-filled in your profile!');
      } catch (error) {
        logger.error('Error parsing resume draft:', error);
        toast.error(
          'Failed to load resume data. Please fill in your profile manually.'
        );
      }
    } else {
      // No draft data, use existing data
      setSelectedProfile(profile);
      setSelectedResume(resume);
      setSelectedSocial(social);
    }
  }, [isProfileModalOpen, profile, resume, social]);

  const handleEditProfile = () => {
    setSelectedProfile(profile);
    setSelectedResume(resume);
    setSelectedSocial(social);
    setIsProfileModalOpen(true);
  };

  const handleSubmit = async (data: {
    profile: ICandidateProfileBasicUpdate;
    resume: IResumeUpdate;
    social: IResumeSocialUpdate;
  }) => {
    try {
      await Promise.all([
        updateProfileMutation.mutateAsync(data.profile),
        updateResumeMutation.mutateAsync(data.resume),
        updateResumeSocialLinksMutation.mutateAsync(data.social),
      ]);

      // Clear resume draft after successful submission
      clearResumeData();

      toast.success('Profile updated successfully!');
      setIsProfileModalOpen(false);
    } catch (error) {
      logger.error('Failed to update profile and resume', { error });
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (isProfileLoading || isResumeLoading || isSocialLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>
          <h1 className="text-foreground mb-3 text-2xl font-semibold">
            Loading Your Profile
          </h1>
          <p className="text-muted-foreground">
            Please wait while we fetch your information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {profile && resume && social ? (
        <ProfileCard
          profile={profile}
          resume={resume}
          social={social}
          onEdit={handleEditProfile}
        />
      ) : (
        <div className="border-muted flex w-full flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No profile information available. Click edit to add your details.
          </p>
        </div>
      )}

      {/* USA Work Authorization Card - Only show for USA-based jobs */}
      {isUSBasedJob && resume && (
        <USAWorkAuthorizationCard
          resume={resume}
          onCompletionChange={handleUSAAuthCompleted}
        />
      )}

      <ProfileForm
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSubmit={handleSubmit}
        profile={selectedProfile}
        resume={selectedResume}
        social={selectedSocial}
      />
    </div>
  );
}
