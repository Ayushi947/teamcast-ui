'use client';

import {
  SharedSidebar,
  partnerNavigationItems,
} from '@/components/app/common/layout';

export function Sidebar() {
  return (
    <SharedSidebar
      userType="partner"
      navigationItems={partnerNavigationItems}
    />
  );
}

export default Sidebar;
