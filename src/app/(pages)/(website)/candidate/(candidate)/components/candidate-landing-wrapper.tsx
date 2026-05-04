'use client';

import { BenefitsSection } from '@/app/(pages)/(website)/candidate/(candidate)/components/benefits';
import { CTASection } from '@/app/(pages)/(website)/candidate/(candidate)/components/cta';
import { HeroSection } from '@/app/(pages)/(website)/candidate/(candidate)/components/hero';
import { PartnerLogosSection } from '@/app/(pages)/(website)/candidate/(candidate)/components/partner-logos';
import { ProcessSection } from '@/app/(pages)/(website)/candidate/(candidate)/components/process';
import { SkillsSection } from '@/app/(pages)/(website)/candidate/(candidate)/components/skills';
import { SuccessStoriesSection } from '@/app/(pages)/(website)/candidate/(candidate)/components/success-stories';

export function CandidateLandingWrapper() {
  return (
    <div className="from-muted/50 to-background bg-gradient-to-br">
      <HeroSection />
      <PartnerLogosSection />
      <BenefitsSection />
      <ProcessSection />
      <SkillsSection />
      <SuccessStoriesSection />
      <CTASection />
    </div>
  );
}
