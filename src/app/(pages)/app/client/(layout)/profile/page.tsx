'use client';

import { Suspense } from 'react';
import ClientProfilePage from './components/profile-page';
import { ProfileSkeleton } from './components/profile-skeleton';

export default function CompanyProfilePage() {
  return (
    <div className="min-h-screen">
      <div>
        <Suspense fallback={<ProfileSkeleton />}>
          <ClientProfilePage />
        </Suspense>
      </div>
    </div>
  );
}
