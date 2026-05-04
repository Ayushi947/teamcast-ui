import { Metadata } from 'next';
import { InterviewAcceptClientPage } from './client-page';

export const metadata: Metadata = {
  title: 'Interview Invitation | Teamcast',
  description: 'Accept your interview invitation',
};

interface PageProps {
  params: Promise<{
    interviewId: string;
  }>;
}

export default async function InterviewAcceptPage({ params }: PageProps) {
  const { interviewId } = await params;

  return <InterviewAcceptClientPage interviewId={interviewId} />;
}
