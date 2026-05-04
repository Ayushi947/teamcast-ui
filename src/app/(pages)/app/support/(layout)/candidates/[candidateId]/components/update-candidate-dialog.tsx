'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { CustomTabs } from '@/components/ui/custom-tabs';
import {
  supportCandidateManagementService,
  activityLogService,
} from '@/lib/services/services';
import {
  ISupportCandidate,
  ActivityModuleEnum,
  ActivityEntityTypeEnum,
} from '@/lib/shared';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/logger';
import {
  PersonalUpdateTab,
  ProfessionalUpdateTab,
  ResumeUpdateTab,
  PreferencesUpdateTab,
  SettingsUpdateTab,
  AssessmentsUpdateTab,
} from './update-tabs';

interface UpdateCandidateDialogProps {
  candidate: ISupportCandidate;
  onCandidateUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function UpdateCandidateDialog({
  candidate,
  onCandidateUpdated,
  trigger,
}: UpdateCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [phoneValidationError, setPhoneValidationError] = useState<
    string | null
  >(null);
  const { user } = useApp();

  // Helper function to safely convert dates to ISO string
  const safeToISOString = (dateValue: any): string | undefined => {
    if (!dateValue) return undefined;
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return undefined;
      return date.toISOString();
    } catch {
      return undefined;
    }
  };

