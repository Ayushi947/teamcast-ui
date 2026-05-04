import { Metadata } from 'next';
import { createMetadata, seoConfigs } from '@/lib/seo-config';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/breadcrumbs';
import {
  StructuredData,
  teamcastProductSchema,
} from '@/components/seo/structured-data';
import PricingPageWrapper from './components/pricing-page-wrapper';

export const metadata: Metadata = createMetadata(seoConfigs.pricing);

export default function PricingPage() {
  const faqData = {
    questions: [
      {
        question: 'Can I change plans later?',
        answer:
          'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
      },
      {
        question: 'Do you offer refunds?',
        answer:
          'Yes, we offer a 30-day money-back guarantee for all paid plans.',
      },
    ],
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbConfigs.pricing} />
      </div>
      <StructuredData type="product" data={teamcastProductSchema} />
      <StructuredData type="faq" data={faqData} />
      <PricingPageWrapper />
    </>
  );
}
