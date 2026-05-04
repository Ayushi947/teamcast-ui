'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Users,
  Building,
  Brain,
  Settings,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Lightbulb,
  Globe,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpSearch } from '@/components/help/help-search';
import { LiveChatWidget } from '@/components/help/live-chat-widget';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  articleCount: number;
  href: string;
  featured?: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  href: string;
  external?: boolean;
}

interface PopularArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  views: number;
  rating: number;
  href: string;
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description:
      'Everything you need to know to get up and running with Teamcast',
    icon: Lightbulb,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
    articleCount: 12,
    href: '/help/getting-started',
    featured: true,
  },
  {
    id: 'for-clients',
    title: 'For Clients',
    description: 'Complete guide for companies looking to hire top talent',
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    articleCount: 24,
    href: '/help/for-clients',
    featured: true,
  },
  {
    id: 'for-candidates',
    title: 'For Candidates',
    description: 'Help for job seekers to find their dream opportunities',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    articleCount: 18,
    href: '/help/for-candidates',
    featured: true,
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    description: 'Understanding and using our AI-powered recruitment tools',
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/10',
    articleCount: 15,
    href: '/help/ai-features',
  },
  {
    id: 'account-settings',
    title: 'Account & Settings',
    description: 'Manage your account, preferences, and security settings',
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/10',
    articleCount: 9,
    href: '/help/account-settings',
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    description: 'Subscription management, billing, and payment information',
    icon: CreditCard,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    articleCount: 8,
    href: '/help/billing',
  },
  {
    id: 'api-docs',
    title: 'API Documentation',
    description: 'Technical documentation for developers and integrations',
    icon: Globe,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/10',
    articleCount: 32,
    href: '/help/api-documentation',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Solutions to common issues and technical problems',
    icon: HelpCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    articleCount: 16,
    href: '/help/troubleshooting',
  },
];

const quickActions: QuickAction[] = [
  {
    id: 'user-guides',
    title: 'User Guides',
    description: 'Step-by-step written guides',
    icon: BookOpen,
    color: 'text-blue-600',
    href: '/help/getting-started',
  },
  {
    id: 'live-chat',
    title: 'Live Chat Support',
    description: 'Get instant help from our team',
    icon: MessageCircle,
    color: 'text-green-600',
    href: '#chat',
  },
  {
    id: 'schedule-call',
    title: 'Schedule a Call',
    description: 'Book a one-on-one session',
    icon: Phone,
    color: 'text-purple-600',
    href: 'https://calendly.com/teamcast-support',
    external: true,
  },
  {
    id: 'download-guides',
    title: 'Download Resources',
    description: 'PDF guides and templates',
    icon: Download,
    color: 'text-orange-600',
    href: '/help/downloads',
  },
];

const popularArticles: PopularArticle[] = [
  {
    id: 'create-job-posting',
    title: 'How to Create Your First Job Posting',
    description:
      'Step-by-step guide to posting your first job and attracting top candidates',
    category: 'For Clients',
    readTime: '5 min read',
    views: 2340,
    rating: 4.8,
    href: '/help/articles/create-job-posting',
  },
  {
    id: 'optimize-profile',
    title: 'Optimizing Your Candidate Profile',
    description:
      'Tips to make your profile stand out and get noticed by recruiters',
    category: 'For Candidates',
    readTime: '7 min read',
    views: 1890,
    rating: 4.9,
    href: '/help/for-candidates',
  },
  {
    id: 'ai-matching',
    title: 'Understanding AI-Powered Matching',
    description:
      'How our AI algorithm matches candidates with the perfect opportunities',
    category: 'AI Features',
    readTime: '6 min read',
    views: 1650,
    rating: 4.7,
    href: '/help/ai-features',
  },
  {
    id: 'troubleshoot-common',
    title: 'Common Issues and Solutions',
    description: 'Quick fixes for the most common problems users encounter',
    category: 'Troubleshooting',
    readTime: '4 min read',
    views: 1420,
    rating: 4.6,
    href: '/help/troubleshooting',
  },
];

