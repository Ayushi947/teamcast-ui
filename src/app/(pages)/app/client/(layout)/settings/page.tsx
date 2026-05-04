'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Globe,
  Moon,
  Sun,
  Mail,
  Smartphone,
  MessageSquare,
  Settings as SettingsIcon,
  Clock,
  Languages,
  HelpCircle,
} from 'lucide-react';
import { clientUserProfileService } from '@/lib/services/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  IClientUserSettings,
  IClientUserSettingsUpdate,
  CommunicationChannelEnum,
  logger,
} from '@/lib/shared';
import { useTheme } from 'next-themes';

// Settings Header Component
const SettingsHeader = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(now);
    setCurrentDate(formattedDate);
  }, []);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#6E55CF]">
            User Profile Settings
          </h1>
          <BadgeComponent className="rounded-md bg-[#6E55CF] text-xs font-bold text-white dark:text-white">
            Personal
          </BadgeComponent>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage your personal preferences, notifications, and account settings.
          Changes are saved automatically.
        </p>
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Last updated: {currentDate}</span>
      </div>
    </div>
  );
};

const UserProfileSettings = () => {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const [userSettings, setUserSettings] = useState<IClientUserSettings>({
    clientUserId: '',
    globalSettingsId: '',
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    darkMode: theme === 'dark',
    language: 'en',
    timezone: 'UTC',
    preferredCommunicationChannel: CommunicationChannelEnum.EMAIL,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['clientUserSettings'],
    queryFn: () => clientUserProfileService.getUserProfileSettings(),
    staleTime: 5 * 60 * 1000,
    retryDelay: 1000,
  });

  // Track if the update is user-initiated
  const [userInitiatedUpdate, setUserInitiatedUpdate] = useState(false);

  const updateUserSettingsMutation = useMutation({
    mutationFn: (newSettings: IClientUserSettingsUpdate) =>
      clientUserProfileService.updateUserProfileSettings(
        userSettings.clientUserId || '',
        newSettings
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['clientUserSettings', userSettings.clientUserId],
      });
      if (userInitiatedUpdate) {
        toast.success('User settings updated');
        setUserInitiatedUpdate(false);
      }
    },
    onError: (error) => {
      toast.error('Failed to update user settings');
      logger.error('Error saving user settings:', error);
      setUserInitiatedUpdate(false);
    },
  });

  useEffect(() => {
    if (settings) {
      setUserSettings(settings);
    }
  }, [settings]);

  // Sync theme with settings state
  useEffect(() => {
    setUserSettings((prev) => ({
      ...prev,
      darkMode: theme === 'dark',
    }));
  }, [theme]);

  const handleToggle = (key: keyof IClientUserSettings) => {
    if (updateUserSettingsMutation.isPending) return;
    setUserInitiatedUpdate(true);
    const newValue = !userSettings[key];
    setUserSettings((prev) => ({ ...prev, [key]: newValue }));
    updateUserSettingsMutation.mutate({ [key]: newValue });
  };

  const handleChange = (key: keyof IClientUserSettings, value: any) => {
    if (updateUserSettingsMutation.isPending) return;
    setUserInitiatedUpdate(true);
    setUserSettings((prev) => ({ ...prev, [key]: value }));
    updateUserSettingsMutation.mutate({ [key]: value });
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
      disabled={loading || updateUserSettingsMutation.isPending}
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
    tooltip,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    tooltip?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-150 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
      <div className="flex flex-1 items-start space-x-4">
        <div className="bg-primary/10 dark:bg-primary/20 mt-0.5 rounded-full p-2">
          <Icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
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
        <div className="border-primary/10 border-t-primary/20 dark:border-t-primary/20 h-12 w-12 animate-spin rounded-full border-4 border-t-4 dark:border-gray-700"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Tour Help Icon */}
        <div className="mb-2 flex justify-end">
          {/* Remove: <DriverTour
            steps={[
              {
                element: '.settings-profile-info',
                popover: {
                  title: 'Profile Info',
                  description:
                    'Your personal and account information is shown here. Update as needed.',
                },
              },
              {
                element: '.settings-notifications',
                popover: {
                  title: 'Notification Settings',
                  description:
                    'Manage your email and push notification preferences here.',
                },
              },
              {
                element: '.settings-theme-toggle',
                popover: {
                  title: 'Theme',
                  description:
                    'Switch between light and dark mode for your preferred experience.',
                },
              },
              {
                element: '.settings-language',
                popover: {
                  title: 'Language',
                  description:
                    'Select your preferred language for the app interface.',
                },
              },
              {
                element: '.settings-save-feedback',
                popover: {
                  title: 'Save & Feedback',
                  description:
                    'Your changes are saved automatically. Look here for feedback or errors.',
                },
              },
            ]}
          /> */}
        </div>
        <div className="space-y-8">
          <SettingsHeader />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Notifications Section */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-primary/10 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="text-primary h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 p-0">
                  <SettingItem
                    icon={Bell}
                    title="All Notifications"
                    description="Master toggle for all notification types"
                    tooltip="Controls whether you receive any notifications at all. When disabled, all other notification settings are ignored."
                  >
                    <ToggleSwitch
                      enabled={userSettings.notificationsEnabled}
                      onToggle={() => handleToggle('notificationsEnabled')}
                      loading={updateUserSettingsMutation.isPending}
                    />
                  </SettingItem>

                  <SettingItem
                    icon={Mail}
                    title="Email Notifications"
                    description="Receive notifications via email"
                    tooltip="Get important updates and alerts delivered to your email inbox. Includes job updates, candidate activities, and system notifications."
                  >
                    <ToggleSwitch
                      enabled={userSettings.emailNotifications}
                      onToggle={() => handleToggle('emailNotifications')}
                      loading={updateUserSettingsMutation.isPending}
                    />
                  </SettingItem>

                  <SettingItem
                    icon={Smartphone}
                    title="Push Notifications"
                    description="Receive push notifications in your browser"
                    tooltip="Get real-time notifications directly in your browser. Includes immediate alerts for urgent matters and time-sensitive updates."
                  >
                    <ToggleSwitch
                      enabled={userSettings.pushNotifications}
                      onToggle={() => handleToggle('pushNotifications')}
                      loading={updateUserSettingsMutation.isPending}
                    />
                  </SettingItem>
                </CardContent>
              </Card>
            </div>

            {/* Appearance Section */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-primary/10 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Moon className="text-primary h-5 w-5" />
                    Appearance & Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 p-0">
                  <SettingItem
                    icon={userSettings.darkMode ? Moon : Sun}
                    title={userSettings.darkMode ? 'Dark Mode' : 'Light Mode'}
                    description="Toggle between light and dark themes"
                    tooltip="Switch between light and dark interface themes. Dark mode reduces eye strain in low-light environments and can help save battery on OLED displays."
                  >
                    <ToggleSwitch
                      enabled={userSettings.darkMode}
                      onToggle={() => {
                        const newTheme = userSettings.darkMode
                          ? 'light'
                          : 'dark';
                        setTheme(newTheme);
                        handleToggle('darkMode');
                      }}
                      loading={updateUserSettingsMutation.isPending}
                    />
                  </SettingItem>

                  <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-150 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                    <div className="flex flex-1 items-start space-x-4">
                      <div className="bg-primary/10 dark:bg-primary/20 mt-0.5 rounded-full p-2">
                        <Languages className="h-5 w-5 flex-shrink-0 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Language
                          </h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">
                                Choose your preferred language for the
                                interface. This affects all text, labels, and
                                messages throughout the application.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Select your preferred interface language
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Select
                        value={userSettings.language}
                        onValueChange={(value) =>
                          handleChange('language', value)
                        }
                        disabled={updateUserSettingsMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="it">Italian</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                          <SelectItem value="nl">Dutch</SelectItem>
                          <SelectItem value="ru">Russian</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="ko">Korean</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Regional Settings Section */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-primary/10 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="text-primary h-5 w-5" />
                    Regional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 p-0">
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-150 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                    <div className="flex flex-1 items-start space-x-4">
                      <div className="bg-primary/10 dark:bg-primary/20 mt-0.5 rounded-full p-2">
                        <Clock className="h-5 w-5 flex-shrink-0 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Timezone
                          </h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">
                                Your timezone affects how dates and times are
                                displayed throughout the application. This
                                ensures all scheduling and timestamps are shown
                                in your local time.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Select your local timezone
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Select
                        value={userSettings.timezone}
                        onValueChange={(value) =>
                          handleChange('timezone', value)
                        }
                        disabled={updateUserSettingsMutation.isPending}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">
                            UTC (Coordinated Universal Time)
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            Eastern Time (ET)
                          </SelectItem>
                          <SelectItem value="America/Chicago">
                            Central Time (CT)
                          </SelectItem>
                          <SelectItem value="America/Denver">
                            Mountain Time (MT)
                          </SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            Pacific Time (PT)
                          </SelectItem>
                          <SelectItem value="America/Phoenix">
                            Arizona Time (MST)
                          </SelectItem>
                          <SelectItem value="America/Anchorage">
                            Alaska Time (AKST)
                          </SelectItem>
                          <SelectItem value="Pacific/Honolulu">
                            Hawaii Time (HST)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            GMT (Greenwich Mean Time)
                          </SelectItem>
                          <SelectItem value="Europe/Paris">
                            CET (Central European Time)
                          </SelectItem>
                          <SelectItem value="Europe/Berlin">
                            CEST (Central European Summer Time)
                          </SelectItem>
                          <SelectItem value="Europe/Rome">
                            CET (Central European Time)
                          </SelectItem>
                          <SelectItem value="Europe/Madrid">
                            CET (Central European Time)
                          </SelectItem>
                          <SelectItem value="Europe/Amsterdam">
                            CET (Central European Time)
                          </SelectItem>
                          <SelectItem value="Europe/Moscow">
                            MSK (Moscow Standard Time)
                          </SelectItem>
                          <SelectItem value="Asia/Tokyo">
                            JST (Japan Standard Time)
                          </SelectItem>
                          <SelectItem value="Asia/Seoul">
                            KST (Korea Standard Time)
                          </SelectItem>
                          <SelectItem value="Asia/Shanghai">
                            CST (China Standard Time)
                          </SelectItem>
                          <SelectItem value="Asia/Kolkata">
                            IST (India Standard Time)
                          </SelectItem>
                          <SelectItem value="Asia/Dubai">
                            GST (Gulf Standard Time)
                          </SelectItem>
                          <SelectItem value="Australia/Sydney">
                            AEDT (Australian Eastern Daylight Time)
                          </SelectItem>
                          <SelectItem value="Australia/Melbourne">
                            AEDT (Australian Eastern Daylight Time)
                          </SelectItem>
                          <SelectItem value="Australia/Perth">
                            AWST (Australian Western Standard Time)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Communication Preferences Section */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-primary/10 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="text-primary h-5 w-5" />
                    Communication Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 p-0">
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-150 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                    <div className="flex flex-1 items-start space-x-4">
                      <div className="bg-primary/10 dark:bg-primary/20 mt-0.5 rounded-full p-2">
                        <MessageSquare className="h-5 w-5 flex-shrink-0 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Preferred Communication Channel
                          </h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">
                                Choose how you prefer to receive important
                                communications from the system. This affects
                                non-urgent messages and updates.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          How would you like to receive communications?
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Select
                        value={userSettings.preferredCommunicationChannel}
                        onValueChange={(value) =>
                          handleChange('preferredCommunicationChannel', value)
                        }
                        disabled={updateUserSettingsMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CommunicationChannelEnum.EMAIL}>
                            Email
                          </SelectItem>
                          <SelectItem value={CommunicationChannelEnum.PHONE}>
                            Phone
                          </SelectItem>
                          <SelectItem value={CommunicationChannelEnum.SMS}>
                            SMS
                          </SelectItem>
                          <SelectItem value={CommunicationChannelEnum.IN_APP}>
                            In-App
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-primary/10 dark:bg-primary/20 border-primary/10 dark:border-primary/20 flex items-start rounded-lg border p-4">
            <SettingsIcon className="text-primary mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
            <p className="text-primary dark:text-primary/90 text-sm">
              All changes to your settings are automatically saved. You
              don&apos;t need to click a save button - your preferences are
              updated instantly.
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UserProfileSettings;
