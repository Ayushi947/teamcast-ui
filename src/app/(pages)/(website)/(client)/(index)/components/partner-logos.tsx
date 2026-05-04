'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

const partners = [
  { name: 'CacheFlow', logo: '/logos/cacheflow.png' },
  { name: 'Avesha', logo: '/logos/avesha.png' },
  { name: 'Sage', logo: '/logos/sage.png' },
  { name: 'Focus45', logo: '/logos/focus.png' },
  { name: 'Wayfair', logo: '/logos/wayfair.png' },
  { name: 'Aria', logo: '/logos/aria_systems.png' },
  { name: 'C3ALabs', logo: '/logos/c3a_labs.png' },
  { name: 'Avibra', logo: '/logos/avibra-logo.png' },
  { name: 'Kintsugi', logo: '/logos/kintsugi.png' },
];

const logoWidth = 140;
const gap = 48;
const singleSetWidth = partners.length * (logoWidth + gap);

export function PartnerLogosSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section
      className="border-border/40 bg-background border-y py-12"
      ref={ref}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.p
          className="text-muted-foreground mb-8 text-center text-sm font-medium tracking-widest uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          Trusted by leading companies
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden"
        >
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r to-transparent" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l to-transparent" />

          <div className="flex">
            <motion.div
              className="flex items-center"
              animate={{ x: [0, -singleSetWidth] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 22,
                  ease: 'linear',
                },
              }}
              style={{ width: `${singleSetWidth * 2}px`, gap: `${gap}px` }}
            >
              {[...partners, ...partners].map((partner, i) => (
                <div
                  key={`${partner.name}-${i}`}
                  className="flex flex-shrink-0 items-center justify-center"
                  style={{ width: `${logoWidth}px` }}
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={140}
                    height={45}
                    className="max-h-9 w-auto opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:invert dark:hover:invert-0"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
