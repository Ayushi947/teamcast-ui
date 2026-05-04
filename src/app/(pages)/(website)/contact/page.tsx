import { Metadata } from 'next';
import { createMetadata, seoConfigs } from '@/lib/seo-config';
import { ContactPageWrapper } from './components/contact-page-wrapper';

export const metadata: Metadata = createMetadata(seoConfigs.contact);

export default function ContactPage() {
  return <ContactPageWrapper />;
}
