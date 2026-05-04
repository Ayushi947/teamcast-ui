'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings2, Bell, Shield, AlertTriangle } from 'lucide-react';
import { ISupportCandidate } from '@/lib/shared';
import { CandidateStatusEnum } from '@/lib/shared';
import { enumToReadableText } from '@/lib/utils';

interface SettingsTabProps {
  candidate: ISupportCandidate;
}

const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

export function SettingsTab({ candidate }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Account Settings */}
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Settings2 className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Account Settings
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Manage candidate account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    Profile Visibility
                  </h3>
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Public Profile
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Profile visible to employers
                      </p>
                    </div>
                    <Badge
                      className={`${
                        candidate.status === 'ONBOARDED'
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      } text-white`}
                    >
                      {candidate.status === 'ONBOARDED' ? 'Visible' : 'Hidden'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    Job Search Status
                  </h3>
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Current Status
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Job seeking preference
                      </p>
                    </div>
                    <Badge className="bg-[#6e55cf] text-white">
                      {enumToReadableText(
                        candidate.jobSearchStatus || 'UNKNOWN'
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded border border-gray-100 p-2 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Email
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.email}
                      </span>
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center justify-between rounded border border-gray-100 p-2 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Phone
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {candidate.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Bell className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Email and notification settings for this candidate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Job Alerts
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Receive notifications about new job opportunities
                  </p>
                </div>
                <Badge className="bg-green-500 text-white">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Application Updates
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Get notified about application status changes
                  </p>
                </div>
                <Badge className="bg-green-500 text-white">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Assessment Reminders
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Reminders for pending assessments
                  </p>
                </div>
                <Badge className="bg-green-500 text-white">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Shield className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Privacy & Security
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Privacy settings and data management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Data Privacy
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded border border-gray-100 p-2 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Profile Created
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(candidate.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-gray-100 p-2 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(candidate.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Account Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded border border-gray-100 p-2 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Account Type
                    </span>
                    <Badge className="bg-blue-500 text-white">Candidate</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded border border-gray-100 p-2 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <Badge
                      className={`${
                        candidate.status === CandidateStatusEnum.ONBOARDED
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      } text-white`}
                    >
                      {enumToReadableText(candidate.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidate Information */}
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Candidate Information
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Key candidate details and metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Profile Completion
                </h3>
                <p className="mb-3 text-xs text-blue-700 dark:text-blue-300">
                  Current profile completion status
                </p>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {candidate.completionPercentage || 0}% Complete
                </div>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <h3 className="mb-2 text-sm font-semibold text-green-900 dark:text-green-100">
                  Applications
                </h3>
                <p className="mb-3 text-xs text-green-700 dark:text-green-300">
                  Total job applications submitted
                </p>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {candidate.applications?.length || 0} Applications
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
