'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export function PricingHero() {
  return (
    <section className="from-muted/50 to-background relative isolate overflow-hidden bg-gradient-to-b py-12 pt-32">
      {/* Background Elements */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#6e55cf]/20 to-[#8b6edb]/10 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-[#6e55cf]/10 text-[#6e55cf] hover:bg-[#6e55cf]/20"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Transparent Pricing
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-foreground text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Simple, Transparent Pricing{' '}
            <span className="bg-gradient-to-r from-[#6e55cf] to-[#8b6edb] bg-clip-text text-transparent">
              for Every Team Size
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg leading-8 sm:text-xl"
          >
            Choose the plan that&apos;s right for your team. Whether
            your&apos;re a startup or enterprise, we have flexible options to
            help you grow. All plans include our core features, world-class
            support, and no hidden fees.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>No setup fees</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Cancel anytime</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>14-day free trial</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
