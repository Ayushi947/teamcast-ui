'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';

export function CTASection() {
  const router = useRouter();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      className="bg-primary dark:bg-primary relative overflow-hidden py-24"
      ref={ref}
    >
      {/* Background Pattern */}
      <div className="bg-grid-pattern absolute inset-0 opacity-10 dark:opacity-5" />

      {/* Gradient Orbs */}
      <motion.div
        className="bg-background/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className="bg-primary/20 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            className="bg-background/10 text-primary-foreground inline-flex items-center rounded-full px-3 py-1 text-sm backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="mr-2 h-4 w-4 text-yellow-300 dark:text-yellow-400" />
            </motion.div>
            Limited Time Offer
          </motion.div>

          {/* Main Content */}
          <motion.h2
            className="text-primary-foreground mt-6 text-4xl font-bold tracking-tight sm:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Ready to Transform Your Hiring Process?
          </motion.h2>
          <motion.p
            className="text-primary-foreground/80 mt-3 text-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Join thousands of companies using AI to build better teams
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="group"
                onClick={() => {
                  router.push('/app/client/signup');
                }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="group"
                onClick={() => {
                  window.open(
                    'https://meetings-na2.hubspot.com/meetings/teamcast-ai/book-a-demo',
                    '_blank'
                  );
                }}
              >
                Schedule Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="text-primary-foreground/80 mt-12 flex flex-col items-center justify-center gap-4 text-sm"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <motion.p
              className="flex flex-wrap items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <motion.span
                className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                No credit card required
              </motion.span>
              <span className="text-primary-foreground/50">•</span>
              <motion.span
                className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                14-day free trial
              </motion.span>
              <span className="text-primary-foreground/50">•</span>
              <motion.span
                className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                Cancel anytime
              </motion.span>
            </motion.p>
            <motion.div
              className="flex flex-wrap items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.span
                className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                Trusted by 1000+ companies
              </motion.span>
              <span className="text-primary-foreground/50">•</span>
              <motion.span
                className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                4.9/5 average rating
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
