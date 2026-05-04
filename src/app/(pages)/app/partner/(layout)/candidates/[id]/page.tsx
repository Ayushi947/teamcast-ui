import { CandidateDetails } from './components/candidate-details';

export const metadata = {
  title: 'Candidate Details | Teamcast Partner',
  description: 'View and manage candidate details',
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CandidateDetails candidateId={id} />;
}
