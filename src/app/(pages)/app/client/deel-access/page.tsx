'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/context/app-context';
import { useRouter } from 'next/navigation';

export default function DeelAccessPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user?.email) {
      // Redirect to Deel with SSO using the user's email
      const deelUrl = `https://people.teamcast.ai/login/sso?email=${user.email}`;
      window.open(deelUrl, '_blank');

      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push('/app/client/dashboard');
      }, 1000);
    } else {
      // If no user email, redirect back to dashboard
      router.push('/app/client/dashboard');
    }
  }, [user?.email, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          Redirecting to Deel...
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Opening Deel.com in a new tab
        </p>
      </div>
    </div>
  );
}
