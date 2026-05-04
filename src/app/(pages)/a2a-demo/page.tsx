'use client';

import { Suspense } from 'react';
import { RecruiterInterface } from '@/components/a2a-demo/recruiter-interface';

const A2ADemoPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <span className="text-muted-foreground ml-3">
            Loading A2A Recruiter Interface...
          </span>
        </div>
      }
    >
      <RecruiterInterface />
    </Suspense>
  );
};

export default A2ADemoPage;
