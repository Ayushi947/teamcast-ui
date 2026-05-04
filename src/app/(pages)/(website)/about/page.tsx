import { Metadata } from 'next';
import { AboutCTASection } from '@/app/(pages)/(website)/about/components/cta';
import { AboutHeroSection } from '@/app/(pages)/(website)/about/components/hero';
import { AboutMissionSection } from '@/app/(pages)/(website)/about/components/mission';
import { AboutValuesSection } from '@/app/(pages)/(website)/about/components/values';
import { createMetadata, seoConfigs } from '@/lib/seo-config';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/breadcrumbs';
import { AboutTeamSection } from './components/team';

export const metadata: Metadata = createMetadata(seoConfigs.about);

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbConfigs.about} />
      </div>
      <AboutHeroSection />

      {/* Stats Section */}
      {/* <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-foreground text-3xl font-bold">Our Impact</h2>
            <p className="text-muted-foreground mt-2 text-xl">
              Numbers that speak for themselves
            </p>
          </div>
          <div className="mt-12">
            <StatsSection />
          </div>
        </div>
      </section> */}

      <AboutMissionSection />
      <AboutValuesSection />
      <AboutTeamSection />
      <AboutCTASection />
    </div>
  );
}
