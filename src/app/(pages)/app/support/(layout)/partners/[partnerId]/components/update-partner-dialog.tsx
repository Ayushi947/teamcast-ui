'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { Edit } from 'lucide-react';
import {
  ISupportPartner,
  ActivityModuleEnum,
  ActivityEntityTypeEnum,
} from '@/lib/shared';

import { toast } from 'sonner';
import {
  supportPartnerManagementService,
  activityLogService,
} from '@/lib/services/services';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/logger';
import { CompanyUpdateTab } from './update-tabs/company-update-tab';
import { SettingsUpdateTab } from './update-tabs/settings-update-tab';
import { SocialUpdateTab } from './update-tabs/social-update-tab';

interface UpdatePartnerDialogProps {
  partner: ISupportPartner;
  onPartnerUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function UpdatePartnerDialog({
  partner,
  onPartnerUpdated,
  trigger,
}: UpdatePartnerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const { user } = useApp();
  const queryClient = useQueryClient();
  // Remove resolver temporarily to avoid validation conflicts with existing data, similar to candidate dialog
  const form = useForm<any>({
    // resolver: zodResolver(partnerUpdateSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: partner?.companyName || '',
      email: partner?.email || '',
      company: {
        profile: {
          website: partner?.company?.profile?.website || '',
          industry: partner?.company?.profile?.industry || undefined,
          size: partner?.company?.profile?.size || undefined,
          companyType: partner?.company?.profile?.companyType || undefined,
          stage: partner?.company?.profile?.stage || undefined,
          foundedYear: partner?.company?.profile?.foundedYear || undefined,
          description: partner?.company?.profile?.description || '',
        },

        benefits: partner?.company?.profile?.benefits || [],
        socialProfiles: {
          linkedin: partner?.company?.socialProfiles?.linkedin || '',
          twitter: partner?.company?.socialProfiles?.twitter || '',
          facebook: partner?.company?.socialProfiles?.facebook || '',
          instagram: partner?.company?.socialProfiles?.instagram || '',
          youtube: partner?.company?.socialProfiles?.youtube || '',
          github: partner?.company?.socialProfiles?.github || '',
        },
        culture: {
          mission: partner?.company?.culture?.mission || '',
          vision: partner?.company?.culture?.vision || '',
          values: partner?.company?.culture?.values || [],
          perks: partner?.company?.culture?.perks || [],
          workEnvironment: partner?.company?.culture?.workEnvironment || [],
        },
      },
      settings: {
        notificationsEnabled: partner?.settings?.notificationsEnabled ?? true,
        emailNotifications: partner?.settings?.emailNotifications ?? true,
        pushNotifications: partner?.settings?.pushNotifications ?? true,
        consultantAlerts: partner?.settings?.consultantAlerts ?? true,
        contractAlerts: partner?.settings?.contractAlerts ?? true,
        privacySettings: {
          dataSharing: partner?.settings?.privacySettings?.dataSharing ?? false,
          profileVisibility:
            partner?.settings?.privacySettings?.profileVisibility || 'public',
          marketingEmails:
            partner?.settings?.privacySettings?.marketingEmails ?? false,
          dataRetention:
            partner?.settings?.privacySettings?.dataRetention || 365,
        },
        brandingSettings: {
          primaryColor:
            partner?.settings?.brandingSettings?.primaryColor || '#6e55cf',
          secondaryColor:
            partner?.settings?.brandingSettings?.secondaryColor || '#6c757d',
        },
        integrationSettings: {
          calendarIntegration:
            partner?.settings?.integrationSettings?.calendarIntegration ??
            false,
          emailIntegration:
            partner?.settings?.integrationSettings?.emailIntegration ?? true,
          slackIntegration:
            partner?.settings?.integrationSettings?.slackIntegration ?? false,
        },
      },
    },
  });

