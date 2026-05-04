import { Metadata } from 'next';
import { createMetadata, seoConfigs } from '@/lib/seo-config';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/breadcrumbs';
import { ClientLandingWrapper } from './components/client-landing-wrapper';

export const metadata: Metadata = createMetadata(seoConfigs.clientLanding);

export default function LandingPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbConfigs.clientLanding} />
      </div>
      <ClientLandingWrapper />
    </>
  );
}
