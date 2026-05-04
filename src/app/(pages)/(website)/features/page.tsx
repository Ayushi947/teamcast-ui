import { Metadata } from 'next';
import {
  CheckCircle,
  Users,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createMetadata, seoConfigs } from '@/lib/seo-config';

export const metadata: Metadata = createMetadata(seoConfigs.features);

const features = [
  {
    category: 'AI-Powered Matching',
    icon: Sparkles,
    color: 'text-[#6e55cf]',
    bgColor: 'bg-[#6e55cf]/10',
    features: [
      {
        title: 'Intelligent Candidate Matching',
        description:
          'Advanced AI algorithms analyze job requirements and candidate profiles to find perfect matches with 95% accuracy.',
      },
      {
        title: 'Skill Assessment AI',
        description:
          'Automated technical and soft skill evaluation using natural language processing and machine learning.',
      },
      {
        title: 'Predictive Analytics',
        description:
          'Predict candidate success probability and cultural fit using behavioral analysis and historical data.',
      },
    ],
  },
  {
    category: 'Streamlined Workflows',
    icon: Zap,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    features: [
      {
        title: 'Automated Screening',
        description:
          'Save 80% of screening time with AI-powered resume parsing and initial candidate qualification.',
      },
      {
        title: 'Smart Interview Scheduling',
        description:
          'Intelligent calendar integration with automated rescheduling and timezone management.',
      },
      {
        title: 'Custom Workflow Builder',
        description:
          "Design personalized hiring workflows that match your company's unique recruitment process.",
      },
    ],
  },
  {
    category: 'Team Collaboration',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: [
      {
        title: 'Real-time Collaboration',
        description:
          'Enable seamless collaboration between hiring managers, HR teams, and interviewers.',
      },
      {
        title: 'Centralized Communication',
        description:
          'Keep all candidate communications, feedback, and decisions in one organized platform.',
      },
      {
        title: 'Role-based Access Control',
        description:
          'Secure access management with customizable permissions for different team members.',
      },
    ],
  },
  {
    category: 'Advanced Analytics',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: [
      {
        title: 'Comprehensive Reports',
        description:
          'Detailed analytics on hiring metrics, time-to-hire, source effectiveness, and team performance.',
      },
      {
        title: 'Real-time Dashboards',
        description:
          'Live insights into your recruitment pipeline with customizable KPI tracking.',
      },
      {
        title: 'Diversity & Inclusion Metrics',
        description:
          'Track and improve diversity initiatives with detailed demographic analytics.',
      },
    ],
  },
];

const additionalFeatures = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'SOC 2 compliant with end-to-end encryption, ensuring your data remains secure.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description:
      'Round-the-clock customer support with dedicated account managers for enterprise clients.',
  },
  {
    icon: Target,
    title: 'Custom Integrations',
    description:
      'Seamlessly integrate with your existing HR tech stack and business tools.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl">
              Powerful Features for
              <span className="text-[#6e55cf]"> Modern Hiring</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-8">
              Transform your recruitment process with AI-powered tools designed
              to help you find, evaluate, and hire the best talent faster than
              ever before.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                asChild
                size="lg"
                className="bg-[#6e55cf] hover:bg-[#5a4ba8]"
              >
                <Link href="/pricing">Start Free Trial</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {features.map((category, index) => (
              <div
                key={category.category}
                className={
                  index % 2 === 1
                    ? 'bg-muted/30 -mx-4 px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'
                    : ''
                }
              >
                <div className="mb-16 text-center">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${category.bgColor} mb-6`}
                  >
                    <category.icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                  <h2 className="text-foreground mb-4 text-3xl font-bold">
                    {category.category}
                  </h2>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                  {category.features.map((feature) => (
                    <div key={feature.title} className="relative">
                      <div className="flex items-start">
                        <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-[#6e55cf]" />
                        <div className="ml-4">
                          <h3 className="text-foreground mb-2 text-xl font-semibold">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold">
              Everything You Need to Scale
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Built for enterprises with the security, support, and flexibility
              you need.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-background rounded-xl border p-8 shadow-sm"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#6e55cf]/10">
                  <feature.icon className="h-6 w-6 text-[#6e55cf]" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#6e55cf] to-[#8b6edb] p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Ready to Transform Your Hiring?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
              Join thousands of companies using Teamcast to build exceptional
              teams.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/pricing">Start Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-primary border-white hover:bg-white hover:text-[#6e55cf]"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
