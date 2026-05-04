'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bell,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Calendar,
  FileText,
  User,
  Briefcase,
  Zap,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  useDeleteNotification,
  Notification,
  NotificationUserType,
  NotificationType,
  // NotificationPriority,
} from '@/lib/services/notification.service';
import { logger } from '@/lib/shared';
import { useRouter } from 'next/navigation';

interface NotificationPanelProps {
  userId: string;
  userType: NotificationUserType;
  className?: string;
}

const getNotificationIcon = (type: NotificationType) => {
  const iconColor = getNotificationIconBorder(type);

  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4" style={{ color: iconColor }} />;
    case 'error':
      return <AlertCircle className="h-4 w-4" style={{ color: iconColor }} />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" style={{ color: iconColor }} />;
    case 'info':
      return <Info className="h-4 w-4" style={{ color: iconColor }} />;
    case 'interview':
      return <Calendar className="h-4 w-4" style={{ color: iconColor }} />;
    case 'application':
      return <FileText className="h-4 w-4" style={{ color: iconColor }} />;
    case 'assessment':
      return <Briefcase className="h-4 w-4" style={{ color: iconColor }} />;
    case 'profile':
      return <User className="h-4 w-4" style={{ color: iconColor }} />;
    case 'system':
      return <Zap className="h-4 w-4" style={{ color: iconColor }} />;
    default:
      return <Bell className="h-4 w-4" style={{ color: iconColor }} />;
  }
};

const getNotificationIconBg = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'hsl(var(--success) / 0.1)';
    case 'error':
      return 'hsl(var(--destructive) / 0.1)';
    case 'warning':
      return 'hsl(var(--warning) / 0.1)';
    case 'info':
      return 'hsl(var(--primary) / 0.1)';
    case 'interview':
      return 'hsl(var(--secondary) / 0.1)';
    case 'application':
      return 'hsl(var(--accent) / 0.1)';
    case 'assessment':
      return 'hsl(var(--muted) / 0.1)';
    case 'profile':
      return 'hsl(var(--success) / 0.1)';
    case 'system':
      return 'hsl(var(--muted) / 0.2)';
    default:
      return 'hsl(var(--muted) / 0.2)';
  }
};

