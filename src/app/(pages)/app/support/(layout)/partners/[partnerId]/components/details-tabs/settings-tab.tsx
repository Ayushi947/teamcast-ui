'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Bell,
  Shield,
  Eye,
  Palette,
  Mail,
  Calendar,
  MessageSquare,
  Lock,
  Globe,
  Smartphone,
  Database,
  Link,
  Zap,
} from 'lucide-react';
import { ISupportPartner, logger } from '@/lib/shared';

interface SettingsTabProps {
  partner: ISupportPartner;
}

export function SettingsTab({ partner }: SettingsTabProps) {
  // Debug logging
  useEffect(() => {
    if (partner) {
      logger.info('Partner data in SettingsTab:', partner);
    }
  }, [partner]);

  const settings = partner.settings;

  return (
    <div className="space-y-6">
      {/* Settings Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border p-2">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Notifications</p>
              <p className="text-xl font-semibold">
                {settings?.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border p-2">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Privacy</p>
              <p className="text-xl font-semibold">
                {settings?.privacySettings?.profileVisibility || 'Public'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border p-2">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Integrations</p>
              <p className="text-xl font-semibold">
                {
                  [
                    settings?.integrationSettings?.emailIntegration,
                    settings?.integrationSettings?.calendarIntegration,
                    settings?.integrationSettings?.slackIntegration,
                  ].filter(Boolean).length
                }{' '}
                Active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border p-2">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Data Retention</p>
              <p className="text-xl font-semibold">
                {settings?.privacySettings?.dataRetention || 365} days
              </p>
            </div>
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
                        Master switch for all notifications
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

            {/* Partner Specific Alerts */}
            <div className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Partner Alerts
              </h4>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Consultant Alerts
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified about consultant activities
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.consultantAlerts ?? true}
                    disabled={true}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Contract Alerts
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified about contract updates
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.contractAlerts ?? true}
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
                    Allow data sharing with partners
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
                    Control who can see your profile
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
                    Receive marketing communications
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
                    How long to keep data
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {settings?.privacySettings?.dataRetention
                  ? `${settings.privacySettings.dataRetention} days`
                  : '365 days'}
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
                        settings.brandingSettings.primaryColor || '#007bff',
                    }}
                  />
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Primary Color
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Main brand color
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {settings.brandingSettings.primaryColor || '#007bff'}
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
                      Accent brand color
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
                    Connect with email services
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
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Calendar Integration
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connect with calendar services
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
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Slack Integration
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connect with Slack workspace
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

      {/* Financial Settings */}
      {partner.financialData && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Shield className="h-5 w-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Annual Revenue
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Company annual revenue
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {partner.financialData.annualRevenue
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(partner.financialData.annualRevenue)
                    : 'Not disclosed'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Tax ID
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tax identification number
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {partner.financialData.taxId
                    ? '***-***-****'
                    : 'Not provided'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      VAT Number
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      VAT registration number
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {partner.financialData.vatNumber
                    ? '***-***-****'
                    : 'Not provided'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Bank Accounts
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Registered bank accounts
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {partner.financialData.bankAccounts?.length || 0} account(s)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Settings Info */}
      {settings?.globalSettingsId && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Global Settings Applied
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  This partner inherits from global settings:{' '}
                  {settings.globalSettingsId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
