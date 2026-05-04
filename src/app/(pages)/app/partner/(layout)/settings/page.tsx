'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NotificationSettingsForm } from './components/notification-settings-form';
import { PrivacySettingsForm } from './components/privacy-settings-form';
import { BrandingSettingsForm } from './components/branding-settings-form';
import { IntegrationSettingsForm } from './components/integration-settings-form';
import { IPartnerProfileSettings, logger } from '@/lib/shared';
import { Loader2, Bell, Shield, Palette, Link2 } from 'lucide-react';
import { partnerProfileService } from '@/lib/services/services';

export default function PartnerSettingsPage() {
  const [settings, setSettings] = useState<IPartnerProfileSettings | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<
    'notifications' | 'privacy' | 'branding' | 'integrations' | null
  >(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await partnerProfileService.getProfileSettings();
        setSettings(response);
      } catch (error) {
        logger.error('Failed to load partner settings:', error);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const handleSettingsUpdate = (updatedSettings: IPartnerProfileSettings) => {
    setSettings(updatedSettings);
    setActiveDialog(null);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Partner Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage your notification preferences and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                Email Notifications:{' '}
                {settings?.emailNotifications ? 'Enabled' : 'Disabled'}
              </p>
              <p>
                Push Notifications:{' '}
                {settings?.pushNotifications ? 'Enabled' : 'Disabled'}
              </p>
              <p>Job Alerts: {settings?.jobAlerts ? 'Enabled' : 'Disabled'}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setActiveDialog('notifications')}>
              Edit Notifications
            </Button>
          </CardFooter>
        </Card>

        {/* Privacy Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>
              Control your privacy and data sharing settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                Profile Visibility:{' '}
                {settings?.privacySettings?.profileVisibility
                  ? 'Public'
                  : 'Private'}
              </p>
              <p>
                Data Sharing:{' '}
                {settings?.privacySettings?.dataSharing
                  ? 'Enabled'
                  : 'Disabled'}
              </p>
              <p>
                Analytics:{' '}
                {settings?.privacySettings?.analyticsTracking
                  ? 'Enabled'
                  : 'Disabled'}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setActiveDialog('privacy')}>
              Edit Privacy Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Branding Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Branding</CardTitle>
            </div>
            <CardDescription>Customize your brand appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Primary Color:</span>
                <div
                  className="h-4 w-4 rounded-full border"
                  style={{
                    backgroundColor: settings?.brandingSettings?.primaryColor,
                  }}
                />
              </div>
              <p>
                Custom Domain:{' '}
                {settings?.brandingSettings?.customDomain || 'Not set'}
              </p>
              <p>
                Logo: {settings?.brandingSettings?.logoUrl ? 'Set' : 'Not set'}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setActiveDialog('branding')}>
              Edit Branding
            </Button>
          </CardFooter>
        </Card>

        {/* Integrations Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              <CardTitle>Integrations</CardTitle>
            </div>
            <CardDescription>
              Manage your external service connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                ATS Integration:{' '}
                {settings?.integrationSettings?.ats?.enabled
                  ? 'Connected'
                  : 'Not connected'}
              </p>
              <p>
                Calendar:{' '}
                {settings?.integrationSettings?.calendar?.enabled
                  ? 'Connected'
                  : 'Not connected'}
              </p>
              <p>
                Communication:{' '}
                {settings?.integrationSettings?.communication?.enabled
                  ? 'Connected'
                  : 'Not connected'}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setActiveDialog('integrations')}>
              Edit Integrations
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Edit Dialogs */}
      <Dialog
        open={activeDialog === 'notifications'}
        onOpenChange={() => setActiveDialog(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <NotificationSettingsForm
            settings={settings}
            onUpdate={handleSettingsUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === 'privacy'}
        onOpenChange={() => setActiveDialog(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
          </DialogHeader>
          <PrivacySettingsForm
            settings={settings}
            onUpdate={handleSettingsUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === 'branding'}
        onOpenChange={() => setActiveDialog(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Branding Settings</DialogTitle>
          </DialogHeader>
          <BrandingSettingsForm
            settings={settings}
            onUpdate={handleSettingsUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === 'integrations'}
        onOpenChange={() => setActiveDialog(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Integration Settings</DialogTitle>
          </DialogHeader>
          <IntegrationSettingsForm
            settings={settings}
            onUpdate={handleSettingsUpdate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