  // Reset form when partner changes
  useEffect(() => {
    form.reset({
      companyName: partner?.companyName || '',
      email: partner?.email || '',
      company: {
        profile: {
          website: partner?.company?.profile?.website || '',
          industry: partner?.company?.profile?.industry || undefined,
          size: partner?.company?.profile?.size || undefined,
          companyType: partner?.company?.profile?.companyType || undefined,
          stage: partner?.company?.profile?.stage || undefined,
          foundedYear: partner?.company?.profile?.foundedYear || undefined,
          description: partner?.company?.profile?.description || '',

          benefits: partner?.company?.profile?.benefits || [],
        },

        socialProfiles: {
          linkedin: partner?.company?.socialProfiles?.linkedin || '',
          twitter: partner?.company?.socialProfiles?.twitter || '',
          facebook: partner?.company?.socialProfiles?.facebook || '',
          instagram: partner?.company?.socialProfiles?.instagram || '',
          youtube: partner?.company?.socialProfiles?.youtube || '',
          github: partner?.company?.socialProfiles?.github || '',
        },
        culture: {
          mission: partner?.company?.culture?.mission || '',
          vision: partner?.company?.culture?.vision || '',
          values: partner?.company?.culture?.values || [],
          perks: partner?.company?.culture?.perks || [],
          workEnvironment: partner?.company?.culture?.workEnvironment || [],
        },
      },
      settings: {
        notificationsEnabled: partner?.settings?.notificationsEnabled ?? true,
        emailNotifications: partner?.settings?.emailNotifications ?? true,
        pushNotifications: partner?.settings?.pushNotifications ?? true,
        consultantAlerts: partner?.settings?.consultantAlerts ?? true,
        contractAlerts: partner?.settings?.contractAlerts ?? true,
        privacySettings: {
          dataSharing: partner?.settings?.privacySettings?.dataSharing ?? false,
          profileVisibility:
            partner?.settings?.privacySettings?.profileVisibility || 'public',
          marketingEmails:
            partner?.settings?.privacySettings?.marketingEmails ?? false,
          dataRetention:
            partner?.settings?.privacySettings?.dataRetention || 365,
        },
        brandingSettings: {
          primaryColor:
            partner?.settings?.brandingSettings?.primaryColor || '#6e55cf',
          secondaryColor:
            partner?.settings?.brandingSettings?.secondaryColor || '#6c757d',
        },
        integrationSettings: {
          calendarIntegration:
            partner?.settings?.integrationSettings?.calendarIntegration ??
            false,
          emailIntegration:
            partner?.settings?.integrationSettings?.emailIntegration ?? true,
          slackIntegration:
            partner?.settings?.integrationSettings?.slackIntegration ?? false,
        },
      },
    });
  }, [partner, form]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Clean social media URLs - only include valid, non-empty URLs
      if (data.company?.socialProfiles) {
        const cleanedSocial: any = {};
        Object.entries(data.company.socialProfiles).forEach(([key, value]) => {
          if (value && typeof value === 'string' && value.trim()) {
            // Only include URLs that start with http/https
            const url = value.trim();
            if (url.startsWith('http://') || url.startsWith('https://')) {
              cleanedSocial[key] = url;
            }
          }
        });

        // Only include social object if it has valid URLs
        if (Object.keys(cleanedSocial).length > 0) {
          data.company.socialProfiles = cleanedSocial;
        } else {
          delete data.company.socialProfiles;
        }
      }

      // Filter out incomplete bank accounts - only include accounts with all required fields
      if (data.financialData?.bankAccounts) {
        data.financialData.bankAccounts = data.financialData.bankAccounts
          .map((account: any) => {
            const cleanAccount: any = {
              accountName: account.accountName || '',
              accountNumber: account.accountNumber || '',
              bankName: account.bankName || '',
              swiftCode: account.swiftCode || '',
              isDefault: account.isDefault || false,
            };

            // Only include ID if it's a valid UUID
            if (
              account.id &&
              account.id.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
              )
            ) {
              cleanAccount.id = account.id;
            }

            return cleanAccount;
          })
          .filter(
            (account: any) =>
              account.accountName &&
              account.accountNumber &&
              account.bankName &&
              account.swiftCode
          ); // Only include complete bank accounts

        // If no valid bank accounts, remove the array
        if (data.financialData.bankAccounts.length === 0) {
          delete data.financialData.bankAccounts;
        }
      }

      // Clean culture values and perks arrays
      if (data.company?.culture) {
        const cleanedCulture: any = {};

        if (data.company.culture.mission?.trim()) {
          cleanedCulture.mission = data.company.culture.mission.trim();
        }

        if (data.company.culture.vision?.trim()) {
          cleanedCulture.vision = data.company.culture.vision.trim();
        }

        if (data.company.culture.values?.length) {
          cleanedCulture.values = data.company.culture.values.filter(
            (v: string) => v?.trim()
          );
        }

        if (data.company.culture.perks?.length) {
          cleanedCulture.perks = data.company.culture.perks.filter(
            (p: string) => p?.trim()
          );
        }

        if (data.company.culture.workEnvironment?.length) {
          cleanedCulture.workEnvironment =
            data.company.culture.workEnvironment.filter((w: string) =>
              w?.trim()
            );
        }

        // Only include culture object if it has content
        if (Object.keys(cleanedCulture).length > 0) {
          data.company.culture = cleanedCulture;
        } else {
          delete data.company.culture;
        }
      }

