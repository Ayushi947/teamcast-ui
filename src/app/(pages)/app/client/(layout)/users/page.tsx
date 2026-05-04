import { Suspense } from 'react';
import ClientUsersPage from './client-page';

export const metadata = {
  title: 'User Management | Teamcast',
  description:
    'Manage users, send invites, and control access to your organization',
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientUsersPage />
    </Suspense>
  );
}
