'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  candidateSettingsService,
  candidateResumeService,
} from '@/lib/services/services';
import { ICandidatePreferences, IResume, UserRoleEnum } from '@/lib/shared';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { ProfessionalDetailsForm } from './professional-details-form';
import { ProfessionalDetailsCard } from './professional-details-card';
import { PreferencesForm } from './preferences-form';
import { PreferencesCard } from './preferences-card';
import { Briefcase, Settings } from 'lucide-react';
import { getUser } from '@/lib/utils/auth-utils';
export function Preferences() {
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [isProfessionalDetailsModalOpen, setIsProfessionalDetailsModalOpen] =
    useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<
    ICandidatePreferences | undefined
  >();
  const [selectedResume, setSelectedResume] = useState<IResume | undefined>();
  const user = getUser();
  const userRole = user?.role || null;
  const queryClient = useQueryClient();

  const { data: preferences, isLoading: isPreferencesLoading } =
    useQuery<ICandidatePreferences>({
      queryKey: ['candidate-preferences'],
      queryFn: () => candidateSettingsService.getPreferences(),
    });

  const { data: resume, isLoading: isResumeLoading } = useQuery<IResume>({
    queryKey: ['candidate-resume'],
    queryFn: () => candidateResumeService.getResume(),
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<ICandidatePreferences>) =>
      candidateSettingsService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-preferences'] });
      // Invalidate profile data to trigger completion percentage recalculation
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      toast.success('Preferences updated successfully');
      setIsPreferencesModalOpen(false);
    },
    onError: (error) => {
      logger.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    },
  });

  const updateResumeMutation = useMutation({
    mutationFn: (data: Partial<IResume>) =>
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
      toast.success('Professional details updated successfully');
      setIsProfessionalDetailsModalOpen(false);
    },
    onError: (error) => {
      logger.error('Failed to update professional details:', error);
      const fullMessage = error?.message || '';
      const extractedMessage =
        fullMessage.split(':').pop()?.trim() ||
        'Failed to update professional details';
      toast.error(extractedMessage);
    },
  });

  const handleEditPreferences = (preferences: ICandidatePreferences) => {
    setSelectedPreferences(preferences);
    setIsPreferencesModalOpen(true);
  };

  const handleEditProfessionalDetails = (resume: IResume) => {
    setSelectedResume(resume);
    setIsProfessionalDetailsModalOpen(true);
  };

  if (isPreferencesLoading || isResumeLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>
          <h1 className="text-foreground mb-3 text-2xl font-semibold">
            Loading Your Information
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
      <div className="space-y-8">
        <div className="w-full">
          {/* Professional Details Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-foreground sm:text2xl mb-2 flex items-center gap-2 text-2xl font-bold">
                <Briefcase className="text-primary h-8 w-8 pr-2" />
                Professional Details
              </h2>
              <p className="text-muted-foreground text-sm">
                Professional details and achievements.
              </p>
            </div>
            {resume ? (
              <ProfessionalDetailsCard
                resume={resume}
                onEdit={() => handleEditProfessionalDetails(resume)}
              />
            ) : (
              <div className="border-muted flex w-full flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <p className="text-muted-foreground">
                  No professional details available. Click edit to add your
                  details.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-border border-t" />

        {userRole !== UserRoleEnum.PARTNER_RESOURCE && (
          <div className="w-full">
            {/* Job Preferences Section */}
            <div className="space-y-4">
              <h2 className="text-foreground sm:text2xl mb-2 flex items-center gap-2 text-2xl font-bold">
                <Settings className="text-primary h-8 w-8 pr-2" />
                Job Preferences
                {userRole === UserRoleEnum.INDIVIDUAL && (
                  <span className="text-destructive text-sm font-normal">
                    *
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground text-sm">
                {userRole === UserRoleEnum.INDIVIDUAL
                  ? 'Complete all required preferences to access your dashboard and receive job matches.'
                  : 'Your ideal job role and industry preferences'}
              </p>
              {preferences ? (
                <PreferencesCard
                  preferences={preferences}
                  onEdit={() => handleEditPreferences(preferences)}
                />
              ) : (
                <div className="border-muted flex w-full flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    {userRole === UserRoleEnum.INDIVIDUAL
                      ? 'Job preferences are required to continue. Add your preferences to proceed.'
                      : 'No preferences available. Add your preferences to get better job matches.'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedPreferences(undefined);
                      setIsPreferencesModalOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Add Job Preferences
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Forms */}
      <PreferencesForm
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        onSubmit={async (data) => {
          await updatePreferencesMutation.mutateAsync(data);
        }}
        preferences={selectedPreferences}
      />

      <ProfessionalDetailsForm
        isOpen={isProfessionalDetailsModalOpen}
        onClose={() => setIsProfessionalDetailsModalOpen(false)}
        onSubmit={async (data) => {
          await updateResumeMutation.mutateAsync(data);
        }}
        resume={selectedResume}
      />
    </div>
  );
}
