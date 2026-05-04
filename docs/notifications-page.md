# Notifications Page Documentation

## Overview

The notifications page provides a comprehensive interface for candidates to view, manage, and interact with all their notifications. It includes advanced filtering, search capabilities, bulk operations, and real-time updates.

## Features

### Core Functionality

- **Real-time Updates**: Notifications are updated in real-time using Convex subscriptions
- **Advanced Filtering**: Filter by type, status, and search through notification content
- **Bulk Operations**: Select multiple notifications for batch operations
- **Sorting**: Notifications are sorted by date (newest first)
- **Archive Support**: View archived notifications with toggle option
- **Responsive Design**: Optimized for all screen sizes

### Notification Management

- **Mark as Read**: Individual and bulk mark as read functionality
- **Archive**: Archive notifications to clean up the main view
- **Delete**: Permanently delete notifications (individual and bulk)
- **Action Buttons**: Navigate directly to relevant pages from notifications

### UI/UX Features

- **Priority Indicators**: Visual priority indicators with color coding
- **Type Icons**: Distinct icons for each notification type
- **Interactive Animations**: Smooth animations for better user experience
- **Hover Effects**: Enhanced interactivity with hover states
- **Loading States**: Proper loading indicators for all operations

## File Structure

```
src/app/(pages)/app/candidate/(layout)/notifications/
├── page.tsx                           # Main notifications page
└── components/
    └── notifications-demo.tsx         # Demo component (dev/qa only)
```

## Components

### Main Page (`page.tsx`)

The main notifications page component includes:

#### Key Features:

- **Header Section**: Navigation back to dashboard, title, and notification counts
- **Demo Component**: Testing component (development/QA environments only)
- **Filters Section**: Search, type filter, status filter, and archive toggle
- **Bulk Actions**: Multi-select operations for selected notifications
- **Notifications List**: Scrollable list of notification items with full CRUD operations

#### State Management:

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [typeFilter, setTypeFilter] = useState<string>('all');
const [statusFilter, setStatusFilter] = useState<string>('all');
const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
  []
);
const [showArchived, setShowArchived] = useState(false);
```

#### Hooks Used:

- `useNotifications`: Fetch notifications with real-time updates
- `useUnreadCount`: Get unread notification count
- `useMarkAsRead`: Mark individual notifications as read
- `useMarkAllAsRead`: Mark all notifications as read
- `useArchiveNotification`: Archive notifications
- `useDeleteNotification`: Delete individual notifications
- `useBulkDeleteNotifications`: Delete multiple notifications

### Notification Item Component

Each notification item includes:

- **Priority Indicator**: Color-coded left border
- **Selection Checkbox**: For bulk operations
- **Type Icon**: Visual representation of notification type
- **Content**: Title, message, metadata, and action button
- **Actions**: Mark as read, archive, delete options

### Demo Component (`notifications-demo.tsx`)

Testing component that includes:

- **8 Different Notification Types**: Covering all notification scenarios
- **Priority Levels**: Examples of all priority levels
- **Action URLs**: Proper navigation examples
- **Environment Restriction**: Only visible in dev/qa environments

## Notification Types and Icons

| Type          | Icon          | Color  | Use Case               |
| ------------- | ------------- | ------ | ---------------------- |
| `success`     | CheckCircle   | Green  | Successful operations  |
| `error`       | AlertCircle   | Red    | Error notifications    |
| `warning`     | AlertTriangle | Yellow | Warning messages       |
| `info`        | Info          | Blue   | Informational messages |
| `interview`   | Calendar      | Purple | Interview-related      |
| `application` | FileText      | Indigo | Application updates    |
| `assessment`  | Briefcase     | Orange | Assessment invitations |
| `profile`     | User          | Teal   | Profile-related        |
| `system`      | Zap           | Gray   | System announcements   |

## Priority Levels

| Priority | Color  | Badge Variant | Use Case               |
| -------- | ------ | ------------- | ---------------------- |
| `urgent` | Red    | Destructive   | Critical notifications |
| `high`   | Orange | Destructive   | High importance        |
| `medium` | Yellow | Secondary     | Standard notifications |
| `low`    | Green  | Secondary     | Low priority updates   |

## Filtering Options

### Search

- Searches through notification titles and messages
- Real-time filtering as user types
- Case-insensitive search

### Type Filter

- All Types (default)
- Individual notification types (info, success, warning, error, etc.)

### Status Filter

- All Status (default)
- Unread only
- Read only

### Archive Toggle

- Show/hide archived notifications
- Toggle button with eye icons

## Bulk Operations

### Selection

- Individual checkbox selection
- Select All/Deselect All functionality
- Visual indication of selected items

### Available Actions

- **Mark All as Read**: Available when unread notifications exist
- **Delete Selected**: Permanently delete selected notifications
- **Selection Counter**: Shows number of selected items

## Navigation

### Access Points

1. **Navbar Notification Panel**: "View All Notifications" button
2. **Direct URL**: `/app/candidate/notifications`
3. **Back Navigation**: Return to dashboard

### Action Navigation

- Notification action buttons navigate to relevant pages
- External link handling for action URLs
- Automatic dropdown closure on navigation

## Error Handling

### Toast Notifications

- Success messages for completed operations
- Error messages for failed operations
- Loading states during operations

### Fallback States

- Loading state while fetching notifications
- Empty state when no notifications exist
- Empty state when filters return no results
- User authentication check

## Responsive Design

### Breakpoints

- **Mobile**: Single column layout, stacked filters
- **Tablet**: Responsive grid, adjusted spacing
- **Desktop**: Full layout with optimal spacing

### Mobile Optimizations

- Touch-friendly buttons and interactions
- Optimized scrolling areas
- Responsive typography
- Proper spacing for mobile devices

## Performance Optimizations

### Real-time Updates

- Efficient Convex subscriptions
- Optimistic updates for better UX
- Proper cleanup of subscriptions

### Rendering

- Framer Motion animations for smooth interactions
- Efficient list rendering with keys
- Conditional rendering for performance

### Memory Management

- Proper cleanup of event listeners
- Efficient state management
- Optimized re-renders

## Development and Testing

### Demo Component

- Only visible in development and QA environments
- 8 pre-configured notification examples
- One-click notification creation for testing
- Proper error handling and feedback

### Environment Detection

```typescript
if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_ENV_NAME !== 'dev' &&
  process.env.NEXT_PUBLIC_ENV_NAME !== 'qa'
) {
  return null;
}
```

## Usage Examples

### Basic Usage

The notifications page is automatically accessible from the candidate layout and integrates with the existing notification system.

### Testing Notifications

In development environments, use the demo component to create test notifications:

1. Navigate to `/app/candidate/notifications`
2. Use the "Notification Demo" section
3. Click "Create" buttons to generate test notifications
4. Test filtering, searching, and bulk operations

### Custom Notification Creation

Use the notification service to create notifications programmatically:

```typescript
import { useCreateNotification } from '@/lib/services/notification.service';