      // Clean benefits array
      if (data.company?.benefits) {
        data.company.benefits = data.company.benefits.filter(
          (benefit: string) => benefit?.trim()
        );
        if (data.company.benefits.length === 0) {
          delete data.company.benefits;
        }
      }

      // Structure the data to match the backend API expectations
      const updatePayload = {
        companyName: data.companyName || undefined,
        email: data.email || undefined,
        company: {
          profile: {
            description: data.company?.profile?.description || undefined,
            companyType: data.company?.profile?.companyType || undefined,
            industry: data.company?.profile?.industry || undefined,
            size: data.company?.profile?.size || undefined,
            stage: data.company?.profile?.stage || undefined,
            foundedYear: data.company?.profile?.foundedYear || undefined,
            website: data.company?.profile?.website || undefined,
            benefits:
              data.company?.profile?.benefits?.length > 0
                ? data.company.profile.benefits
                : undefined,
          },

          socialProfiles: data.company?.socialProfiles || undefined,
          culture: data.company?.culture || undefined,
        },
        settings: data.settings || undefined,
        financialData: {
          annualRevenue:
            typeof data.financialData?.annualRevenue === 'number'
              ? data.financialData.annualRevenue
              : 0,
          taxId: data.financialData?.taxId || '',
          vatNumber: data.financialData?.vatNumber || '',
          gstNumber: data.financialData?.gstNumber || '',
          bankAccounts:
            data.financialData?.bankAccounts?.length > 0
              ? data.financialData.bankAccounts
              : undefined,
        },
      };

      // Remove undefined/null/empty (except required financial fields)
      const cleanedPayload = JSON.parse(
        JSON.stringify(updatePayload, (key, value) => {
          if (
            ['annualRevenue', 'taxId', 'vatNumber', 'gstNumber'].includes(key)
          ) {
            return value;
          }
          return value === undefined || value === null || value === ''
            ? undefined
            : value;
        })
      );

      // Ensure required financial fields are always present
      if (
        cleanedPayload.financialData &&
        typeof cleanedPayload.financialData === 'object'
      ) {
        cleanedPayload.financialData.annualRevenue =
          typeof updatePayload.financialData?.annualRevenue === 'number'
            ? updatePayload.financialData.annualRevenue
            : 0;
        cleanedPayload.financialData.taxId =
          updatePayload.financialData?.taxId || '';
        cleanedPayload.financialData.vatNumber =
          updatePayload.financialData?.vatNumber || '';
        cleanedPayload.financialData.gstNumber =
          updatePayload.financialData?.gstNumber || '';
      }

      await supportPartnerManagementService.updateSupportPartner(
        partner.id,
        cleanedPayload
      );

      if (user?.id) {
        try {
          await activityLogService.createActivityLog({
            entityType: ActivityEntityTypeEnum.PARTNER,
            entityId: partner.id,
            module: ActivityModuleEnum.SYSTEM,
            action: ActivityActionEnums.UPDATE,
            description: `Partner ${data.companyName || partner.companyName} updated by support user ${user.name}`,
            metadata: {
              title: ActivityTitleEnum.PROFILE_UPDATED,
              partnerId: partner.id,
              partnerName: data.companyName || partner.companyName,
              partnerEmail: data.email || partner.email,
              userName: user.name,
              updatedById: user.id,
              updatedFields: Object.keys(cleanedPayload),
            },
          });
        } catch (logError) {
          logger.warn('Failed to log activity:', logError);
        }
      }

      toast.success('Partner updated successfully!');
      queryClient.invalidateQueries({
        queryKey: ['support-partner', partner.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['supportPartners'],
      });
      setOpen(false);
      onPartnerUpdated?.();
    } catch (error: any) {
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

      toast.error('Failed to update partner', {
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
            Update Partner - {partner.companyName}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            Update partner information and settings. All fields are optional.
          </DialogDescription>
        </DialogHeader>

        <div className="scrollbar-invisible flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="w-full">
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800">
                  <CustomTabs
                    tabs={[
                      { key: 'company', label: 'Company' },
                      { key: 'social', label: 'Social' },
                      { key: 'settings', label: 'Settings' },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>

                <div className="my-6 space-y-6">
                  {activeTab === 'company' && (
                    <div className="space-y-4">
                      <CompanyUpdateTab
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

                  {activeTab === 'social' && (
                    <div className="space-y-4">
                      <SocialUpdateTab
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
              disabled={isSubmitting}
              className="flex-1 bg-[#6e55cf] text-white hover:bg-[#5a4ba8] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              onClick={(e) => {
                e.preventDefault();

                // Call handleSubmit manually like in candidate dialog
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
                'Update Partner'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
