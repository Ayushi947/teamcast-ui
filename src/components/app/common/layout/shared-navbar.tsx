'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useApp } from '@/lib/context/app-context';
import { useSidebar } from '@/lib/context/sidebar-context';
import { HelpCircle, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { TeamcastIcon } from '@/components/icons';
import { NotificationPanel } from '@/components/ui/notification-panel';

export type UserType = 'client' | 'candidate' | 'partner' | 'support';

interface SharedNavbarProps {
  userType: UserType;
  showGreeting?: boolean;
  showCollapseButton?: boolean;
  className?: string;
}

export function SharedNavbar({
  userType,
  showCollapseButton = true,
  className = '',
}: SharedNavbarProps) {
  const { user, isInitialized } = useApp();
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (!isInitialized) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <TooltipProvider>
      <header
        className={`sticky top-0 z-30 w-full bg-white dark:border-gray-800 dark:bg-gray-900 ${className}`}
      >
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left: Mobile menu button, logo, and greeting */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-9 w-9 p-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center md:hidden">
              <Link href="/" className="flex items-center">
                <TeamcastIcon className="h-6 w-auto" color="#6e55cf" />
              </Link>
            </div>

            {/* Collapse/Expand Button - Desktop only */}
            {showCollapseButton && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 hidden h-8 w-8 rounded-lg shadow-sm md:flex"
                    aria-label={
                      isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                    }
                  >
                    {isCollapsed ? (
                      <ChevronRight className="text-primary h-6 w-6" />
                    ) : (
                      <ChevronLeft className="text-primary h-6 w-6" />
                    )}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            )}
          </div>

          {/* Right: Actions */}
          <div className="ml-auto flex items-center gap-4">
            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle className="h-9 w-9" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Theme</p>
              </TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <NotificationPanel userId={user.id} userType={userType} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>

            {/* Help */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  asChild
                >
                  <Link href="/help">
                    <HelpCircle className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help & Support</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}

export default SharedNavbar;
