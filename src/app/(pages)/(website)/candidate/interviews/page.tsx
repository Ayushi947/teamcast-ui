import { Metadata } from 'next';
import React from 'react';
import { createMetadata, seoConfigs } from '@/lib/seo-config';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/breadcrumbs';

export const metadata: Metadata = createMetadata(
  seoConfigs.candidateInterviews
);

const CandidateInterviewsPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbConfigs.candidateInterviews} />
        </div>
        <h1 className="text-foreground text-3xl font-bold">Interviews</h1>
        <p className="text-muted-foreground mt-4">
          Prepare for your interviews with our comprehensive resources and
          guidance.
        </p>
      </main>
    </div>
  );
};

export default CandidateInterviewsPage;
