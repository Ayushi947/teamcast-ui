import { ISupportTicketAuditLog, UserTypeEnum } from '@/lib/shared';
import { formatDateAndTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface TimelineSectionProps {
  auditLogs: ISupportTicketAuditLog[];
  userType?: UserTypeEnum;
}

export function TimelineSection({ auditLogs, userType }: TimelineSectionProps) {
  const groupAuditLogsByDate = (logs: ISupportTicketAuditLog[]) => {
    const groups: { [key: string]: ISupportTicketAuditLog[] } = {};

    logs.forEach((log) => {
      const date = new Date(log.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return groups;
  };

  const getUserInitials = (userName: string) => {
    return userName
      .split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserAvatarColor = (userName: string) => {
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];

    const hash = userName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  // Filter out audit logs that don't have a description
  // Also filter out private audit logs for non-support users
  const filteredAuditLogs = auditLogs.filter((log) => {
    // Always filter out logs without description
    if (!log.metadata?.description || log.metadata.description.trim() === '') {
      return false;
    }

    // For non-support users, filter out private audit logs
    if (userType !== UserTypeEnum.SUPPORT && log.isPrivate === true) {
      return false;
    }

    return true;
  });

  if (filteredAuditLogs.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Activity className="h-8 w-8 opacity-50" />
        </div>
        <h3 className="mb-2 text-lg font-medium">No Activity Yet</h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          Actions taken on this ticket will appear here in chronological order.
        </p>
      </div>
    );
  }

  const groupedLogs = groupAuditLogsByDate(filteredAuditLogs);

  return (
    <div className="space-y-8">
      {Object.entries(groupedLogs).map(([dateKey, logs]) => (
        <div key={dateKey} className="space-y-4">
          {/* Date header */}
          <h3 className="text-foreground text-lg font-semibold">{dateKey}</h3>

          {/* Activity entries */}
          <div className="space-y-6">
            {logs.map((auditLog, index) => {
              const showAvatar =
                index === 0 ||
                (index > 0 &&
                  logs[index - 1].metadata?.user !== auditLog.metadata?.user);

              return (
                <div key={auditLog.id} className="relative">
                  {/* Horizontal separator line */}
                  {index > 0 && (
                    <div className="bg-border absolute -top-3 right-0 left-0 h-px" />
                  )}

                  <div className="flex gap-4">
                    {/* User Avatar */}
                    {showAvatar && auditLog.metadata?.user && (
                      <div className="flex-shrink-0">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white',
                            getUserAvatarColor(auditLog.metadata.user)
                          )}
                        >
                          {getUserInitials(auditLog.metadata.user)}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="space-y-2">
                        {/* Action description */}
                        <div className="text-foreground text-sm">
                          <span className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                            {auditLog.metadata?.user}
                          </span>

                          {auditLog.metadata?.description && (
                            <span className="text-foreground ml-1">
                              {auditLog.metadata.description}
                            </span>
                          )}
                          {auditLog.metadata?.field && (
                            <span className="ml-1 cursor-pointer text-blue-600 hover:text-blue-700">
                              {auditLog.metadata.field}
                            </span>
                          )}
                        </div>

                        {/* Additional metadata */}
                        {auditLog.metadata?.oldValue &&
                          auditLog.metadata?.newValue && (
                            <div className="text-muted-foreground text-sm">
                              Changed from{' '}
                              <span className="font-medium">
                                {auditLog.metadata.oldValue}
                              </span>{' '}
                              to{' '}
                              <span className="font-medium">
                                {auditLog.metadata.newValue}
                              </span>
                            </div>
                          )}

                        {/* Timestamp */}
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <div className="bg-muted flex h-3 w-3 items-center justify-center rounded-full">
                            <div className="bg-muted-foreground h-1.5 w-1.5 rounded-full" />
                          </div>
                          <time>{formatDateAndTime(auditLog.createdAt)}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
