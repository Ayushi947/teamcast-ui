'use client';

import { useMemo } from 'react';
import {
  SharedSidebar,
  clientNavigationItems,
  type Section,
} from '@/components/app/common/layout';
import { UserRoleEnum, UserTypeEnum } from '@/lib/shared';
import { useApp } from '@/lib/context/app-context';

export function Sidebar() {
  const { user } = useApp();

  // Create dynamic navigation items based on user's isDeelEnabled status
  const navigationItems: Section[] = useMemo(() => {
    const items = [...clientNavigationItems];

    // Find the COMPANY section and add "Manage People" if Deel is enabled
    const companySectionIndex = items.findIndex(
      (section) => section.title === 'COMPANY'
    );

    // Show "Manage People" only when user.type === 'CLIENT' and user.isDeelEnabled === true
    if (
      companySectionIndex !== -1 &&
      user?.type === UserTypeEnum.CLIENT &&
      user?.isDeelEnabled === true
    ) {
      // Add "Manage People" menu item to COMPANY section
      items[companySectionIndex] = {
        ...items[companySectionIndex],
        items: [
          ...items[companySectionIndex].items,
          {
            name: 'Manage People',
            href: '/app/client/deel-access',
            icon: 'Users2',
            roles: [UserRoleEnum.ADMIN, UserRoleEnum.HR],
          },
        ],
      };
    }

    return items;
  }, [user?.type, user?.isDeelEnabled]);

  return <SharedSidebar userType="client" navigationItems={navigationItems} />;
}

export default Sidebar;
