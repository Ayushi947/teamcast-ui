'use client';

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamcastIcon, TeamcastShortIcon } from '@/components/icons';
import { useApp } from '@/lib/context/app-context';
import { useSidebar } from '@/lib/context/sidebar-context';
import { cn } from '@/lib/utils';
import { UserRoleEnum, UserTypeEnum } from '@/lib/shared';
import {
  ChevronRight,
  ChevronDown,
  LogOut,
  Headphones,
  LayoutGrid,
  Mail,
  Search,
  Calendar,
  Settings,
  Home,
  FileText,
  Briefcase,
  Users,
  Users2,
  Building2,
  Building,
  UserCog,
  MessageSquare,
  BarChart3,
  CreditCard,
  ChartBar,
  Heart,
  Blocks,
  Wrench,
  Contact,
  Flag,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  authService,
  supportAccountManagerAssignmentService,
} from '@/lib/services/services';
import { logger } from '@/lib/logger';
import { clearAuthData } from '@/lib/utils/auth-utils';
import { useImpersonation } from '@/lib/utils/impersonation.utils';
import { useQuery } from '@tanstack/react-query';

export type MenuItem = {
  name: string;
  href?: string;
  icon: string; // Changed to string to support serialization
  roles?: UserRoleEnum[];
  isBeta?: boolean; // New property to indicate beta status
  dataTour?: string; // New property for tour guide targeting
  shouldDisplay?: boolean;
};

export type Section = {
  title: string;
  items: MenuItem[];
  roles?: UserRoleEnum[];
  shouldDisplay?: boolean;
};

export type UserType = 'client' | 'candidate' | 'partner' | 'support';

interface SharedSidebarProps {
  userType: UserType;
  navigationItems: Section[];
  className?: string;
}

// Icon resolver function
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutGrid,
    Mail,
    Search,
    Calendar,
    Settings,
    Home,
    FileText,
    Briefcase,
    Users,
    Users2,
    Building2,
    UserCog,
    MessageSquare,
    BarChart3,
    Headphones,
    LogOut,
    CreditCard,
    Building,
    ChartBar,
    Heart,
    Blocks,
    Wrench,
    Contact,
    Flag,
  };

  return iconMap[iconName] || Home; // Default to Home if icon not found
};

//cursor bot comment
interface SidebarItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  isActive: boolean;
  handleClickCallback?: () => void;
  className?: string;
  isInDropdown?: boolean;
}

