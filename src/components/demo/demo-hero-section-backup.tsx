'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Brain,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Target,
  BarChart3,
  Video,
  Eye,
  Shield,
  Sparkles,
  Timer,
  Award,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoHeroSectionProps {
  onStartDemo: () => void;
}

export function DemoHeroSection({ onStartDemo }: DemoHeroSectionProps) {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demos = [
    {
      title: 'AI-Powered Video Analysis',
      description:
        'Real-time assessment of communication skills, confidence, and professional demeanor',
      icon: Video,
      color: 'bg-blue-500',
      features: [
        'Facial expression analysis',
        'Voice tone assessment',
        'Engagement tracking',
      ],
    },
    {
      title: 'Intelligent Question Generation',
      description:
        'Dynamic questions tailored to role, experience level, and industry requirements',
      icon: Brain,
      color: 'bg-purple-500',
      features: [
        'Role-specific questions',
        'Adaptive difficulty',
        'Industry expertise',
      ],
    },
    {
      title: 'Comprehensive Scoring',
      description:
        'Multi-dimensional evaluation with detailed feedback and improvement suggestions',
      icon: BarChart3,
      color: 'bg-green-500',
      features: [
        'Technical skills',
        'Soft skills',
        'Cultural fit',
        'Growth potential',
      ],
    },
  ];

  const stats = [
    { label: 'Companies Using AI Interviews', value: '500+', icon: Users },
    { label: 'Time Saved Per Interview', value: '75%', icon: Clock },
    { label: 'Assessment Accuracy', value: '95%', icon: Target },
    { label: 'Candidate Satisfaction', value: '4.8/5', icon: Star },
  ];

  const features = [
    {
      icon: Zap,
      title: '5-Minute Assessments',
      description: 'Complete comprehensive interviews in just 5 minutes',
    },
    {
      icon: Shield,
      title: 'Bias-Free Evaluation',
      description:
        'AI eliminates unconscious bias for fair, objective assessments',
    },
    {
      icon: Eye,
      title: 'Real-Time Monitoring',
      description: 'Advanced proctoring ensures assessment integrity',
    },
    {
      icon: MessageSquare,
      title: 'Instant Feedback',
      description:
        'Detailed insights and improvement suggestions immediately available',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [demos.length]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              Teamcast AI
            </span>
          </div>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="mr-2 h-4 w-4" />
                AI-Powered Recruitment
              </Badge>

              <h1 className="text-5xl leading-tight font-bold lg:text-6xl">
                Experience the Future of
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}
                  AI Interviews
                </span>
              </h1>

              <p className="text-xl leading-relaxed text-gray-600">
                See how our AI interviewer can assess candidates in just 5
                minutes with comprehensive video analysis, intelligent
                questioning, and instant feedback.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={onStartDemo}
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg text-white hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="mr-2 h-5 w-5" />
                Try AI Interview Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-8 py-4 text-lg"
              >
                <Video className="mr-2 h-5 w-5" />
                Watch Demo Video
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-8 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-100 to-purple-100">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
              {/* Demo Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Timer className="mr-1 h-3 w-3" />
                  Live Demo
                </Badge>
              </div>

              {/* Rotating Demo Content */}
              <div className="relative h-80 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDemo}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-6 text-center"
                  >
                    <div
                      className={cn(
                        'flex h-16 w-16 items-center justify-center rounded-2xl',
                        demos[currentDemo].color
                      )}
                    >
                      {(() => {
                        const IconComponent = demos[currentDemo].icon;
                        return <IconComponent className="h-8 w-8 text-white" />;
                      })()}
                    </div>

                    <div>
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        {demos[currentDemo].title}
                      </h3>
                      <p className="mb-4 text-gray-600">
                        {demos[currentDemo].description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {demos[currentDemo].features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-2 text-sm text-gray-700"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Demo Progress */}
              <div className="mt-6 flex justify-center space-x-2">
                {demos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDemo(index)}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all duration-300',
                      index === currentDemo ? 'w-8 bg-blue-600' : 'bg-gray-300'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400"
            >
              <Award className="h-4 w-4 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 flex h-6 w-6 items-center justify-center rounded-full bg-green-400"
            >
              <CheckCircle2 className="h-3 w-3 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="border-t border-gray-200 bg-white/50 px-6 py-16 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Why Choose AI-Powered Interviews?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Transform your hiring process with cutting-edge AI technology that
              delivers faster, fairer, and more accurate candidate assessments.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