const getNotificationIconBorder = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'hsl(var(--success))';
    case 'error':
      return 'hsl(var(--destructive))';
    case 'warning':
      return 'hsl(var(--warning))';
    case 'info':
      return 'hsl(var(--primary))';
    case 'interview':
      return 'hsl(var(--secondary))';
    case 'application':
      return 'hsl(var(--accent))';
    case 'assessment':
      return 'hsl(var(--muted-foreground))';
    case 'profile':
      return 'hsl(var(--success))';
    case 'system':
      return 'hsl(var(--muted-foreground))';
    default:
      return 'hsl(var(--muted-foreground))';
  }
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (url: string) => void;
}> = ({ notification, onMarkAsRead, onArchive, onDelete, onAction }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'overflow-hidden rounded-xl shadow-sm transition-all duration-200',
        'bg-white dark:bg-gray-800',

        isHovered && 'shadow-md dark:shadow-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-stretch gap-2 p-3">
        {/* Icon */}
        <div
          className="flex flex-shrink-0 items-start justify-center self-stretch rounded-3xl pt-1"
          style={{
            width: '20px',
            background: getNotificationIconBg(notification.type),
            border: `0.5px solid ${getNotificationIconBorder(notification.type)}`,
            borderRadius: '16px',
            padding: '3px',
          }}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {/* Title */}
              <p
                className={cn(
                  'mb-1 text-sm font-medium',
                  notification.isRead
                    ? 'text-muted-foreground dark:text-gray-500'
                    : 'text-foreground dark:text-gray-200'
                )}
              >
                {notification.title}
              </p>

              {/* Message */}
              <p
                className={cn(
                  'mb-1 line-clamp-2 text-xs',
                  notification.isRead
                    ? 'text-muted-foreground/70 dark:text-gray-600'
                    : 'text-muted-foreground dark:text-gray-400'
                )}
              >
                {notification.message}
              </p>

              {/* Timestamp */}
              <div className="text-muted-foreground flex items-center text-xs dark:text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </div>

              {/* Action button */}
              {notification.actionUrl && notification.actionText && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary hover:text-primary/80 mt-1 h-auto p-0 text-xs dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => onAction?.(notification.actionUrl!)}
                >
                  {notification.actionText}
                </Button>
              )}
            </div>

            {/* Actions */}
            <div
              className={cn(
                'ml-2 flex items-center gap-1',
                'opacity-0 transition-opacity',
                isHovered && 'opacity-100'
              )}
            >
              <TooltipProvider>
                {!notification.isRead && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => onMarkAsRead(notification._id)}
                        aria-label={`Mark "${notification.title}" as read`}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark as read</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label={`More actions for "${notification.title}"`}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="dark:border-gray-700 dark:bg-gray-800"
                  >
                    <DropdownMenuLabel className="dark:text-gray-200">
                      Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:border-gray-700" />
                    {!notification.isRead && (
                      <DropdownMenuItem
                        onClick={() => onMarkAsRead(notification._id)}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Check className="mr-2 h-3 w-3" />
                        Mark as read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onArchive(notification._id)}
                      className="dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Archive className="mr-2 h-3 w-3" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="dark:border-gray-700" />
                    <DropdownMenuItem
                      onClick={() => onDelete(notification._id)}
                      className="text-destructive dark:text-red-400 dark:hover:bg-gray-700"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  userId,
  userType,
  className,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  // Convex hooks
  const notifications = useNotifications(userId, userType, {
    limit: 50,
    includeRead: filter === 'all',
    includeArchived: false,
  });

  const unreadCount = useUnreadCount(userId, userType);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const archiveNotification = useArchiveNotification();
  const deleteNotification = useDeleteNotification();

  // Handle actions
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      logger.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ userId, userType });
    } catch (error) {
      logger.error(error);
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await archiveNotification({ notificationId: notificationId as any });
    } catch (error) {
      logger.error(error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId: notificationId as any });
    } catch (error) {
      logger.error(error);
    }
  };

  const handleAction = (url: string) => {
    router.push(url);
    setIsOpen(false);
  };

  const filteredNotifications = notifications || [];

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'relative h-9 w-9 p-0 dark:hover:bg-gray-800',
              className
            )}
            aria-label={
              unreadCount && unreadCount > 0
                ? `Notifications: ${unreadCount} unread`
                : 'Notifications'
            }
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            <Bell className="h-5 w-5 dark:text-gray-300" />
            {(unreadCount ?? 0) > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                aria-hidden="true"
              >
                {unreadCount && unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-96 p-0 dark:border-gray-700 dark:bg-gray-900"
          align="end"
          forceMount
          asChild
          role="menu"
          aria-label="Notifications panel"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 dark:text-gray-300" />
                <span className="font-semibold dark:text-gray-200">
                  Notifications
                </span>
                {(unreadCount ?? 0) > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs dark:bg-gray-700 dark:text-gray-300"
                  >
                    {unreadCount} new
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {/* Filter toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 dark:hover:bg-gray-800"
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                  aria-label={`Currently showing ${filter} notifications. Click to show ${filter === 'all' ? 'unread' : 'all'} notifications`}
                >
                  <Filter className="h-4 w-4 dark:text-gray-400" />
                </Button>

                {/* Mark all as read */}
                {(unreadCount ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 dark:hover:bg-gray-800"
                        onClick={handleMarkAllAsRead}
                        aria-label={`Mark all ${unreadCount} notifications as read`}
                      >
                        <CheckCheck className="h-4 w-4 dark:text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark all as read</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Filter indicator */}
            <div className="text-muted-foreground border-b px-4 py-2 text-xs dark:border-gray-700 dark:text-gray-500">
              Showing {filter === 'all' ? 'all' : 'unread'} notifications
            </div>

            {/* Notifications list */}
            <ScrollArea className="h-96">
              <div className="p-2">
                <AnimatePresence>
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <Bell className="text-muted-foreground/50 mb-4 h-12 w-12 dark:text-gray-600" />
                      <p className="text-muted-foreground text-sm dark:text-gray-400">
                        {filter === 'unread'
                          ? 'No unread notifications'
                          : 'No notifications'}
                      </p>
                      <p className="text-muted-foreground/70 mt-1 text-xs dark:text-gray-500">
                        You&apos;re all caught up!
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {filteredNotifications.map(
                        (notification: Notification) => (
                          <NotificationItem
                            key={notification._id}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                            onAction={handleAction}
                          />
                        )
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default NotificationPanel;
