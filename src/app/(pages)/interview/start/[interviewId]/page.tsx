import { Metadata } from 'next';
import { InterviewStartClientPage } from './client-page';

export const metadata: Metadata = {
  title: 'Starting Interview | Teamcast',
  description: 'Starting your interview assessment',
};

interface PageProps {
  params: Promise<{
    interviewId: string;
  }>;
}

export default async function InterviewStartPage({ params }: PageProps) {
  const { interviewId } = await params;

  return <InterviewStartClientPage interviewId={interviewId} />;
}
