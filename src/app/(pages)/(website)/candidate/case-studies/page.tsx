import { Metadata } from 'next';
import React from 'react';
import { createMetadata, seoConfigs } from '@/lib/seo-config';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/breadcrumbs';

export const metadata: Metadata = createMetadata(
  seoConfigs.candidateCaseStudies
);

const CandidateCaseStudiesPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbConfigs.candidateCaseStudies} />
        </div>
        <h1 className="text-foreground text-3xl font-bold">Case Studies</h1>
        <p className="text-muted-foreground mt-4">
          Explore success stories and case studies of candidates who found their
          dream jobs through our platform.
        </p>
      </main>
    </div>
  );
};

export default CandidateCaseStudiesPage;
