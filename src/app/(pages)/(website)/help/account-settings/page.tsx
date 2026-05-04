'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  User,
  Shield,
  Bell,
  Lock,
  Mail,
  Eye,
  Download,
  Globe,
  Palette,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Smartphone,
  Activity,
  Database,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  description: string;
  steps: string[];
  tips?: string[];
  warning?: string;
}

const settingSections: SettingSection[] = [
  {
    id: 'profile',
    title: 'Profile Management',
    description: 'Update your personal information and profile settings',
    icon: User,
    color: 'text-blue-600',
    items: [
      {
        id: 'edit-profile',
        title: 'Edit Profile Information',
        description: 'Update your name, photo, bio, and contact details',
        steps: [
          'Navigate to Settings > Profile',
          'Click "Edit Profile" button',
          'Update your information in the form',
          'Upload a new profile photo if desired',
          'Save your changes',
        ],
        tips: [
          'Use a professional photo for better impression',
          'Keep your bio concise and relevant',
          'Ensure contact information is up-to-date',
        ],
      },
      {
        id: 'privacy-settings',
        title: 'Profile Privacy Settings',
        description: 'Control who can see your profile information',
        steps: [
          'Go to Settings > Privacy',
          'Choose visibility options for each field',
          'Set who can contact you',
          'Configure search visibility',
          'Save your preferences',
        ],
        tips: [
          'Balance privacy with discoverability',
          'Consider your career goals when setting visibility',
        ],
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Authentication',
    description: 'Manage your account security and login methods',
    icon: Shield,
    color: 'text-green-600',
    items: [
      {
        id: 'change-password',
        title: 'Change Password',
        description: 'Update your account password for better security',
        steps: [
          'Go to Settings > Security',
          'Click "Change Password"',
          'Enter your current password',
          'Enter new password twice',
          'Click "Update Password"',
        ],
        tips: [
          'Use a strong password with 12+ characters',
          'Include uppercase, lowercase, numbers, and symbols',
          'Avoid using the same password for multiple accounts',
        ],
      },
      {
        id: 'two-factor-auth',
        title: 'Enable Two-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        steps: [
          'Navigate to Settings > Security',
          'Find "Two-Factor Authentication" section',
          'Click "Enable 2FA"',
          'Scan QR code with authenticator app',
          'Enter verification code',
          'Save backup codes in a safe place',
        ],
        tips: [
          'Use Google Authenticator or similar app',
          'Store backup codes securely',
          'Test 2FA before fully enabling',
        ],
      },
      {
        id: 'login-activity',
        title: 'Monitor Login Activity',
        description: 'Review recent login attempts and active sessions',
        steps: [
          'Go to Settings > Security',
          'Click "Login Activity"',
          'Review recent login attempts',
          'Check for suspicious activity',
          'Sign out of unknown sessions if needed',
        ],
        warning:
          'If you see suspicious activity, change your password immediately',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    description: 'Control how and when you receive notifications',
    icon: Bell,
    color: 'text-purple-600',
    items: [
      {
        id: 'email-notifications',
        title: 'Email Notification Settings',
        description: 'Configure which emails you want to receive',
        steps: [
          'Navigate to Settings > Notifications',
          'Find "Email Notifications" section',
          'Toggle on/off different notification types',
          'Set frequency preferences',
          'Save your settings',
        ],
        tips: [
          'Keep important notifications enabled',
          'Use digest emails to reduce inbox clutter',
          'Set quiet hours for non-urgent notifications',
        ],
      },
      {
        id: 'push-notifications',
        title: 'Push Notification Settings',
        description: 'Manage browser and mobile push notifications',
        steps: [
          'Go to Settings > Notifications',
          'Find "Push Notifications" section',
          'Enable/disable push notifications',
          'Configure notification types',
          'Set quiet hours if needed',
        ],
        tips: [
          'Enable notifications for urgent messages',
          'Use quiet hours during sleep/work times',
        ],
      },
    ],
  },
  {
    id: 'preferences',
    title: 'App Preferences',
    description: 'Customize your app experience and interface',
    icon: Palette,
    color: 'text-orange-600',
    items: [
      {
        id: 'theme-settings',
        title: 'Theme and Appearance',
        description: 'Choose between light, dark, or system theme',
        steps: [
          'Go to Settings > Preferences',
          'Find "Appearance" section',
          'Select your preferred theme',
          'Adjust other display settings',
          'Save your preferences',
        ],
        tips: [
          'System theme adapts to your device settings',
          'Dark theme can reduce eye strain',
        ],
      },
      {
        id: 'language-region',
        title: 'Language and Region',
        description: 'Set your preferred language and regional settings',
        steps: [
          'Navigate to Settings > Preferences',
          'Find "Language & Region" section',
          'Select your preferred language',
          'Choose your region/timezone',
          'Save changes',
        ],
        tips: [
          'Timezone affects scheduling features',
          'Language changes may require app restart',
        ],
      },
    ],
  },
  {
    id: 'data',
    title: 'Data & Privacy',
    description: 'Manage your data, exports, and privacy settings',
    icon: Database,
    color: 'text-red-600',
    items: [
      {
        id: 'export-data',
        title: 'Export Your Data',
        description: 'Download a copy of your account data',
        steps: [
          'Go to Settings > Data & Privacy',
          'Click "Export Data"',
          'Select data types to export',
          'Choose export format',
          'Request export',
          "Download when ready (you'll receive an email)",
        ],
        tips: [
          'Export may take several hours for large accounts',
          'Data is available for 30 days after export',
        ],
      },
      {
        id: 'delete-account',
        title: 'Delete Account',
        description: 'Permanently delete your account and all data',
        steps: [
          'Navigate to Settings > Data & Privacy',
          'Scroll to "Delete Account" section',
          'Click "Delete Account"',
          'Enter your password to confirm',
          'Confirm deletion in email',
        ],
        warning: 'Account deletion is permanent and cannot be undone',
        tips: [
          'Export your data before deletion',
          'Consider deactivating instead of deleting',
        ],
      },
    ],
  },
];

const commonIssues = [
  {
    issue: 'Can&apos;t change password',
    solution:
      'Ensure you\'re entering your current password correctly. If forgotten, use "Forgot Password" link.',
    icon: Lock,
  },
  {
    issue: 'Not receiving notifications',
    solution:
      'Check your notification settings and email spam folder. Verify your email address is correct.',
    icon: Bell,
  },
  {
    issue: 'Profile changes not saving',
    solution:
      'Check your internet connection and try refreshing the page. Clear browser cache if needed.',
    icon: User,
  },
  {
    issue: '2FA not working',
    solution:
      'Ensure your device time is correct. Try using backup codes or contact support.',
    icon: Smartphone,
  },
];

export default function AccountSettingsPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/help" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Help
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <Badge variant="outline">Account Settings</Badge>
            </div>
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              Account Settings & Preferences
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Manage your account, security, and preferences
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Quick Actions */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Quick Actions
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Common account management tasks
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Change Password',
                  icon: Lock,
                  color: 'text-red-600',
                  href: '#security',
                },
                {
                  title: 'Update Profile',
                  icon: User,
                  color: 'text-blue-600',
                  href: '#profile',
                },
                {
                  title: 'Notification Settings',
                  icon: Bell,
                  color: 'text-purple-600',
                  href: '#notifications',
                },
                {
                  title: 'Export Data',
                  icon: Download,
                  color: 'text-green-600',
                  href: '#data',
                },
              ].map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                >
                  <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-4 text-center">
                      <action.icon
                        className={`h-8 w-8 ${action.color} mx-auto mb-2`}
                      />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {action.title}
                      </h3>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Settings Sections */}
          <section className="mb-12">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {settingSections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-2"
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {section.title.split(' ')[0]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {settingSections.map((section) => (
                <TabsContent
                  key={section.id}
                  value={section.id}
                  className="mt-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                            <section.icon
                              className={`h-6 w-6 ${section.color}`}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              {section.title}
                            </CardTitle>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {section.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {section.items.map((item, _index) => (
                            <div
                              key={item.id}
                              className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0 dark:border-slate-700"
                            >
                              <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                                {item.description}
                              </p>

                              {item.warning && (
                                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                    <div className="flex-1">
                                      <h5 className="font-medium text-amber-800 dark:text-amber-200">
                                        Warning
                                      </h5>
                                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                        {item.warning}
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/20"
                                        onClick={() =>
                                          toast.warning(item.warning)
                                        }
                                      >
                                        Show Warning Toast
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="mb-4">
                                <h4 className="mb-2 font-medium text-slate-900 dark:text-white">
                                  Step-by-step guide:
                                </h4>
                                <ol className="space-y-1">
                                  {item.steps.map((step, stepIndex) => (
                                    <li
                                      key={stepIndex}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600 dark:bg-blue-900/20">
                                        {stepIndex + 1}
                                      </span>
                                      <span className="text-sm text-slate-600 dark:text-slate-300">
                                        {step}
                                      </span>
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              {item.tips && (
                                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
                                  <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900 dark:text-blue-100">
                                    <Info className="h-4 w-4" />
                                    Pro Tips:
                                  </h4>
                                  <ul className="space-y-1">
                                    {item.tips.map((tip, tipIndex) => (
                                      <li
                                        key={tipIndex}
                                        className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200"
                                      >
                                        <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* Common Issues */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Common Issues & Solutions
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Quick fixes for frequent account-related problems
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {commonIssues.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                          <item.icon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                            {item.issue}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {item.solution}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Security Best Practices */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:border-green-800 dark:from-green-900/10 dark:to-blue-900/10">
                <CardContent className="p-8">
                  <div className="mb-6 text-center">
                    <div className="mb-4 inline-flex rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                      Security Best Practices
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                      Keep your account secure with these recommendations
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        title: 'Strong Password',
                        description:
                          'Use 12+ characters with mixed case, numbers, and symbols',
                        icon: Lock,
                      },
                      {
                        title: 'Enable 2FA',
                        description:
                          'Add two-factor authentication for extra security',
                        icon: Smartphone,
                      },
                      {
                        title: 'Regular Updates',
                        description:
                          'Keep your profile and security settings up to date',
                        icon: Activity,
                      },
                      {
                        title: 'Monitor Activity',
                        description:
                          'Check login activity regularly for suspicious access',
                        icon: Eye,
                      },
                      {
                        title: 'Secure Email',
                        description:
                          'Use a secure email address for your account',
                        icon: Mail,
                      },
                      {
                        title: 'Privacy Settings',
                        description:
                          'Review and adjust privacy settings as needed',
                        icon: Globe,
                      },
                    ].map((practice, index) => (
                      <div key={index} className="text-center">
                        <div className="mb-3 inline-flex rounded-lg bg-white p-3 dark:bg-slate-800">
                          <practice.icon className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                          {practice.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {practice.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Need More Help */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-center"
            >
              <Card className="border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                <CardContent className="p-8">
                  <HelpCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                    Need More Help?
                  </h2>
                  <p className="mx-auto mb-6 max-w-2xl text-slate-600 dark:text-slate-300">
                    If you can&apos;t find what you&apos;re looking for or need
                    personalized assistance with your account settings, our
                    support team is here to help.
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button size="lg" asChild>
                      <Link href="/help">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Help Center
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="mailto:hello@teamcast.ai">
                        <Mail className="mr-2 h-5 w-5" />
                        Contact Support
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