  // Initialize form with complete candidate data
  // Removing resolver temporarily to avoid validation conflicts with existing data
  const form = useForm<any>({
    // resolver: zodResolver(candidateUpdateValidator.shape.body),
    mode: 'onChange',
    defaultValues: {
      // Basic information
      fullName: candidate.fullName || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      image: candidate.image || '',

      // Status and assessment
      status: candidate.status,
      assessmentStage: candidate.assessmentStage,
      resumeAssessmentStatus: candidate.resumeAssessmentStatus,
      onboardingAssessmentStatus: candidate.onboardingAssessmentStatus,
      jobSearchStatus: candidate.jobSearchStatus,

      // Personal information
      sex: candidate.sex,
      birthDate: safeToISOString(candidate.birthDate),
      maritalStatus: candidate.maritalStatus,

      // Publishing and completion
      isPublished: candidate.isPublished || false,
      isDirty: candidate.isDirty || false,
      completionPercentage: candidate.completionPercentage || 0,

      // Partner
      partner: candidate.partner ? { id: candidate.partner.id } : undefined,

      // Resume data - convert from ISupportCandidate format to ISupportCandidateUpdate format
      resume: {
        summary: candidate.resume?.summary || '',
        // Validator expects string arrays, not object arrays
        skills: candidate.resume?.skills || [],
        industries: candidate.resume?.industries || [],
        totalExperience: candidate.resume?.totalExperience || 0,
        highestEducationLevel: candidate.resume?.highestEducationLevel || '',
        // Map experience with correct field names that match validator
        experience:
          candidate.resume?.experience?.map((exp) => ({
            id: exp.id,
            title: exp.title || '', // Validator expects 'title'
            company: exp.company || '', // Validator expects 'company'
            startDate:
              safeToISOString(exp.startDate) || new Date().toISOString(),
            endDate: safeToISOString(exp.endDate),
            description: exp.description || '',
            projects:
              exp.projects?.map((proj) => ({
                id: proj.id,
                name: proj.name,
                description: proj.description,
                startDate:
                  safeToISOString(proj.startDate) || new Date().toISOString(),
                endDate: safeToISOString(proj.endDate),
              })) || [],
          })) || [],
        education:
          candidate.resume?.education?.map((edu) => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy || '',
            startDate:
              safeToISOString(edu.startDate) || new Date().toISOString(),
            endDate: safeToISOString(edu.endDate),
          })) || [],
        // Map certifications with correct field names that match validator
        certifications:
          candidate.resume?.certifications?.map((cert) => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer || '', // Validator expects 'issuer'
            date: safeToISOString(cert.date) || new Date().toISOString(), // Validator expects 'date'
          })) || [],
      },

      // Settings
      settings: {
        notificationsEnabled: candidate.settings?.notificationsEnabled ?? true,
        emailNotifications: candidate.settings?.emailNotifications ?? true,
        pushNotifications: candidate.settings?.pushNotifications ?? true,
        jobAlerts: candidate.settings?.jobAlerts ?? true,
        applicationUpdates: candidate.settings?.applicationUpdates ?? true,
        profileVisibility: candidate.settings?.profileVisibility ?? false,
        shareDataWithEmployers:
          candidate.settings?.shareDataWithEmployers ?? true,
        darkMode: candidate.settings?.darkMode ?? false,
        language: candidate.settings?.language || 'en',
        timezone: candidate.settings?.timezone || 'UTC',
        preferredCommunicationChannel:
          candidate.settings?.preferredCommunicationChannel || 'EMAIL',
      },

      // Preferences - Filter out invalid work types on initialization
      preferences: {
        preferredIndustries: candidate.preferences?.preferredIndustries || [],
        preferredLocations: candidate.preferences?.preferredLocations || [],
        preferredWorkTypes: (
          candidate.preferences?.preferredWorkTypes || []
        ).filter((type: string) =>
          [
            'FULL_TIME',
            'PART_TIME',
            'CONTRACT',
            'FREELANCE',
            'INTERNSHIP',
          ].includes(type)
        ),
        preferredJobTitles: candidate.preferences?.preferredJobTitles || [],
        preferredJobCommitments:
          candidate.preferences?.preferredJobCommitments || [],
        preferredJobSchedules:
          candidate.preferences?.preferredJobSchedules || [],
        preferredSalaryMin: candidate.preferences?.preferredSalaryMin || 0,
        preferredSalaryMax: candidate.preferences?.preferredSalaryMax || 0,
        preferredSalaryCurrency:
          candidate.preferences?.preferredSalaryCurrency || 'USD',
        preferredEquity: candidate.preferences?.preferredEquity ?? false,
        preferredBenefits: candidate.preferences?.preferredBenefits || [],
        preferredResponsibilities:
          candidate.preferences?.preferredResponsibilities || [],
        preferredTags: candidate.preferences?.preferredTags || [],
      },

      // Subscription (read-only fields for support)
      subscription: {
        status: candidate.subscription?.status,
        endDate: candidate.subscription?.endDate
          ? new Date(candidate.subscription.endDate).toISOString()
          : undefined,
        autoRenew: candidate.subscription?.autoRenew ?? false,
        assessmentsUsedThisMonth:
          candidate.subscription?.assessmentsUsedThisMonth || 0,
        practiceAssessmentsUsed:
          candidate.subscription?.practiceAssessmentsUsed || 0,
        additionalPracticeAssessmentCredits:
          candidate.subscription?.additionalPracticeAssessmentCredits || 0,
      },

      resumeAssessments: candidate.resumeAssessments || [],
      onboardingAssessments: candidate.onboardingAssessments || [],
      jobAiAssessments: candidate.jobAiAssessments || [],
    },
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const validWorkTypes = [
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'FREELANCE',
        'INTERNSHIP',
      ];

      if (data.preferences?.preferredWorkTypes) {
        data.preferences.preferredWorkTypes =
          data.preferences.preferredWorkTypes.filter((type: string) =>
            validWorkTypes.includes(type)
          );
      }

      if (data.resume?.skills) {
        data.resume.skills = Array.isArray(data.resume.skills)
          ? data.resume.skills.map((skill: any) =>
              typeof skill === 'string' ? skill : skill?.name || skill
            )
          : [];
      }

      if (data.resume?.industries) {
        data.resume.industries = Array.isArray(data.resume.industries)
          ? data.resume.industries.map((industry: any) =>
              typeof industry === 'string'
                ? industry
                : industry?.name || industry
            )
          : [];
      }

      // Ensure experience fields are properly set
      if (data.resume?.experience) {
        data.resume.experience = data.resume.experience
          .map((exp: any) => {
            // Remove empty or invalid ID fields for new items
            const cleanExp = {
              ...exp,
              title: exp.title || '',
              company: exp.company || '',
              description: exp.description || '',
            };

            // Only include ID if it's a valid UUID, otherwise omit it (new item)
            if (
              exp.id &&
              exp.id.length > 0 &&
              exp.id.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
              )
            ) {
              cleanExp.id = exp.id;
            }

            // Handle projects within experience
            if (exp.projects && Array.isArray(exp.projects)) {
              cleanExp.projects = exp.projects.map((proj: any) => {
                const cleanProj: any = {
                  name: proj.name || '',
                  description: proj.description || '',
                  startDate: proj.startDate,
                  endDate: proj.endDate,
                };

                // Only include project ID if it's valid
                if (
                  proj.id &&
                  proj.id.match(
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                  )
                ) {
                  cleanProj.id = proj.id;
                }

                return cleanProj;
              });
            }

            return cleanExp;
          })
          .filter((exp: any) => exp.title && exp.company); // Only include experience with both title and company
      }

      // Filter out incomplete education entries and handle IDs
      if (data.resume?.education) {
        data.resume.education = data.resume.education
          .map((edu: any) => {
            const cleanEdu: any = {
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              startDate: edu.startDate,
              endDate: edu.endDate,
            };

            // Only include ID if it's a valid UUID
            if (
              edu.id &&
              edu.id.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
              )
            ) {
              cleanEdu.id = edu.id;
            }

            return cleanEdu;
          })
          .filter((edu: any) => edu.institution && edu.degree);
      }

      // Filter out incomplete certification entries and handle IDs
      if (data.resume?.certifications) {
        data.resume.certifications = data.resume.certifications
          .map((cert: any) => {
            const cleanCert: any = {
              name: cert.name,
              issuer: cert.issuer,
              date: cert.date,
            };

            // Only include ID if it's a valid UUID
            if (
              cert.id &&
              cert.id.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
              )
            ) {
              cleanCert.id = cert.id;
            }

            return cleanCert;
          })
          .filter((cert: any) => cert.name && cert.issuer);
      }

      // Remove undefined/null values to avoid API issues
      const cleanData = JSON.parse(
        JSON.stringify(data, (_key, value) => {
          if (value === undefined || value === null) return undefined;
          return value;
        })
      );

      // Cleaned data for submission

      await supportCandidateManagementService.updateSupportCandidate(
        candidate.id,
        cleanData
      );

      // Log activity for candidate update
      if (user?.id) {
        try {
          await activityLogService.createActivityLog({
            entityType: ActivityEntityTypeEnum.CANDIDATE,
            entityId: candidate.id,
            module: ActivityModuleEnum.SYSTEM,
            action: ActivityActionEnums.UPDATE,
            description: `Candidate ${data.fullName || candidate.fullName} updated by support user ${user.name}`,
            metadata: {
              title: ActivityTitleEnum.PROFILE_UPDATED,
              candidateId: candidate.id,
              candidateName: data.fullName || candidate.fullName,
              candidateEmail: data.email || candidate.email,
              userName: user.name,
              updatedById: user.id,
              updatedFields: Object.keys(cleanData),
            },
          });
        } catch (logError) {
          logger.warn('Failed to log activity:', logError);
        }
      }

      toast.success('Candidate updated successfully!', {
        description: `${data.fullName || candidate.fullName} has been updated.`,
      });

      setOpen(false);
      onCandidateUpdated?.();
    } catch (error: unknown) {
      let errorMessage = 'Please check the form and try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        errorMessage = (error as any).message;
      }

      toast.error('Failed to update candidate', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const DefaultTrigger = (
    <Button variant="outline" size="sm" className="h-8 gap-1">
      <Edit className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || DefaultTrigger}</DialogTrigger>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col overflow-hidden bg-white shadow-lg dark:bg-gray-800">
        <DialogHeader className="flex-shrink-0 border-b border-gray-100 pb-4 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            Update Candidate - {candidate.fullName}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            Update candidate information. Fields marked with
            <span className="text-red-600"> *</span> are required.
          </DialogDescription>
        </DialogHeader>

        <div className="custom-scrollbar-thin flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="w-full">
                <div className="sticky top-0 z-10 bg-white pb-4 dark:bg-gray-800">
                  <CustomTabs
                    tabs={[
                      { key: 'personal', label: 'Personal' },
                      { key: 'professional', label: 'Professional' },
                      { key: 'resume', label: 'Resume' },
                      { key: 'assessments', label: 'Assessments' },
                      { key: 'preferences', label: 'Preferences' },
                      { key: 'settings', label: 'Settings' },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>

                <div className="mt-6 space-y-6">
                  {activeTab === 'personal' && (
                    <div className="space-y-4">
                      <PersonalUpdateTab
                        form={form}
                        isSubmitting={isSubmitting}
                        phoneValidationError={phoneValidationError}
                        setPhoneValidationError={setPhoneValidationError}
                      />
                    </div>
                  )}

                  {activeTab === 'professional' && (
                    <div className="space-y-4">
                      <ProfessionalUpdateTab
                        form={form}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  )}

                  {activeTab === 'resume' && (
                    <div className="space-y-4">
                      <ResumeUpdateTab
                        form={form}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  )}

                  {activeTab === 'assessments' && (
                    <div className="space-y-4">
                      <AssessmentsUpdateTab
                        form={form}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  )}

                  {activeTab === 'preferences' && (
                    <div className="space-y-4">
                      <PreferencesUpdateTab
                        form={form}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-4">
                      <SettingsUpdateTab
                        form={form}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex-shrink-0 border-t border-gray-100 pt-4 dark:border-gray-700">
          <div className="flex w-full gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting || phoneValidationError !== null}
              className="flex-1 bg-[#6e55cf] text-white hover:bg-[#5a4ba8] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              onClick={(e) => {
                e.preventDefault();

                const submitFn = form.handleSubmit(handleSubmit);
                submitFn();
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Updating...
                </div>
              ) : (
                'Update Candidate'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
