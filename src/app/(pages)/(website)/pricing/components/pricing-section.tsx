'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Star, Zap, Crown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { clientSubscriptionService } from '@/lib/services/services';
import { logger } from '@/lib/logger';
import { IClientSubscriptionPackage } from '@/lib/shared';
import { parseAdditionalFeatures } from '@/lib/utils/subscription-feature-parser';
import { useApp } from '@/lib/context/app-context';

export interface PricingTier {
  id: string;
  name: string;
  price: string | number;
  description: string;
  features: string[];
  cta: string;
  trial?: boolean;
  popular: boolean;
  // Additional data from API
  maxJobPostings: number;
  maxCandidateViews: number;
  maxAiAssessments: number;
  maxSeats: number;
  unlimitedCandidateViews: boolean;
  currency: string;
  billingCycle: string;
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();
  const { user } = useApp();
  const isLoggedIn = !!user;

  const {
    data: packages,
    isLoading: packagesLoading,
    error: packagesError,
  } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      try {
        const packages =
          await clientSubscriptionService.getSubscriptionPackages({
            page: 1,
            limit: 10,
          });
        return packages;
      } catch (error) {
        logger.error('Failed to fetch subscription packages:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const handleCTAClick = (tier: PricingTier) => {
    // Handle different CTA actions
    if (tier.cta === 'Contact Sales') {
      router.push('/contact');
    } else {
      // For "Start Free Trial" and "Get Started" buttons, redirect to login with pricing page as return URL
      // const currentUrl = encodeURIComponent(
      //   window.location.pathname + window.location.search
      // );
      // Add session_id parameter to the success URL to ensure proper handling after payment
      router.push(
        // `/app/auth/login?user_type=client&redirect=${currentUrl}&include_session_id=true`
        `/app/client/signup?selected_plan=${tier.id}`
      );
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'starter':
        return <Zap className="h-6 w-6" />;
      case 'professional':
        return <Star className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <CheckCircle2 className="h-6 w-6" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 15,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const pricingTiers = (() => {
    const allPackages = packages?.items || [];

    // Find the different tiers
    const starterPackage = allPackages.find(
      (item) =>
        item.name.toLowerCase() === 'basic' ||
        item.name.toLowerCase() === 'starter'
    );
    const professionalPackage = allPackages.find(
      (item) => item.name.toLowerCase() === 'professional'
    );
    const enterprisePackage = allPackages.find(
      (item) => item.name.toLowerCase() === 'enterprise'
    );

    // Transform packages into PricingTier format
    const createPricingTier = (
      pkg: IClientSubscriptionPackage | undefined,
      isPopular = false
    ): PricingTier | null => {
      if (!pkg) return null;
      return {
        id: pkg.id,
        name: pkg.name,
        price:
          pkg.name.toLowerCase() === 'enterprise' ? 'Talk to Us' : pkg.price,
        description: pkg.description || '',
        features: parseAdditionalFeatures(pkg.additionalFeatures),
        cta:
          pkg.name.toLowerCase() === 'enterprise'
            ? 'Contact Sales'
            : isLoggedIn
              ? 'Select Plan'
              : 'Start Free Trial',
        trial: false,
        popular: isPopular,
        // Additional data from API
        maxJobPostings: pkg.maxJobPostings,
        maxCandidateViews: pkg.maxCandidateViews,
        maxAiAssessments: pkg.maxAiAssessments,
        maxSeats: pkg.maxSeats,
        unlimitedCandidateViews: pkg.unlimitedCandidateViews,
        currency: pkg.currency,
        billingCycle: pkg.billingCycle,
      };
    };

    // Create the tiers in the desired order
    const starter = createPricingTier(starterPackage);
    const professional = createPricingTier(professionalPackage, true);
    const enterprise = createPricingTier(enterprisePackage);

    // Filter out null values and ensure correct order
    return [starter, professional, enterprise].filter(
      (tier): tier is PricingTier => tier !== null
    );
  })();

  return (
    <section className="relative overflow-hidden py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Pricing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex items-center justify-center"
        >
          <div className="bg-muted flex items-center space-x-4 rounded-lg p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                !isAnnual
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                isAnnual
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <Badge
                variant="secondary"
                className="ml-2 bg-[#6e55cf]/10 text-xs text-[#6e55cf]"
              >
                Save 20%
              </Badge>
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {packagesLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#6e55cf] border-t-transparent"></div>
              <p className="text-muted-foreground mt-4">
                Loading subscription packages...
              </p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {packagesError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 p-2">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-foreground mt-4 text-lg font-semibold">
                Failed to load packages
              </h3>
              <p className="text-muted-foreground mt-2">
                {packagesError instanceof Error
                  ? packagesError.message
                  : 'An error occurred while loading subscription packages.'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* No Packages Found */}
        {!packagesLoading && !packagesError && pricingTiers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 p-2">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-foreground mt-4 text-lg font-semibold">
                No packages available
              </h3>
              <p className="text-muted-foreground mt-2">
                No subscription packages were found. Please contact support for
                assistance.
              </p>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        {!packagesLoading && !packagesError && pricingTiers.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-8 lg:grid-cols-3"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name + index}
                variants={cardVariants}
                whileHover={{
                  scale: tier.popular ? 1.05 : 1.02,
                  y: -8,
                  transition: { duration: 0.2, ease: 'easeOut' },
                }}
                className={`bg-card group relative cursor-pointer rounded-2xl border p-8 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-[#6e55cf]/10 ${
                  tier.popular
                    ? 'scale-105 border-[#6e55cf]/50 ring-2 ring-[#6e55cf]/20'
                    : 'border-border hover:border-[#6e55cf]/30'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#6e55cf] text-white hover:bg-[#6e55cf]/90">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center">
                  {/* Tier Icon & Name */}
                  <div className="mb-4 flex items-center justify-center">
                    <div
                      className={`rounded-full p-3 transition-all duration-300 group-hover:scale-110 ${
                        tier.popular
                          ? 'bg-[#6e55cf]/10 text-[#6e55cf] group-hover:bg-[#6e55cf]/20'
                          : 'bg-muted text-muted-foreground group-hover:bg-[#6e55cf]/10 group-hover:text-[#6e55cf]'
                      }`}
                    >
                      {getTierIcon(tier.name)}
                    </div>
                  </div>

                  <h3 className="text-foreground mb-2 text-2xl font-bold">
                    {tier.name}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-sm">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-foreground text-5xl font-bold">
                        {typeof tier.price === 'string'
                          ? tier.price
                          : `$${tier.price}`}
                      </span>
                      {typeof tier.price !== 'string' && (
                        <span className="text-muted-foreground ml-2 text-lg">
                          /month
                        </span>
                      )}
                    </div>
                    {isAnnual && typeof tier.price === 'number' && (
                      <p className="text-muted-foreground mt-2 text-sm">
                        Save ${Math.round(tier.price * 0.2 * 12)} per year
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleCTAClick(tier)}
                    className={`mb-8 h-12 w-full text-base font-semibold transition-all duration-200 group-hover:scale-105 ${
                      tier.popular
                        ? 'bg-[#6e55cf] text-white shadow-lg group-hover:shadow-2xl hover:bg-[#6e55cf]/90 hover:shadow-xl'
                        : 'bg-muted text-foreground border-border border group-hover:border-[#6e55cf] hover:bg-[#6e55cf] hover:text-white'
                    }`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </div>

                {/* Key Highlights */}
                <div className="mb-6 space-y-3">
                  <h4 className="text-foreground text-sm font-semibold tracking-wide uppercase">
                    Key Highlights:
                  </h4>
                  <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="space-y-3"
                  >
                    {tier.name.toLowerCase() === 'enterprise' && (
                      <motion.li
                        variants={featureVariants}
                        className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                      >
                        <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                        <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                          Unlimited everything
                        </span>
                      </motion.li>
                    )}
                    {tier.name.toLowerCase() === 'professional' && (
                      <>
                        <motion.li
                          variants={featureVariants}
                          className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                        >
                          <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                          <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                            Advanced AI matching
                          </span>
                        </motion.li>
                        <motion.li
                          variants={featureVariants}
                          className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                        >
                          <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                          <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                            Priority support
                          </span>
                        </motion.li>
                      </>
                    )}
                    {tier.name.toLowerCase() === 'starter' && (
                      <>
                        <motion.li
                          variants={featureVariants}
                          className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                        >
                          <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                          <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                            Perfect for startups
                          </span>
                        </motion.li>
                        <motion.li
                          variants={featureVariants}
                          className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                        >
                          <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                          <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                            Essential features
                          </span>
                        </motion.li>
                      </>
                    )}
                  </motion.ul>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="text-foreground text-sm font-semibold tracking-wide uppercase">
                    What&apos;s included:
                  </h4>
                  <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="space-y-3"
                  >
                    {/* Plan Limits as Key Points */}
                    <motion.li
                      variants={featureVariants}
                      className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                    >
                      <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                      <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                        <span className="font-semibold">
                          {tier.maxJobPostings === -1
                            ? '∞'
                            : tier.maxJobPostings}
                        </span>{' '}
                        Job Postings
                      </span>
                    </motion.li>
                    <motion.li
                      variants={featureVariants}
                      className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                    >
                      <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                      <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                        <span className="font-semibold">
                          {tier.maxSeats === -1 ? '∞' : tier.maxSeats}
                        </span>{' '}
                        Team Members
                      </span>
                    </motion.li>
                    <motion.li
                      variants={featureVariants}
                      className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                    >
                      <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                      <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                        <span className="font-semibold">
                          {tier.maxAiAssessments === -1
                            ? '∞'
                            : tier.maxAiAssessments}
                        </span>{' '}
                        AI Assessments
                      </span>
                    </motion.li>
                    <motion.li
                      variants={featureVariants}
                      className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                    >
                      <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                      <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                        <span className="font-semibold">
                          {tier.unlimitedCandidateViews
                            ? '∞'
                            : tier.maxCandidateViews}
                        </span>{' '}
                        Candidate Views
                      </span>
                    </motion.li>

                    {/* Original Features */}
                    {tier.features
                      .slice(0, 6)
                      .map((feature: string, featureIndex: number) => (
                        <motion.li
                          key={featureIndex}
                          variants={featureVariants}
                          className="flex items-start transition-all duration-200 group-hover:translate-x-1"
                        >
                          <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6e55cf] transition-all duration-200 group-hover:scale-110" />
                          <span className="text-muted-foreground group-hover:text-foreground text-sm leading-relaxed transition-all duration-200">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    {tier.features.length > 6 && (
                      <li className="text-muted-foreground text-sm italic">
                        +{tier.features.length - 6} more features
                      </li>
                    )}
                  </motion.ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground text-sm">
            All plans include SSL security, 99.9% uptime guarantee, and 24/7
            support.
          </p>
          <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>14-day free trial</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
