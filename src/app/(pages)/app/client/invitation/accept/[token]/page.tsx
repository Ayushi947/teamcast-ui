'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { clientUserInvitationService } from '@/lib/services/services';
import { useApp } from '@/lib/context/app-context';
import { motion } from 'framer-motion';
import {
  Loader2,
  Shield,
  Target,
  Rocket,
  Brain,
  Sparkles,
  Users,
  Mail,
  CheckCircle,
  UserPlus,
  ArrowRight,
  LogInIcon,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';
import TeamcastMobileIcon from '@/components/icons/TeamcastMobileIcon';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { setToken, setUser as setUserInStorage } from '@/lib/utils/auth-utils';
import { logger } from '@/lib/shared';
import { toast } from 'sonner';

export default function AcceptClientInvitationPage() {
  const params = useParams();
  const { setUser } = useApp();

  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);

  const token = params?.token as string | undefined;

  const acceptInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link.');
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      const result = await clientUserInvitationService.acceptUserInvitation({
        token,
      });

      if (!result || !result.user || !result.authToken) {
        throw new Error('Invalid invitation response');
      }

      // Store token and user data in localStorage
      setToken(result.authToken);
      setUserInStorage(result.user);

      // Set user in app context
      setUser(result.user);

      setIsAccepted(true);
      toast.success('Invitation accepted successfully!');

      // Redirect to set-password page after 2 seconds
      setTimeout(() => {
        window.location.href = '/app/auth/set-password';
      }, 2000);
    } catch (err) {
      logger.error('Invitation acceptance error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to accept invitation. Please try again.'
      );
    } finally {
      setIsAccepting(false);
    }
  };

  // Check if token is valid on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link.');
    }
  }, [token]);

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

  // Client-focused features for invitation acceptance
  const invitationFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Hiring',
      description: 'Access intelligent candidate matching and screening tools',
    },
    {
      icon: Sparkles,
      title: 'Smart Workflows',
      description: 'Streamlined processes that save time and improve quality',
    },
    {
      icon: Target,
      title: 'Precision Matching',
      description: 'Find the perfect candidates with data-driven insights',
    },
    {
      icon: Rocket,
      title: 'Rapid Deployment',
      description: 'Scale your team quickly with our platform',
    },
  ];

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
          {/* Left Panel - Brand & Features */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative hidden overflow-hidden lg:fixed lg:top-0 lg:left-0 lg:flex lg:h-screen lg:w-1/2"
          >
            {/* Background Pattern with Glass Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6e55cf] via-[#5a47b8] to-[#4a3ba0]">
              {/* Geometric pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <svg
                  className="h-full w-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="60"
                      height="60"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 60 0 L 0 0 0 60"
                        fill="none"
                        stroke="white"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-[1px]"></div>
              {/* Subtle noise texture for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10"></div>
            </div>

            {/* Floating Glass Elements */}
            <div className="absolute top-20 left-20 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-xl backdrop-blur-md"></div>
            <div className="absolute right-20 bottom-40 h-24 w-24 animate-pulse rounded-full bg-white/15 blur-lg backdrop-blur-lg delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 h-16 w-16 animate-pulse rounded-full bg-white/20 blur-md backdrop-blur-sm delay-500"></div>

            <div className="relative z-10 flex flex-col justify-between p-8 text-white lg:p-12">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center space-x-3"
              >
                <TeamcastIcon
                  className="h-10 w-auto lg:h-12"
                  primaryColor="#000000"
                  secondaryColor="#ffffff"
                />
              </motion.div>

              {/* Main Content */}
              <div className="flex max-w-2xl flex-col justify-center">
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
                      className="inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md"
                    >
                      <UserPlus className="h-4 w-4 text-white/90" />
                      <span className="text-sm font-medium text-white/95">
                        Team Invitation
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl leading-tight font-bold tracking-tight lg:text-5xl xl:text-6xl"
                    >
                      {isAccepted ? 'Welcome to' : 'Join Your'}
                      <span className="block bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                        {isAccepted ? 'The Team!' : 'New Team'}
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/85 lg:text-xl"
                    >
                      {isAccepted
                        ? 'Your invitation has been accepted! Redirecting you to complete your account setup.'
                        : "You've been invited to join an amazing team. Accept your invitation to get started with AI-powered hiring."}
                    </motion.p>
                  </div>

                  {/* Features Grid */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {invitationFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={childVariant}
                        className="group h-full"
                      >
                        <div className="card-hover h-full rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 lg:rounded-2xl lg:p-6">
                          <div className="flex h-full flex-col">
                            <div className="flex items-start space-x-3 lg:space-x-4">
                              <div className="flex-shrink-0">
                                <div className="rounded-lg bg-gradient-to-br from-white/20 to-white/10 p-2 shadow-lg backdrop-blur-sm lg:rounded-xl lg:p-3">
                                  <feature.icon className="h-5 w-5 text-white lg:h-6 lg:w-6" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="mb-1 text-base font-semibold text-white lg:mb-2 lg:text-lg">
                                  {feature.title}
                                </h3>
                                <p className="text-xs leading-relaxed text-white/75 lg:text-sm">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* Bottom Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex items-center justify-between border-t border-white/20 pt-6 lg:pt-8"
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    5K+
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Happy Clients
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    50K+
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Successful Hires
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    90%
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Client Satisfaction
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Panel - Invitation Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-card min-h-screen w-full overflow-y-auto lg:ml-auto lg:w-1/2"
          >
            <div className="flex min-h-screen items-center justify-center p-6 lg:p-8">
              <div className="w-full max-w-sm py-8 lg:max-w-md">
                {/* Mobile Header */}
                <div className="mb-8 text-center lg:hidden">
                  <TeamcastMobileIcon className="mx-auto mb-4 h-10 w-auto" />
                  <p className="text-muted-foreground mt-2">Team Invitation</p>
                </div>

                {/* Error State */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/40">
                          <svg
                            className="h-8 w-8 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                        Invitation Error
                      </h3>
                      <p className="mb-4 text-gray-600 dark:text-gray-400">
                        {error}
                      </p>
                      <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                        <p>
                          This could happen if the invitation link has expired,
                          been used already, or is invalid.
                        </p>
                        <p>
                          Please contact your team administrator for a new
                          invitation, or try logging in if you already have an
                          account.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link href="/app/auth/login">
                        <Button className="h-11 w-full lg:h-12">
                          <LogInIcon className="ml-2 h-4 w-4" /> &nbsp; Go to
                          Login
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* Success State */}
                {isAccepted && !error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 text-center"
                  >
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-800 dark:bg-green-900/20">
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/40">
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                        Invitation Accepted!
                      </h3>
                      <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Welcome to the team! Redirecting you to complete your
                        account setup...
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Setting up your account
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Initial/Default State - Accept Invitation */}
                {!isAccepted && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Desktop Header */}
                    <div className="hidden lg:block">
                      <h2 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
                        Accept Your Invitation
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        You&apos;ve been invited to join a team. Click below to
                        accept and get started.
                      </p>
                    </div>

                    {/* Invitation Info Card */}
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/20">
                      <div className="flex items-start space-x-4">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/40">
                          <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                            Team Invitation
                          </h3>
                          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            You&apos;re invited to join an exciting team and
                            start building exceptional talent pipelines with
                            AI-powered tools.
                          </p>

                          {/* Features list */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>AI-powered candidate matching</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Streamlined hiring workflows</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Advanced analytics and insights</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accept Button */}
                    <Button
                      variant="default"
                      onClick={acceptInvitation}
                      disabled={isAccepting || !token}
                      className="h-11 w-full lg:h-12"
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Accepting Invitation...
                        </>
                      ) : (
                        <>
                          Accept Invitation
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {/* Alternative Actions */}
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex items-center">
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                        <div className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Or
                        </div>
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                      </div>

                      <Link href="/app/auth/login">
                        <Button
                          variant="outline"
                          className="h-11 w-full border-2 border-gray-200 transition-colors hover:border-gray-300 lg:h-12 dark:border-gray-700 dark:hover:border-gray-600"
                        >
                          <LogInIcon className="ml-2 h-4 w-4" /> &nbsp; Go to
                          Login Instead
                        </Button>
                      </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500 lg:mt-8 lg:space-x-6 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>Trusted by 5K+</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Rocket className="h-3 w-3" />
                        <span>Fast Setup</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
