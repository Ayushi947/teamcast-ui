'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  User,
  Calendar,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Mail,
  Award,
  Briefcase,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ISupportJobApplication } from '@/lib/shared';

interface ActivityTabProps {
  applicationData: ISupportJobApplication;
  jobApplicationActivityLogs?: any[];
}

// Mock activity data - in a real implementation, this would come from an API
const mockActivityLogs = [
  {
    id: '1',
    action: 'Application Submitted',
    description: 'Candidate submitted application for the position',
    timestamp: new Date().toISOString(),
    user: 'System',
    type: 'application',
  },
  {
    id: '2',
    action: 'Status Updated',
    description: 'Application status changed to Reviewing',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: 'HR Manager',
    type: 'status',
  },
  {
    id: '3',
    action: 'AI Assessment Completed',
    description: 'AI assessment completed with 85% score',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'AI System',
    type: 'assessment',
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'application':
      return FileText;
    case 'status':
      return CheckCircle;
    case 'assessment':
      return Eye;
    case 'interview':
      return Calendar;
    case 'communication':
      return MessageSquare;
    case 'email':
      return Mail;
    case 'shortlist':
      return Award;
    case 'hire':
      return Briefcase;
    default:
      return Activity;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'application':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    case 'status':
      return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
    case 'assessment':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
    case 'interview':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
    case 'communication':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    case 'email':
      return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400';
    case 'shortlist':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'hire':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export function ActivityTab({
  applicationData,
  jobApplicationActivityLogs,
}: ActivityTabProps) {
  // Use real activity logs if available, otherwise use mock data
  const activityLogs =
    jobApplicationActivityLogs && jobApplicationActivityLogs.length > 0
      ? jobApplicationActivityLogs
      : mockActivityLogs;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Application Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLogs.length > 0 ? (
            <div className="space-y-4">
              {activityLogs.map((log) => {
                const ActivityIcon = getActivityIcon(log.type || 'activity');
                const iconColor = getActivityColor(log.type || 'activity');

                return (
                  <div key={log.id} className="flex items-start space-x-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${iconColor}`}
                    >
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action || log.title || 'Activity'}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(
                            new Date(log.timestamp || log.createdAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {log.description ||
                          log.message ||
                          'No description available'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {log.user || log.createdBy || 'System'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No Activity
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No activity has been recorded for this application yet.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Application Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Application Submitted
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(applicationData.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {applicationData.updatedAt &&
              applicationData.updatedAt !== applicationData.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Status Updated
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(
                        new Date(applicationData.updatedAt),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                </div>
              )}

            {/* Add more timeline items based on application status */}
            {applicationData.status === 'SHORTLISTED' && (
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                  <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Application Shortlisted
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Candidate moved to shortlist
                  </p>
                </div>
              </div>
            )}

            {applicationData.status === 'ASSESSING' && (
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                  <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Interview Completed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Candidate interviewed for the position
                  </p>
                </div>
              </div>
            )}

            {applicationData.status === 'OFFERED' && (
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Offer Extended
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Job offer sent to candidate
                  </p>
                </div>
              </div>
            )}

            {applicationData.status === 'ACCEPTED' && (
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Application Accepted
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Candidate accepted the offer
                  </p>
                </div>
              </div>
            )}

            {applicationData.status === 'REJECTED' && (
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Application Rejected
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Application was not selected
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
