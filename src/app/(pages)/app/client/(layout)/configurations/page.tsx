'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Eye,
  Share2,
  MessageCircle,
  Info,
  Newspaper,
  AlertCircle,
  BellOff,
  MessageCircleCode,
  Building,
  Briefcase,
  Users,
  Settings,
  Link as LinkIcon,
  Palette,
  Calendar,
  Brain,
  Shield,
  Video,
  AlertTriangle,
  BarChart3,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { clientProfileService } from '@/lib/services/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  IClientProfileSettings,
  IClientProfileAiAssessmentSettings,
  DifficultyLevelEnum,
  logger,
} from '@/lib/shared';
import { useClientNotifications } from '@/lib/hooks/use-client-notifications';
import { useApp } from '@/lib/context/app-context';

// Settings Header Component
const SettingsHeader = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user,
}: {
  user: any;
}) => {
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
      <div className="">
        <div className="flex items-center gap-3">
          <h1 className="text-primary text-2xl font-bold">Configurations</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage your company preferences, notifications, and integration
          settings. Changes are saved automatically.
        </p>
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Last updated: {currentDate}</span>
      </div>
    </div>
  );
};

const ClientSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const clientNotifications = useClientNotifications();

  const [settingsState, setSettingsState] = useState<IClientProfileSettings>({
    clientId: '',
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    candidateAlerts: true,
    applicationAlerts: true,
    privacySettings: {
      shareAnalyticsWithTeamcast: true,
      allowAnonymousDataCollection: true,
    },
    brandingSettings: {
      useCustomBranding: false,
      useCustomEmailTemplates: false,
    },
    integrationSettings: {
      enableAtsIntegration: false,
      enableCalendarIntegration: true,
    },
  });

  const [aiAssessmentSettings, setAiAssessmentSettings] =
    useState<IClientProfileAiAssessmentSettings>({
      clientId: '',
      greetingMessage: '',
      requiredSections: [],
      defaultAssessmentDuration: 30,
      defaultPassingScore: 70,
      maximumAttempts: 3,
      cooldownPeriod: 24,
      maxAssessmentDuration: 60,
      assessmentBuffer: 10,
      useCustomPrompts: false,
      aiDifficulty: DifficultyLevelEnum.MEDIUM,
      maxSections: 5,
      maxQuestionsPerSection: 10,
      proctoringEnabled: true,
      maxWarnings: 3,
      tabSwitchLimit: 5,
      copyPasteAllowed: false,
      videoRecordingEnabled: false,
      minimumVideoLength: 30,
      aiVideoAnalysisEnabled: false,
      autoPublishOnSuccess: true,
      autoNotifyOnComplete: true,
    });

  const [originalAiAssessmentSettings, setOriginalAiAssessmentSettings] =
    useState<IClientProfileAiAssessmentSettings | null>(null);

  const [hasAiSettingsChanges, setHasAiSettingsChanges] = useState(false);
  const [requiredSectionsInput, setRequiredSectionsInput] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['clientSettings'],
    queryFn: () => clientProfileService.getProfileSettings(),
  });

  const { data: aiSettings, isLoading: isLoadingAiSettings } = useQuery({
    queryKey: ['clientAiAssessmentSettings'],
    queryFn: () => clientProfileService.getAiAssessmentSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: IClientProfileSettings) =>
      clientProfileService.updateProfileSettings(newSettings),
    onSuccess: (_, newSettings) => {
      queryClient.invalidateQueries({ queryKey: ['clientSettings'] });
      toast.success('Settings updated');

      // Send notification for settings update
      if (user?.id) {
        // Determine what type of setting was updated
        const updatedSettings = Object.keys(newSettings).filter(
          (key) =>
            key !== 'clientId' &&
            newSettings[key as keyof IClientProfileSettings] !==
              settingsState[key as keyof IClientProfileSettings]
        );

        if (updatedSettings.length > 0) {
          const settingType = updatedSettings[0];
          clientNotifications.settingsUpdated(user.id, settingType);
        }
      }
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      logger.error('Error saving settings:', error);
    },
  });

  const updateAiAssessmentSettingsMutation = useMutation({
    mutationFn: (newSettings: IClientProfileAiAssessmentSettings) =>
      clientProfileService.updateAiAssessmentSettings(newSettings),
    onSuccess: (_, newSettings) => {
      queryClient.invalidateQueries({
        queryKey: ['clientAiAssessmentSettings'],
      });
      setOriginalAiAssessmentSettings(newSettings);
      setHasAiSettingsChanges(false);
      toast.success('AI Assessment settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update AI Assessment settings');
      logger.error('Error saving AI Assessment settings:', error);
    },
  });

  useEffect(() => {
    if (settings) {
      // Make sure we provide default values for any undefined fields
      setSettingsState((prevState) => ({
        ...prevState,
        ...settings,
        privacySettings: {
          ...prevState.privacySettings,
          ...(settings.privacySettings || {}),
        },
        brandingSettings: {
          ...prevState.brandingSettings,
          ...(settings.brandingSettings || {}),
        },
        integrationSettings: {
          ...prevState.integrationSettings,
          ...(settings.integrationSettings || {}),
        },
      }));
    }
  }, [settings]);

  useEffect(() => {
    if (aiSettings) {
      const newSettings = {
        ...aiAssessmentSettings,
        ...aiSettings,
      };
      setAiAssessmentSettings(newSettings);
      setOriginalAiAssessmentSettings(JSON.parse(JSON.stringify(newSettings)));
      setHasAiSettingsChanges(false);
      // Update the input field with the loaded sections
      setRequiredSectionsInput(newSettings.requiredSections?.join(', ') || '');
    }
  }, [aiSettings]);

  const handleToggle = (
    key: keyof IClientProfileSettings,
    nestedKey?: string
  ) => {
    if (nestedKey) {
      // Type guard to check if the setting is an object with nested properties
      if (key === 'privacySettings') {
        const newSettings = {
          ...settingsState,
          privacySettings: {
            ...settingsState.privacySettings,
            [nestedKey]:
              !settingsState.privacySettings[
                nestedKey as keyof typeof settingsState.privacySettings
              ],
          },
        };
        setSettingsState(newSettings);
        updateSettingsMutation.mutate(newSettings);
      } else if (key === 'brandingSettings') {
        const newSettings = {
          ...settingsState,
          brandingSettings: {
            ...settingsState.brandingSettings,
            [nestedKey]:
              !settingsState.brandingSettings[
                nestedKey as keyof typeof settingsState.brandingSettings
              ],
          },
        };
        setSettingsState(newSettings);
        updateSettingsMutation.mutate(newSettings);
      } else if (key === 'integrationSettings') {
        const newSettings = {
          ...settingsState,
          integrationSettings: {
            ...settingsState.integrationSettings,
            [nestedKey]:
              !settingsState.integrationSettings[
                nestedKey as keyof typeof settingsState.integrationSettings
              ],
          },
        };
        setSettingsState(newSettings);
        updateSettingsMutation.mutate(newSettings);
      }
    } else {
      const newSettings = {
        ...settingsState,
        [key]: !settingsState[key],
      };
      setSettingsState(newSettings);
      updateSettingsMutation.mutate(newSettings);
    }
  };

  const handleAiAssessmentToggle = (
    key: keyof IClientProfileAiAssessmentSettings
  ) => {
    const newSettings = {
      ...aiAssessmentSettings,
      [key]: !aiAssessmentSettings[key],
    };
    setAiAssessmentSettings(newSettings);
    updateAiAssessmentSettingsMutation.mutate(newSettings);
  };

  const handleAiAssessmentChange = (
    key: keyof IClientProfileAiAssessmentSettings,
    value: any
  ) => {
    const newSettings = {
      ...aiAssessmentSettings,
      [key]: value,
    };
    setAiAssessmentSettings(newSettings);

    // Check if there are changes compared to original
    if (originalAiAssessmentSettings) {
      const hasChanges =
        JSON.stringify(newSettings) !==
        JSON.stringify(originalAiAssessmentSettings);
      setHasAiSettingsChanges(hasChanges);
    }
  };

  const saveAiAssessmentSettings = () => {
    updateAiAssessmentSettingsMutation.mutate(aiAssessmentSettings);
  };

  const resetAiAssessmentSettings = () => {
    if (originalAiAssessmentSettings) {
      setAiAssessmentSettings(
        JSON.parse(JSON.stringify(originalAiAssessmentSettings))
      );
      setHasAiSettingsChanges(false);
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

  const NumberInput = ({
    label,
    value,
    onChange,
    min,
    max,
    suffix,
    tooltip,
    loading = false,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    suffix?: string;
    tooltip?: string;
    loading?: boolean;
  }) => {
    const [localValue, setLocalValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);
    const [hasError, setHasError] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Only update local value from props when not focused
    useEffect(() => {
      if (!isFocused) {
        setLocalValue(value.toString());
        setHasError(false);
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Allow empty string for better UX while typing
      if (newValue === '') {
        setHasError(false);
        // Don't call onChange yet
        return;
      }

      const numValue = Number(newValue);
      if (isNaN(numValue)) {
        setHasError(true);
        return;
      }
      if (numValue > max) {
        setHasError(true);
        return;
      }
      if (numValue < min) {
        setHasError(true);
      } else {
        setHasError(false);
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout to call onChange after user stops typing
      timeoutRef.current = setTimeout(() => {
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
          onChange(numValue);
          setHasError(false);
        }
      }, 1000); // 500ms delay
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Clear timeout and immediately apply changes on blur
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const numValue = Number(localValue);
      if (localValue === '' || isNaN(numValue)) {
        // If empty or invalid, use minimum value
        setLocalValue(min.toString());
        onChange(min);
        setHasError(false);
      } else {
        // Clamp the value to min/max range
        const clampedValue = Math.max(min, Math.min(max, numValue));
        setLocalValue(clampedValue.toString());
        onChange(clampedValue);
        setHasError(false);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }, []);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </Label>
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
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            min={min}
            max={max}
            disabled={loading}
            className={`w-full ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {suffix && (
            <span className="text-sm text-gray-500 select-none">
              ({suffix})
            </span>
          )}
        </div>
        {hasError && (
          <p className="text-xs text-red-600 dark:text-red-400">
            Value must be between {min} and {max}
            {suffix ? ` ${suffix}` : ''}
          </p>
        )}
      </div>
    );
  };

  if (isLoading || isLoadingAiSettings) {
    return (
      <div className="flex h-screen items-center justify-center overflow-y-hidden">
        <div className="border-primary/10 border-t-primary/20 dark:border-t-primary/20 h-12 w-12 animate-spin rounded-full border-4 border-t-4 dark:border-gray-700"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4">
        <SettingsHeader user={user} />

        {/* Settings Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* AI Assessment Settings Section - Full Width */}
          <div className="lg:col-span-3">
            <Card className="dark:bg-primary/10 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="text-primary h-5 w-5" />
                    AI Assessment Settings
                  </CardTitle>
                  {hasAiSettingsChanges && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetAiAssessmentSettings}
                        disabled={updateAiAssessmentSettingsMutation.isPending}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveAiAssessmentSettings}
                        disabled={updateAiAssessmentSettingsMutation.isPending}
                      >
                        {updateAiAssessmentSettingsMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Updating...
                          </div>
                        ) : (
                          'Update Settings'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Greeting Message */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Greeting Message
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">
                          Welcome message shown to candidates at the start of
                          their assessment. Use this to set expectations,
                          provide encouragement, and explain the assessment
                          process.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    value={aiAssessmentSettings.greetingMessage || ''}
                    onChange={(e) =>
                      handleAiAssessmentChange(
                        'greetingMessage',
                        e.target.value
                      )
                    }
                    placeholder="Welcome to your AI assessment! Please read all questions carefully and take your time to provide thoughtful responses..."
                    className="min-h-[100px] resize-none"
                    disabled={updateAiAssessmentSettingsMutation.isPending}
                  />
                </div>

                {/* Required Sections + AI Difficulty */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Required Sections
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">
                            Specify which assessment sections are mandatory for
                            all candidates. Common sections include Technical
                            Skills, Problem Solving, Communication, and Cultural
                            Fit.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={requiredSectionsInput}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          setRequiredSectionsInput(inputValue);

                          // Process the sections for the settings
                          const sections = inputValue
                            .split(',')
                            .map((s) => s.trim())
                            .filter((s) => s.length > 0);

                          handleAiAssessmentChange(
                            'requiredSections',
                            sections
                          );
                        }}
                        onBlur={(e) => {
                          // On blur, clean up the input formatting
                          const inputValue = e.target.value;
                          const sections = inputValue
                            .split(',')
                            .map((s) => s.trim())
                            .filter((s) => s.length > 0);

                          // Update the input to show clean formatting
                          const cleanedInput = sections.join(', ');
                          setRequiredSectionsInput(cleanedInput);

                          handleAiAssessmentChange(
                            'requiredSections',
                            sections
                          );
                        }}
                        placeholder="Eg: Technical Skills, Problem Solving, Communication"
                        disabled={updateAiAssessmentSettingsMutation.isPending}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter section names separated by commas
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        AI Difficulty Level
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">
                            Controls the complexity of AI-generated questions
                            and evaluation criteria. Higher difficulty levels
                            create more challenging assessments that better
                            differentiate between skill levels.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={
                        aiAssessmentSettings.aiDifficulty ||
                        DifficultyLevelEnum.MEDIUM
                      }
                      onValueChange={(value) =>
                        handleAiAssessmentChange(
                          'aiDifficulty',
                          value as DifficultyLevelEnum
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={DifficultyLevelEnum.EASY}>
                          Easy
                        </SelectItem>
                        <SelectItem value={DifficultyLevelEnum.MEDIUM}>
                          Medium
                        </SelectItem>
                        <SelectItem value={DifficultyLevelEnum.HARD}>
                          Hard
                        </SelectItem>
                        <SelectItem value={DifficultyLevelEnum.EXPERT}>
                          Expert
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Assessment Configuration */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <NumberInput
                    label="Default Assessment Duration"
                    value={
                      (aiAssessmentSettings.defaultAssessmentDuration || 1800) /
                      60
                    }
                    onChange={(value) =>
                      handleAiAssessmentChange(
                        'defaultAssessmentDuration',
                        value * 60
                      )
                    }
                    min={1}
                    max={120}
                    suffix="min"
                    tooltip="Sets the standard time limit for AI assessments. This helps ensure consistency and prevents assessments from running too long, maintaining candidate engagement while allowing sufficient time for evaluation."
                    loading={updateAiAssessmentSettingsMutation.isPending}
                  />
                  <NumberInput
                    label="Default Passing Score"
                    value={
                      (aiAssessmentSettings.defaultPassingScore || 70) * 100
                    }
                    onChange={(value) =>
                      handleAiAssessmentChange(
                        'defaultPassingScore',
                        value / 100
                      )
                    }
                    min={0}
                    max={100}
                    suffix="%"
                    tooltip="Minimum score required to pass the assessment. This threshold ensures only qualified candidates proceed, maintaining quality standards while filtering out unsuitable applicants early in the process."
                    loading={updateAiAssessmentSettingsMutation.isPending}
                  />
                </div>

                {/* Assessment Structure */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <NumberInput
                    label="Max Sections"
                    value={aiAssessmentSettings.maxSections || 5}
                    onChange={(value) =>
                      handleAiAssessmentChange('maxSections', value)
                    }
                    min={1}
                    max={20}
                    tooltip="Maximum number of sections in an assessment. Sections help organize questions by topic or skill area, making assessments more structured and easier to analyze results."
                    loading={updateAiAssessmentSettingsMutation.isPending}
                  />
                  <NumberInput
                    label="Max Questions Per Section"
                    value={aiAssessmentSettings.maxQuestionsPerSection || 10}
                    onChange={(value) =>
                      handleAiAssessmentChange('maxQuestionsPerSection', value)
                    }
                    min={1}
                    max={50}
                    tooltip="Maximum questions allowed per section. This controls assessment length and prevents any single section from becoming too overwhelming for candidates."
                    loading={updateAiAssessmentSettingsMutation.isPending}
                  />
                </div>

                {/* Toggle Settings */}
                <div className="space-y-0">
                  <SettingItem
                    icon={Shield}
                    title="Proctoring Enabled"
                    description="Monitor candidates during assessment for security"
                    tooltip="Activates monitoring features like tab switching detection, copy-paste restrictions, and behavior analysis. Essential for maintaining assessment integrity and preventing cheating."
                  >
                    <ToggleSwitch
                      enabled={aiAssessmentSettings.proctoringEnabled || false}
                      onToggle={() =>
                        handleAiAssessmentToggle('proctoringEnabled')
                      }
                      loading={updateAiAssessmentSettingsMutation.isPending}
                    />
                  </SettingItem>
                  <SettingItem
                    icon={Video}
                    title="Video Recording"
                    description="Record video during assessment for review"
                    tooltip="Records candidate video during assessments for later review. Useful for analyzing communication skills, problem-solving approach, and detecting suspicious behavior. Requires candidate consent."
                  >
                    <ToggleSwitch
                      enabled={
                        aiAssessmentSettings.videoRecordingEnabled || false
                      }
                      onToggle={() =>
                        handleAiAssessmentToggle('videoRecordingEnabled')
                      }
                      loading={updateAiAssessmentSettingsMutation.isPending}
                    />
                  </SettingItem>

                  <SettingItem
                    icon={BarChart3}
                    title="AI Video Analysis"
                    description="Use AI to analyze candidate behavior in video recordings"
                    tooltip="Employs AI to automatically analyze video recordings for insights on candidate confidence, engagement, stress levels, and communication patterns. Provides additional data points for hiring decisions."
                  >
                    <ToggleSwitch
                      enabled={
                        aiAssessmentSettings.aiVideoAnalysisEnabled || false
                      }
                      onToggle={() =>
                        handleAiAssessmentToggle('aiVideoAnalysisEnabled')
                      }
                      loading={updateAiAssessmentSettingsMutation.isPending}
                    />
                  </SettingItem>
                </div>

                {/* Proctoring Settings */}
                {aiAssessmentSettings.proctoringEnabled && (
                  <div className="mt-6 space-y-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <h4 className="font-medium text-orange-800 dark:text-orange-300">
                        Proctoring Configuration
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <NumberInput
                        label="Max Warnings"
                        value={aiAssessmentSettings.maxWarnings || 3}
                        onChange={(value) =>
                          handleAiAssessmentChange('maxWarnings', value)
                        }
                        min={1}
                        max={10}
                        tooltip="Number of warnings a candidate receives before automatic assessment termination. Provides fair opportunity to correct behavior while maintaining security standards."
                        loading={updateAiAssessmentSettingsMutation.isPending}
                      />
                      <NumberInput
                        label="Tab Switch Limit"
                        value={aiAssessmentSettings.tabSwitchLimit || 5}
                        onChange={(value) =>
                          handleAiAssessmentChange('tabSwitchLimit', value)
                        }
                        min={0}
                        max={20}
                        tooltip="Maximum number of times a candidate can switch browser tabs during assessment. Helps prevent external research or cheating while allowing some flexibility for legitimate needs."
                        loading={updateAiAssessmentSettingsMutation.isPending}
                      />
                    </div>
                  </div>
                )}

                {/* Video Recording Settings */}
                {aiAssessmentSettings.videoRecordingEnabled && (
                  <div className="mt-6 space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">
                        Video Recording Configuration
                      </h4>
                    </div>
                    <NumberInput
                      label="Minimum Video Length"
                      value={aiAssessmentSettings.minimumVideoLength || 30}
                      onChange={(value) =>
                        handleAiAssessmentChange('minimumVideoLength', value)
                      }
                      min={1}
                      max={300}
                      suffix="sec"
                      tooltip="Minimum duration required for video recordings to be considered valid. Ensures sufficient content for meaningful analysis while preventing very short, unusable recordings."
                      loading={updateAiAssessmentSettingsMutation.isPending}
                    />
                  </div>
                )}
              </CardContent>
              {hasAiSettingsChanges && (
                <div className="mx-6 mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      You have unsaved changes. Click &quot;Update
                      Settings&quot; to save your changes.
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Notifications Section - Full Width */}
          <div className="lg:col-span-3">
            <Card className="dark:bg-primary/10 bg-white">
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
                  description="Receive notifications about your job postings and candidates"
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
                  icon={Briefcase}
                  title="Job Posting Alerts"
                  description="Get notified about job posting status and performance"
                >
                  <ToggleSwitch
                    enabled={settingsState.jobAlerts}
                    onToggle={() => handleToggle('jobAlerts')}
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>

                <SettingItem
                  icon={Users}
                  title="Candidate Alerts"
                  description="Receive updates when new candidates match your job postings"
                >
                  <ToggleSwitch
                    enabled={settingsState.candidateAlerts}
                    onToggle={() => handleToggle('candidateAlerts')}
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>

                <SettingItem
                  icon={Newspaper}
                  title="Application Updates"
                  description="Receive updates about candidate application status"
                >
                  <ToggleSwitch
                    enabled={settingsState.applicationAlerts}
                    onToggle={() => handleToggle('applicationAlerts')}
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Section */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-primary/10 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="text-primary h-5 w-5" />
                  Privacy & Data Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                <SettingItem
                  icon={Share2}
                  title="Share Analytics with Teamcast"
                  description="Allow Teamcast to analyze usage data to improve services"
                >
                  <ToggleSwitch
                    enabled={
                      settingsState.privacySettings.shareAnalyticsWithTeamcast
                    }
                    onToggle={() =>
                      handleToggle(
                        'privacySettings',
                        'shareAnalyticsWithTeamcast'
                      )
                    }
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>

                <SettingItem
                  icon={AlertCircle}
                  title="Anonymous Data Collection"
                  description="Allow collection of anonymous usage data for platform improvements"
                >
                  <ToggleSwitch
                    enabled={
                      settingsState.privacySettings.allowAnonymousDataCollection
                    }
                    onToggle={() =>
                      handleToggle(
                        'privacySettings',
                        'allowAnonymousDataCollection'
                      )
                    }
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>
              </CardContent>
            </Card>
          </div>

          {/* Branding Section */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-primary/10 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="text-primary h-5 w-5" />
                  Branding & Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                <SettingItem
                  icon={Building}
                  title="Custom Branding"
                  description="Use your company branding on candidate-facing pages"
                >
                  <ToggleSwitch
                    enabled={settingsState.brandingSettings.useCustomBranding}
                    onToggle={() =>
                      handleToggle('brandingSettings', 'useCustomBranding')
                    }
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>

                <SettingItem
                  icon={MessageCircle}
                  title="Custom Email Templates"
                  description="Use custom email templates to streamline and personalize candidate communication."
                >
                  <ToggleSwitch
                    enabled={
                      settingsState.brandingSettings.useCustomEmailTemplates
                    }
                    onToggle={() =>
                      handleToggle(
                        'brandingSettings',
                        'useCustomEmailTemplates'
                      )
                    }
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>
              </CardContent>
            </Card>
          </div>

          {/* Integrations Section */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-primary/10 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="text-primary h-5 w-5" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                <SettingItem
                  icon={Settings}
                  title="ATS Integration"
                  description="Connect with your existing Applicant Tracking System"
                >
                  <ToggleSwitch
                    enabled={
                      settingsState.integrationSettings.enableAtsIntegration
                    }
                    onToggle={() =>
                      handleToggle(
                        'integrationSettings',
                        'enableAtsIntegration'
                      )
                    }
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>

                <SettingItem
                  icon={Calendar}
                  title="Calendar Integration"
                  description="Easily sync interviews and events with your calendar to stay organized and on schedule.
"
                >
                  <ToggleSwitch
                    enabled={
                      settingsState.integrationSettings
                        .enableCalendarIntegration
                    }
                    onToggle={() =>
                      handleToggle(
                        'integrationSettings',
                        'enableCalendarIntegration'
                      )
                    }
                    loading={updateSettingsMutation.isPending}
                  />
                </SettingItem>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-primary/10 dark:bg-primary/20 border-primary/10 dark:border-primary/20 flex items-start rounded-lg border p-4">
          <Info className="text-primary mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
          <p className="text-primary dark:text-primary/90 text-sm">
            Settings are automatically saved when changes are made. Your
            preferences will be applied across all Teamcast services for your
            organization.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ClientSettings;
