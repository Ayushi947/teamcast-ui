'use client';

import { Experience } from '@/components/app/candidate/experience/experience';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Briefcase } from 'lucide-react';
import { TourGuide } from '@/components/tour/tour-guide';

export default function ExperiencePage() {
  const router = useRouter();

  return (
    <>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                <Briefcase className="text-primary h-10 w-10 pr-2" />
                Work Experience
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Add your professional work history, including your roles,
                responsibilities, and achievements. For each experience, you can
                add multiple projects to showcase your technical expertise and
                impact.
              </p>
            </div>
          </div>
        </div>
        <Experience />
        <div className="mt-6 sm:mt-8">
          <Button
            onClick={() => router.push('/app/candidate/onboard/education')}
            variant="default"
            className="h-11 w-full rounded-lg px-6 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 sm:w-auto sm:px-10"
          >
            Save & Continue to Education
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <TourGuide tourKey="candidate_onboarding_experience" />
    </>
  );
}
