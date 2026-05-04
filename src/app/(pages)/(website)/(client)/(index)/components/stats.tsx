'use client';

import { GlowingEffect } from '@/components/ui/glowing-effect';
import { motion, useAnimation } from 'framer-motion';
import { Award, Briefcase, Globe, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const stats = [
  {
    value: 10000,
    label: 'Active Users',
    description: 'Companies and teams building with Teamcast',
    icon: Users,
    suffix: '+',
  },
  {
    value: 5000,
    label: 'Jobs Posted',
    description: 'Positions successfully matched across industries',
    icon: Briefcase,
    suffix: '+',
  },
  {
    value: 95,
    label: 'Success Rate',
    description: 'Companies reporting improved hiring outcomes',
    icon: Award,
    suffix: '%',
  },
  {
    value: 140,
    label: 'Countries',
    description: 'Global reach with localized hiring solutions',
    icon: Globe,
    suffix: '+',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 18, stiffness: 120 },
  },
};

export function StatsSection() {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  useEffect(() => {
    if (!inView) return;
    controls.start('visible');

    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;

    const timers = stats.map((stat, index) => {
      const increment = stat.value / steps;
      let current = 0;
      return setInterval(() => {
        current += increment;
        if (current >= stat.value) current = stat.value;
        setCounts((prev) => {
          const next = [...prev];
          next[index] = Math.round(current);
          return next;
        });
        if (current >= stat.value) clearInterval(timers[index]);
      }, interval);
    });

    return () => timers.forEach(clearInterval);
  }, [inView, controls]);

  return (
    <section className="bg-background pt-12 pb-24" ref={ref}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by Teams Worldwide
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Join thousands of companies using Teamcast to build better teams
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="group"
              >
                <div className="border-border/50 hover:border-primary/30 relative h-full rounded-2xl border p-[3px] shadow-sm transition-all duration-300 hover:shadow-md">
                  <GlowingEffect
                    spread={40}
                    glow
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <div className="bg-card relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[calc(1.25rem-3px)] p-8 text-center">
                    <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
                      <Icon className="text-primary h-6 w-6" />
                    </div>

                    <div className="text-foreground text-4xl font-bold tabular-nums">
                      {counts[index].toLocaleString()}
                      <span className="text-primary ml-0.5 text-xl">
                        {stat.suffix}
                      </span>
                    </div>

                    <div className="text-foreground mt-2 text-base font-semibold">
                      {stat.label}
                    </div>

                    <div className="text-muted-foreground mt-1 text-sm leading-snug">
                      {stat.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          className="text-muted-foreground mt-12 text-center text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          Our platform reduces time-to-hire by{' '}
          <span className="text-primary font-semibold">60%</span> and improves
          candidate quality by{' '}
          <span className="text-primary font-semibold">40%</span>.
        </motion.p>
      </div>
    </section>
  );
}
