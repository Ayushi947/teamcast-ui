'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Bell,
  Shield,
  Palette,
  Zap,
  Mail,
  Smartphone,
  Eye,
  Database,
  Link,
  Users2,
} from 'lucide-react';
import { ISupportClient } from '@/lib/shared';
import { logger } from '@/lib/logger';
import { useQuery } from '@tanstack/react-query';
import { deelConfigurationService } from '@/lib/services/services';

interface SettingsTabProps {
  client: ISupportClient;
}

export function SettingsTab({ client }: SettingsTabProps) {
  // Debug logging
  useEffect(() => {
    if (client) {
      logger.info('Client data in SettingsTab:', client);
    }
  }, [client]);

  const settings = client.settings;

  // Fetch Deel configuration
  const { data: deelConfig } = useQuery({
    queryKey: ['deel-configuration', client.id],
    queryFn: () => deelConfigurationService.getDeelConfiguration(client.id),
    enabled: !!client.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="space-y-6">
      {/* Settings Overview */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Notifications
            </div>
            <div className="bg-primary/20 dark:bg-primary/30 rounded-full p-2">
              <Bell className="text-primary dark:text-primary h-5 w-5" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {settings?.notificationsEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Privacy
            </div>
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {settings?.privacySettings?.profileVisibility || 'Public'}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Integrations
            </div>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {
                [
                  settings?.integrationSettings?.emailIntegration,
                  settings?.integrationSettings?.calendarIntegration,
                  settings?.integrationSettings?.slackIntegration,
                ].filter(Boolean).length
              }{' '}
              Active
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Data Retention
            </div>
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
              <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {settings?.privacySettings?.dataRetention || 365} days
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Deel SSO
            </div>
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <Users2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {client?.settings?.isDeelEnabled ? 'Enabled' : 'Disabled'}
            </div>
            {deelConfig?.isDeelEnabled && deelConfig?.deelConfiguredAt && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(deelConfig.deelConfiguredAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6">
            {/* General Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                General Notifications
              </h4>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Enable Notifications
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive notifications about account activities
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.notificationsEnabled ?? true}
                    disabled={true}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.emailNotifications ?? true}
                    disabled={true}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Push Notifications
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive push notifications on your device
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.pushNotifications ?? true}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            {/* Job & Application Alerts */}
            <div className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Job & Application Alerts
              </h4>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Job Alerts
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Notifications about job postings
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.jobAlerts ?? true}
                    disabled={true}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Candidate Alerts
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Notifications about candidate activities
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.candidateAlerts ?? true}
                    disabled={true}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Application Alerts
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Notifications about job applications
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.applicationAlerts ?? true}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Data Sharing
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allow sharing of anonymized data for platform improvement
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.privacySettings?.dataSharing ?? false}
                disabled={true}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Profile Visibility
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Control who can see your company profile
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {settings?.privacySettings?.profileVisibility || 'Public'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Marketing Emails
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive marketing and promotional emails
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.privacySettings?.marketingEmails ?? false}
                disabled={true}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Data Retention Period
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    How long to keep your data after account deletion
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {settings?.privacySettings?.dataRetention || 365} days
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding Settings */}
      {settings?.brandingSettings && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Palette className="h-5 w-5" />
              Branding Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded border"
                    style={{
                      backgroundColor:
                        settings.brandingSettings.primaryColor || '#6e55cf',
                    }}
                  />
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Primary Color
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Main brand color for your company
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {settings.brandingSettings.primaryColor || '#6e55cf'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded border"
                    style={{
                      backgroundColor:
                        settings.brandingSettings.secondaryColor || '#6c757d',
                    }}
                  />
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Secondary Color
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Secondary brand color for accents
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {settings.brandingSettings.secondaryColor || '#6c757d'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Link className="h-5 w-5" />
            Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Integration
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connect with email services for notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={
                  settings?.integrationSettings?.emailIntegration ?? true
                }
                disabled={true}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded bg-blue-500"></div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Calendar Integration
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sync with calendar services for scheduling
                  </p>
                </div>
              </div>
              <Switch
                checked={
                  settings?.integrationSettings?.calendarIntegration ?? false
                }
                disabled={true}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded bg-purple-500"></div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Slack Integration
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connect with Slack for team notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={
                  settings?.integrationSettings?.slackIntegration ?? false
                }
                disabled={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deel Integration Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Users2 className="h-5 w-5" />
            Deel Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users2 className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Deel SSO Status
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Single Sign-On integration with Deel.com
                  </p>
                </div>
              </div>
              <Badge
                variant={settings?.isDeelEnabled ? 'default' : 'secondary'}
              >
                {settings?.isDeelEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            {settings?.isDeelEnabled && (
              <div className="space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                {deelConfig?.deelConfiguredAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Configured On:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(
                        deelConfig.deelConfiguredAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {deelConfig?.deelConfiguredByName && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Configured By:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {deelConfig.deelConfiguredByName}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
