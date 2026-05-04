# Teamcast Notification System

This document describes the comprehensive notification system implemented using Convex for real-time notifications across all user types in the Teamcast platform.

## Overview

The notification system provides:

- Real-time notifications using Convex
- Support for multiple user types (candidate, client, partner, support)
- Rich notification types with different priorities
- Interactive notification panel in all navbars
- Comprehensive CRUD operations
- Automatic cleanup of expired notifications

## Architecture

### Components

1. **Convex Backend**

   - `convex/schema.ts` - Database schema definition
   - `convex/notifications.ts` - CRUD functions and queries
   - `convex/_generated/` - Auto-generated TypeScript types

2. **Frontend Services**

   - `src/lib/services/notification.service.ts` - React hooks and helpers
   - `src/lib/convex.ts` - Convex client configuration
   - `src/lib/providers/convex-provider.tsx` - React provider

3. **UI Components**
   - `src/components/ui/notification-panel.tsx` - Main notification panel
   - `src/components/demo/notification-demo.tsx` - Demo/testing component

## Setup

### Environment Variables

Add the following to your `.env` file:

```bash
# Convex Configuration
NEXT_CONVEX_SELF_HOSTED_URL=https://your-convex-deployment.convex.cloud
CONVEX_SELF_HOSTED_ADMIN_KEY=your-admin-key
```

### Installation

The system is already integrated into the project. Convex is installed as a dependency and the provider is added to the root layout.

## Usage

### Creating Notifications

#### Using Helper Functions

```typescript
import {
  useCreateNotification,
  createNotificationHelpers,
} from '@/lib/services/notification.service';

const createNotification = useCreateNotification();
const helpers = createNotificationHelpers(createNotification);

// Interview notification
await helpers.interviewScheduled(userId, userType, {
  id: 'interview-123',
  jobTitle: 'Senior Developer',
  date: 'Tomorrow at 2:00 PM',
});

// Application notification
await helpers.applicationSubmitted(userId, userType, {
  id: 'app-456',
  jobTitle: 'Product Manager',
});

// Generic notifications
await helpers.success(
  userId,
  userType,
  'Success!',
  'Operation completed successfully.'
);
await helpers.error(userId, userType, 'Error', 'Something went wrong.');
await helpers.warning(
  userId,
  userType,
  'Warning',
  'Please complete your profile.'
);
await helpers.info(userId, userType, 'Info', 'New features available.');
```

#### Direct Creation

```typescript
await createNotification({
  userId: 'user-123',
  userType: 'candidate',
  title: 'Custom Notification',
  message: 'This is a custom notification message.',
  type: 'info',
  priority: 'medium',
  actionUrl: '/app/candidate/dashboard',
  actionText: 'View Dashboard',
  metadata: {
    entityId: 'entity-123',
    entityType: 'job',
    category: 'application',
    tags: ['urgent', 'follow-up'],
  },
  expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expire in 24 hours
});
```

### Reading Notifications

```typescript
import {
  useNotifications,
  useUnreadCount,
} from '@/lib/services/notification.service';

// Get notifications for a user
const notifications = useNotifications(userId, userType, {
  limit: 50,
  includeRead: false,
  includeArchived: false,
});

// Get unread count
const unreadCount = useUnreadCount(userId, userType);
```

### Managing Notifications

```typescript
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  useDeleteNotification,
} from '@/lib/services/notification.service';

const markAsRead = useMarkAsRead();
const markAllAsRead = useMarkAllAsRead();
const archiveNotification = useArchiveNotification();
const deleteNotification = useDeleteNotification();

// Mark single notification as read
await markAsRead({ notificationId: 'notification-id' });

// Mark all notifications as read for a user
await markAllAsRead({ userId, userType });

// Archive notification
await archiveNotification({ notificationId: 'notification-id' });

// Delete notification
await deleteNotification({ notificationId: 'notification-id' });
```

## Notification Types

### Core Types

- `info` - General information (blue)
- `success` - Success messages (green)
- `warning` - Warning messages (yellow)
- `error` - Error messages (red)

### Business Types

- `interview` - Interview-related notifications (purple)
- `application` - Application-related notifications (indigo)
- `assessment` - Assessment-related notifications (orange)
- `profile` - Profile-related notifications (teal)
- `system` - System notifications (gray)

### Priority Levels

