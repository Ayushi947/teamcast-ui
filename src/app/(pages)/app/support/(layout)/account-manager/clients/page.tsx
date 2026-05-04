import { AccountManagerClientsList } from './components/account-manager-clients-list';

export const metadata = {
  title: 'My Clients | Teamcast',
  description: 'View and manage your assigned clients',
};

export default function AccountManagerClientsPage() {
  return <AccountManagerClientsList />;
}
