import { Metadata } from 'next';
import {
  MapPin,
  Clock,
  Users,
  Star,
  ArrowRight,
  Building,
  Heart,
  Zap,
  Mail,
  Calendar,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createMetadata, seoConfigs } from '@/lib/seo-config';

export const metadata: Metadata = createMetadata(seoConfigs.careers);

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description:
      'Comprehensive health, dental, and vision insurance for you and your family.',
    gradient: 'from-primary/20 to-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Clock,
    title: 'Flexible Work',
    description:
      'Work from anywhere with flexible hours and unlimited PTO policy.',
    gradient: 'from-secondary/20 to-secondary/10',
    iconColor: 'text-secondary-foreground',
  },
  {
    icon: Zap,
    title: 'Growth & Learning',
    description:
      '$3,000 annual learning budget and conference attendance support.',
    gradient: 'from-accent/20 to-accent/10',
    iconColor: 'text-accent-foreground',
  },
  {
    icon: Building,
    title: 'Equity Package',
    description:
      'Competitive equity package with potential for significant upside.',
    gradient: 'from-muted/30 to-muted/20',
    iconColor: 'text-muted-foreground',
  },
  {
    icon: Users,
    title: 'Amazing Team',
    description:
      'Work with world-class talent in a collaborative, inclusive environment.',
    gradient: 'from-primary/15 to-secondary/15',
    iconColor: 'text-primary',
  },
  {
    icon: Star,
    title: 'Impact',
    description:
      'Help millions of people find better jobs and companies build better teams.',
    gradient: 'from-secondary/20 to-primary/10',
    iconColor: 'text-secondary-foreground',
  },
];

interface Position {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  description: string;
  requirements: string[];
}

const openPositions: Position[] = [];

const companyValues = [
  {
    title: 'Customer Obsession',
    description: 'We start with the customer and work backwards, always.',
    icon: '🎯',
  },
  {
    title: 'Innovation',
    description:
      "We embrace change and continuously push the boundaries of what's possible.",
    icon: '💡',
  },
  {
    title: 'Transparency',
    description:
      'We communicate openly and honestly, building trust through authenticity.',
    icon: '🔍',
  },
  {
    title: 'Excellence',
    description:
      'We set high standards and deliver exceptional results consistently.',
    icon: '⭐',
  },
];

const departmentColors = {
  Engineering: 'bg-primary/10 text-primary',
  Design: 'bg-secondary/10 text-secondary-foreground',
  Marketing: 'bg-accent/10 text-accent-foreground',
  'Customer Success': 'bg-muted text-muted-foreground',
  Sales: 'bg-primary/20 text-primary',
};