const SidebarItem = memo<SidebarItemProps>(
  ({
    item,
    isCollapsed,
    isActive,
    handleClickCallback,
    className,
    isInDropdown = false,
  }) => {
    const IconComponent = getIconComponent(item.icon);

    const handleClick = () => {
      if (item.name === 'Log Out' && handleClickCallback) {
        handleClickCallback();
      }
    };

    // Shared classes for both states
    const baseClasses =
      'relative flex items-center justify-center h-11 w-11 rounded-lg transition-all duration-200 group';
    const activeClasses = isActive
      ? 'bg-secondary font-extrabold text-primary'
      : 'text-muted-foreground hover:bg-secondary hover:text-accent-foreground';

    const BetaBadge = () => (
      <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
        beta
      </span>
    );

    if (isCollapsed) {
      return (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={cn(baseClasses, activeClasses, className)}
                      data-tour={item.dataTour}
                    >
                      <IconComponent className="h-5 w-5" />
                    </Link>
                  ) : (
                    <button
                      onClick={handleClick}
                      className={cn(baseClasses, activeClasses, className)}
                      data-tour={item.dataTour}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-sm font-medium">
                <span
                  className={cn(
                    'flex items-center truncate text-sm',
                    isActive ? 'font-extrabold' : 'font-medium'
                  )}
                >
                  {item.name}
                  {item.isBeta && <BetaBadge />}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }

    // Expanded state: add label, keep icon and container sizing consistent
    const expandedClasses = isInDropdown
      ? 'flex-row justify-start px-2 py-2 h-10 w-full'
      : 'flex-row justify-start px-3 py-2.5 w-full h-11';
    const content = (
      <div
        className={cn(
          baseClasses,
          expandedClasses,
          activeClasses,
          'relative gap-3',
          className
        )}
      >
        <IconComponent
          className={cn('flex-shrink-0', isInDropdown ? 'h-5 w-5' : 'h-5 w-5')}
        />
        <div className="flex items-center">
          <span
            className={cn(
              'truncate',
              isInDropdown ? 'text-sm' : 'text-sm',
              isActive ? 'font-extrabold' : 'font-medium'
            )}
          >
            {item.name.charAt(0).toUpperCase() +
              item.name.slice(1).toLowerCase()}
          </span>
          {item.isBeta && <BetaBadge />}
        </div>
        {item.name === 'Live Assessments' && (
          <span className="relative ml-12 flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
          </span>
        )}
      </div>
    );

    if (item.href) {
      return (
        <Link href={item.href} data-tour={item.dataTour}>
          {content}
        </Link>
      );
    }

    return (
      <button
        onClick={handleClick}
        className="w-full text-left"
        data-tour={item.dataTour}
      >
        {content}
      </button>
    );
  }
);

SidebarItem.displayName = 'SidebarItem';

interface SidebarSectionProps {
  section: Section;
  isCollapsed: boolean;
  pathname: string;
  userRole: UserRoleEnum;
  shouldDisplay?: boolean;
}

const SidebarSection = memo<SidebarSectionProps>(
  ({ section, isCollapsed, pathname, userRole, shouldDisplay = true }) => {
    const { user } = useApp();

    const filteredItems = section.items.filter((item) => {
      // Check role-based access
      const hasRoleAccess = !item.roles || item.roles.includes(userRole);

      // Check shouldDisplay flag
      const shouldDisplayItem = item.shouldDisplay !== false;

      // Special handling for "Manage People" - only show if isDeelEnabled is true and user is CLIENT ADMIN
      if (item.name === 'Manage People') {
        return (
          hasRoleAccess &&
          shouldDisplayItem &&
          user?.type === UserTypeEnum.CLIENT &&
          user?.isDeelEnabled === true &&
          user?.role === UserRoleEnum.ADMIN
        );
      }

      return hasRoleAccess && shouldDisplayItem;
    });

    if (filteredItems.length === 0 || shouldDisplay === false) return null;

    return (
      <div className="space-y-2">
        {!isCollapsed && section.title && section.title.trim() !== '' && (
          <h3 className="text-muted-foreground/60 text-xs font-semibold tracking-wider uppercase">
            {section.title}
          </h3>
        )}
        <div className="flex flex-col">
          {filteredItems.map((item, idx) => (
            <SidebarItem
              key={item.name}
              item={item}
              isCollapsed={isCollapsed}
              isActive={pathname === item.href}
              className={idx !== filteredItems.length - 1 ? 'mb-0.5' : ''}
            />
          ))}
        </div>
      </div>
    );
  }
);

SidebarSection.displayName = 'SidebarSection';

interface DropdownSidebarSectionProps {
  section: Section;
  isCollapsed: boolean;
  pathname: string;
  userRole: UserRoleEnum;
  shouldDisplay?: boolean;
}

const DropdownSidebarSection = memo<DropdownSidebarSectionProps>(
  ({ section, isCollapsed, pathname, userRole, shouldDisplay = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasBeenManuallyClosed, setHasBeenManuallyClosed] = useState(false);
    const { user } = useApp();

    const filteredItems = section.items.filter((item) => {
      // Check role-based access
      const hasRoleAccess = !item.roles || item.roles.includes(userRole);

      // Check shouldDisplay flag
      const shouldDisplayItem = item.shouldDisplay !== false;

      // Special handling for "Manage People" - only show if isDeelEnabled is true and user is CLIENT ADMIN
      if (item.name === 'Manage People') {
        return (
          hasRoleAccess &&
          shouldDisplayItem &&
          user?.type === UserTypeEnum.CLIENT &&
          user?.isDeelEnabled === true &&
          user?.role === UserRoleEnum.ADMIN
        );
      }

      return hasRoleAccess && shouldDisplayItem;
    });

    // Check if any item in this section is active
    const hasActiveItem = filteredItems.some((item) => pathname === item.href);

    // Auto-open dropdown if any item is active (but respect manual closing)
    React.useEffect(() => {
      if (hasActiveItem && !isOpen && !hasBeenManuallyClosed) {
        setIsOpen(true);
      }
    }, [hasActiveItem, isOpen, hasBeenManuallyClosed]);

    // Reset manual close state when pathname changes
    React.useEffect(() => {
      setHasBeenManuallyClosed(false);
    }, [pathname]);

    if (filteredItems.length === 0 || shouldDisplay === false) return null;

    const handleToggle = () => {
      const newState = !isOpen;
      setIsOpen(newState);

      // Track manual closing
      if (!newState) {
        setHasBeenManuallyClosed(true);
      }
    };

    if (isCollapsed) {
      // In collapsed state, show the section icon instead of first item icon
      const isActive = hasActiveItem;
      let IconComponent;

      if (section.title === 'COMMON') {
        IconComponent = Briefcase;
      } else {
        // Fallback to first item icon for other sections
        const firstItem = filteredItems[0];
        IconComponent = getIconComponent(firstItem.icon);
      }

      return (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <button
                    onClick={handleToggle}
                    className={cn(
                      'group relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-secondary text-primary font-extrabold'
                        : 'text-muted-foreground hover:bg-secondary hover:text-accent-foreground'
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-sm font-medium">
                <span className="flex items-center truncate text-sm font-medium">
                  {section.title.charAt(0) +
                    section.title.slice(1).toLowerCase()}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <button
          onClick={handleToggle}
          className={cn(
            'group relative flex h-11 w-full cursor-pointer items-center justify-start rounded-lg px-3 py-2.5 transition-all duration-200',
            hasActiveItem
              ? 'bg-secondary text-primary font-extrabold'
              : 'text-muted-foreground hover:bg-secondary hover:text-accent-foreground'
          )}
        >
          <div className="flex w-full items-center gap-3">
            <div className="flex flex-1 items-center gap-3">
              {section.title === 'COMMON' && (
                <Briefcase className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="font-base text-sm tracking-wider">
                {section.title.charAt(0) + section.title.slice(1).toLowerCase()}
              </span>
            </div>

            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen ? 'rotate-180' : ''
              )}
            />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pl-4">
                {filteredItems.map((item, idx) => (
                  <SidebarItem
                    key={item.name}
                    item={item}
                    isCollapsed={false}
                    isActive={pathname === item.href}
                    className={idx !== filteredItems.length - 1 ? 'mb-0.5' : ''}
                    isInDropdown={true}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

DropdownSidebarSection.displayName = 'DropdownSidebarSection';

export function SharedSidebar({
  userType,
  navigationItems,
  className = '',
}: SharedSidebarProps) {
  const { user, isInitialized } = useApp();
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const router = useRouter();
  const { isImpersonating } = useImpersonation();

  const { data: managerDetails } = useQuery({
    queryKey: ['managerDetails'],
    queryFn: () => supportAccountManagerAssignmentService.getManagerDetails(),
    enabled: user?.role == UserRoleEnum.RECRUITER,
  });

  const handleLogout = async () => {
    try {
      await authService.logout();

      clearAuthData();

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Now redirect to login page
      window.location.replace('/app/auth/login');
    } catch (error) {
      logger.error('Logout failed:', error);
      // Fallback: clear data and redirect
      clearAuthData();
      await new Promise((resolve) => setTimeout(resolve, 200));
      window.location.replace('/app/auth/login');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isInitialized) {
    return null;
  }

  if (!user) {
    return null;
  }

  const hasManager = managerDetails && managerDetails.id && managerDetails.name;

  // Filter navigation items based on manager assignment for recruiters
  const filteredNavigationItems = navigationItems
    .map((section) => {
      // Only apply filtering for recruiters who don't have a manager assigned
      if (
        section.title === 'RECRUITMENT' &&
        user.role === UserRoleEnum.RECRUITER &&
        user.type === UserTypeEnum.SUPPORT &&
        !hasManager // Use the hasManager check instead of just !managerDetails
      ) {
        // Hide sourcing and invites for recruiters without managers
        const filteredItems = section.items.filter(
          (item) => item.name !== 'Sourcing' && item.name !== 'Invites'
        );

        return {
          ...section,
          items: filteredItems,
        };
      }
      return section;
    })
    .filter((section) => section.items.length > 0); // Remove empty sections

  const filteredNavigation = filteredNavigationItems
    .filter(
      (section) =>
        !section.roles || section.roles.includes(user.role as UserRoleEnum)
    )
    .filter((section) =>
      section.items.some(
        (item) => !item.roles || item.roles.includes(user.role as UserRoleEnum)
      )
    );

  // Check if manager is assigned (managerDetails exists and has required fields)

  return (
    <TooltipProvider>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          'fixed top-0 left-0 z-50 h-screen overflow-hidden bg-white dark:border-gray-800 dark:bg-gray-900',
          'md:relative md:translate-x-0',
          isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <Link href="/" className="flex items-center">
                  {isCollapsed ? (
                    <TeamcastShortIcon className="h-8 w-auto" color="#6e55cf" />
                  ) : (
                    <TeamcastIcon className="h-12 w-auto" color="#6e55cf" />
                  )}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar-thin flex-1 overflow-y-auto py-6">
            <div className={cn('space-y-2', isCollapsed ? 'px-2' : 'px-3')}>
              {filteredNavigation.map((section, index) => {
                // Determine if this section should be a dropdown based on title
                const isDropdownSection = ['COMMON'].includes(section.title);

                if (isDropdownSection) {
                  return (
                    <DropdownSidebarSection
                      key={section.title || `section-${index}`}
                      section={section}
                      isCollapsed={isCollapsed}
                      pathname={pathname}
                      userRole={user.role as UserRoleEnum}
                      shouldDisplay={section.shouldDisplay ?? true}
                    />
                  );
                }

                return (
                  <SidebarSection
                    key={section.title || `section-${index}`}
                    section={section}
                    isCollapsed={isCollapsed}
                    pathname={pathname}
                    userRole={user.role as UserRoleEnum}
                    shouldDisplay={section.shouldDisplay ?? true}
                  />
                );
              })}
            </div>
          </div>

          {/* User Section */}
          <div className="p-3">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* USER Section Title and Items */}
                <div className="space-y-3">
                  <h3 className="text-muted-foreground/60 mb-2 px-0 text-xs font-semibold tracking-wider uppercase">
                    USER
                  </h3>
                  <div className="space-y-1">
                    {!isImpersonating() && (
                      <button
                        onClick={handleLogout}
                        className="text-muted-foreground hover:bg-secondary hover:text-accent-foreground group relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate text-sm font-medium">
                          Log Out
                        </span>
                      </button>
                    )}
                    <Link
                      href="/help"
                      className="text-muted-foreground hover:bg-secondary hover:text-accent-foreground group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
                    >
                      <Headphones className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">
                        Help Center
                      </span>
                    </Link>
                    <Link
                      href={`/app/${userType}/settings`}
                      className="text-muted-foreground hover:bg-secondary hover:text-accent-foreground group relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
                    >
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">
                        Settings
                      </span>
                    </Link>
                  </div>
                </div>

                {/* User Profile */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    router.push(`/app/${userType}/user/profile`);
                  }}
                  className="hover:bg-accent border-border flex cursor-pointer items-center gap-3 border-t p-3 transition-all duration-200"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(user.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-xs font-medium opacity-75">
                      Welcome 👋
                    </p>
                    <p className="text-foreground truncate text-sm font-semibold">
                      {user.name || 'User'}
                    </p>
                  </div>
                  <ChevronRight className="text-muted-foreground h-4 w-4 opacity-50" />
                </motion.div>
              </motion.div>
            )}

            {/* Collapsed state - show user actions and avatar */}
            {isCollapsed && (
              <div className="space-y-3">
                {/* Logout Button */}
                {!isImpersonating() && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleLogout}
                          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground group relative mx-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-all duration-200"
                        >
                          <LogOut className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="text-sm font-medium"
                      >
                        <span className="truncate text-sm font-medium">
                          Log Out
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Help Center */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/help"
                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground group relative mx-auto flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200"
                      >
                        <Headphones className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="text-sm font-medium"
                    >
                      <span className="truncate text-sm font-medium">
                        Help Center
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Settings */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/app/${userType}/settings`}
                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground group relative mx-auto flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200"
                      >
                        <Settings className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="text-sm font-medium"
                    >
                      <span className="truncate text-sm font-medium">
                        Settings
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* User Avatar */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      asChild
                      onClick={() => {
                        if (userType !== 'support') {
                          router.push(`/app/${userType}/user/profile`);
                        }
                      }}
                    >
                      <Avatar className="hover:ring-primary/20 mx-auto h-11 w-11 cursor-pointer transition-all duration-200 hover:ring-2">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(user.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="text-sm font-medium"
                    >
                      <span className="truncate text-sm font-medium">
                        {user.name || 'User'}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

export default SharedSidebar;
