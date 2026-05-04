'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Eye,
  Share2,
  Moon,
  Globe,
  MessageCircle,
  User,
  Clock,
  Sun,
  Info,
  Newspaper,
  AlertCircle,
  BellOff,
  MessageCircleCode,
} from 'lucide-react';
import { candidateSettingsService } from '@/lib/services/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CommunicationChannelEnum, logger } from '@/lib/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';

// Define interface for settings to match the API expectations
interface ICandidateSettings {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  jobAlerts: boolean;
  applicationUpdates: boolean;
  profileVisibility: boolean;
  shareDataWithEmployers: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
  preferredCommunicationChannel: CommunicationChannelEnum | undefined;
}

const CandidateSettings = () => {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [settingsState, setSettingsState] = useState<ICandidateSettings>({
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    profileVisibility: true,
    shareDataWithEmployers: true,
    darkMode: theme === 'dark',
    language: 'English',
    timezone: 'UTC-5 (Eastern Time)',
    preferredCommunicationChannel: CommunicationChannelEnum.EMAIL,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => candidateSettingsService.getSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: ICandidateSettings) =>
      candidateSettingsService.updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      logger.error('Error saving settings:', error);
    },
  });

  useEffect(() => {
    if (settings) {
      // Make sure we provide default values for any undefined fields
      setSettingsState({
        ...settings,
        language: 'English', // Always set to English
        preferredCommunicationChannel:
          settings.preferredCommunicationChannel ||
          CommunicationChannelEnum.EMAIL,
      });
    }
  }, [settings]);

  // Sync theme with settings state
  useEffect(() => {
    setSettingsState((prev) => ({
      ...prev,
      darkMode: theme === 'dark',
    }));
  }, [theme]);

  const handleToggle = (key: keyof ICandidateSettings) => {
    const newSettings = {
      ...settingsState,
      [key]: !settingsState[key],
    };

    setSettingsState(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleSelectChange = (key: keyof ICandidateSettings, value: string) => {
    const newSettings = {
      ...settingsState,
      [key]:
        key === 'preferredCommunicationChannel'
          ? convertToCommunicationChannel(value)
          : value,
    };

    setSettingsState(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  // Helper function to safely convert string to CommunicationChannelEnum
  const convertToCommunicationChannel = (
    value: string
  ): CommunicationChannelEnum => {
    switch (value) {
      case CommunicationChannelEnum.EMAIL:
        return CommunicationChannelEnum.EMAIL;
      case CommunicationChannelEnum.SMS:
        return CommunicationChannelEnum.SMS;
      case CommunicationChannelEnum.PHONE:
        return CommunicationChannelEnum.PHONE;
      case CommunicationChannelEnum.IN_APP:
        return CommunicationChannelEnum.IN_APP;
      default:
        return CommunicationChannelEnum.EMAIL; // Default fallback
    }
  };

  const ToggleSwitch = ({
    enabled,
    onToggle,
    loading = false,
  }: {
    enabled: boolean;
    onToggle: () => void;
    loading?: boolean;
  }) => (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`focus:ring-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
        enabled
          ? 'bg-[#6e55cf] dark:bg-[#6e55cf]'
          : 'bg-gray-300 dark:bg-gray-700'
      } ${loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      aria-pressed={enabled}
      aria-label="Toggle setting"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } ${loading ? 'animate-pulse' : ''}`}
      />
    </button>
  );

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-150 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
      <div className="flex flex-1 items-start space-x-4">
        <div className="mt-0.5 rounded-full bg-blue-50 p-2 dark:bg-blue-900/20">
          <Icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[#6E55CF] dark:text-gray-100">
            {title}
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary/10 border-t-primary/20 h-12 w-12 animate-spin rounded-full border-4 border-t-4 dark:border-gray-700 dark:border-t-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl dark:bg-gray-900">
      <div className="px-3">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center">
            <h1 className="text-2xl font-bold text-[#6E55CF] dark:text-white">
              Settings
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Manage your account preferences and notification settings. Changes
            are saved automatically.
          </p>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Notifications Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="text-primary h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              <SettingItem
                icon={MessageCircleCode}
                title="Enable Notifications"
                description="Receive notifications about your job applications and updates"
              >
                <ToggleSwitch
                  enabled={settingsState.notificationsEnabled}
                  onToggle={() => handleToggle('notificationsEnabled')}
                  loading={updateSettingsMutation.isPending}
                />
              </SettingItem>

              <SettingItem
                icon={MessageCircle}
                title="Email Notifications"
                description="Get notified via email for important updates"
              >
                <ToggleSwitch
                  enabled={settingsState.emailNotifications}
                  onToggle={() => handleToggle('emailNotifications')}
                  loading={updateSettingsMutation.isPending}
                />
              </SettingItem>

              <SettingItem
                icon={BellOff}
                title="Push Notifications"
                description="Receive push notifications on your device"
              >
                <ToggleSwitch
                  enabled={settingsState.pushNotifications}
                  onToggle={() => handleToggle('pushNotifications')}
                  loading={updateSettingsMutation.isPending}
                />
              </SettingItem>

              <SettingItem
                icon={AlertCircle}
                title="Job Alerts"
                description="Get notified when new jobs match your preferences"
              >
                <ToggleSwitch
                  enabled={settingsState.jobAlerts}
                  onToggle={() => handleToggle('jobAlerts')}
                  loading={updateSettingsMutation.isPending}
                />
              </SettingItem>

              <SettingItem
                icon={Newspaper}
                title="Application Updates"
                description="Receive updates about your job application status"
              >
                <ToggleSwitch
                  enabled={settingsState.applicationUpdates}
                  onToggle={() => handleToggle('applicationUpdates')}
                  loading={updateSettingsMutation.isPending}
                />
              </SettingItem>
            </CardContent>
          </Card>

          {/* Privacy Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="text-primary h-5 w-5" />
                Privacy & Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              <SettingItem
                icon={User}
                title="Profile Visibility"
                description="Make your profile visible to recruiters and employers"
              >
                <ToggleSwitch
                  enabled={settingsState.profileVisibility}
                  onToggle={() => handleToggle('profileVisibility')}
                  loading={updateSettingsMutation.isPending}
                />
              </SettingItem>

              <SettingItem
                icon={Share2}
                title="Share Data with Employers"
                description="Allow employers to view your application data and analytics"
              >
                <ToggleSwitch
                  enabled={settingsState.shareDataWithEmployers}
                  onToggle={() => handleToggle('shareDataWithEmployers')}
                  loading={updateSettingsMutation.isPending}
                />
              </SettingItem>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="text-primary h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              <SettingItem
                icon={settingsState.darkMode ? Sun : Moon}
                title={settingsState.darkMode ? 'Dark Mode' : 'Light Mode'}
                description="Switch between light and dark themes"
              >
                <ToggleSwitch
                  enabled={settingsState.darkMode}
                  onToggle={() => {
                    const newTheme = settingsState.darkMode ? 'light' : 'dark';
                    setTheme(newTheme);
                    handleToggle('darkMode');
                  }}
                  loading={updateSettingsMutation.isPending}
                />
              </SettingItem>

              <SettingItem
                icon={Globe}
                title="Language"
                description="Language is set to English (disabled)"
              >
                <Select value="English" disabled={true}>
                  <SelectTrigger className="w-[180px] cursor-not-allowed opacity-50">
                    <SelectValue placeholder="English" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>

              <SettingItem
                icon={Clock}
                title="Timezone"
                description="Set your local timezone"
              >
                <Select
                  value={settingsState.timezone}
                  onValueChange={(value) =>
                    handleSelectChange('timezone', value)
                  }
                  disabled={updateSettingsMutation.isPending}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-12 (Baker Island)">
                      UTC-12 (Baker Island)
                    </SelectItem>
                    <SelectItem value="UTC-8 (Pacific Time)">
                      UTC-8 (Pacific Time)
                    </SelectItem>
                    <SelectItem value="UTC-5 (Eastern Time)">
                      UTC-5 (Eastern Time)
                    </SelectItem>
                    <SelectItem value="UTC+0 (GMT)">UTC+0 (GMT)</SelectItem>
                    <SelectItem value="UTC+1 (Central European)">
                      UTC+1 (Central European)
                    </SelectItem>
                    <SelectItem value="UTC+5:30 (Indian Standard)">
                      UTC+5:30 (Indian Standard)
                    </SelectItem>
                    <SelectItem value="UTC+8 (China Standard)">
                      UTC+8 (China Standard)
                    </SelectItem>
                    <SelectItem value="UTC+9 (Japan Standard)">
                      UTC+9 (Japan Standard)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>

              <SettingItem
                icon={MessageCircle}
                title="Preferred Communication"
                description="How would you like to be contacted?"
              >
                <Select
                  value={settingsState.preferredCommunicationChannel}
                  onValueChange={(value) =>
                    handleSelectChange('preferredCommunicationChannel', value)
                  }
                  disabled={updateSettingsMutation.isPending}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CommunicationChannelEnum.EMAIL}>
                      Email
                    </SelectItem>
                    <SelectItem value={CommunicationChannelEnum.SMS}>
                      SMS
                    </SelectItem>
                    <SelectItem value={CommunicationChannelEnum.PHONE}>
                      Phone
                    </SelectItem>
                    <SelectItem value={CommunicationChannelEnum.IN_APP}>
                      In-app
                    </SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="bg-primary/10 dark:bg-primary/20 border-primary/10 dark:border-primary/20 mt-6 flex items-start rounded-lg border p-4">
          <Info className="text-primary mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
          <p className="text-primary dark:text-primary/90 text-sm">
            Settings are automatically saved when changes are made. Your
            preferences will be applied across all Teamcast services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateSettings;
