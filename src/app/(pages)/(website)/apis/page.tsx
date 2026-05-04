import { Metadata } from 'next';
import { ApiDocsLanding } from './components/api-docs-landing';
import { createMetadata, seoConfigs } from '@/lib/seo-config';

export const metadata: Metadata = createMetadata(seoConfigs.apis);

export default function DocsPage() {
  return (
    <div className="bg-background min-h-screen">
      <ApiDocsLanding />
    </div>
  );
}