const createNotification = useCreateNotification();

await createNotification({
  userId: user.id,
  userType: 'candidate',
  type: 'success',
  title: 'Profile Updated',
  message: 'Your profile has been successfully updated.',
  priority: 'medium',
  actionUrl: '/app/candidate/resume',
  actionText: 'View Profile',
});
```

## Integration with Existing System

### Navbar Integration

- Notification panel includes "View All Notifications" button
- Seamless navigation between panel and full page
- Consistent notification count display

### Service Integration

- Uses existing notification service hooks
- Consistent error handling and user feedback
- Real-time updates across all components

### Theme Integration

- Follows existing design system
- Consistent color schemes and typography
- Proper dark/light mode support

## Accessibility

### Keyboard Navigation

- Full keyboard accessibility
- Proper tab order
- Focus indicators

### Screen Readers

- Proper ARIA labels
- Semantic HTML structure
- Descriptive text for actions

### Visual Accessibility

- High contrast color schemes
- Clear visual hierarchy
- Proper text sizing

## Future Enhancements

### Potential Features

- **Notification Categories**: Group notifications by category
- **Custom Filters**: Save custom filter combinations
- **Notification Templates**: Pre-defined notification templates
- **Export Functionality**: Export notifications to PDF/CSV
- **Advanced Search**: Search by date range, priority, etc.
- **Notification Scheduling**: Schedule notifications for later

### Performance Improvements

- **Virtual Scrolling**: For large notification lists
- **Pagination**: Server-side pagination for better performance
- **Caching**: Enhanced caching strategies
- **Background Sync**: Offline notification management

## Troubleshooting

### Common Issues

1. **Notifications not loading**

   - Check Convex connection
   - Verify user authentication
   - Check network connectivity

2. **Real-time updates not working**

   - Verify Convex subscription setup
   - Check WebSocket connection
   - Ensure proper cleanup on component unmount

3. **Bulk operations failing**
   - Check notification IDs format
   - Verify user permissions
   - Check network requests in dev tools

### Debug Information

- Console logs for notification operations
- Network tab for API calls
- Convex dashboard for backend monitoring
