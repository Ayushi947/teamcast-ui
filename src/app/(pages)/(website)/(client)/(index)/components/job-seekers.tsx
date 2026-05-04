'use client';

import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

const benefits = [
  {
    icon: Briefcase,
    title: 'Smart Job Matching',
    description:
      'AI-powered matching that connects you with roles that fit your skills and aspirations.',
  },
  {
    icon: Building2,
    title: 'Top Companies',
    description:
      'Access to opportunities at leading tech companies and high-growth startups.',
  },
  {
    icon: GraduationCap,
    title: 'Career Growth',
    description:
      'Resources and guidance to help you level up and advance your career.',
  },
];

const features = [
  'AI-powered job matching',
  'Direct company connections',
  'Career development resources',
  'Interview preparation',
  'Salary insights',
  'Remote opportunities',
];

const seekerStats = [
  { value: '10K+', label: 'Active Job Seekers' },
  { value: '500+', label: 'Partner Companies' },
  { value: '85%', label: 'Match Rate' },
  { value: '24h', label: 'Avg. Response Time' },
];

const cardVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 110,
      delay: i * 0.12,
    },
  }),
};

export function JobSeekersSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section
      className="from-muted via-background to-muted relative overflow-hidden bg-gradient-to-br py-24"
      ref={ref}
    >
      <div className="bg-primary/8 pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-primary/8 pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left — content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5 }}
              className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium"
            >
              <Sparkles className="h-3.5 w-3.5" />
              For Job Seekers
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-foreground mt-6 text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Looking for a Job?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground mt-4 text-lg"
            >
              Get matched with the perfect role at top companies
            </motion.p>

            <motion.div
              className="mt-8 grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {features.map((feature) => (
                <div
                  key={feature}
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                  {feature}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/app/candidate/signup">
                <Button
                  size="lg"
                  className="group bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Your Profile
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/candidate">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="border-border mt-10 grid grid-cols-2 gap-6 border-t pt-8"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              {seekerStats.map((s) => (
                <div key={s.label}>
                  <div className="text-primary text-2xl font-bold">
                    {s.value}
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-sm">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — benefit cards */}
          <div className="space-y-5">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  className="group"
                >
                  <div className="border-border/50 hover:border-primary/30 relative h-full overflow-hidden rounded-2xl border p-[3px] shadow-sm transition-all duration-300 hover:shadow-md">
                    <GlowingEffect
                      spread={40}
                      glow
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                      borderWidth={2}
                    />
                    <div className="bg-card relative flex h-full flex-col overflow-hidden rounded-[calc(1.25rem-3px)] p-6">
                      <div className="from-primary/5 pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
                          <Icon className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-foreground font-semibold">
                            {benefit.title}
                          </h3>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
