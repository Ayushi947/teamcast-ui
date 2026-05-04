'use client';

import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';

const caseStudies = [
  {
    title: 'TechCorp Transforms Engineering Hiring',
    description:
      'TechCorp revolutionized their engineering hiring process, scaling from 10 to 50 engineers in just 6 months while reducing time-to-hire by 60% and improving candidate quality by 30%.',
    image: '/images/case-studies/techcorp.jpg',
    logo: '/logos/anthropic.png',
    metrics: [
      {
        label: 'Time to Hire',
        value: '-60%',
        icon: Clock,
        color: 'text-primary',
      },
      {
        label: 'Cost per Hire',
        value: '-40%',
        icon: DollarSign,
        color: 'text-primary',
      },
      {
        label: 'Quality of Hire',
        value: '+30%',
        icon: TrendingUp,
        color: 'text-primary',
      },
    ],
    category: 'Engineering',
    readTime: '5 min read',
  },
  {
    title: 'StartupX Builds Dream Team',
    description:
      'StartupX achieved remarkable growth by leveraging AI-powered matching to build their product team, reducing hiring time by 70% and cutting costs by 50% while ensuring top candidate.',
    image: '/images/case-studies/startupx.jpg',
    logo: '/logos/augment.png',
    metrics: [
      {
        label: 'Time to Hire',
        value: '-70%',
        icon: Clock,
        color: 'text-primary',
      },
      {
        label: 'Cost per Hire',
        value: '-50%',
        icon: DollarSign,
        color: 'text-primary',
      },
      {
        label: 'Quality of Hire',
        value: '+40%',
        icon: TrendingUp,
        color: 'text-primary',
      },
    ],
    category: 'Product',
    readTime: '4 min read',
  },
  {
    title: 'EnterpriseCo Goes Global',
    description:
      'EnterpriseCo successfully expanded their candidate pool across 10 countries, reducing hiring time by 50% and achieving 25% better candidate quality through AI-powered matching.',
    image: '/images/case-studies/enterpriseco.jpg',
    logo: '/logos/meta.png',
    metrics: [
      {
        label: 'Time to Hire',
        value: '-50%',
        icon: Clock,
        color: 'text-primary',
      },
      {
        label: 'Cost per Hire',
        value: '-30%',
        icon: DollarSign,
        color: 'text-primary',
      },
      {
        label: 'Quality of Hire',
        value: '+25%',
        icon: TrendingUp,
        color: 'text-primary',
      },
    ],
    category: 'Global',
    readTime: '6 min read',
  },
];

export function CaseStudiesSection() {
  return (
    <section className="bg-background relative w-full overflow-hidden py-16">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-sm">
            <Users className="mr-2 h-4 w-4" />
            Success Stories
          </div>
          <h2 className="text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Real Results from Real Companies
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            See how companies are transforming their hiring process with
            Teamcast
          </p>
        </div>

        {/* Case Studies List */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((study) => (
            <div
              key={study.title}
              className="group bg-card hover:border-border relative overflow-hidden rounded-2xl border border-transparent p-3 transition-all duration-300 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                <Image
                  src={study.image}
                  alt={study.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Category Badge */}
                <div className="bg-background/90 text-foreground absolute top-4 left-4 rounded-full px-3 py-1 text-sm backdrop-blur-sm">
                  {study.category}
                </div>
              </div>

              {/* Content */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-full items-center justify-between">
                    <Image
                      src={study.logo}
                      alt={`${study.title} logo`}
                      width={120}
                      height={40}
                      className="h-8 w-auto transition-all duration-300 group-hover:scale-105 dark:brightness-0 dark:invert"
                    />
                    <span className="text-muted-foreground text-sm">
                      {study.readTime}
                    </span>
                  </div>
                </div>

                <h3 className="text-foreground mt-3 line-clamp-1 text-xl font-semibold">
                  {study.title}
                </h3>
                <p className="text-muted-foreground mt-2 line-clamp-4 text-base">
                  {study.description}
                </p>

                {/* Metrics */}
                <div className="border-border mt-6 grid grid-cols-3 gap-4 border-t pt-6">
                  {study.metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div key={metric.label} className="text-center">
                        <div
                          className={`flex items-center justify-center ${metric.color}`}
                        >
                          <Icon className="mr-2 h-5 w-5" />
                          <span className="text-base font-semibold">
                            {metric.value}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          {metric.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Read More Link */}
                <div className="mt-6">
                  <Button
                    variant="ghost"
                    className="group text-primary hover:text-primary/90 inline-flex items-center text-base font-semibold"
                  >
                    Read Case Study
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button className="group bg-primary text-primary-foreground hover:bg-primary/90">
            View All Case Studies
            <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
