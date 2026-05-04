'use client';

import { Badge } from '@/components/ui/badge';
import { UserRoleEnum } from '@/lib/shared';
import { useEffect, useState } from 'react';

interface DashboardHeaderProps {
  user: any;
}

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'Admin';
    case UserRoleEnum.ACCOUNT_MANAGER:
      return 'Account Manager';
    case UserRoleEnum.RECRUITER:
      return 'Recruiter';
    case UserRoleEnum.ACCOUNTS:
      return 'Accounts';
    default:
      return 'Support Team';
  }
};

const getRoleDescription = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'Manage the platform, users, and system-wide operations.';
    case UserRoleEnum.ACCOUNT_MANAGER:
      return 'Manage client relationships, job postings, and recruitment processes.';
    case UserRoleEnum.RECRUITER:
      return 'Source candidates, manage applications, and conduct assessments.';
    case UserRoleEnum.ACCOUNTS:
      return 'Handle billing, subscriptions, and financial operations.';
    default:
      return 'Access support tools and platform management features.';
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'destructive' as const;
    case UserRoleEnum.ACCOUNT_MANAGER:
      return 'default' as const;
    case UserRoleEnum.RECRUITER:
      return 'outline' as const;
    case UserRoleEnum.ACCOUNTS:
      return 'secondary' as const;
    default:
      return 'secondary' as const;
  }
};

// Client-side date component to prevent hydration mismatch
const LastUpdatedDate = () => {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setMounted(true);
    // Use a consistent date format that works across locales
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(now);
    setCurrentDate(formattedDate);
  }, []);

  if (!mounted) {
    return <span>Loading...</span>;
  }

  return <span>Last updated: {currentDate}</span>;
};

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const userRole = user?.role || UserRoleEnum.ADMIN;
  const roleDisplayName = getRoleDisplayName(userRole);
  const roleDescription = getRoleDescription(userRole);
  const badgeVariant = getRoleBadgeVariant(userRole);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#6E55CF]">{`Welcome back, ${user?.name || 'Support'}!👋🏻 `}</h1>
          <Badge
            variant={badgeVariant}
            className="rounded-md bg-[#6E55CF] text-xs font-bold text-white dark:text-white"
          >
            {roleDisplayName}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">{`${roleDescription}`}</p>
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <LastUpdatedDate />
      </div>
    </div>
  );
};
