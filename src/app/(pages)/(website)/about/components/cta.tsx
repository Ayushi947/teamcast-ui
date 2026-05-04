'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Users } from 'lucide-react';

export function AboutCTASection() {
  return (
    <section className="bg-primary/70 relative overflow-hidden py-24">
      {/* Background Pattern */}
      <div className="bg-grid-pattern absolute inset-0 opacity-10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="bg-background/10 text-primary-foreground inline-flex items-center rounded-full px-3 py-1 text-sm backdrop-blur-sm">
            <Users className="text-primary-foreground mr-2 h-4 w-4" />
            Join Our Team
          </div>

          {/* Main Content */}
          <h2 className="text-primary-foreground mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Join Our Mission
          </h2>
          <p className="text-primary-foreground/80 mt-6 text-xl">
            Be part of the future of team management
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group bg-background text-primary hover:bg-background/90"
            >
              View Open Positions
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group border-background text-secondary-foreground hover:bg-secondary"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-primary-foreground/80 mt-12 flex flex-col items-center justify-center gap-4 text-sm">
            <p className="flex flex-wrap items-center justify-center gap-2">
              <span className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm">
                Remote-first culture
              </span>
              <span className="text-primary-foreground/50">•</span>
              <span className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm">
                Competitive salary
              </span>
              <span className="text-primary-foreground/50">•</span>
              <span className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm">
                Unlimited PTO
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm">
                Health insurance
              </span>
              <span className="text-primary-foreground/50">•</span>
              <span className="bg-background/10 rounded-full px-3 py-1 backdrop-blur-sm">
                401(k) matching
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
