'use client';

import {
  SharedSidebar,
  supportNavigationItems,
} from '@/components/app/common/layout';

export function Sidebar() {
  return (
    <SharedSidebar
      userType="support"
      navigationItems={supportNavigationItems}
    />
  );
}

export default Sidebar;