export default function HelpCenterPage() {
  const [_searchQuery, _setSearchQuery] = useState('');

  const handleSearch = (query: string, filters: any) => {
    // Navigate to search results page
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    if (filters.categories && filters.categories.length > 0) {
      searchParams.set('categories', filters.categories.join(','));
    }
    window.location.href = `/help/search?${searchParams.toString()}`;
  };

  const handleChatClick = () => {
    // Scroll to chat widget or open chat
    const chatWidget = document.querySelector('#live-chat-widget');
    if (chatWidget) {
      chatWidget.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10" />
        <div className="relative container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-8">
              <h1 className="mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-5xl font-bold text-transparent md:text-6xl dark:from-white dark:via-blue-100 dark:to-white">
                How can we help you?
              </h1>
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Find answers, learn about features, and get the most out of
                Teamcast&apos;s AI-powered recruitment platform
              </p>
            </div>

            {/* Enhanced Search */}
            <div className="mx-auto max-w-2xl">
              <HelpSearch
                onSearch={handleSearch}
                suggestions={[]}
                recentSearches={[
                  'job posting',
                  'AI matching',
                  'candidate profile',
                ]}
                popularSearches={[
                  'billing',
                  'account settings',
                  'troubleshooting',
                ]}
                className="mb-8"
              />
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>150+ Articles</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>50+ Resources</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Live Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="border-b border-slate-200 py-16 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
              Get Help Your Way
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Choose how you&apos;d like to learn and get support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card className="group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800/80">
                  <CardContent className="p-6 text-center">
                    <div
                      className={
                        'mb-4 inline-flex rounded-2xl bg-gradient-to-br from-white to-slate-50 p-3 shadow-lg transition-transform duration-300 group-hover:scale-110 dark:from-slate-700 dark:to-slate-800'
                      }
                    >
                      <action.icon className={`h-8 w-8 ${action.color}`} />
                    </div>
                    <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                      {action.title}
                    </h3>
                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                      {action.description}
                    </p>
                    {action.id === 'live-chat' ? (
                      <Button
                        variant="ghost"
                        className="group-hover:bg-slate-100 dark:group-hover:bg-slate-700"
                        onClick={handleChatClick}
                      >
                        Start Chat
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="group-hover:bg-slate-100 dark:group-hover:bg-slate-700"
                        asChild
                      >
                        <Link
                          href={action.href}
                          target={action.external ? '_blank' : '_self'}
                        >
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
              Popular Help Topics
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Browse our most helpful content by category
            </p>
          </motion.div>

          {/* Featured Categories */}
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {helpCategories
              .filter((cat) => cat.featured)
              .map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="group h-full border-0 bg-gradient-to-br from-white to-slate-50 transition-all duration-500 hover:scale-105 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900">
                    <CardContent className="p-8">
                      <div
                        className={`inline-flex rounded-3xl p-4 ${category.bgColor} mb-6 transition-transform duration-300 group-hover:scale-110`}
                      >
                        <category.icon
                          className={`h-10 w-10 ${category.color}`}
                        />
                      </div>
                      <h3 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
                        {category.title}
                      </h3>
                      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 dark:bg-slate-700"
                        >
                          {category.articleCount} articles
                        </Badge>
                        <Button
                          variant="ghost"
                          className="group-hover:bg-slate-100 dark:group-hover:bg-slate-700"
                          asChild
                        >
                          <Link href={category.href}>
                            Explore
                            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>

          {/* All Categories Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {helpCategories
              .filter((cat) => !cat.featured)
              .map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Card className="group h-full border-slate-200 transition-all duration-300 hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:hover:border-slate-600">
                    <CardContent className="p-6">
                      <div
                        className={`inline-flex rounded-2xl p-3 ${category.bgColor} mb-4`}
                      >
                        <category.icon
                          className={`h-6 w-6 ${category.color}`}
                        />
                      </div>
                      <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                        {category.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {category.articleCount} articles
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={category.href}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
              Most Popular Articles
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Our most viewed and helpful content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {popularArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <Card className="group h-full border-slate-200 bg-white transition-all duration-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-slate-500">
                          {article.rating}
                        </span>
                      </div>
                    </div>
                    <h3 className="mb-2 font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      <Link href={article.href}>{article.title}</Link>
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {article.views.toLocaleString()} views
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={article.href}>
                          Read More
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/help/search">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="border-t border-slate-200 py-16 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
              Still Need Help?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Our support team is here to help you succeed. Get in touch and
              we&apos;ll get back to you as soon as possible.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleChatClick}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Live Chat
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="mailto:hello@teamcast.ai">
                  <Mail className="mr-2 h-5 w-5" />
                  Email Support
                </Link>
              </Button>
            </div>

            <div className="mt-8 text-sm text-slate-500 dark:text-slate-400">
              <p>📧 hello@teamcast.ai • 📞 +1 (650) 695-9495</p>
              <p>Available Monday-Friday, 9AM-6PM PST</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Chat Widget */}
      <div id="live-chat-widget">
        <LiveChatWidget />
      </div>
    </div>
  );
}
