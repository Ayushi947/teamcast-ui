'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button, ButtonProps } from '@/components/ui/button';
import {
  FileText,
  Shield,
  Users,
  Mail,
  Globe,
  CreditCard,
  Bell,
  Settings,
  Lock,
  Database,
  UserCheck,
  Briefcase,
  Moon,
  Sun,
  ClipboardCheck,
} from 'lucide-react';
import DocumentVerificationDialog from './components/documents/add-documents-dialog';
import { OnboardingAssessmentSettingsDialog } from './components/onboarding-assessment-settings';
import { PracticeAssessmentSettingsDialog } from './components/practice-assessment-settings';
import { OnboardingAssessmentGlobalSettingsDialog } from './components/onboarding-assessment-global-settings';
import { JobAiAssessmentGlobalSettingsDialog } from './components/job-ai-assessment-global-settings';
import {
  onboardingAssessmentSettingsService,
  practiceAssessmentSettingsService,
  onboardingAssessmentGlobalSettingsService,
  jobAiAssessmentGlobalSettingsService,
} from '@/lib/services/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type Category =
  | 'All'
  | 'Compliance'
  | 'Security'
  | 'Administration'
  | 'Communication'
  | 'Finance'
  | 'Technical'
  | 'Assessment Global Settings';

interface ConfigDataItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  button: string;
  buttonVariant: ButtonProps['variant'];
  category: Category;
}

