'use client';

import { PricingCTA } from '@/app/(pages)/(website)/pricing/components/cta';
import { FAQ } from '@/app/(pages)/(website)/pricing/components/faq';
import { PricingHero } from '@/app/(pages)/(website)/pricing/components/hero';
import { PricingSection } from '@/app/(pages)/(website)/pricing/components/pricing-section';
import { ClientPricingSection } from '@/components/app/client/pricing/pricing-section';
import { UserTypeEnum } from '@/lib/shared';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';

export default function PricingPageWrapper() {
  const { user } = useApp();
  const isClient = UserTypeEnum.CLIENT === user?.type;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-background"
    >
      <PricingHero />
      {isClient ? <ClientPricingSection /> : <PricingSection />}
      <FAQ />
      <PricingCTA />
    </motion.div>
  );
}
