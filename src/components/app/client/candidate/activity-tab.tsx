import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';
import {
  FileText,
  Brain,
  VideoIcon,
  Calendar,
  MessageSquare,
  User,
} from 'lucide-react';
import { IActivityLog } from '@/lib/shared';

interface ActivityTabProps {
  jobApplicationActivityLogs: IActivityLog[];
}

export const ActivityTab = ({
  jobApplicationActivityLogs,
}: ActivityTabProps) => {
  const getActivityIcon = (iconName: string) => {
    const icons = {
      FileText: FileText,
      Brain: Brain,
      Video: VideoIcon,
      Code: FileText,
      Calendar: Calendar,
      MessageSquare: MessageSquare,
      User: User,
    };
    const Icon = icons[iconName as keyof typeof icons] || Activity;
    return <Icon className="h-5 w-5 text-[#6e55cf]" />;
  };
  return (
    <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Activity className="h-5 w-5 text-[#6e55cf]" />
          Application Activity Log
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          Complete timeline of all activities for this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobApplicationActivityLogs &&
          jobApplicationActivityLogs?.length > 0 ? (
            jobApplicationActivityLogs?.map((log, index) => (
              <div
                key={log.id}
                className="flex items-start gap-4 rounded-lg border-l-4 border-l-[#6e55cf]/30 p-4 hover:bg-gray-50"
              >
                <div className="flex flex-col items-center">
                  <div className="rounded-full border border-[#6e55cf]/20 bg-[#6e55cf]/10 p-2">
                    {getActivityIcon(log.action)}
                  </div>
                  {index < (jobApplicationActivityLogs?.length || 0) - 1 && (
                    <div className="mt-3 h-8 w-px bg-gray-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">
                      {log.metadata?.title}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                      {formatDate(log.metadata?.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {log.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      by {log.metadata?.userName}
                    </span>
                    {log.description && (
                      <div className="flex gap-2">
                        {log.metadata?.score && (
                          <Badge className="bg-[#6e55cf] px-2 py-1 text-xs text-white">
                            Score: {log.metadata.score}%
                          </Badge>
                        )}
                        {log.metadata?.duration && (
                          <Badge
                            variant="outline"
                            className="border-[#6e55cf] px-2 py-1 text-xs text-[#6e55cf]"
                          >
                            {log.metadata?.duration}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
              No activity logs found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
