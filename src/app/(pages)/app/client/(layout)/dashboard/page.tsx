'use client';

import { useApp } from '@/lib/context/app-context';
import { UserRoleEnum } from '@/lib/shared';
import { AdminDashboard } from './components/admin-dashboard';
import { HRDashboard } from './components/hr-dashboard';
import { AccountsDashboard } from './components/accounts-dashboard';
import { DashboardHeader } from './components/dashboard-header';
import { EmailVerificationBanner } from '@/components/app/common/email-verification-banner';
import { useState, useEffect } from 'react';
import { clientJobPostingService } from '@/lib/services/services';

const ClientDashboardPage = () => {
  const { user } = useApp();
  const [hasJobPostings, setHasJobPostings] = useState(true); // Set to false to show the banner for testing

  // TODO: Change back to true when you have real job posting data
  // const [hasJobPostings, setHasJobPostings] = useState(true);

  // Get the user's role - default to HR if not specified
  const userRole = user?.role || UserRoleEnum.HR;

  // Check if user has job postings
  useEffect(() => {
    const checkJobPostings = async () => {
      try {
        // You can replace this with your actual API call to check job postings
        // For now, let's simulate checking - you can modify this based on your data structure
        const response = await clientJobPostingService.getJobPostings();

        if (response.items.length > 0) {
          const data = await response.items;
          setHasJobPostings(data.length > 0);
        } else {
          // If API fails, assume no job postings to show the banner
          setHasJobPostings(false);
        }
      } catch (_error) {
        // On error, assume no job postings to show the banner
        setHasJobPostings(false);
      }
    };

    if (user) {
      checkJobPostings();
    }
  }, [user]);

  // For testing purposes - you can temporarily set this to false to see the banner
  // const hasJobPostings = false;

  // Handle create job navigation

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
        return <HRDashboard />; // Recruiters see HR dashboard
      default:
        return <HRDashboard />; // Default fallback
    }
  };

  return (
    <div className="space-y-6 p-4">
      <EmailVerificationBanner />
      <DashboardHeader user={user} hasJobPostings={hasJobPostings} />
      {renderDashboard()}
    </div>
  );
};

export default ClientDashboardPage;
