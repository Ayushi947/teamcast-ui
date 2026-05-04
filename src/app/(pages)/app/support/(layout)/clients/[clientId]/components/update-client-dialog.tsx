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
  ISupportClient,
  ActivityModuleEnum,
  ActivityEntityTypeEnum,
} from '@/lib/shared';

import { toast } from 'sonner';
import {
  supportClientManagementService,
  activityLogService,
} from '@/lib/services/services';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/logger';
import { CompanyUpdateTab } from './update-tabs/company-update-tab';
import { SettingsUpdateTab } from './update-tabs/settings-update-tab';
import { SubscriptionUpdateTab } from './update-tabs/subscription-update-tab';
import { AccountManagerUpdateTab } from './update-tabs/account-manager-update-tab';

interface UpdateClientDialogProps {
  client: ISupportClient;
  onClientUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function UpdateClientDialog({
  client,
  onClientUpdated,
  trigger,
}: UpdateClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const { user } = useApp();
  const queryClient = useQueryClient();

  // Remove resolver temporarily to avoid validation conflicts with existing data, similar to partner dialog
  const form = useForm<any>({
    // resolver: zodResolver(clientUpdateSchema),
    mode: 'onChange',
    defaultValues: {
      company: {
        name: client?.company?.name || '',
        contactEmail: client?.company?.contactEmail || '',
        website: client?.company?.website || '',
        industry: client?.company?.industry || undefined,
        size: client?.company?.size || undefined,
        companyType: client?.company?.companyType || undefined,
        stage: client?.company?.stage || undefined,
        foundedYear: client?.company?.foundedYear || undefined,
        description: client?.company?.description || '',
        contactName: client?.company?.contactName || '',
        contactPhone: client?.company?.contactPhone || '',
        benefits: client?.company?.benefits || [],

        address: {
          address: client?.company?.address || '',
          city: client?.company?.city || '',
          state: client?.company?.state || '',
          zipCode: client?.company?.zipCode || '',
          country: client?.company?.country || '',
        },
        social: {
          linkedin: client?.company?.social?.linkedin || '',
          twitter: client?.company?.social?.twitter || '',
          facebook: client?.company?.social?.facebook || '',
          instagram: client?.company?.social?.instagram || '',
          youtube: client?.company?.social?.youtube || '',
          github: client?.company?.social?.github || '',
        },
        culture: {
          mission: client?.company?.culture?.mission || '',
          vision: client?.company?.culture?.vision || '',
          values: client?.company?.culture?.values || [],
          perks: client?.company?.culture?.perks || [],
          workEnvironment: client?.company?.culture?.workEnvironment || [],
        },
      },
      settings: {
        notificationsEnabled: client?.settings?.notificationsEnabled ?? true,
        emailNotifications: client?.settings?.emailNotifications ?? true,
        pushNotifications: client?.settings?.pushNotifications ?? true,
        jobAlerts: client?.settings?.jobAlerts ?? true,
        candidateAlerts: client?.settings?.candidateAlerts ?? true,
        applicationAlerts: client?.settings?.applicationAlerts ?? true,
        isDeelEnabled: client?.settings?.isDeelEnabled ?? false,
        privacySettings: {
          dataSharing: client?.settings?.privacySettings?.dataSharing ?? false,
          profileVisibility:
            client?.settings?.privacySettings?.profileVisibility || 'public',
          marketingEmails:
            client?.settings?.privacySettings?.marketingEmails ?? false,
          dataRetention:
            client?.settings?.privacySettings?.dataRetention || 365,
        },
        brandingSettings: {
          primaryColor:
            client?.settings?.brandingSettings?.primaryColor || '#6e55cf',
          secondaryColor:
            client?.settings?.brandingSettings?.secondaryColor || '#6c757d',
        },
        integrationSettings: {
          calendarIntegration:
            client?.settings?.integrationSettings?.calendarIntegration ?? false,
          emailIntegration:
            client?.settings?.integrationSettings?.emailIntegration ?? true,
          slackIntegration:
            client?.settings?.integrationSettings?.slackIntegration ?? false,
        },
      },
      financialData: {
        annualRevenue: client?.financialData?.annualRevenue || 0,
        taxId: client?.financialData?.taxId || '',
        vatNumber: client?.financialData?.vatNumber || '',
        gstNumber: client?.financialData?.gstNumber || '',
        bankAccounts: client?.financialData?.bankAccounts || [],
      },
      subscription: {
        status: client?.subscription?.status || '',
        packageId: client?.subscription?.packageId || 'none',
        startDate: client?.subscription?.startDate || '',
        endDate: client?.subscription?.endDate || '',
        autoRenew: client?.subscription?.autoRenew ?? false,
        additionalCandidateViewCredits:
          client?.subscription?.additionalCandidateViewCredits || 0,
        additionalAiAssessmentCredits:
          client?.subscription?.additionalAiAssessmentCredits || 0,
        additionalSeatsCredits:
          client?.subscription?.additionalSeatsCredits || 0,
      },
    },
  });

  // Reset form when client changes
  useEffect(() => {
    form.reset({
      company: {
        name: client?.company?.name || '',
        contactEmail: client?.company?.contactEmail || '',
        website: client?.company?.website || '',
        industry: client?.company?.industry || undefined,
        size: client?.company?.size || undefined,
        companyType: client?.company?.companyType || undefined,
        stage: client?.company?.stage || undefined,
        foundedYear: client?.company?.foundedYear || undefined,
        description: client?.company?.description || '',
        contactName: client?.company?.contactName || '',
        contactPhone: client?.company?.contactPhone || '',
        benefits: client?.company?.benefits || [],

        address: {
          address: client?.company?.address || '',
          city: client?.company?.city || '',
          state: client?.company?.state || '',
          zipCode: client?.company?.zipCode || '',
          country: client?.company?.country || '',
        },
        social: {
          linkedin: client?.company?.social?.linkedin || '',
          twitter: client?.company?.social?.twitter || '',
          facebook: client?.company?.social?.facebook || '',
          instagram: client?.company?.social?.instagram || '',
          youtube: client?.company?.social?.youtube || '',
          github: client?.company?.social?.github || '',
        },
        culture: {
          mission: client?.company?.culture?.mission || '',
          vision: client?.company?.culture?.vision || '',
          values: client?.company?.culture?.values || [],
          perks: client?.company?.culture?.perks || [],
          workEnvironment: client?.company?.culture?.workEnvironment || [],
        },
      },
      settings: {
        notificationsEnabled: client?.settings?.notificationsEnabled ?? true,
        emailNotifications: client?.settings?.emailNotifications ?? true,
        pushNotifications: client?.settings?.pushNotifications ?? true,
        jobAlerts: client?.settings?.jobAlerts ?? true,
        candidateAlerts: client?.settings?.candidateAlerts ?? true,
        applicationAlerts: client?.settings?.applicationAlerts ?? true,
        isDeelEnabled: client?.settings?.isDeelEnabled ?? false,
        privacySettings: {
          dataSharing: client?.settings?.privacySettings?.dataSharing ?? false,
          profileVisibility:
            client?.settings?.privacySettings?.profileVisibility || 'public',
          marketingEmails:
            client?.settings?.privacySettings?.marketingEmails ?? false,
          dataRetention:
            client?.settings?.privacySettings?.dataRetention || 365,
        },
        brandingSettings: {
          primaryColor:
            client?.settings?.brandingSettings?.primaryColor || '#6e55cf',
          secondaryColor:
            client?.settings?.brandingSettings?.secondaryColor || '#6c757d',
        },
        integrationSettings: {
          calendarIntegration:
            client?.settings?.integrationSettings?.calendarIntegration ?? false,
          emailIntegration:
            client?.settings?.integrationSettings?.emailIntegration ?? true,
          slackIntegration:
            client?.settings?.integrationSettings?.slackIntegration ?? false,
        },
      },
      financialData: {
        annualRevenue: client?.financialData?.annualRevenue || 0,
        taxId: client?.financialData?.taxId || '',
        vatNumber: client?.financialData?.vatNumber || '',
        gstNumber: client?.financialData?.gstNumber || '',
        bankAccounts: client?.financialData?.bankAccounts || [],
      },
      subscription: {
        status: client?.subscription?.status || '',
        packageId: client?.subscription?.packageId || 'none',
        startDate: client?.subscription?.startDate || '',
        endDate: client?.subscription?.endDate || '',
        autoRenew: client?.subscription?.autoRenew ?? false,
        additionalCandidateViewCredits:
          client?.subscription?.additionalCandidateViewCredits || 0,

        additionalAiAssessmentCredits:
          client?.subscription?.additionalAiAssessmentCredits || 0,
        additionalSeatsCredits:
          client?.subscription?.additionalSeatsCredits || 0,
      },
    });
  }, [client, form]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Clean social media URLs - only include valid, non-empty URLs
      if (data.company?.social) {
        const cleanedSocial: any = {};
        Object.entries(data.company.social).forEach(([key, value]) => {
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
          data.company.social = cleanedSocial;
        } else {
          delete data.company.social;
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
        company: {
          name: data.company?.name || undefined,
          contactEmail: data.company?.contactEmail || undefined,
          website: data.company?.website || undefined,
          industry: data.company?.industry || undefined,
          size: data.company?.size || undefined,
          stage: data.company?.stage || undefined,
          foundedYear: data.company?.foundedYear || undefined,
          description: data.company?.description || undefined,
          companyType: data.company?.companyType || undefined,
          contactPhone: data.company?.contactPhone || undefined,
          contactName: data.company?.contactName || undefined,
          benefits: data.company?.benefits || undefined,
          address: {
            address: data.company?.address?.address || undefined,
            city: data.company?.address?.city || undefined,
            state: data.company?.address?.state || undefined,
            zipCode: data.company?.address?.zipCode || undefined,
            country: data.company?.address?.country || undefined,
          },
          social: data.company?.social,
          culture: data.company?.culture,
        },
        settings: data.settings,
        financialData: {
          annualRevenue:
            typeof data.financialData?.annualRevenue === 'number'
              ? data.financialData.annualRevenue
              : 0, // Always include annualRevenue, default to 0
          taxId: data.financialData?.taxId || '', // Always include taxId, default to empty string
          vatNumber: data.financialData?.vatNumber || '', // Always include vatNumber, default to empty string
          gstNumber: data.financialData?.gstNumber || '', // Always include gstNumber, default to empty string
          bankAccounts: data.financialData?.bankAccounts?.length
            ? data.financialData.bankAccounts
            : undefined,
        },
        subscription: {
          status: data.subscription?.status || undefined,
          startDate: data.subscription?.startDate || undefined,
          endDate: data.subscription?.endDate || undefined,
          autoRenew: data.subscription?.autoRenew ?? false,
          additionalCandidateViewCredits:
            data.subscription?.additionalCandidateViewCredits || 0,
          additionalAiAssessmentCredits:
            data.subscription?.additionalAiAssessmentCredits || 0,
          additionalSeatsCredits:
            data.subscription?.additionalSeatsCredits || 0,

          // Only include packageId if it's not empty and not "none"
          ...(data.subscription?.packageId &&
            data.subscription.packageId.trim() !== '' &&
            data.subscription.packageId !== 'none' && {
              packageId: data.subscription.packageId,
            }),
        },
      };

      // Remove undefined values to match client dialog approach
      const cleanedPayload = JSON.parse(
        JSON.stringify(updatePayload, (key, value) => {
          // Special handling for required financial fields - always preserve them
          if (
            ['annualRevenue', 'taxId', 'vatNumber', 'gstNumber'].includes(key)
          ) {
            return value;
          }
          if (value === undefined || value === null || value === '')
            return undefined;
          return value;
        })
      );

      // Ensure financialData always includes all required fields if any financial data exists
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
      logger.info('Cleaned payload:', cleanedPayload);
      await supportClientManagementService.updateSupportClient(
        client.id,
        cleanedPayload
      );

      if (user?.id) {
        try {
          await activityLogService.createActivityLog({
            entityType: ActivityEntityTypeEnum.CLIENT,
            entityId: client.id,
            module: ActivityModuleEnum.SYSTEM,
            action: ActivityActionEnums.UPDATE,
            description: `Client ${data.company?.basic?.name} updated by support user ${user.name}`,
            metadata: {
              title: ActivityTitleEnum.PROFILE_UPDATED,
              clientId: client.id,
              clientName: data.company?.basic?.name,
              clientEmail: data.company?.basic?.contactEmail,
              userName: user.name,
              updatedById: user.id,
              updatedFields: Object.keys(cleanedPayload),
            },
          });
        } catch (logError) {
          logger.warn('Failed to log activity:', logError);
        }
      }

      toast.success('Client updated successfully!');

      queryClient.invalidateQueries({
        queryKey: ['support-client', client.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['supportClients'],
      });

      setOpen(false);
      onClientUpdated?.();
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

      toast.error('Failed to update client', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const DefaultTrigger = (
    <Button variant="outline">
      <Edit className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || DefaultTrigger}</DialogTrigger>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col overflow-hidden border-0 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
        <DialogHeader className="flex-shrink-0 border-b border-gray-100 pb-4 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            Update Client - {client.company?.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            Update client information and settings. All fields are optional.
          </DialogDescription>
        </DialogHeader>

        <div className="scrollbar-invisible flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="w-full">
                <CustomTabs
                  tabs={[
                    { key: 'company', label: 'Company' },
                    { key: 'subscription', label: 'Subscription' },
                    { key: 'settings', label: 'Settings' },
                    { key: 'account-manager', label: 'Account Manager' },
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />

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
                        clientId={client.id}
                      />
                    </div>
                  )}

                  {activeTab === 'subscription' && (
                    <div className="space-y-4">
                      <SubscriptionUpdateTab
                        form={form}
                        isSubmitting={isSubmitting}
                        client={client}
                      />
                    </div>
                  )}

                  {activeTab === 'account-manager' && (
                    <div className="space-y-4">
                      <AccountManagerUpdateTab
                        form={form}
                        isSubmitting={isSubmitting}
                        clientId={client.id}
                        currentAccountManager={null}
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

                // Call handleSubmit manually like in partner dialog
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
                'Update Client'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
