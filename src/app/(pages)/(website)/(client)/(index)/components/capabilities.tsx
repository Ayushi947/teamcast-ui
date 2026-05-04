'use client';

import { GlowingEffect } from '@/components/ui/glowing-effect';
import { motion } from 'framer-motion';
import { BarChart, CheckCircle, Shield, Users, Zap } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const capabilities = [
  {
    title: 'AI-Powered Matching',
    description:
      'Advanced algorithms analyze job requirements and candidate profiles to surface the perfect fit — every time.',
    icon: Zap,
    features: [
      'Smart candidate scoring',
      'Skills-based matching',
      'Cultural fit analysis',
      'Experience verification',
    ],
  },
  {
    title: 'Smart Screening',
    description:
      'Automated evaluation of skills, experience, and cultural alignment so only the best reach your desk.',
    icon: Shield,
    features: [
      'Automated assessments',
      'Behavioral analysis',
      'Technical evaluations',
      'Background checks',
    ],
  },
  {
    title: 'Team Collaboration',
    description:
      'Built-in tools that let your entire team weigh in on candidates and align on hiring decisions in real time.',
    icon: Users,
    features: [
      'Real-time feedback',
      'Team voting system',
      'Interview scheduling',
      'Candidate notes',
    ],
  },
  {
    title: 'Analytics & Insights',
    description:
      'A full-picture dashboard that tracks every hiring metric and surfaces data to continuously improve.',
    icon: BarChart,
    features: [
      'Hiring metrics',
      'Cost analysis',
      'Time-to-hire tracking',
      'Quality of hire',
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 20, stiffness: 110 },
  },
};

export function CapabilitiesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section
      id="capabilities-section"
      className="bg-muted/40 relative overflow-hidden py-24"
      ref={ref}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-primary/5 absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful Features for Modern Hiring
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Everything you need to find and hire the best candidates — faster
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                variants={cardVariants}
                className="group"
              >
                <div className="border-border/50 hover:border-primary/30 relative h-full overflow-hidden rounded-2xl border p-[3px] shadow-sm transition-all duration-300 hover:shadow-lg">
                  <GlowingEffect
                    spread={40}
                    glow
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <div className="bg-card relative flex h-full flex-col overflow-hidden rounded-[calc(1.25rem-3px)] p-8">
                    <div className="from-primary/5 pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="bg-primary/10 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
                      <Icon className="text-primary h-6 w-6" />
                    </div>

                    <h3 className="text-foreground text-xl font-bold">
                      {cap.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {cap.description}
                    </p>

                    <ul className="mt-5 space-y-2">
                      {cap.features.map((feature) => (
                        <li
                          key={feature}
                          className="text-muted-foreground flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
