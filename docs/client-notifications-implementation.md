# Client Notifications Implementation

This document outlines the comprehensive notification system implemented for the Teamcast client modules using Convex real-time notifications.

## Overview

The notification system provides real-time updates to clients for various actions and events across different modules including subscription management, settings, profile updates, interviews, candidate applications, and recruiter activities.

## Architecture

### 1. Convex Backend (`convex/notifications.ts`)

- **Notification Types**: info, success, warning, error, interview, application, assessment, profile, system
- **User Types**: client, candidate, partner, support
- **Priorities**: low, medium, high, urgent
- **Metadata Support**: entityId, entityType, category, tags
- **Expiration**: Configurable expiration times for time-sensitive notifications

### 2. Frontend Service (`src/lib/services/notification.service.ts`)

- **Hooks**: useNotifications, useUnreadCount, useCreateNotification, etc.
- **Helper Functions**: Pre-built notification creators for common scenarios
- **Type Safety**: Full TypeScript support with proper interfaces

### 3. Client-Specific Hook (`src/lib/hooks/use-client-notifications.ts`)

- **Specialized Helpers**: Client-specific notification functions
- **Context-Aware**: Automatically uses 'client' user type
- **Modular Design**: Organized by feature area

## Implementation by Module

### 1. Subscription Module (`/app/client/subscription`)

**Notifications Added:**

- ✅ Subscription upgrade/downgrade
- ✅ Payment method addition
- ✅ Subscription cancellation
- ✅ Payment failures

**Key Features:**

```typescript
// Example usage
clientNotifications.subscriptionUpgraded(userId, packageName, price);
clientNotifications.paymentMethodAdded(userId, cardType);
clientNotifications.subscriptionCancelled(userId, endDate);
```

### 2. Settings Module (`/app/client/settings`)

**Notifications Added:**

- ✅ Settings updates
- ✅ Notification preference changes

**Key Features:**

```typescript
// Example usage
clientNotifications.settingsUpdated(userId, settingType);
clientNotifications.notificationPreferencesChanged(userId, enabled);
```

### 3. Profile Module (`/app/client/profile`)

**Notifications Added:**

- ✅ Profile section updates
- ✅ Profile completion reminders

**Key Features:**

```typescript
// Example usage
clientNotifications.profileUpdated(userId, sectionName);
clientNotifications.profileIncomplete(userId, completionPercentage);
```

### 4. Interviews Module (`/app/client/interviews`)

**Notifications Added:**

- ✅ Interview scheduling
- ✅ Interview reminders
- ✅ Interview completion
- ✅ Interview cancellation

**Key Features:**

```typescript
// Example usage
clientNotifications.interviewScheduled(userId, candidateName, jobTitle, date);
clientNotifications.interviewReminder(
  userId,
  candidateName,
  jobTitle,
  timeUntil
);
```

### 5. Candidates Module (`/app/client/candidates`)

**Notifications Added:**

- ✅ New applications
- ✅ Application status changes

**Key Features:**

```typescript
// Example usage
clientNotifications.newApplication(userId, candidateName, jobTitle);
clientNotifications.applicationStatusChanged(
  userId,
  candidateName,
  jobTitle,
  status
);
```

### 6. Recruiter Module (`/app/client/recruiter`)

**Notifications Added:**

- ✅ Job posting success
- ✅ Job expiration warnings
- ✅ New candidate discoveries

**Key Features:**

```typescript
// Example usage
clientNotifications.jobPosted(userId, jobTitle);
clientNotifications.jobExpiring(userId, jobTitle, daysLeft);
clientNotifications.candidateFound(userId, candidateCount, jobTitle);
```

## Notification Panel Integration

The notification system is integrated into the client layout through the `NotificationPanel` component in the shared navbar:

```typescript
// src/components/app/common/layout/shared-navbar.tsx
<NotificationPanel userId={user.id} userType={userType} />
```

**Features:**

- Real-time notification updates
- Unread count badge
- Mark as read functionality
- Archive/delete options
- Action buttons for direct navigation
- Priority-based visual indicators

