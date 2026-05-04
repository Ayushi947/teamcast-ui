'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bell,
  MoreVertical,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Calendar,
  FileText,
  User,
  Briefcase,
  Zap,
  Settings,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  // useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  useDeleteNotification,
  useBulkDeleteNotifications,
  Notification,
  NotificationType,
} from '@/lib/services/notification.service';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { useRouter } from 'next/navigation';

// Utility functions to format text to title case
// const toTitleCase = (str: string) => {
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// };

// Client-side date formatter to prevent hydration issues
const useDateFormatter = (date: Date) => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(formatDistanceToNow(date) + ' ago');
  }, [date]);

  return formattedDate;
};

// Component to handle date formatting on client side
const DateFormatter: React.FC<{ date: Date }> = ({ date }) => {
  const formattedDate = useDateFormatter(date);
  return <span>{formattedDate || 'Loading...'}</span>;
};

const getNotificationIcon = (type: NotificationType) => {
  const iconColor = getNotificationIconBorder(type);

  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5" style={{ color: iconColor }} />;
    case 'error':
      return <AlertCircle className="h-5 w-5" style={{ color: iconColor }} />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5" style={{ color: iconColor }} />;
    case 'info':
      return <Info className="h-5 w-5" style={{ color: iconColor }} />;
    case 'interview':
      return <Calendar className="h-5 w-5" style={{ color: iconColor }} />;
    case 'application':
      return <FileText className="h-5 w-5" style={{ color: iconColor }} />;
    case 'assessment':
      return <Briefcase className="h-5 w-5" style={{ color: iconColor }} />;
    case 'profile':
      return <User className="h-5 w-5" style={{ color: iconColor }} />;
    case 'system':
      return <Zap className="h-5 w-5" style={{ color: iconColor }} />;
    default:
      return <Bell className="h-5 w-5" style={{ color: iconColor }} />;
  }
};

const getNotificationIconBg = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return '#E4FFE7';
    case 'error':
      return '#FFE4E4';
    case 'warning':
      return '#FFF4E4';
    case 'info':
      return '#E4F0FF';
    case 'interview':
      return '#F4E4FF';
    case 'application':
      return '#E4E8FF';
    case 'assessment':
      return '#FFE8E4';
    case 'profile':
      return '#E4FFF4';
    case 'system':
      return '#F0F0F0';
    default:
      return '#F0F0F0';
  }
};

