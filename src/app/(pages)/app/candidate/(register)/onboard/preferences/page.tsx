'use client';

import { Button } from '@/components/ui/button';
import { Preferences } from '@/components/app/candidate/preferences/preferences';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { UserRoleEnum, UserTypeEnum } from '@/lib/shared';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { candidateSettingsService } from '@/lib/services/services';
import { ICandidatePreferences } from '@/lib/shared';
import { TourGuide } from '@/components/tour/tour-guide';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function PreferencesPage() {
  const router = useRouter();
  const { user } = useApp();
  const queryClient = useQueryClient();
  const userRole = user?.role;

  // Query preferences data to check completion status
  const { data: preferences, isLoading: isPreferencesLoading } =
    useQuery<ICandidatePreferences>({
      queryKey: ['candidate-preferences'],
      queryFn: () => candidateSettingsService.getPreferences(),
      enabled: user?.role === UserRoleEnum.INDIVIDUAL, // Only fetch for INDIVIDUAL users
    });

  // Check if preferences are complete for INDIVIDUAL users
  const arePreferencesComplete = (
    prefs: ICandidatePreferences | undefined
  ): boolean => {
    if (!prefs) return false;

    // Check required fields based on the schema validation
    return !!(
      prefs.preferredIndustries?.length &&
      prefs.preferredLocations?.length &&
      prefs.preferredWorkTypes?.length &&
      prefs.preferredJobTitles?.length &&
      prefs.preferredJobCommitments?.length &&
      prefs.preferredJobSchedules?.length
    );
  };

  const isIndividualUser = user?.role === UserRoleEnum.INDIVIDUAL;
  const isButtonDisabled =
    isIndividualUser && (!preferences || !arePreferencesComplete(preferences));

  return (
    <>
      {' '}
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-foreground mb-2 text-2xl font-bold sm:text-3xl">
                Job Preferences
                {isIndividualUser && (
                  <span className="text-destructive ml-2 text-base font-normal">
                    *
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {isIndividualUser
                  ? 'Complete your job preferences to continue. These help us match you with the right opportunities.'
                  : 'Tell us about your professional experience and preferences so we can match you with the right opportunities.'}
              </p>
            </div>
          </div>
        </div>

        {user?.type === UserTypeEnum.CANDIDATE ? (
          <Preferences />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Job Preferences Not Available
              </h3>
            </div>
          </div>
        )}

        <div className="mt-6 sm:mt-8">
          {isButtonDisabled && !isPreferencesLoading ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={() => {
                        // Invalidate all candidate-related queries to ensure fresh data on dashboard
                        queryClient.invalidateQueries({
                          queryKey: ['candidate-profile'],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ['candidate-resume'],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ['candidate-preferences'],
                        });

                        if (userRole === UserRoleEnum.PARTNER_RESOURCE) {
                          router.push('/app/candidate/resume');
                        } else {
                          router.push('/app/candidate/dashboard');
                        }
                      }}
                      variant="default"
                      disabled={isButtonDisabled || isPreferencesLoading}
                      className="h-11 w-full rounded-lg px-6 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 sm:w-auto sm:px-10"
                    >
                      {isPreferencesLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Continue to Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Please complete job Preferences
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              onClick={() => {
                // Invalidate all candidate-related queries to ensure fresh data on dashboard
                queryClient.invalidateQueries({
                  queryKey: ['candidate-profile'],
                });
                queryClient.invalidateQueries({
                  queryKey: ['candidate-resume'],
                });
                queryClient.invalidateQueries({
                  queryKey: ['candidate-preferences'],
                });

                if (userRole === UserRoleEnum.PARTNER_RESOURCE) {
                  router.push('/app/candidate/resume');
                } else {
                  router.push('/app/candidate/dashboard');
                }
              }}
              variant="default"
              disabled={isButtonDisabled || isPreferencesLoading}
              className="h-11 w-full rounded-lg px-6 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 sm:w-auto sm:px-10"
            >
              {isPreferencesLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                  Loading...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {isButtonDisabled && !isPreferencesLoading && (
            <p className="text-muted-foreground mt-2 text-sm">
              Please complete all required job preferences fields to continue.
            </p>
          )}
        </div>
      </div>
      <TourGuide tourKey="candidate_onboarding_preferences" />
    </>
  );
}
