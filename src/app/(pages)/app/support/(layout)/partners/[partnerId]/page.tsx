import { PartnerDetails } from './components/partner-details';

export const metadata = {
  title: 'Partner Details | Teamcast',
  description: 'View and manage partner details',
};

export default async function Page({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  return <PartnerDetails partnerId={partnerId} />;
}
