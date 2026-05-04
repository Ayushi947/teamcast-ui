'use client';

import React from 'react';
import { SupportDashboard } from './components/support-dashboard';
import { AccountManagerDashboard } from './components/account-manager-dashboard';
import { RecruiterDashboard } from './components/recruiter-dashboard';
import { TechnicalSupportDashboard } from './components/technical-support-dashboard';
import { DashboardHeader } from './components/dashboard-header';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useApp } from '@/lib/context/app-context';
import { UserRoleEnum } from '@/lib/shared/models/common/enums';

const DashboardPage = () => {
  const queryClient = new QueryClient();
  const { user } = useApp();

  // Get the user's role - default to ADMIN if not specified
  const userRole = user?.role || UserRoleEnum.ADMIN;

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    switch (userRole) {
      case UserRoleEnum.ADMIN:
        return <SupportDashboard />;
      case UserRoleEnum.ACCOUNT_MANAGER:
        return <AccountManagerDashboard />;
      case UserRoleEnum.RECRUITER:
        return <RecruiterDashboard />;
      case UserRoleEnum.TECHNICAL_SUPPORT:
        return <TechnicalSupportDashboard />;
      case UserRoleEnum.ACCOUNTS:
        return <SupportDashboard />; // Accounts see the general support dashboard
      default:
        return <SupportDashboard />; // Default fallback
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6 p-4">
        <DashboardHeader user={user} />
        {renderDashboard()}
      </div>
    </QueryClientProvider>
  );
};

export default DashboardPage;
