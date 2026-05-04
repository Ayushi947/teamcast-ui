'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from '@/lib/context/sidebar-context';
import { useApp } from '@/lib/context/app-context';
import { SharedNavbar } from './shared-navbar';
import { SharedSidebar } from './shared-sidebar';
import { Loader2 } from 'lucide-react';
import {
  clientNavigationItems,
  candidateNavigationItems,
  partnerNavigationItems,
  supportNavigationItems,
} from './navigation-configs';

type UserType = 'client' | 'candidate' | 'partner' | 'support';

interface SharedLayoutProps {
  children: ReactNode;
  userType: UserType;
}

const navigationItemsMap = {
  client: clientNavigationItems,
  candidate: candidateNavigationItems,
  partner: partnerNavigationItems,
  support: supportNavigationItems,
};

export function SharedLayout({ children, userType }: SharedLayoutProps) {
  const navigationItems = navigationItemsMap[userType];
  const { isInitialized } = useApp();

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Loading Teamcast...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="fixed inset-0 overflow-hidden bg-white dark:bg-gray-900">
        <div className="flex h-full w-full">
          <SharedSidebar
            userType={userType}
            navigationItems={navigationItems}
          />
          <div className="flex h-full flex-1 flex-col overflow-hidden bg-white dark:bg-gray-900">
            <SharedNavbar userType={userType} />
            <main className="bg-muted/80 border-border/50 relative flex-1 overflow-hidden rounded-tl-4xl border-t border-l">
              <div className="custom-scrollbar h-full overflow-y-auto">
                <div className="h-full p-8">{children}</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export type { UserType as SharedLayoutUserType };
