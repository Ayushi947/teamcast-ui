'use client';

import { useApp } from '@/lib/context/app-context';
import { UserRoleEnum } from '@/lib/shared';
import { DashboardHeader } from './components/dashboard-header';
import { AdminDashboard } from './components/admin-dashboard';
import { HRDashboard } from './components/hr-dashboard';
import { RecruiterDashboard } from './components/recruiter-dashboard';
import { AccountsDashboard } from './components/accounts-dashboard';
import { EmailVerificationBanner } from '@/components/app/common/email-verification-banner';

const PartnerDashboardPage = () => {
  const { user } = useApp();

  // Get the user's role - default to HR if not specified
  const userRole = user?.role || UserRoleEnum.HR;

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    switch (userRole) {
      case UserRoleEnum.ADMIN:
        return <AdminDashboard />;
      case UserRoleEnum.HR:
        return <HRDashboard />;
      case UserRoleEnum.ACCOUNTS:
        return <AccountsDashboard />;
      case UserRoleEnum.RECRUITER:
        return <RecruiterDashboard />;
      default:
        return <HRDashboard />; // Default fallback
    }
  };

  return (
    <div className="space-y-6 px-4 py-2">
      <EmailVerificationBanner />
      <DashboardHeader user={user} />
      {renderDashboard()}
    </div>
  );
};

export default PartnerDashboardPage;
