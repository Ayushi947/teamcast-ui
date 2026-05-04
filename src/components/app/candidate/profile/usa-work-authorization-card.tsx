'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { candidateResumeService } from '@/lib/services/services';
import { IResume, IResumeUpdate } from '@/lib/shared';
import { cn, formatEnumValue } from '@/lib/utils';
import { USWorkAuthorizationStatusEnum } from '@/lib/shared/models/common/enums';

interface USAWorkAuthorizationCardProps {
  resume?: IResume;
  onCompletionChange: (isCompleted: boolean) => void;
}

export function USAWorkAuthorizationCard({
  resume,
  onCompletionChange,
}: USAWorkAuthorizationCardProps) {
  const queryClient = useQueryClient();
  const [isUSWorkAuthorized, setIsUSWorkAuthorized] = useState<
    boolean | undefined
  >(undefined);
  const [requiresUSVisaSponsorship, setRequiresUSVisaSponsorship] = useState<
    boolean | undefined
  >(undefined);
  const [usWorkAuthorizationStatus, setUsWorkAuthorizationStatus] = useState<
    USWorkAuthorizationStatusEnum | undefined
  >(undefined);
  const [usWorkAuthorizationDetails, setUsWorkAuthorizationDetails] = useState<
    string | undefined
  >(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data from resume
  useEffect(() => {
    if (resume) {
      setIsUSWorkAuthorized(resume.isUSWorkAuthorized);
      setRequiresUSVisaSponsorship(resume.requiresUSVisaSponsorship);
      setUsWorkAuthorizationStatus(resume.usWorkAuthorizationStatus);
      setUsWorkAuthorizationDetails(resume.usWorkAuthorizationDetails);
    }
  }, [resume]);

  // Memoize completion status calculation
  const isComplete = useMemo(() => {
    return (
      isUSWorkAuthorized !== undefined &&
      isUSWorkAuthorized !== null &&
      requiresUSVisaSponsorship !== undefined &&
      requiresUSVisaSponsorship !== null &&
      usWorkAuthorizationStatus !== undefined &&
      usWorkAuthorizationStatus !== null &&
      usWorkAuthorizationStatus !==
        USWorkAuthorizationStatusEnum.PREFER_NOT_TO_SAY
    );
  }, [
    isUSWorkAuthorized,
    requiresUSVisaSponsorship,
    usWorkAuthorizationStatus,
  ]);

  // Create stable callback reference
  const notifyCompletionChange = useCallback(onCompletionChange, [
    onCompletionChange,
  ]);

  // Only notify parent when completion status actually changes
  useEffect(() => {
    notifyCompletionChange(isComplete);
  }, [isComplete, notifyCompletionChange]);

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: (data: IResumeUpdate) =>
      candidateResumeService.updateResume(data),
    onSuccess: async () => {
      // Invalidate and immediately refetch to update UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['candidate-resume'] }),
        queryClient.invalidateQueries({ queryKey: ['candidate-profile'] }),
      ]);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
      ]);
      toast.success('USA Work Authorization information saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save USA Work Authorization information');
      logger.error('Failed to update resume', { error });
    },
  });

  const handleSave = async () => {
    // Validate required fields
    if (
      isUSWorkAuthorized === undefined ||
      isUSWorkAuthorized === null ||
      requiresUSVisaSponsorship === undefined ||
      requiresUSVisaSponsorship === null ||
      !usWorkAuthorizationStatus
    ) {
      toast.error(
        'Please fill in all required fields for USA Work Authorization to continue'
      );
      return;
    }

    setIsSaving(true);
    try {
      await updateResumeMutation.mutateAsync({
        isUSWorkAuthorized,
        requiresUSVisaSponsorship,
        usWorkAuthorizationStatus,
        usWorkAuthorizationDetails,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if form has been modified
  const hasChanges =
    isUSWorkAuthorized !== resume?.isUSWorkAuthorized ||
    requiresUSVisaSponsorship !== resume?.requiresUSVisaSponsorship ||
    usWorkAuthorizationStatus !== resume?.usWorkAuthorizationStatus ||
    usWorkAuthorizationDetails !== resume?.usWorkAuthorizationDetails;

  return (
    <Card
      className={cn(
        'transition-all',
        !isComplete
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-green-200/60 bg-green-50/30 dark:border-green-800/40 dark:bg-green-950/10'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                !isComplete
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'bg-green-100/60 dark:bg-green-900/20'
              )}
            >
              <UserCheck
                className={cn(
                  'h-5 w-5',
                  !isComplete
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-green-600 dark:text-green-400'
                )}
              />
            </div>
            <div>
              <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
                USA Work Authorization
                <span className="text-lg text-red-600 dark:text-red-500">
                  *
                </span>
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {!isComplete
                  ? 'Please provide your work authorization information to continue'
                  : 'Your work authorization information has been saved'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question 1: Legally authorized to work */}
        <div className="space-y-3">
          <Label className="text-foreground block text-sm font-medium">
            Are you legally authorized to work in the United States?{' '}
            <span className="text-red-600 dark:text-red-500">*</span>
          </Label>
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsUSWorkAuthorized(true)}
              className={cn(
                'px-6 py-2.5 text-sm font-medium transition-all duration-200',
                'rounded-l-lg border-r border-gray-200 dark:border-gray-700',
                'focus:ring-primary cursor-pointer focus:z-10 focus:ring-2 focus:outline-none',
                isUSWorkAuthorized === true
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setIsUSWorkAuthorized(false)}
              className={cn(
                'px-6 py-2.5 text-sm font-medium transition-all duration-200',
                'rounded-r-lg',
                'focus:ring-primary cursor-pointer focus:z-10 focus:ring-2 focus:outline-none',
                isUSWorkAuthorized === false
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              No
            </button>
          </div>
        </div>

        {/* Question 2: Requires sponsorship */}
        <div className="space-y-3">
          <Label className="text-foreground block text-sm font-medium">
            Will you now or in the future require sponsorship for employment
            visa status?{' '}
            <span className="text-red-600 dark:text-red-500">*</span>
          </Label>
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setRequiresUSVisaSponsorship(true)}
              className={cn(
                'px-6 py-2.5 text-sm font-medium transition-all duration-200',
                'rounded-l-lg border-r border-gray-200 dark:border-gray-700',
                'focus:ring-primary cursor-pointer focus:z-10 focus:ring-2 focus:outline-none',
                requiresUSVisaSponsorship === true
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setRequiresUSVisaSponsorship(false)}
              className={cn(
                'px-6 py-2.5 text-sm font-medium transition-all duration-200',
                'rounded-r-lg',
                'focus:ring-primary cursor-pointer focus:z-10 focus:ring-2 focus:outline-none',
                requiresUSVisaSponsorship === false
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              No
            </button>
          </div>
        </div>

        {/* Question 3: Work authorization status */}
        <div className="space-y-3">
          <Label
            htmlFor="usWorkAuthorizationStatus"
            className="text-foreground block text-sm font-medium"
          >
            What is your current work authorization status?{' '}
            <span className="text-red-600 dark:text-red-500">*</span>
          </Label>
          <Select
            value={usWorkAuthorizationStatus || ''}
            onValueChange={(value) =>
              setUsWorkAuthorizationStatus(
                value as USWorkAuthorizationStatusEnum
              )
            }
          >
            <SelectTrigger id="usWorkAuthorizationStatus" className="w-full">
              <SelectValue placeholder="Select your work authorization status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USWorkAuthorizationStatusEnum.US_CITIZEN}>
                {formatEnumValue(USWorkAuthorizationStatusEnum.US_CITIZEN)}
              </SelectItem>
              <SelectItem
                value={USWorkAuthorizationStatusEnum.GREEN_CARD_HOLDER}
              >
                {formatEnumValue(
                  USWorkAuthorizationStatusEnum.GREEN_CARD_HOLDER
                )}
              </SelectItem>
              <SelectItem value={USWorkAuthorizationStatusEnum.WORK_VISA}>
                {formatEnumValue(USWorkAuthorizationStatusEnum.WORK_VISA)}{' '}
                (H-1B, L-1, TN, etc.)
              </SelectItem>
              <SelectItem value={USWorkAuthorizationStatusEnum.EAD}>
                {USWorkAuthorizationStatusEnum.EAD}
              </SelectItem>
              <SelectItem value={USWorkAuthorizationStatusEnum.STUDENT_VISA}>
                {formatEnumValue(USWorkAuthorizationStatusEnum.STUDENT_VISA)}{' '}
                (F-1/OPT/CPT)
              </SelectItem>
              <SelectItem value={USWorkAuthorizationStatusEnum.OTHER}>
                {formatEnumValue(USWorkAuthorizationStatusEnum.OTHER)}
              </SelectItem>
              <SelectItem
                value={USWorkAuthorizationStatusEnum.PREFER_NOT_TO_SAY}
              >
                {formatEnumValue(
                  USWorkAuthorizationStatusEnum.PREFER_NOT_TO_SAY
                )}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Optional: Additional details */}
        <div className="space-y-3">
          <Label
            htmlFor="usWorkAuthorizationDetails"
            className="text-foreground block text-sm font-medium"
          >
            Additional Details (Optional)
          </Label>
          <Input
            id="usWorkAuthorizationDetails"
            value={usWorkAuthorizationDetails || ''}
            onChange={(e) => setUsWorkAuthorizationDetails(e.target.value)}
            placeholder="Any additional information about your work authorization"
            className="w-full"
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || !isComplete}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Work Authorization
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
