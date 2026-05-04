'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Briefcase, Globe, Star, Users } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <div className="relative isolate mt-2 px-6 py-24 sm:mt-16 sm:py-20 lg:px-8">
      <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
        <div
          className="from-primary/50 to-primary/30 ml-[max(50%,38rem)] aspect-[1313/771] w-auto bg-gradient-to-tr"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Main CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to Start Your Global Career?
            </h2>
            <p className="text-muted-foreground mt-6 text-lg leading-8">
              Join thousands of Candidate professionals who have found their
              dream jobs with US companies through our platform.
            </p>
            <div className="mt-8 flex items-center gap-x-6">
              <Link href="/app/candidate/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Create Your Profile
                </Button>
              </Link>
              <a
                href="#process"
                className="text-foreground text-sm leading-6 font-semibold"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column - Stats and Testimonials */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/5 rounded-2xl p-6 backdrop-blur-sm">
                <Users className="text-primary h-8 w-8" />
                <p className="text-foreground mt-2 text-3xl font-bold">10K+</p>
                <p className="text-muted-foreground text-sm">Active Users</p>
              </div>
              <div className="bg-card/5 rounded-2xl p-6 backdrop-blur-sm">
                <Briefcase className="text-primary h-8 w-8" />
                <p className="text-foreground mt-2 text-3xl font-bold">500+</p>
                <p className="text-muted-foreground text-sm">Companies</p>
              </div>
              <div className="bg-card/5 rounded-2xl p-6 backdrop-blur-sm">
                <Globe className="text-primary h-8 w-8" />
                <p className="text-foreground mt-2 text-3xl font-bold">50+</p>
                <p className="text-muted-foreground text-sm">Countries</p>
              </div>
              <div className="bg-card/5 rounded-2xl p-6 backdrop-blur-sm">
                <Star className="text-primary h-8 w-8" />
                <p className="text-foreground mt-2 text-3xl font-bold">4.8/5</p>
                <p className="text-muted-foreground text-sm">User Rating</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-card/5 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-x-4">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-primary text-lg font-semibold">JD</span>
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    John Doe
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Software Engineer at Google
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-4">
                {`"Teamcast helped me land my dream job in the US. The platform's
                support and guidance throughout the process were invaluable."`}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
        <div
          className="sm:max-w-100vw from-primary/50 to-primary/30 aspect-[1155/678] w-[72.1875rem] max-w-[100vw] bg-gradient-to-tr"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}