- `low` - Low priority (green indicator)
- `medium` - Medium priority (yellow indicator)
- `high` - High priority (orange indicator)
- `urgent` - Urgent priority (red indicator)

## User Types

- `candidate` - Job seekers
- `client` - Companies/employers
- `partner` - Partner organizations
- `support` - Support team members

## Features

### Notification Panel

The notification panel is integrated into all navbar components and provides:

- Real-time notification display
- Unread count badge
- Filter between all/unread notifications
- Mark as read/archive/delete actions
- Action buttons for relevant notifications
- Responsive design for mobile and desktop

### Automatic Features

- **Expiration**: Notifications can have expiration dates
- **Cleanup**: Expired notifications are automatically filtered out
- **Sorting**: Notifications are sorted by priority and creation date
- **Real-time Updates**: Using Convex's real-time capabilities

## Integration Points

### Navbar Components

All navbar components have been updated to include the notification panel:

- `src/app/(pages)/app/candidate/(layout)/components/navbar.tsx`
- `src/app/(pages)/app/client/(layout)/components/navbar.tsx`
- `src/app/(pages)/app/partner/(layout)/components/navbar.tsx`
- `src/app/(pages)/app/support/(layout)/components/navbar.tsx`

### Provider Setup

The Convex provider is added to the root layout:

```typescript
// src/app/layout.tsx
<ConvexClientProvider>
  <QueryProvider>
    <AppProvider>
      {children}
    </AppProvider>
  </QueryProvider>
</ConvexClientProvider>
```

## Testing

### Demo Component

Use the `NotificationDemo` component to test the notification system:

```typescript
import { NotificationDemo } from '@/components/demo/notification-demo';

<NotificationDemo />
```

This component provides buttons to create different types of test notifications.

### Manual Testing

1. Log in as any user type
2. Use the demo component to create notifications
3. Check the notification panel in the navbar
4. Test all CRUD operations (read, mark as read, archive, delete)
5. Test filtering and real-time updates

## Database Schema

### Notifications Table

```typescript
{
  _id: Id<"notifications">,
  userId: string,
  userType: "candidate" | "client" | "partner" | "support",
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" | "interview" | "application" | "assessment" | "profile" | "system",
  isRead: boolean,
  isArchived: boolean,
  priority: "low" | "medium" | "high" | "urgent",
  actionUrl?: string,
  actionText?: string,
  metadata?: {
    entityId?: string,
    entityType?: string,
    category?: string,
    tags?: string[]
  },
  createdAt: number,
  updatedAt: number,
  expiresAt?: number
}
```

### Indexes

- `by_user` - Query by userId
- `by_user_type` - Query by userId and userType
- `by_user_unread` - Query unread notifications by user
- `by_user_type_unread` - Query unread notifications by user and type
- `by_created_at` - Query by creation date
- `by_priority` - Query by priority
- `by_type` - Query by notification type

## Performance Considerations

- Notifications are limited to 50 per query by default
- Expired notifications are automatically filtered
- Indexes are optimized for common query patterns
- Real-time updates are efficient with Convex's subscription model

## Best Practices

1. **Use Helper Functions**: Prefer using the helper functions for common notification types
2. **Set Expiration**: Set expiration dates for time-sensitive notifications
3. **Include Actions**: Provide actionUrl and actionText for actionable notifications
4. **Use Metadata**: Include relevant metadata for filtering and categorization
5. **Choose Appropriate Priority**: Use priority levels to ensure important notifications are visible
6. **Clean Descriptions**: Write clear, concise notification messages

## Troubleshooting

### Common Issues

1. **Notifications Not Appearing**

   - Check Convex connection
   - Verify environment variables
   - Check user ID and type

2. **Real-time Updates Not Working**

   - Ensure Convex provider is properly set up
   - Check network connectivity
   - Verify subscription is active

3. **TypeScript Errors**
   - Run `npx convex dev` to regenerate types
   - Check import paths
   - Verify Convex configuration

### Debugging

1. Check browser console for errors
2. Verify Convex dashboard for data
3. Test with demo component
4. Check network requests in dev tools

## Future Enhancements

Potential improvements to consider:

1. **Email Notifications**: Send email for high-priority notifications
2. **Push Notifications**: Browser push notifications for urgent items
3. **Notification Templates**: Configurable templates for different notification types
4. **Bulk Operations**: Enhanced bulk management features
5. **Analytics**: Notification engagement analytics
6. **Preferences**: User-specific notification preferences