## Notification Types and Use Cases

### 1. Subscription Notifications

- **Upgrade/Downgrade**: When subscription plan changes
- **Payment Issues**: Failed payments, expired cards
- **Cancellation**: Subscription termination with end date

### 2. Settings Notifications

- **Preferences**: Changes to notification settings
- **Privacy**: Updates to privacy and data collection settings
- **Integrations**: ATS and calendar integration changes

### 3. Profile Notifications

- **Updates**: When profile sections are modified
- **Completion**: Reminders for incomplete profiles
- **Approval**: Profile approval status changes

### 4. Interview Notifications

- **Scheduling**: New interview appointments
- **Reminders**: Pre-interview notifications
- **Status Changes**: Interview completion or cancellation

### 5. Application Notifications

- **New Applications**: When candidates apply for jobs
- **Status Updates**: Application progress changes
- **Review Actions**: When applications are reviewed

### 6. Recruiter Notifications

- **Job Management**: Job posting success and expiration
- **Candidate Discovery**: New matching candidates found
- **System Updates**: Platform maintenance and updates

## Priority Levels

### Urgent (Red)

- Payment failures
- Interview reminders (within 1 hour)
- System critical issues

### High (Orange)

- Subscription changes
- Interview scheduling
- New applications
- Job expiration warnings

### Medium (Yellow)

- Settings updates
- Profile changes
- Job posting success
- Application status changes

### Low (Green)

- Profile completion reminders
- System maintenance notices
- General information updates

## Metadata and Categorization

Each notification includes rich metadata for better organization:

```typescript
metadata: {
  entityId: "job-123",
  entityType: "job",
  category: "posting",
  tags: ["job", "posted"]
}
```

## Expiration and Cleanup

- **Time-sensitive notifications**: Auto-expire after 24 hours
- **System maintenance**: Expire after maintenance window
- **Automatic cleanup**: Convex function removes expired notifications

## Best Practices

### 1. User Experience

- Use appropriate priority levels
- Provide clear action buttons
- Include relevant context in messages
- Respect user notification preferences

### 2. Performance

- Batch notifications when possible
- Use appropriate expiration times
- Clean up old notifications regularly

### 3. Security

- Validate user permissions before sending
- Sanitize notification content
- Use proper user type validation

## Testing

### Manual Testing Checklist

- [ ] Subscription notifications trigger correctly
- [ ] Settings changes generate appropriate notifications
- [ ] Profile updates show in notification panel
- [ ] Interview notifications work with real scheduling
- [ ] Application status changes notify properly
- [ ] Job posting notifications appear after creation
- [ ] Notification panel displays correctly
- [ ] Mark as read functionality works
- [ ] Action buttons navigate to correct pages

### Automated Testing

- Unit tests for notification helpers
- Integration tests for Convex functions
- E2E tests for notification workflows

## Future Enhancements

### Planned Features

1. **Email Notifications**: Send notifications via email
2. **Push Notifications**: Browser push notifications
3. **Notification Templates**: Customizable notification messages
4. **Bulk Actions**: Mark multiple notifications as read
5. **Notification History**: Archive and search past notifications
6. **Custom Filters**: Filter notifications by type, priority, date
7. **Notification Analytics**: Track notification engagement

### Technical Improvements

1. **Real-time Updates**: WebSocket integration for instant updates
2. **Offline Support**: Queue notifications when offline
3. **Performance Optimization**: Lazy loading and pagination
4. **Accessibility**: Screen reader support and keyboard navigation

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check user authentication and permissions
2. **Wrong user type**: Ensure correct userType is passed
3. **Missing metadata**: Verify all required fields are provided
4. **Expired notifications**: Check expiration time settings

### Debug Tools

- Convex dashboard for notification inspection
- Browser console for frontend debugging
- Network tab for API call verification

## Conclusion

The client notification system provides a comprehensive, real-time communication platform that enhances user engagement and keeps clients informed about important events and actions across all modules. The modular design ensures easy maintenance and future extensibility.
