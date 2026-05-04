import { RecruitersList } from './components/recruiters-list';

export const metadata = {
  title: 'My Recruiters | Teamcast',
  description: 'View and manage your assigned recruiters',
};

export default function AccountManagerRecruitersPage() {
  return <RecruitersList />;
}
