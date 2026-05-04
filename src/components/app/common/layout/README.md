# Shared Layout Components

This directory contains reusable layout components that can be used across all modules (client, candidate, partner, support) in the Teamcast application.

## Components

### SharedNavbar

A unified navbar component that provides consistent navigation experience across all modules.

**Props:**

- `userType`: `'client' | 'candidate' | 'partner' | 'support'` - Determines the user type for proper routing and configuration
- `showGreeting?`: `boolean` - Whether to show the greeting message (default: `true`)
- `showCollapseButton?`: `boolean` - Whether to show the sidebar collapse/expand button (default: `true`)
- `className?`: `string` - Additional CSS classes

**Features:**

- Automatic routing based on user type
- Theme toggle
- Notifications panel
- User profile dropdown with proper links
- Mobile responsive design
- Sidebar collapse/expand functionality

**Usage:**

```tsx
import { SharedNavbar } from '@/components/app/common/layout';

export function Navbar() {
  return <SharedNavbar userType="client" />;
}
```

### SharedSidebar

A flexible sidebar component that accepts navigation configuration and handles user authentication.

**Props:**

- `userType`: `'client' | 'candidate' | 'partner' | 'support'` - Determines the user type for proper logout routing
- `navigationItems`: `Section[]` - Array of navigation sections and items
- `className?`: `string` - Additional CSS classes

**Features:**

- Role-based navigation filtering
- Collapsible/expandable design
- Mobile overlay support
- User profile section with logout functionality
- Help center integration
- Smooth animations

**Usage:**

```tsx
import {
  SharedSidebar,
  clientNavigationItems,
} from '@/components/app/common/layout';

export function Sidebar() {
  return (
    <SharedSidebar userType="client" navigationItems={clientNavigationItems} />
  );
}
```

### Navigation Configurations

Pre-built navigation configurations for each module:

- `clientNavigationItems` - Navigation for client module
- `candidateNavigationItems` - Navigation for candidate module
- `partnerNavigationItems` - Navigation for partner module
- `supportNavigationItems` - Navigation for support module

**Types:**

```tsx
type MenuItem = {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRoleEnum[];
};

type Section = {
  title: string;
  items: MenuItem[];
  roles?: UserRoleEnum[];
};
```

## Examples

### Basic Implementation

**Client Module:**

```tsx
// navbar.tsx
import { SharedNavbar } from '@/components/app/common/layout';

export function Navbar() {
  return <SharedNavbar userType="client" />;
}

// sidebar.tsx
import {
  SharedSidebar,
  clientNavigationItems,
} from '@/components/app/common/layout';

export function Sidebar() {
  return (
    <SharedSidebar userType="client" navigationItems={clientNavigationItems} />
  );
}
```

### Dynamic Navigation (Candidate Module)

For modules that need dynamic navigation based on data:

```tsx
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SharedSidebar, type Section } from '@/components/app/common/layout';

export function Sidebar() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchProfile(),
  });

  const dynamicNavigation: Section[] = useMemo(() => {
    const baseItems = [
      // ... base navigation items
    ];

    if (profile?.isPublished) {
      baseItems.push({
        title: 'JOBS',
        items: [
          // ... job-related items
        ],
      });
    }

    return baseItems;
  }, [profile?.isPublished]);

  return (
    <SharedSidebar userType="candidate" navigationItems={dynamicNavigation} />
  );
}
```

### Custom Navigation Configuration

```tsx
import { SharedSidebar, type Section } from '@/components/app/common/layout';
import { UserRoleEnum } from '@/lib/shared';
import { Home, Settings } from 'lucide-react';

const customNavigationItems: Section[] = [
  {
    title: 'MAIN',
    items: [
      {
        name: 'Dashboard',
        href: '/app/custom/dashboard',
        icon: Home,
        roles: [UserRoleEnum.ADMIN],
      },
      {
        name: 'Settings',
        href: '/app/custom/settings',
        icon: Settings,
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.USER],
      },
    ],
  },
];

export function CustomSidebar() {
  return (
    <SharedSidebar userType="custom" navigationItems={customNavigationItems} />
  );
}
```

## Benefits

1. **Consistency**: Unified look and feel across all modules
2. **Maintainability**: Single source of truth for layout components
3. **Type Safety**: Full TypeScript support with proper types
4. **Flexibility**: Configurable navigation and behavior
5. **Accessibility**: Built-in accessibility features
6. **Performance**: Optimized with React memo and proper animations
7. **Responsive**: Mobile-first design with proper breakpoints

## Migration Guide

To migrate existing navbar/sidebar components:

1. Replace existing imports with shared components
2. Update component to use `SharedNavbar` and `SharedSidebar`
3. Configure navigation items using the provided types
4. Remove duplicate code and logic
5. Test functionality across different user roles

**Before:**

```tsx
// Long component with duplicate logic
export function Navbar() {
  // 200+ lines of component logic
}
```

**After:**

```tsx
// Clean, simple wrapper
import { SharedNavbar } from '@/components/app/common/layout';

export function Navbar() {
  return <SharedNavbar userType="client" />;
}
```
