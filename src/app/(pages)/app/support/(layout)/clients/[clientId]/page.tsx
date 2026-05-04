import { ClientDetails } from './components/client-details';

export const metadata = {
  title: 'Client Details | Teamcast',
  description: 'View and manage client details',
};

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <ClientDetails clientId={clientId} />;
}
