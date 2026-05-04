'use client';

import { FC, useState, useMemo } from 'react';
import { Bell, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { IActivityLog, ActivityModuleEnum } from '@/lib/shared';
import {
  getActivityIcon,
  getActivityColor,
  getRelativeTime,
  ActivityModuleLabels,
  ActivityActionLabels,
} from '@/lib/models/activity';
import { getEntityUrl } from '@/lib/utils/activity-entity-url';

export type TimelineGroupBy = 'none' | 'date' | 'user';

interface TimelineProps {
  logs: IActivityLog[];
  showUserInfo?: boolean;
  /** Group entries by date (Today/Yesterday/This week) or by user */
  groupBy?: TimelineGroupBy;
  /** Base path for entity links (e.g. /app/support, /app/client) */
  basePathForEntityLinks?: string;
}

function getDateGroupLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This week';
  return format(date, 'MMMM d, yyyy');
}

export const Timeline: FC<TimelineProps> = ({
  logs,
  showUserInfo = true,
  groupBy = 'none',
  basePathForEntityLinks = '/app/support',
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    if (groupBy === 'none') return { '': logs };
    if (groupBy === 'date') {
      const map: Record<string, IActivityLog[]> = {};
      logs.forEach((log) => {
        const d = log.timestamp ? new Date(log.timestamp) : new Date();
        const key = getDateGroupLabel(d);
        if (!map[key]) map[key] = [];
        map[key].push(log);
      });
      return map;
    }
    if (groupBy === 'user') {
      const map: Record<string, IActivityLog[]> = {};
      logs.forEach((log) => {
        const key = log.userName || log.userId || 'Unknown';
        if (!map[key]) map[key] = [];
        map[key].push(log);
      });
      return map;
    }
    return { '': logs };
  }, [logs, groupBy]);

  const groupKeys = useMemo(() => {
    if (groupBy === 'date') {
      const order = ['Today', 'Yesterday', 'This week'];
      const keys = Object.keys(grouped);
      return keys.sort((a, b) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    return Object.keys(grouped);
  }, [groupBy, grouped]);

  if (logs.length === 0) {
    return (
      <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <div className="bg-muted-foreground/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <Bell className="text-muted-foreground h-7 w-7 opacity-60" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          No activity logs found
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Activity will appear here as actions are performed
        </p>
      </div>
    );
  }

  const getInitials = (log: IActivityLog) => {
    if (log.userName?.trim()) {
      return log.userName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (log.userType) return log.userType.substring(0, 1).toUpperCase();
    return 'U';
  };

  const getUserDisplay = (log: IActivityLog) => {
    if (log.userName?.trim() && log.userType) {
      return `${log.userName} • ${log.userType}`;
    }
    if (log.userName?.trim()) return log.userName;
    if (log.userType) return log.userType;
    return `User ID: ${log.userId.substring(0, 8)}...`;
  };

  const getModuleLabel = (module: string) =>
    ActivityModuleLabels[module as keyof typeof ActivityModuleLabels] ||
    module.charAt(0).toUpperCase() + module.slice(1).toLowerCase();

  const getActionLabel = (action: string) =>
    ActivityActionLabels[action as keyof typeof ActivityActionLabels] ||
    action
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

  const getAccentBorderColor = (module: string) => {
    const colorMap: Record<string, string> = {
      [ActivityModuleEnum.AUTH]: 'border-l-emerald-500',
      [ActivityModuleEnum.JOB]: 'border-l-blue-500',
      [ActivityModuleEnum.APPLICATION]: 'border-l-orange-500',
      [ActivityModuleEnum.CANDIDATE]: 'border-l-green-500',
      [ActivityModuleEnum.CLIENT]: 'border-l-purple-500',
      [ActivityModuleEnum.PARTNER]: 'border-l-indigo-500',
      [ActivityModuleEnum.ASSESSMENT]: 'border-l-pink-500',
      [ActivityModuleEnum.SYSTEM]: 'border-l-gray-500',
      [ActivityModuleEnum.SUBSCRIPTION]: 'border-l-cyan-500',
      [ActivityModuleEnum.NOTIFICATION]: 'border-l-teal-500',
    };
    return colorMap[module] ?? 'border-l-gray-400';
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderLogCard = (log: IActivityLog) => {
    const IconComponent = getActivityIcon(log.module, log.action);
    const timestampDate = log.timestamp ? new Date(log.timestamp) : null;
    const relativeTime = timestampDate ? getRelativeTime(timestampDate) : '';
    const entityUrl = getEntityUrl(
      log.entityType as string,
      log.entityId,
      basePathForEntityLinks
    );
    const hasMetadata =
      log.metadata &&
      typeof log.metadata === 'object' &&
      Object.keys(log.metadata).length > 0;
    const isExpanded = expandedIds.has(log.id);

    return (
      <div key={log.id} className="relative pl-12">
        {/* Icon circle */}
        <div
          className={cn(
            'border-background absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm',
            getActivityColor(log.module, 'default')
          )}
        >
          <IconComponent className="h-5 w-5" />
        </div>
        <div
          className={cn(
            'border-border bg-card dark:border-border dark:bg-card rounded-xl border py-4 pr-4 pl-4 shadow-sm transition-shadow hover:shadow-md',
            'border-l-4',
            getAccentBorderColor(log.module)
          )}
        >
          {/* User row */}
          {showUserInfo && log.userId && (
            <div className="mb-3 flex items-center gap-3">
              <Avatar className="border-background h-8 w-8 border-2">
                <AvatarFallback
                  className={cn(
                    'text-xs font-medium',
                    getActivityColor(log.module, 'default')
                  )}
                >
                  {getInitials(log)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-foreground truncate text-sm font-semibold">
                          {getUserDisplay(log)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">{getUserDisplay(log)}</p>
                        {log.userRole && (
                          <p className="text-muted-foreground text-xs">
                            Role: {log.userRole.replace(/_/g, ' ')}
                          </p>
                        )}
                        {log.userEmail && (
                          <p className="text-muted-foreground text-xs">
                            {log.userEmail}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1 text-xs">
                          User ID: {log.userId}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {log.userRole && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {log.userRole.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
                {(log.userCompanyName || log.userEmail) && (
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {[log.userCompanyName, log.userEmail]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                )}
                {log.impersonatedUserName && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Impersonated:{' '}
                    <span className="font-medium">
                      {log.impersonatedUserName}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Context: IP, device */}
          {(log.ipAddress || log.deviceLabel) && (
            <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-x-3 gap-y-0 text-xs">
              {log.ipAddress && <span>IP: {log.ipAddress}</span>}
              {log.deviceLabel && <span>{log.deviceLabel}</span>}
            </div>
          )}

          {/* Description */}
          <p className="text-foreground mb-3 text-sm leading-relaxed">
            {log.description}
          </p>

          {/* Entity link */}
          {(log.entityName || (entityUrl && log.entityId)) && (
            <div className="mb-3">
              {entityUrl ? (
                <Link
                  href={entityUrl}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline underline-offset-2 transition-colors"
                >
                  {log.entityName ||
                    `${String(log.entityType).replace(/_/g, ' ')} #${log.entityId?.slice(0, 8)}`}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-muted-foreground text-xs">
                  {log.entityName}
                </span>
              )}
            </div>
          )}

          {/* Badges + time */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  'font-medium',
                  getActivityColor(log.module, 'default')
                )}
              >
                {getModuleLabel(log.module)}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {getActionLabel(log.action)}
              </Badge>
              {log.entityType && !log.entityName && (
                <Badge variant="outline" className="font-normal">
                  {String(log.entityType).replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {relativeTime}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {timestampDate
                      ? format(timestampDate, 'EEEE, MMMM d, yyyy • h:mm a')
                      : '—'}
                  </p>
                  {log.entityId && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Entity ID: {log.entityId}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Expandable metadata */}
          {hasMetadata && (
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleExpanded(log.id)}
            >
              <CollapsibleTrigger className="text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1 text-xs transition-colors">
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                {isExpanded ? 'Hide' : 'Show'} details & metadata
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-muted/50 dark:bg-muted/30 border-border mt-2 rounded-lg border p-3 font-mono text-xs">
                  {log.metadata?.changes && (
                    <div className="mb-2">
                      <span className="text-muted-foreground font-sans font-medium">
                        Changed fields:
                      </span>{' '}
                      {Array.isArray(log.metadata.changes)
                        ? log.metadata.changes.join(', ')
                        : String(log.metadata.changes)}
                    </div>
                  )}
                  <pre className="overflow-x-auto break-words whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        className="from-primary/40 via-primary/20 absolute top-0 bottom-0 left-5 w-px bg-gradient-to-b to-transparent"
        aria-hidden
      />

      <div className="space-y-6">
        {groupKeys.map((groupKey) => (
          <div key={groupKey || 'all'}>
            {groupKey && (
              <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                {groupKey}
              </h3>
            )}
            <div className="space-y-4">
              {(grouped[groupKey] || []).map((log) => renderLogCard(log))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
