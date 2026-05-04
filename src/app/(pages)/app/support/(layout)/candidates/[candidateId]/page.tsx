import { CandidateDetails } from './components/candidate-details';

export const metadata = {
  title: 'Candidate Details | Teamcast',
  description: 'View and manage candidate details',
};

export default async function Page({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  return <CandidateDetails candidateId={candidateId} />;
}
