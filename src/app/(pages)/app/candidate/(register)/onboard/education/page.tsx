'use client';

import { Education } from '@/components/app/candidate/education/education';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { TourGuide } from '@/components/tour/tour-guide';

export default function EducationPage() {
  const router = useRouter();

  return (
    <>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                <GraduationCap className="text-primary h-10 w-10 pr-2" />
                Education & Certifications
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
                Add your educational background and professional certifications.
                Include details about your degrees, achievements, and any
                relevant certifications that showcase your expertise.
              </p>
            </div>
          </div>
        </div>
        <Education />
        <div className="mt-6 sm:mt-8">
          <Button
            onClick={() => router.push('/app/candidate/onboard/preferences')}
            variant="default"
            className="h-11 w-full rounded-lg px-6 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 sm:w-auto sm:px-10"
          >
            Save & Continue to Preferences
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <TourGuide tourKey="candidate_onboarding_education" />
    </>
  );
}
