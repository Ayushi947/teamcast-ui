'use client';

import { CapabilitiesSection } from '@/app/(pages)/(website)/(client)/(index)/components/capabilities';
import { CTASection } from '@/app/(pages)/(website)/(client)/(index)/components/cta';
import { HeroSection } from '@/app/(pages)/(website)/(client)/(index)/components/hero';
import { JobSeekersSection } from '@/app/(pages)/(website)/(client)/(index)/components/job-seekers';
import { PartnerLogosSection } from '@/app/(pages)/(website)/(client)/(index)/components/partner-logos';
import { StatsSection } from '@/app/(pages)/(website)/(client)/(index)/components/stats';
import { PlatformShowcaseSection } from './platform-showcase';
import { PracticeAssessmentBanner } from './practice-assessment-banner';

export function ClientLandingWrapper() {
  return (
    <div className="bg-background overflow-x-clip">
      <HeroSection />
      <PartnerLogosSection />
      <PlatformShowcaseSection />
      <StatsSection />
      <CapabilitiesSection />
      <JobSeekersSection />
      <CTASection />
      <PracticeAssessmentBanner />
    </div>
  );
}
