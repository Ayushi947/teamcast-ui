# Partner Dashboard - Role-Based Implementation

## Overview

The Partner Dashboard is a modern SaaS-style role-based dashboard built with Next.js 15, TypeScript, Tailwind CSS, ShadCN UI, and Framer Motion. It provides personalized dashboard experiences based on user roles within the Teamcast.ai partner organization.

## Features

### 🎯 Role-Based Access Control

- **Admin Dashboard**: Full organizational oversight with subscription management, team overview, and system alerts
- **HR Dashboard**: Candidate pipeline management, interview scheduling, and AI assessment tracking
- **Recruiter Dashboard**: Job request management, AI-powered candidate matching, and shortlist tracking
- **Accounts Dashboard**: Billing management, subscription overview, and financial metrics

### ✨ Design System

- **Consistent UI**: Uses ShadCN UI components throughout
- **Soft Neutral Backgrounds**: No white backgrounds, follows app theme
- **Flat Design**: Clean design without layered cards or multiple shadows
- **Responsive Layout**: Grid and Flex layouts for all screen sizes
- **Smooth Animations**: Framer Motion for loading and interaction animations

### 🔧 Technical Implementation

#### File Structure

```
dashboard/
├── page.tsx                    # Main dashboard page with role routing
├── components/
│   ├── dashboard-header.tsx    # Role-aware header component
│   ├── admin-dashboard.tsx     # Admin-specific dashboard
│   ├── hr-dashboard.tsx        # HR-specific dashboard
│   ├── recruiter-dashboard.tsx # Recruiter-specific dashboard
│   └── accounts-dashboard.tsx  # Accounts-specific dashboard
└── README.md                   # This documentation
```

#### Role Routing Logic

```typescript
const renderDashboard = () => {
  switch (userRole) {
    case UserRoleEnum.ADMIN:
      return <AdminDashboard />;
    case UserRoleEnum.HR:
      return <HRDashboard />;
    case UserRoleEnum.ACCOUNTS:
      return <AccountsDashboard />;
    case UserRoleEnum.RECRUITER:
      return <RecruiterDashboard />;
    default:
      return <HRDashboard />; // Default fallback
  }
};
```

## Dashboard Components

### Admin Dashboard

**Key Widgets:**

- Total Active Clients
- Active Job Posts
- Candidates Submitted
- Pending Interviews
- Subscription Status & Billing Summary
- Team Members Overview
- System Alerts & Notifications

### HR Dashboard

**Key Widgets:**

- Candidate Pipeline Summary (Active, In-Process, Selected, Rejected)
- Upcoming Interviews (Manual + AI)
- Pending Profile Approvals
- AI Assessment Completion Summary
- Pending Actions Table

### Recruiter Dashboard

**Key Widgets:**

- New Job Requests from Clients
- Assigned Candidates
- AI-Powered Candidate Recommendations
- Shortlist Summary with Success Metrics
- Quick Action Buttons

### Accounts Dashboard

**Key Widgets:**

- Subscription Plan Overview
- Monthly Billing Summary
- Recent Invoices
- Add-on Purchases Summary
- Usage Tracking & Limits

## Usage

### Basic Implementation

```typescript
import { useApp } from '@/lib/context/app-context';
import { UserRoleEnum } from '@teamcastai/commons';

const PartnerDashboardPage = () => {
  const { user } = useApp();
  const userRole = user?.role || UserRoleEnum.HR;

  // Dashboard automatically renders based on user role
  return (
    <div className="space-y-6 px-4 py-2">
      <DashboardHeader user={user} />
      {renderDashboard()}
    </div>
  );
};
```

### Adding New Widgets

1. Create the widget component in the appropriate dashboard file
2. Add mock data (replace with actual API calls)
3. Use ShadCN UI components for consistency
4. Follow the established design patterns

### Customizing for New Roles

1. Add the new role to `UserRoleEnum`
2. Create a new dashboard component file
3. Add the role case to the switch statement in `page.tsx`
4. Update the header component with role-specific information

## Dependencies

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **ShadCN UI**: Component library
- **Framer Motion**: Animations
- **@teamcastai/commons**: Shared types and enums
- **Lucide React**: Icons

## Performance Considerations

- **Code Splitting**: Each dashboard component is lazy-loaded based on role
- **Optimized Animations**: Framer Motion animations are lightweight
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Efficient Rendering**: Only the relevant dashboard component is rendered

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Charts and graphs using Recharts
- **Customizable Widgets**: User-configurable dashboard layouts
- **Export Functionality**: PDF/Excel export for reports
- **Dark/Light Mode**: Theme switching capability

## API Integration

Replace mock data with actual API calls:

```typescript
// Example: Replace mock data with real API calls
const { data: stats } = useQuery({
  queryKey: ['partner-stats'],
  queryFn: () => partnerService.getStats(),
});
```

## Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Proper focus indicators

## Testing

- **Unit Tests**: Component testing with Jest/React Testing Library
- **Integration Tests**: Role-based rendering tests
- **E2E Tests**: Full dashboard workflow testing
- **Accessibility Tests**: Screen reader and keyboard navigation tests