export default function CareersPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="from-primary/5 via-background to-secondary/5 relative overflow-hidden bg-gradient-to-br py-24 lg:py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl"></div>
          <div className="bg-secondary/10 absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-primary/10 mb-6 inline-flex items-center rounded-full px-6 py-2">
              <Trophy className="text-primary mr-2 h-4 w-4" />
              <span className="text-primary text-sm font-semibold">
                Join Our Mission
              </span>
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Build the{' '}
              <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                Future
              </span>
              <br />
              of Hiring
            </h1>
            <p className="text-muted-foreground mx-auto mt-8 max-w-3xl text-xl leading-8 lg:text-2xl">
              Help us transform how companies find and hire exceptional talent.
              Join a team of passionate individuals building the next generation
              of AI-powered recruitment tools.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group bg-primary hover:bg-primary/90 px-8 py-4 text-lg"
              >
                <a href="#positions" className="flex items-center">
                  View Opportunities
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Learn About Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="text-foreground mb-6 text-4xl font-bold lg:text-5xl">
              Why Choose Teamcast?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl lg:text-2xl">
              We offer more than just a job – we provide a platform for growth,
              impact, and success in a supportive environment.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${benefit.gradient} border-border/50 border p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div
                    className={
                      'mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/90 shadow-lg'
                    }
                  >
                    <benefit.icon className={`h-7 w-7 ${benefit.iconColor}`} />
                  </div>
                  <h3 className="text-foreground mb-4 text-xl font-bold lg:text-2xl">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed lg:text-lg">
                    {benefit.description}
                  </p>
                </div>
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="from-muted/50 via-background to-muted/50 bg-gradient-to-br py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="text-foreground mb-6 text-4xl font-bold lg:text-5xl">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-xl lg:text-2xl">
              The principles that guide everything we do and shape our culture.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {companyValues.map((value, index) => (
              <div
                key={value.title}
                className="group bg-card border-border/50 relative rounded-2xl border p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mb-6 text-4xl">{value.icon}</div>
                <h3 className="text-foreground mb-4 text-xl font-bold lg:text-2xl">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed lg:text-lg">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="text-foreground mb-6 text-4xl font-bold lg:text-5xl">
              Current Opportunities
            </h2>
            <p className="text-muted-foreground text-xl lg:text-2xl">
              Join us in building the future of AI-powered hiring.
            </p>
          </div>

          {openPositions.length === 0 ? (
            <div className="mx-auto max-w-4xl">
              <div className="from-primary/10 via-background to-secondary/10 border-border/50 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-12 text-center shadow-2xl lg:p-16">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="bg-primary/5 absolute top-4 right-4 h-32 w-32 rounded-full blur-2xl"></div>
                  <div className="bg-secondary/5 absolute bottom-4 left-4 h-32 w-32 rounded-full blur-2xl"></div>
                </div>

                <div className="relative">
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      <div className="bg-primary/20 flex h-20 w-20 items-center justify-center rounded-full shadow-xl">
                        <Calendar className="text-primary h-10 w-10" />
                      </div>
                      <div className="bg-secondary absolute -top-2 -right-2 h-6 w-6 animate-pulse rounded-full shadow-lg"></div>
                    </div>
                  </div>

                  <h3 className="text-foreground mb-6 text-3xl font-bold lg:text-4xl">
                    No Current Openings
                  </h3>

                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed lg:text-xl">
                    We&apos;re not actively hiring right now, but we&apos;re
                    always interested in connecting with exceptional talent.
                    Join our talent community and be the first to know about
                    future opportunities.
                  </p>

                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                      size="lg"
                      className="group bg-primary hover:bg-primary/90 px-8 py-4 text-lg"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Join Talent Community
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="border-primary/20 text-primary hover:bg-primary/10 px-8 py-4 text-lg"
                    >
                      Set Job Alert
                    </Button>
                  </div>

                  <div className="bg-muted/50 mt-8 rounded-2xl p-6">
                    <p className="text-muted-foreground text-sm lg:text-base">
                      <strong className="text-foreground">💡 Tip:</strong>{' '}
                      Follow us on LinkedIn and subscribe to our newsletter to
                      stay updated on company news and future job openings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {openPositions.map((position) => (
                <div
                  key={position.id}
                  className="bg-card rounded-xl border p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-3">
                        <h3 className="text-foreground text-xl font-semibold">
                          {position.title}
                        </h3>
                        <Badge
                          className={
                            (departmentColors as Record<string, string>)[
                              position.department
                            ] || 'bg-muted text-muted-foreground'
                          }
                        >
                          {position.department}
                        </Badge>
                        <Badge variant="outline">{position.level}</Badge>
                      </div>

                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {position.description}
                      </p>

                      <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {position.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {position.type}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {position.requirements.map((req, index) => (
                          <span
                            key={index}
                            className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 lg:mt-0 lg:ml-8">
                      <Button className="bg-primary hover:bg-primary/90 w-full lg:w-auto">
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="from-primary to-secondary relative overflow-hidden bg-gradient-to-r py-24">
        <div className="absolute inset-0 opacity-50">
          <div
            className="h-full w-full bg-white/5"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
            Ready to Make an Impact?
          </h2>
          <p className="mb-10 text-xl text-white/90 lg:text-2xl">
            Join a team that&apos;s passionate about transforming the future of
            work and making hiring more efficient and fair for everyone.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="text-primary bg-white px-8 py-4 text-lg font-semibold hover:bg-white/90"
              asChild
            >
              <Link href="#positions" className="flex items-center">
                Explore Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-primary border-white/20 px-8 py-4 text-lg hover:bg-white/10"
              asChild
            >
              <Link href="/contact">Have Questions?</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
