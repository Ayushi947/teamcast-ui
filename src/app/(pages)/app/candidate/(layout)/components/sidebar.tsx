'use client';

import {
  SharedSidebar,
  candidateNavigationItems,
} from '@/components/app/common/layout';

export function Sidebar() {
  return (
    <SharedSidebar
      userType="candidate"
      navigationItems={candidateNavigationItems}
    />
  );
}

export default Sidebar;