const getNotificationIconBorder = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return '#00CE17';
    case 'error':
      return '#CE0000';
    case 'warning':
      return '#CE7000';
    case 'info':
      return '#0070CE';
    case 'interview':
      return '#7000CE';
    case 'application':
      return '#4F46E5';
    case 'assessment':
      return '#CE4000';
    case 'profile':
      return '#00CE70';
    case 'system':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (url: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onArchive,
  onDelete,
  onAction,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex gap-3">
      {/* Selection checkbox - outside of card */}
      <div className="flex items-center pt-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(notification._id)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 hover:border-gray-400 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'max-w-full flex-1 overflow-hidden rounded-xl shadow-sm transition-all duration-200',
          'bg-white dark:bg-gray-800',
          !notification.isRead
            ? 'border-1 border-purple-500 dark:border-purple-400'
            : 'border border-gray-200 dark:border-gray-700',
          isHovered && 'shadow-md dark:shadow-lg'
          // isSelected && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex items-stretch gap-3 p-4">
          {/* Icon */}
          <div
            className="flex flex-shrink-0 items-start justify-center self-stretch rounded-3xl pt-2"
            style={{
              width: '28px',
              background: getNotificationIconBg(notification.type),
              border: `0.5px solid ${getNotificationIconBorder(notification.type)}`,
              borderRadius: '24px',
              padding: '4px',
            }}
          >
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                {/* Header with title and timestamp */}
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </h3>
                  <span className="ml-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    <DateFormatter date={new Date(notification.createdAt)} />
                  </span>
                </div>

                {/* Description */}
                <p className="mb-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {notification.message}
                </p>

                {/* Action link */}
                {notification.actionUrl && notification.actionText && (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onAction?.(notification.actionUrl!);
                    }}
                    className="cursor-pointer text-sm font-medium text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {notification.actionText}
                  </a>
                )}
              </div>

              {/* Actions menu - positioned in top right */}
              <div
                className={cn(
                  'ml-4 flex items-center gap-1',
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
                          className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-700/50"
                          onClick={() => onMarkAsRead(notification._id)}
                        >
                          <Check className="h-4 w-4" />
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
                        className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-700/50"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {!notification.isRead && (
                        <DropdownMenuItem
                          onClick={() => onMarkAsRead(notification._id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onArchive(notification._id)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(notification._id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
    </div>
  );
};

export default function CandidateNotificationsPage() {
  const { user } = useApp();
  const router = useRouter();
  const [searchQuery, _setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  // All hooks must be called before any conditional returns
  const notifications = useNotifications(user?.id || '', 'candidate', {
    includeRead: true,
    includeArchived: false,
    limit: 100, // Increase limit to get more notifications
  });

  // const unreadCount = useUnreadCount(user?.id || '', 'candidate');
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const archiveNotification = useArchiveNotification();
  const deleteNotification = useDeleteNotification();
  const bulkDeleteNotifications = useBulkDeleteNotifications();

  // Check for loading and error states
  const isLoading = notifications === undefined;
  const hasError = notifications === null;

  // // Conditional returns after all hooks
  // if (!user) {
  //   return (
  //     <div className="flex items-center justify-center py-8">
  //       <p className="text-muted-foreground">
  //         Please log in to view notifications.
  //       </p>
  //     </div>
  //   );
  // }

  // Handle errors
  if (hasError) {
    return (
      <div className="space-y-6 px-4">
        <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-4 dark:border-red-900/20 dark:bg-red-900/10 dark:text-red-400">
          <h2 className="mb-2 text-lg font-semibold">
            Error Loading Notifications
          </h2>
          <p>
            There was a problem loading your notifications. Please try
            refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  // Filter notifications
  const filteredNotifications = (notifications || [])
    .filter((notification: Notification) => {
      // User filter - ensure we only show notifications for the current user
      return (
        notification.userId === user?.id &&
        notification.userType === 'candidate'
      );
    })
    .filter((notification: Notification) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((notification: Notification) => {
      // Type filter
      if (typeFilter !== 'all') {
        return notification.type === typeFilter;
      }
      return true;
    })
    .filter((notification: Notification) => {
      // Status filter
      if (statusFilter === 'unread') {
        return !notification.isRead;
      }
      if (statusFilter === 'read') {
        return notification.isRead;
      }
      return true;
    })
    .sort((a: Notification, b: Notification) => {
      // Sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Handlers
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to mark notification as read'
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead({ userId: user.id, userType: 'candidate' });
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to mark all notifications as read'
      );
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      // Mark each selected notification as read
      await Promise.all(
        selectedNotifications.map((notificationId) =>
          markAsRead({ notificationId: notificationId as any })
        )
      );
      setSelectedNotifications([]);
      toast.success(
        `${selectedNotifications.length} notifications marked as read`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to mark selected notifications as read'
      );
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await archiveNotification({ notificationId: notificationId as any });
      toast.success('Notification archived');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to archive notification'
      );
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId: notificationId as any });
      toast.success('Notification deleted');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete notification'
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await bulkDeleteNotifications({
        notificationIds: selectedNotifications as any,
      });
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notifications deleted`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete notifications'
      );
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(
        filteredNotifications.map((n: Notification) => n._id)
      );
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  const handleAction = (url: string) => {
    router.push(url);
  };

  const handleSettingsClick = () => {
    if (user?.type) {
      router.push(`/app/${user.type.toLowerCase()}/settings`);
    }
  };

  return (
    <div className="min-h-screen space-y-6 px-4">
      {/* Header Section - Matching dashboard style */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight dark:text-gray-100">
              Notifications
            </h1>
            <p className="text-muted-foreground text-sm dark:text-gray-400">
              Manage your notifications and stay updated with important
              information
            </p>
          </div>
          {/* Filters moved to top right */}
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 dark:border-gray-700 dark:bg-gray-800">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="dark:border-gray-700 dark:bg-gray-800">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab Navigation with CustomTabs and Action Buttons */}
        <div className="flex items-center justify-between">
          <CustomTabs
            tabs={[
              {
                key: 'all',
                label: `All (${(notifications || []).length})`,
              },
              {
                key: 'read',
                label: `Read (${(notifications || []).filter((n) => n.isRead).length})`,
              },
              {
                key: 'unread',
                label: `Unread (${(notifications || []).filter((n) => !n.isRead).length})`,
              },
            ]}
            activeTab={statusFilter}
            onTabChange={setStatusFilter}
            className="dark:bg-gray-800"
          />

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={
                (notifications || []).filter((n) => !n.isRead).length === 0
              }
              className="dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={handleSettingsClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm font-medium dark:text-gray-400">
                  {selectedNotifications.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="dark:border-gray-700 dark:bg-gray-800"
                >
                  {selectedNotifications.length === filteredNotifications.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsRead}
                  disabled={selectedNotifications.length === 0}
                  className="dark:border-gray-700 dark:bg-gray-800"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark Selected as Read
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedNotifications.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="bg-muted border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent dark:border-blue-400 dark:bg-gray-700" />
            <p className="text-muted-foreground text-sm dark:text-gray-400">
              Loading notifications...
            </p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Bell className="text-muted-foreground/30 mb-6 h-16 w-16 dark:text-gray-600" />
          <h3 className="text-foreground mb-2 text-lg font-semibold dark:text-gray-200">
            {typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No notifications match your filters'
              : 'No notifications yet'}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md text-center text-sm dark:text-gray-400">
            {typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filters to see more results.'
              : 'You&apos;ll receive notifications here for important updates about your applications, interviews, and account activities.'}
          </p>
          {(typeFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="dark:border-gray-700 dark:bg-gray-800"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.map((notification: Notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                isSelected={selectedNotifications.includes(notification._id)}
                onSelect={handleSelectNotification}
                onMarkAsRead={handleMarkAsRead}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onAction={handleAction}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
