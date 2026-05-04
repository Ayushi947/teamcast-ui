'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { authService } from '@/lib/services/services';

import {
  Loader2,
  Zap,
  ArrowRight,
  Shield,
  Target,
  Check,
  ArrowLeft,
  Lock,
  Mail,
  Users,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function SendResetPasswordTokenComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.sendResetPasswordToken(email);
      setIsSuccess(true);
      toast.success('Reset instructions sent to your email');
    } catch (error) {
      logger.error('Password reset error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send reset instructions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Security-focused features
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Secure Reset Process',
      description:
        'Bank-grade security protocols protect your account recovery',
    },
    {
      icon: Lock,
      title: 'Encrypted Communications',
      description: 'All reset instructions are sent through encrypted channels',
    },
    {
      icon: Target,
      title: 'Account Protection',
      description:
        'Advanced verification ensures only you can reset your password',
    },
    {
      icon: Zap,
      title: 'Quick Recovery',
      description: 'Get back to building your AI-powered teams in minutes',
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
          {/* Left Panel - Brand & Security Features */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative hidden overflow-hidden lg:flex lg:w-1/2"
          >
            {/* Professional Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6e55cf] via-[#5d46b8] to-[#4c3996]">
              {/* Subtle geometric pattern overlay */}
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
              {/* Professional overlay with refined gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6e55cf]/95 via-[#5d46b8]/90 to-[#4c3996]/95"></div>
            </div>

            {/* Elegant Floating Elements */}
            <div className="absolute top-24 left-16 h-28 w-28 animate-pulse rounded-full bg-white/8 backdrop-blur-sm"></div>
            <div className="absolute right-16 bottom-32 h-20 w-20 animate-pulse rounded-full bg-white/6 backdrop-blur-sm delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 h-12 w-12 animate-pulse rounded-full bg-white/4 backdrop-blur-sm delay-500"></div>

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
                  className="h-10 w-auto text-white lg:h-12"
                  primaryColor="#000000"
                  secondaryColor="#ffffff"
                  width={350}
                  height={70}
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
                      className="inline-flex items-center space-x-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm"
                    >
                      <Lock className="h-4 w-4 text-white/90" />
                      <span className="text-sm font-medium text-white">
                        Secure Recovery
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-2xl leading-tight font-bold tracking-tight lg:text-4xl xl:text-5xl"
                    >
                      Reset Your Password
                      <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                        Securely & Quickly
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/85 lg:text-lg"
                    >
                      Don&apos;t worry, it happens to everyone. We&apos;ll help
                      you get back to building amazing teams with our AI-powered
                      platform.
                    </motion.p>
                  </div>

                  {/* Security Features Grid */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {securityFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={childVariant}
                        className="group"
                      >
                        <div className="card-hover rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 lg:rounded-2xl lg:p-6">
                          <div className="flex items-start space-x-3 lg:space-x-4">
                            <div className="flex-shrink-0">
                              <div className="rounded-lg bg-white/10 p-2 shadow-sm backdrop-blur-sm lg:rounded-xl lg:p-3">
                                <feature.icon className="h-5 w-5 text-white lg:h-6 lg:w-6" />
                              </div>
                            </div>
                            <div>
                              <h3 className="mb-1 text-base font-semibold text-white lg:mb-2 lg:text-lg">
                                {feature.title}
                              </h3>
                              <p className="text-xs leading-relaxed text-white/75 lg:text-sm">
                                {feature.description}
                              </p>
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
                className="flex items-center justify-between border-t border-white/15 pt-6 lg:pt-8"
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    99.9%
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    256-bit
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Encryption
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    24/7
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Security
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Panel - Reset Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-card flex min-h-screen flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-8"
          >
            <div className="w-full max-w-sm lg:max-w-md">
              {/* Mobile Header */}
              <div className="mb-8 text-center lg:hidden">
                <TeamcastIcon
                  className="mx-auto mb-4 h-10 w-auto"
                  primaryColor="#00000"
                  secondaryColor="#ffffff"
                />
                <h1 className="text-foreground text-2xl font-bold">
                  Reset Password
                </h1>
                <p className="text-muted-foreground mt-2">
                  We&apos;ll send you reset instructions
                </p>
              </div>

              {/* Desktop Header */}
              <div className="mb-8 hidden lg:mb-10 lg:block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-foreground mb-2 text-2xl font-bold tracking-tight lg:text-3xl">
                    Reset Password
                  </h2>
                  <p className="text-muted-foreground">
                    Enter your email and we&apos;ll send you reset instructions
                  </p>
                </motion.div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive/10 border-destructive/20 mb-6 rounded-lg border p-4"
                >
                  <p className="text-destructive text-sm font-medium">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Success or Form */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center"
                >
                  <div className="rounded-lg border border-green-200 bg-green-50 p-8 dark:border-green-800 dark:bg-green-900/20">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/40">
                        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-foreground mb-2 text-xl font-bold">
                      Check Your Email
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      We&apos;ve sent password reset instructions to{' '}
                      <span className="text-foreground font-medium">
                        {email}
                      </span>
                    </p>
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:from-slate-800/50 dark:via-blue-900/20 dark:to-purple-900/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
                        <div className="relative">
                          <div className="mb-4 flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                              Email not showing up?
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Check your{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  spam/junk folder
                                </strong>
                              </span>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Verify{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  {email}
                                </strong>{' '}
                                is correct
                              </span>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Wait up to{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  5 minutes
                                </strong>{' '}
                                for delivery
                              </span>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Ensure stable{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  internet connection
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-5 lg:space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-foreground text-sm font-semibold"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (touched && error) {
                          setError('');
                        }
                      }}
                      onBlur={() => setTouched(true)}
                      className={cn(
                        'bg-card focus-ring h-11 transition-colors lg:h-12',
                        touched && error
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-input focus:border-ring focus:ring-ring/20'
                      )}
                    />
                    {touched && error && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {error}
                      </p>
                    )}
                  </div>

                  <Button
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring btn-hover-lift h-11 w-full rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none lg:h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center">
                        Send Reset Instructions
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              )}

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="my-6 flex items-center lg:my-8"
              >
                <div className="border-border flex-1 border-t"></div>
                <div className="text-muted-foreground px-4 text-sm font-medium">
                  Or
                </div>
                <div className="border-border flex-1 border-t"></div>
              </motion.div>

              {/* Back to Login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-3 lg:space-y-4"
              >
                <Link href="/app/auth/login">
                  <Button
                    variant="outline"
                    className="focus:ring-ring border-input bg-card hover:bg-accent hover:text-accent-foreground h-11 w-full border transition-colors focus:ring-2 focus:ring-offset-2 lg:h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </motion.div>

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8 text-center lg:mt-10"
              >
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/app/client/signup"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-muted-foreground/70 mt-6 flex items-center justify-center space-x-4 text-xs lg:mt-8 lg:space-x-6"
              >
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Trusted by 10K+</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
        <p className="text-muted-foreground">Loading Teamcast...</p>
      </div>
    </div>
  );
}

export default function SendResetPasswordTokenPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SendResetPasswordTokenComponent />
    </Suspense>
  );
}
