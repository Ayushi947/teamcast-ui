'use client';

import { useApp } from '@/lib/context/app-context';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const DashboardGreeting = () => {
  const { user } = useApp();
  const greeting = getGreeting();
  const name = user?.name || 'there';

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="mb-2 flex items-center">
          <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
            {greeting}, {name}!
          </h1>
        </div>
        <p className="text-md text-gray-600 dark:text-gray-400">
          Welcome to your candidate dashboard. Here you can manage your
          applications and track your progress.
        </p>
      </div>
    </div>
  );
};