export default function CompanySettings() {
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category>('All');
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = React.useState(false);
  const [isOnboardingAssessmentModalOpen, setIsOnboardingAssessmentModalOpen] =
    React.useState(false);
  const [isPracticeAssessmentModalOpen, setIsPracticeAssessmentModalOpen] =
    React.useState(false);
  const [
    isOnboardingAssessmentGlobalModalOpen,
    setIsOnboardingAssessmentGlobalModalOpen,
  ] = React.useState(false);
  const [
    isJobAiAssessmentGlobalModalOpen,
    setIsJobAiAssessmentGlobalModalOpen,
  ] = React.useState(false);
  const [
    isPracticeAssessmentGlobalModalOpen,
    setIsPracticeAssessmentGlobalModalOpen,
  ] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const queryClient = useQueryClient();

  // Fetch global onboarding assessment settings
  const { data: globalSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['globalOnboardingAssessmentSettings'],
    queryFn: () =>
      onboardingAssessmentSettingsService.getGlobalOnboardingAssessmentSettings(),
  });

  // Fetch global practice assessment settings
  const { data: practiceSettings, isLoading: isLoadingPracticeSettings } =
    useQuery({
      queryKey: ['globalPracticeAssessmentSettings'],
      queryFn: () =>
        practiceAssessmentSettingsService.getGlobalPracticeAssessmentSettings(),
    });

  // Fetch global onboarding assessment settings
  const {
    data: onboardingGlobalSettings,
    isLoading: isLoadingOnboardingGlobalSettings,
  } = useQuery({
    queryKey: ['globalOnboardingAssessmentGlobalSettings'],
    queryFn: () =>
      onboardingAssessmentGlobalSettingsService.getGlobalOnboardingAssessmentSettings(),
  });

  // Fetch global job AI assessment settings
  const { data: jobAiGlobalSettings, isLoading: isLoadingJobAiGlobalSettings } =
    useQuery({
      queryKey: ['globalJobAiAssessmentGlobalSettings'],
      queryFn: () =>
        jobAiAssessmentGlobalSettingsService.getGlobalJobAiAssessmentSettings(),
    });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const configData: ConfigDataItem[] = [
    {
      title: 'Required Documents',
      description:
        'Add country-specific required documents for client verification.',
      icon: <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />,
      content:
        'Ensure that your clients upload all necessary documents based on their location. These documents will be used for verification and compliance.',
      button: 'Add Documents',
      buttonVariant: 'default',
      category: 'Compliance',
    },
    {
      title: 'Security Settings',
      description: 'Configure authentication methods and security protocols.',
      icon: <Shield className="h-6 w-6 text-green-500 dark:text-green-400" />,
      content:
        'Set up multi-factor authentication, password policies, and session management to protect your organization and client data.',
      button: 'Configure Security',
      buttonVariant: 'default',
      category: 'Security',
    },
    {
      title: 'User Management',
      description:
        'Manage team members, roles, and permissions across your organization.',
      icon: <Users className="h-6 w-6 text-purple-500 dark:text-purple-400" />,
      content:
        'Add team members, assign roles, and control access levels to different parts of your verification system.',
      button: 'Manage Users',
      buttonVariant: 'default',
      category: 'Administration',
    },
    {
      title: 'Email Templates',
      description: 'Customize verification and notification email templates.',
      icon: <Mail className="h-6 w-6 text-orange-500 dark:text-orange-400" />,
      content:
        'Create personalized email templates for client communications, verification requests, and status updates.',
      button: 'Edit Templates',
      buttonVariant: 'default',
      category: 'Communication',
    },
    {
      title: 'Regional Settings',
      description:
        'Configure location-based verification rules and requirements.',
      icon: <Globe className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />,
      content:
        'Set up different verification workflows and document requirements based on client geographic locations.',
      button: 'Configure Regions',
      buttonVariant: 'default',
      category: 'Compliance',
    },
    {
      title: 'Payment Integration',
      description: 'Set up payment gateways and billing configurations.',
      icon: (
        <CreditCard className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
      ),
      content:
        'Configure payment processing, subscription billing, and financial reporting for your verification services.',
      button: 'Setup Payments',
      buttonVariant: 'default',
      category: 'Finance',
    },
    {
      title: 'Notifications',
      description: 'Configure system alerts and notification preferences.',
      icon: <Bell className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />,
      content:
        'Set up automated notifications for verification status changes, system alerts, and important updates.',
      button: 'Setup Alerts',
      buttonVariant: 'default',
      category: 'Communication',
    },
    {
      title: 'API Configuration',
      description: 'Manage API keys, webhooks, and third-party integrations.',
      icon: <Settings className="h-6 w-6 text-gray-500 dark:text-gray-400" />,
      content:
        'Configure API access, manage webhook endpoints, and set up integrations with external verification services.',
      button: 'Manage APIs',
      buttonVariant: 'default',
      category: 'Technical',
    },
    {
      title: 'Data Privacy',
      description: 'Configure data retention policies and privacy settings.',
      icon: <Lock className="h-6 w-6 text-red-500 dark:text-red-400" />,
      content:
        'Set up GDPR compliance, data retention schedules, and privacy controls to protect client information.',
      button: 'Privacy Settings',
      buttonVariant: 'default',
      category: 'Security',
    },
    {
      title: 'Backup & Recovery',
      description:
        'Configure automated backups and disaster recovery procedures.',
      icon: <Database className="h-6 w-6 text-teal-500 dark:text-teal-400" />,
      content:
        'Set up automated data backups, recovery procedures, and ensure business continuity planning.',
      button: 'Configure Backup',
      buttonVariant: 'default',
      category: 'Technical',
    },
    {
      title: 'Client Onboarding',
      description: 'Customize the client verification and onboarding flow.',
      icon: <UserCheck className="h-6 w-6 text-pink-500 dark:text-pink-400" />,
      content:
        'Design custom onboarding workflows, verification steps, and client experience touchpoints.',
      button: 'Customize Flow',
      buttonVariant: 'default',
      category: 'Administration',
    },
    {
      title: 'Business Rules',
      description: 'Define custom business logic and verification criteria.',
      icon: (
        <Briefcase className="h-6 w-6 text-amber-500 dark:text-amber-400" />
      ),
      content:
        'Create custom rules for client verification, risk assessment, and automated decision-making processes.',
      button: 'Define Rules',
      buttonVariant: 'default',
      category: 'Compliance',
    },
    {
      title: 'Onboarding Assessment',
      description: 'Configure voice settings for onboarding assessments.',
      icon: (
        <ClipboardCheck className="h-6 w-6 text-pink-500 dark:text-pink-400" />
      ),
      content:
        'Set up the dialect and voice gender for onboarding assessments. These settings will be used as defaults for all new onboarding assessments.',
      button: 'Configure Voice',
      buttonVariant: 'default',
      category: 'Administration',
    },
    {
      title: 'Practice Assessment',
      description: 'Configure settings for practice assessments.',
      icon: (
        <ClipboardCheck className="h-6 w-6 text-blue-500 dark:text-blue-400" />
      ),
      content:
        'Set up comprehensive settings for practice assessments including voice configuration, assessment parameters, proctoring, and video analysis. These settings will be used as defaults for all new practice assessments.',
      button: 'Configure Settings',
      buttonVariant: 'default',
      category: 'Administration',
    },
    {
      title: 'Onboarding Assessment Global Settings',
      description:
        'Configure comprehensive global settings for onboarding assessments.',
      icon: (
        <ClipboardCheck className="h-6 w-6 text-pink-500 dark:text-pink-400" />
      ),
      content:
        'Set up comprehensive global settings for onboarding assessments including voice configuration, assessment parameters, proctoring, video analysis, and automation settings. These settings will be used as defaults for all new onboarding assessments.',
      button: 'Configure Global Settings',
      buttonVariant: 'default',
      category: 'Assessment Global Settings',
    },
    {
      title: 'Job AI Assessment Global Settings',
      description:
        'Configure comprehensive global settings for job AI assessments.',
      icon: (
        <ClipboardCheck className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
      ),
      content:
        'Set up comprehensive global settings for job AI assessments including voice configuration, AI difficulty, assessment parameters, proctoring, video analysis, and automation settings. These settings will be used as defaults for all new job AI assessments.',
      button: 'Configure Global Settings',
      buttonVariant: 'default',
      category: 'Assessment Global Settings',
    },
    {
      title: 'Practice Assessment Global Settings',
      description:
        'Configure comprehensive global settings for practice assessments.',
      icon: (
        <ClipboardCheck className="h-6 w-6 text-blue-500 dark:text-blue-400" />
      ),
      content:
        'Set up comprehensive global settings for practice assessments including voice configuration, assessment parameters, proctoring, video analysis, and automation settings. These settings will be used as defaults for all new practice assessments.',
      button: 'Configure Global Settings',
      buttonVariant: 'default',
      category: 'Assessment Global Settings',
    },
  ];

  const categories: Category[] = [
    'All',
    'Compliance',
    'Security',
    'Administration',
    'Communication',
    'Finance',
    'Technical',
    'Assessment Global Settings',
  ];

  const filteredData =
    selectedCategory === 'All'
      ? configData
      : configData.filter((config) => config.category === selectedCategory);

  const getCategoryColor = (category: string): string => {
    const lightColors: Record<string, string> = {
      Compliance:
        'bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Security:
        'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Administration:
        'bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Communication:
        'bg-orange-100/80 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Finance:
        'bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      Technical:
        'bg-gray-100/80 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
      'Assessment Global Settings':
        'bg-violet-100/80 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    };
    return (
      lightColors[category] ||
      'bg-gray-100/80 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'
    );
  };

  const handleButtonClick = (title: string) => {
    if (title === 'Required Documents') {
      setIsDocumentsModalOpen(true);
    } else if (title === 'Onboarding Assessment') {
      setIsOnboardingAssessmentModalOpen(true);
    } else if (title === 'Practice Assessment') {
      setIsPracticeAssessmentModalOpen(true);
    } else if (title === 'Onboarding Assessment Global Settings') {
      setIsOnboardingAssessmentGlobalModalOpen(true);
    } else if (title === 'Job AI Assessment Global Settings') {
      setIsJobAiAssessmentGlobalModalOpen(true);
    } else if (title === 'Practice Assessment Global Settings') {
      setIsPracticeAssessmentGlobalModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen space-y-2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-colors duration-500 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Header Section with Glassmorphism */}
      <div className="rounded-xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-gray-900/80">
        <div className="mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
                Company Settings
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Manage your organization&apos;s verification system and
                configurations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="rounded-full bg-white/20 p-2 text-gray-600 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <div className="rounded-full bg-green-100/80 px-3 py-1 text-sm font-medium text-green-800 backdrop-blur-sm dark:bg-green-900/30 dark:text-green-300">
                Active
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 dark:border-gray-600/30 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
              >
                Export Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Glassmorphism */}
      <div className="rounded-xl border border-white/20 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/80">
        {/* Category Filter */}
        <div className="mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-500/90 text-white shadow-lg shadow-blue-500/25 dark:bg-blue-600/90 dark:shadow-blue-400/25'
                    : 'border border-white/30 bg-white/50 text-gray-600 hover:bg-white/70 dark:border-gray-600/30 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Cards */}
        <div className="mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((config, index) => (
              <Card
                key={index}
                className="group flex h-full flex-col border border-white/20 bg-white/60 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 dark:border-white/10 dark:bg-gray-800/60 dark:hover:shadow-blue-400/10"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/70 dark:bg-gray-700/50 dark:group-hover:bg-gray-600/50">
                        {config.icon}
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {config.title}
                      </CardTitle>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm ${getCategoryColor(
                        config.category
                      )}`}
                    >
                      {config.category}
                    </span>
                  </div>
                  <CardDescription className="mt-2 text-gray-600 dark:text-gray-300">
                    {config.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {config.content}
                </CardContent>

                <CardFooter className="mt-auto pt-4">
                  <Button
                    variant={config.buttonVariant || 'default'}
                    className={`w-full transition-all duration-200 ${
                      config.buttonVariant === 'outline'
                        ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-600/50'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl'
                    }`}
                    size="sm"
                    onClick={() => handleButtonClick(config.title)}
                  >
                    {config.button}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Document Modal */}
      <DocumentVerificationDialog
        open={isDocumentsModalOpen}
        onOpenChange={setIsDocumentsModalOpen}
      />

      {/* Onboarding Assessment Settings Modal */}
      <OnboardingAssessmentSettingsDialog
        open={isOnboardingAssessmentModalOpen}
        onOpenChange={setIsOnboardingAssessmentModalOpen}
        initialValues={globalSettings}
        isLoading={isLoadingSettings}
        onSave={async (values) => {
          try {
            await onboardingAssessmentSettingsService.updateGlobalOnboardingAssessmentSettings(
              {
                interviewLanguage: values.interviewLanguage,
                interviewDialect: values.interviewDialect,
                interviewVoiceGender: values.interviewVoiceGender,
              }
            );
            // Invalidate and refetch
            await queryClient.invalidateQueries({
              queryKey: ['globalOnboardingAssessmentSettings'],
            });
            toast.success('Onboarding assessment settings saved successfully');
            setIsOnboardingAssessmentModalOpen(false);
          } catch (_error) {
            // Error saving settings
            toast.error('Failed to save settings');
          }
        }}
      />

      {/* Practice Assessment Settings Modal */}
      <PracticeAssessmentSettingsDialog
        open={isPracticeAssessmentModalOpen}
        onOpenChange={setIsPracticeAssessmentModalOpen}
        initialValues={practiceSettings}
        isLoading={isLoadingPracticeSettings}
        onSave={async (values) => {
          try {
            await practiceAssessmentSettingsService.updateGlobalPracticeAssessmentSettings(
              values
            );
            // Invalidate and refetch
            await queryClient.invalidateQueries({
              queryKey: ['globalPracticeAssessmentSettings'],
            });
            toast.success('Practice assessment settings saved successfully');
            setIsPracticeAssessmentModalOpen(false);
          } catch (_error) {
            // Error saving settings
            toast.error('Failed to save settings');
          }
        }}
      />

      {/* Onboarding Assessment Global Settings Modal */}
      <OnboardingAssessmentGlobalSettingsDialog
        open={isOnboardingAssessmentGlobalModalOpen}
        onOpenChange={setIsOnboardingAssessmentGlobalModalOpen}
        initialValues={onboardingGlobalSettings}
        isLoading={isLoadingOnboardingGlobalSettings}
        onSave={async (values) => {
          try {
            await onboardingAssessmentGlobalSettingsService.updateGlobalOnboardingAssessmentSettings(
              values
            );
            // Invalidate and refetch
            await queryClient.invalidateQueries({
              queryKey: ['globalOnboardingAssessmentGlobalSettings'],
            });
            toast.success(
              'Onboarding assessment global settings saved successfully'
            );
            setIsOnboardingAssessmentGlobalModalOpen(false);
          } catch (_error) {
            toast.error('Failed to save settings');
          }
        }}
      />

      {/* Job AI Assessment Global Settings Modal */}
      <JobAiAssessmentGlobalSettingsDialog
        open={isJobAiAssessmentGlobalModalOpen}
        onOpenChange={setIsJobAiAssessmentGlobalModalOpen}
        initialValues={jobAiGlobalSettings}
        isLoading={isLoadingJobAiGlobalSettings}
        onSave={async (values) => {
          try {
            await jobAiAssessmentGlobalSettingsService.updateGlobalJobAiAssessmentSettings(
              values
            );
            // Invalidate and refetch
            await queryClient.invalidateQueries({
              queryKey: ['globalJobAiAssessmentGlobalSettings'],
            });
            toast.success(
              'Job AI assessment global settings saved successfully'
            );
            setIsJobAiAssessmentGlobalModalOpen(false);
          } catch (_error) {
            toast.error('Failed to save settings');
          }
        }}
      />

      {/* Practice Assessment Global Settings Modal */}
      <PracticeAssessmentSettingsDialog
        open={isPracticeAssessmentGlobalModalOpen}
        onOpenChange={setIsPracticeAssessmentGlobalModalOpen}
        initialValues={practiceSettings}
        isLoading={isLoadingPracticeSettings}
        onSave={async (values) => {
          try {
            await practiceAssessmentSettingsService.updateGlobalPracticeAssessmentSettings(
              values
            );
            // Invalidate and refetch
            await queryClient.invalidateQueries({
              queryKey: ['globalPracticeAssessmentSettings'],
            });
            toast.success(
              'Practice assessment global settings saved successfully'
            );
            setIsPracticeAssessmentGlobalModalOpen(false);
          } catch (_error) {
            toast.error('Failed to save settings');
          }
        }}
      />

      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl dark:from-blue-500/10 dark:to-purple-600/10"></div>
        <div className="absolute -bottom-1/2 -left-1/2 h-96 w-96 animate-pulse rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-500/20 blur-3xl delay-1000 dark:from-indigo-500/10 dark:to-pink-600/10"></div>
        <div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-500/15 blur-2xl delay-500 dark:from-cyan-500/8 dark:to-blue-600/8"></div>
      </div>
    </div>
  );
}
