'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Shield, Lock, CheckCircle2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { logger, OIDCApiService } from '@/lib/shared';
import { getToken, isAuthenticated } from '@/lib/utils/auth-utils';
import { apiClient } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TeamcastIcon } from '@/components/icons';
import TeamcastMobileIcon from '@/components/icons/TeamcastMobileIcon';
import { cn } from '@/lib/utils';

/**
 * OAuth2 Authorization Page
 *
 * This page handles the OAuth2 authorization flow when Deel redirects users here.
 *
 * Flow:
 * 1. Deel redirects user to this page with OAuth2 parameters (client_id, redirect_uri, etc.)
 * 2. Page checks if user is authenticated (JWT token in localStorage)
 * 3. Shows TeamCast loading animation
 * 4. Makes authenticated API call to /api/v1/oidc/authorize
 * 5. Backend generates authorization code and returns redirect URL
 * 6. Redirects user to Deel with authorization code
 */
function OAuthAuthorizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthorization = async () => {
      try {
        // Get OAuth2 parameters from URL
        const responseType = searchParams.get('response_type');
        const clientId = searchParams.get('client_id');
        const redirectUri = searchParams.get('redirect_uri');
        const scope = searchParams.get('scope');
        const state = searchParams.get('state');

        logger.info('OAuth2 authorization request received', {
          responseType,
          clientId,
          redirectUri,
          scope,
          state,
        });

        // Validate required parameters
        if (!responseType || !clientId || !redirectUri || !scope) {
          throw new Error('Missing required OAuth2 parameters');
        }

        // Check if user is authenticated using TeamCast auth utilities
        if (!isAuthenticated()) {
          logger.warn('User not authenticated, redirecting to login');
          // Redirect to login page with return URL
          const returnUrl = encodeURIComponent(window.location.href);
          router.push(`/app/auth/login?returnUrl=${returnUrl}`);
          return;
        }

        // Get access token for API call
        const tokenData = getToken();
        if (!tokenData?.accessToken) {
          logger.error('No access token found');
          const returnUrl = encodeURIComponent(window.location.href);
          router.push(`/app/auth/login?returnUrl=${returnUrl}`);
          return;
        }

        logger.info('User authenticated, calling authorize endpoint');

        // Use shared OIDC API service
        const oidcService = new OIDCApiService(apiClient);
        const result = await oidcService.authorize({
          response_type: responseType,
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: scope,
          ...(state && { state }),
        });

        if (result.redirect_url) {
          logger.info('Redirecting to Deel', {
            redirectUrl: result.redirect_url,
          });
          // Redirect user to Deel with authorization code
          window.location.href = result.redirect_url;
          return;
        }

        throw new Error('No redirect URL received from authorization endpoint');
      } catch (error) {
        logger.error('OAuth2 authorization failed', error);
        // Show error message using toast
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        toast.error('Authorization failed', {
          description: errorMessage,
        });
        // Redirect to error page or home after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    handleAuthorization();
  }, [searchParams, router]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const slideIn = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const childVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen font-sans">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Theme</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex min-h-screen">
          {/* Left Panel - Brand & Features - FIXED */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative hidden overflow-hidden lg:fixed lg:top-0 lg:left-0 lg:flex lg:h-screen lg:w-1/2"
          >
            {/* Enhanced Professional Background */}
            <div className="absolute inset-0">
              {/* Primary gradient layer */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, 
                  #1a1625 0%, 
                  #2d2438 15%, 
                  #3d3052 35%, 
                  #4a3c68 50%, 
                  #6e55cf 70%, 
                  #8b6edf 90%, 
                  #a386eb 100%
                )`,
                }}
              />

              {/* Subtle overlay pattern */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />

              {/* Noise texture overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23noiseFilter%29%22%20opacity%3D%220.02%22%2F%3E%3C%2Fsvg%3E')] mix-blend-overlay" />
            </div>

            {/* Sophisticated Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Main orb */}
              <div
                className="absolute top-20 left-20 h-40 w-40 animate-pulse rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(2px)',
                  animation: 'float 6s ease-in-out infinite',
                }}
              />

              {/* Secondary orb */}
              <div
                className="absolute right-16 bottom-32 h-24 w-24 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                  backdropFilter: 'blur(1px)',
                  animation: 'float 8s ease-in-out infinite reverse',
                }}
              />

              {/* Accent orbs */}
              <div
                className="absolute top-1/2 left-1/3 h-16 w-16 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent)',
                  animation: 'float 10s ease-in-out infinite',
                }}
              />

              <div
                className="absolute bottom-20 left-1/4 h-12 w-12 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), transparent)',
                  animation: 'float 7s ease-in-out infinite reverse',
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col justify-between p-8 text-white lg:p-12">
              {/* Logo */}
              <motion.div
                onClick={() => router.push('/')}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex cursor-pointer items-center space-x-3"
              >
                <TeamcastIcon
                  className="h-12 w-auto lg:h-16"
                  primaryColor="#ffffff"
                  secondaryColor="#ffffff"
                />
              </motion.div>

              {/* Main Content */}
              <div className="flex max-w-2xl flex-1 flex-col justify-center">
                <motion.div
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="inline-flex items-center space-x-2 rounded-full px-4 py-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Lock className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium text-white">
                        Secure Authorization
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl leading-tight font-bold tracking-tight text-white lg:text-5xl xl:text-6xl"
                    >
                      Connecting to
                      <span className="block bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                        Deel
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/90 lg:text-xl"
                    >
                      Please wait while we securely authorize your connection.
                      Your data is protected with industry-standard encryption.
                    </motion.p>
                  </div>

                  {/* Security Features Grid with Glass Effect */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {[
                      {
                        icon: Shield,
                        title: 'Secure Connection',
                        description:
                          'All data is encrypted using TLS/SSL protocols',
                      },
                      {
                        icon: Lock,
                        title: 'OAuth 2.0 Standard',
                        description: 'Industry-standard authorization protocol',
                      },
                      {
                        icon: CheckCircle2,
                        title: 'Verified Identity',
                        description:
                          'Your identity has been verified and authenticated',
                      },
                      {
                        icon: KeyRound,
                        title: 'Token Security',
                        description:
                          'Secure token exchange with encrypted credentials',
                      },
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={childVariant}
                        className="group relative overflow-hidden rounded-xl p-4 lg:p-6"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          backdropFilter: 'blur(20px)',
                        }}
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <div className="flex items-start space-x-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-lg"
                            style={{
                              background: 'rgba(255, 255, 255, 0.15)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            <feature.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-white">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-white/80">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 lg:mt-0"
              >
                <div className="flex items-center space-x-2 text-white/80">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">
                    Trusted by 50,000+ professionals worldwide
                  </span>
                </div>
              </motion.div>
            </div>

            {/* CSS Keyframes */}
            <style jsx>{`
              @keyframes float {
                0%,
                100% {
                  transform: translateY(0px) rotate(0deg);
                }
                50% {
                  transform: translateY(-20px) rotate(180deg);
                }
              }
            `}</style>
          </motion.div>

          {/* Right Panel - Loading Dialog - SCROLLABLE */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-card min-h-screen w-full overflow-y-auto lg:ml-auto lg:w-1/2"
          >
            <div className="flex min-h-screen items-center justify-center p-6 lg:p-8">
              <div className="w-full max-w-md">
                {/* Mobile Header */}
                <div className="mb-8 text-center lg:hidden">
                  <TeamcastMobileIcon className="mx-auto mb-4 h-10 w-auto" />
                  <h2 className="text-foreground mb-2 text-xl font-bold">
                    Connecting to Deel
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Secure authorization in progress
                  </p>
                </div>

                {/* Desktop Header */}
                <div className="mb-8 hidden lg:mb-10 lg:block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h2 className="text-foreground mb-2 text-2xl font-bold">
                      Authorization in Progress
                    </h2>
                    <p className="text-muted-foreground">
                      Please wait while we securely connect your account to
                      Deel.
                    </p>
                  </motion.div>
                </div>

                {/* Loading Dialog Box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={cn(
                    'border-border bg-card rounded-2xl border p-8 shadow-lg lg:p-12',
                    'dark:border-border dark:bg-card'
                  )}
                >
                  {/* Loading Animation */}
                  <div className="mb-6 flex justify-center lg:mb-8">
                    <Loader2
                      className={cn(
                        'h-12 w-12 animate-spin',
                        'text-primary dark:text-primary'
                      )}
                    />
                  </div>

                  {/* Status Message */}
                  <div className="mb-6 text-center lg:mb-8">
                    <h3
                      className={cn(
                        'mb-2 text-lg font-semibold',
                        'text-foreground dark:text-foreground'
                      )}
                    >
                      Connecting to Deel
                    </h3>
                    <p
                      className={cn(
                        'text-sm',
                        'text-muted-foreground dark:text-muted-foreground'
                      )}
                    >
                      Please wait while we securely log you in...
                    </p>
                  </div>

                  {/* Progress Indicators */}
                  <div className="flex justify-center gap-2">
                    {[0, 0.2, 0.4].map((delay, index) => (
                      <motion.div
                        key={index}
                        className={cn(
                          'h-2 w-2 rounded-full',
                          'bg-primary dark:bg-primary'
                        )}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay,
                        }}
                      />
                    ))}
                  </div>

                  {/* Security Note */}
                  <div
                    className={cn(
                      'mt-8 rounded-lg border p-4',
                      'border-border/50 bg-muted/50',
                      'dark:border-border/50 dark:bg-muted/30'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <Shield
                        className={cn(
                          'mt-0.5 h-5 w-5 flex-shrink-0',
                          'text-primary dark:text-primary'
                        )}
                      />
                      <div>
                        <p
                          className={cn(
                            'text-xs font-medium',
                            'text-foreground dark:text-foreground'
                          )}
                        >
                          Secure Connection
                        </p>
                        <p
                          className={cn(
                            'mt-1 text-xs',
                            'text-muted-foreground dark:text-muted-foreground'
                          )}
                        >
                          Your authorization is being processed securely using
                          OAuth 2.0 standards. This process typically takes just
                          a few seconds.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function OAuthAuthorizePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <Loader2 className="text-primary h-16 w-16 animate-spin" />
        </div>
      }
    >
      <OAuthAuthorizeContent />
    </Suspense>
  );
}
