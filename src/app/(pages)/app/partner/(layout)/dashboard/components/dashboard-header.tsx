'use client';

import { Badge } from '@/components/ui/badge';
import { UserRoleEnum } from '@/lib/shared';

interface DashboardHeaderProps {
  user: any;
}

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'Partner Admin';
    case UserRoleEnum.HR:
      return 'HR Manager';
    case UserRoleEnum.ACCOUNTS:
      return 'Accounts Manager';
    case UserRoleEnum.RECRUITER:
      return 'Recruiter';
    default:
      return 'Team Member';
  }
};

const getRoleDescription = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return "Manage your partner organization's operations, team, and client relationships.";
    case UserRoleEnum.HR:
      return 'Review candidates, manage interviews, and oversee the hiring pipeline.';
    case UserRoleEnum.ACCOUNTS:
      return 'Monitor billing, manage subscriptions, and track financial metrics.';
    case UserRoleEnum.RECRUITER:
      return 'Source candidates, manage job requests, and conduct interviews.';
    default:
      return 'Access your recruitment and team management tools.';
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'destructive' as const;
    case UserRoleEnum.HR:
      return 'default' as const;
    case UserRoleEnum.ACCOUNTS:
      return 'secondary' as const;
    case UserRoleEnum.RECRUITER:
      return 'outline' as const;
    default:
      return 'secondary' as const;
  }
};

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const userRole = user?.role || UserRoleEnum.HR;
  const roleDisplayName = getRoleDisplayName(userRole);
  const roleDescription = getRoleDescription(userRole);
  const badgeVariant = getRoleBadgeVariant(userRole);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-foreground text-2xl font-bold">{`Welcome back, ${user?.name || 'Partner'}!`}</h1>
          <Badge
            variant={badgeVariant}
            className="h-6 rounded-md bg-[#6E55CF] text-xs text-white hover:bg-violet-500"
          >
            {roleDisplayName}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">{`${roleDescription}`}</p>
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Last updated: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};
