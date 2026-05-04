'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactPhoneInput } from '@/components/ui/contact-phone-input';
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  Users,
  Clock,
  Shield,
  Zap,
  Brain,
  TrendingUp,
  Award,
  Sparkles,
  Globe,
  ArrowUpRight,
} from 'lucide-react';

interface DemoCTAProps {
  onBack: () => void;
}

export function DemoCTA({ onBack }: DemoCTAProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    role: '',
    teamSize: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneValidationError, setPhoneValidationError] = useState<
    string | null
  >(null);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Assessments',
      description:
        'Advanced video analysis with real-time scoring and feedback',
    },
    {
      icon: Clock,
      title: '5-Minute Interviews',
      description: 'Complete comprehensive assessments in just 5 minutes',
    },
    {
      icon: Shield,
      title: 'Bias-Free Evaluation',
      description: 'Eliminate unconscious bias with objective AI analysis',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get detailed insights and recommendations immediately',
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: '75% Time Savings',
      description: 'Reduce interview time from 30 minutes to 5 minutes',
    },
    {
      icon: Users,
      title: '95% Accuracy',
      description: 'AI analysis matches or exceeds human interviewer accuracy',
    },
    {
      icon: Award,
      title: 'Better Hires',
      description: 'Data-driven decisions lead to higher quality candidates',
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Conduct interviews in multiple languages and time zones',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'VP of Engineering',
      company: 'TechCorp',
      content:
        "Teamcast AI has revolutionized our hiring process. We've reduced time-to-hire by 60% while improving candidate quality.",
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Talent',
      company: 'StartupXYZ',
      content:
        "The AI insights are incredibly detailed and accurate. It's like having a senior interviewer available 24/7.",
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'HR Director',
      company: 'Enterprise Inc',
      content:
        'Our team loves the streamlined process. Candidates appreciate the fair, objective assessment approach.',
      rating: 5,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Thank You!</h2>
          <p className="mb-6 text-lg text-gray-600">
            We&apos;ve received your information and will contact you within 24
            hours to set up your personalized demo.
          </p>
          <div className="space-y-4">
            <Button
              size="lg"
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg text-white hover:from-blue-700 hover:to-purple-700"
            >
              Try Another Demo
            </Button>
            <p className="text-sm text-gray-500">
              Check your email for next steps and exclusive early access offers.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Demo</span>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              Teamcast AI
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Badge variant="secondary" className="mb-4">
            <Star className="mr-2 h-4 w-4" />
            Ready to Transform Your Hiring?
          </Badge>

          <h1 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
            Experience the Full Power of
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}
              AI-Powered Recruitment
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
            You&apos;ve seen what our AI can do in 5 minutes. Imagine the
            possibilities when you have access to our full platform with
            advanced analytics, team collaboration, and enterprise features.
          </p>
        </motion.div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Left Column - Features & Benefits */}
          <div className="space-y-8">
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                What You Get with Teamcast AI
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start space-x-3 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Proven Results
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 text-center"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <benefit.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="mb-1 text-2xl font-bold text-gray-900">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                What Our Customers Say
              </h2>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="mb-3 text-gray-700">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - CTA Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="sticky top-8"
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Get Started Today
                </CardTitle>
                <CardDescription className="text-center">
                  Join 500+ companies already using AI-powered recruitment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange('company', e.target.value)
                      }
                      placeholder="Your Company"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <ContactPhoneInput
                        value={formData.phone}
                        onChange={(value) => handleInputChange('phone', value)}
                        onValidationError={setPhoneValidationError}
                        placeholder="(555) 123-4567"
                        label="Phone Number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Your Role</Label>
                      <Input
                        id="role"
                        type="text"
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange('role', e.target.value)
                        }
                        placeholder="HR Manager, Recruiter, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="teamSize">Team Size</Label>
                    <select
                      id="teamSize"
                      value={formData.teamSize}
                      onChange={(e) =>
                        handleInputChange('teamSize', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select team size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || phoneValidationError !== null}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-lg text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Setting up your demo...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Get Free Demo & Consultation</span>
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Free 30-day trial • No credit card required • Setup in 5
                      minutes
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>500+ Companies</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
