'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { toast } from 'sonner';
import {
  Loader2,
  Shield,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Check,
  Zap,
  Users,
  Target,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';
import { useApp } from '@/lib/context/app-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { authService } from '@/lib/services/services';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { processResumeDraftAndGetRedirectPath } from '@/lib/utils/resume-draft.utils';
import { hasParsedJDData } from '@/lib/utils/jd-parser-utils';
import { UserTypeEnum } from '@/lib/shared/models/common/enums';

export default function EmailVerificationComponent() {
  const router = useRouter();
  const { user, setUser } = useApp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [attempts, setAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/app/auth/login');
      return;
    }
    // Start countdown for resend
    setCountdown(60);
  }, [user, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOtp = useCallback(async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return;
    }

    if (isBlocked || attempts <= 0) {
      toast.error('Maximum attempts exceeded. Please try again later.');
      return;
    }

    setIsLoading(true);
    setVerificationStatus('idle');

    try {
      logger.info('Verifying OTP:', otpString);

      const response = await authService.verifyOtp(otpString);

      logger.info('OTP verification response:', response);

      if (response.message && response.user && response.token) {
        setVerificationStatus('success');
        toast.success('Email verified successfully! Redirecting...');

        // Update user and token in context and localStorage
        if (setUser) {
          setUser(response.user);
        }

        localStorage.setItem('token', JSON.stringify(response.token));
        localStorage.setItem('user', JSON.stringify(response.user));

        // Handle post-verification redirects based on user type and context
        setTimeout(async () => {
          const userType = response.user?.type;

          switch (userType) {
            case UserTypeEnum.CLIENT:
              // Handle client-specific post-verification logic
              if (hasParsedJDData()) {
                toast.success('Email verified! Redirecting to job creation...');
                router.push('/app/client/recruiter/sourcing');
              } else {
                // Clean up any pending JD data if no parsed JD exists
                localStorage.removeItem('pendingJDData');
                localStorage.removeItem('pendingJDParsingTask');
                router.push('/app/client/dashboard');
              }
              break;

            case UserTypeEnum.CANDIDATE:
              // Handle candidate-specific post-verification logic
              {
                const draft = localStorage.getItem('candidateResumeDraft');
                if (draft) {
                  try {
                    logger.info(
                      'Processing resume draft after email verification'
                    );
                    const redirectPath =
                      await processResumeDraftAndGetRedirectPath();
                    router.push(redirectPath);
                  } catch (error) {
                    logger.error(
                      'Failed to process resume draft after verification:',
                      error
                    );
                    router.push('/app/candidate/onboard/resume');
                  }
                } else {
                  router.push('/app/candidate/onboard/resume');
                }
              }
              break;

            case UserTypeEnum.PARTNER:
              router.push('/app/partner/dashboard');
              break;

            case UserTypeEnum.SUPPORT:
            default:
              router.push('/app/support/dashboard');
              break;
          }
        }, 1500);
      }
    } catch (error) {
      logger.error('OTP verification error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to verify OTP';
      toast.error(errorMessage);
      setVerificationStatus('error');

      // Decrease attempts
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);

      if (newAttempts <= 0) {
        setIsBlocked(true);
        toast.error('Maximum attempts exceeded. Redirecting to login...');

        // Clear user data and redirect to login
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          router.push('/app/auth/login');
        }, 2000);
        return;
      }

      // Clear OTP on error after a delay
      setTimeout(() => {
        setOtp(['', '', '', '', '', '']);
        setVerificationStatus('idle');
        // Focus first input
        const firstInput = document.getElementById('otp-0');
        if (firstInput) {
          (firstInput as HTMLInputElement).focus();
        }
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  }, [otp, setUser, user, router, attempts, isBlocked]);

  // Auto-submit when 6th digit is entered
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Reset verification status when user starts typing
    if (verificationStatus !== 'idle') {
      setVerificationStatus('idle');
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResendLoading(true);

    try {
      await authService.sendOtpVerification(currentEmail);
      toast.success('OTP resent successfully!');
      setCountdown(60);
      setVerificationStatus('idle');
    } catch (error) {
      logger.error('Resend OTP error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to resend OTP';
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const currentEmail = user?.email || '';

  const getOtpInputStyle = (_index: number) => {
    const baseStyle =
      'h-14 w-14 text-center text-xl font-bold transition-all duration-500 ease-out';

    if (verificationStatus === 'success') {
      return cn(
        baseStyle,
        'border-2 border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-200/50'
      );
    } else if (verificationStatus === 'error') {
      return cn(
        baseStyle,
        'border-2 border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-200/50'
      );
    }

    return cn(
      baseStyle,
      'border-2 border-gray-200 bg-white text-gray-900 shadow-sm hover:border-gray-300'
    );
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

  // Verification features
  const verificationFeatures = [
    {
      icon: Shield,
      title: 'Secure Verification',
      description: 'Bank-grade security ensures your account protection',
    },
    {
      icon: Check,
      title: 'Instant Confirmation',
      description: 'Get verified instantly with our streamlined process',
    },
    {
      icon: Target,
      title: 'Account Security',
      description: 'Enhanced protection with email verification',
    },
    {
      icon: Zap,
      title: 'Quick Access',
      description: 'Get back to building your AI-powered teams immediately',
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
          {/* Left Panel - Brand & Verification Features - FIXED */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative hidden overflow-hidden lg:fixed lg:top-0 lg:left-0 lg:flex lg:h-screen lg:w-1/2"
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
                      <Shield className="h-4 w-4 text-white/90" />
                      <span className="text-sm font-medium text-white">
                        Secure Verification
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-2xl leading-tight font-bold tracking-tight lg:text-4xl xl:text-5xl"
                    >
                      Verify Your Email
                      <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                        Secure & Instant
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/85 lg:text-lg"
                    >
                      We&apos;ve sent a secure verification code to your email
                      address. This helps us ensure your account security and
                      protect your personal information.
                    </motion.p>
                  </div>

                  {/* Verification Features Grid */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {verificationFeatures.map((feature, index) => (
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
                    10K+
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Verified Users
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    99.9%
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Success Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    &lt; 1min
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Verification Time
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Panel - Verification Form - SCROLLABLE */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-card min-h-screen w-full lg:ml-auto lg:w-1/2"
          >
            <div className="flex min-h-screen items-center justify-center p-6 lg:p-8">
              <div className="w-full max-w-sm lg:max-w-md">
                {/* Mobile Header */}
                <div className="mb-8 text-center lg:hidden">
                  <TeamcastIcon className="mx-auto mb-4 h-10 w-auto" />
                  <div className="mb-2 flex items-center justify-center">
                    <div className="inline-flex items-center space-x-2 rounded-full border border-blue-600/20 bg-blue-600/5 px-3 py-1 text-xs font-medium text-blue-600">
                      <Shield className="h-3 w-3" />
                      <span>Secure Verification</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Enter the code sent to your email
                  </p>
                </div>

                {/* Desktop Header */}
                <div className="mb-8 hidden text-center lg:mb-10 lg:block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h2 className="text-foreground mb-3 text-2xl font-bold tracking-tight lg:text-3xl">
                      Verify Your Email
                    </h2>
                    <p className="text-muted-foreground text-center">
                      We&apos;ve sent a verification code to{' '}
                      <span className="text-foreground font-medium">
                        {currentEmail}
                      </span>
                    </p>
                  </motion.div>
                </div>

                {/* OTP Input Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-6"
                >
                  {/* OTP Input Grid */}
                  <div className="space-y-6">
                    <div className="mb-6 text-center">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        Enter Verification Code
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        We&apos;ve sent a 6-digit code to your email
                      </p>

                      {/* Attempts Counter */}
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3].map((attempt) => (
                            <div
                              key={attempt}
                              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                attempt <= attempts
                                  ? 'bg-primary'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {attempts} {attempts === 1 ? 'attempt' : 'attempts'}{' '}
                          remaining
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-3">
                      {otp.map((digit, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.8, opacity: 0, y: 20 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            ...(verificationStatus === 'success' && {
                              scale: [1, 1.1, 1],
                              transition: { duration: 0.6, delay: index * 0.1 },
                            }),
                            ...(verificationStatus === 'error' && {
                              x: [0, -5, 5, -5, 0],
                              transition: {
                                duration: 0.5,
                                delay: index * 0.05,
                              },
                            }),
                          }}
                          transition={{ delay: index * 0.1 }}
                          className="relative"
                        >
                          <Input
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={getOtpInputStyle(index)}
                            disabled={isLoading || isBlocked}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {isBlocked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center py-4"
                      >
                        <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 px-6 py-3 dark:border-red-800 dark:bg-red-900/20">
                          <XCircle className="h-6 w-6 text-red-600" />
                          <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                            Maximum attempts exceeded. Redirecting to login...
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center space-x-3 py-4"
                      >
                        <div className="flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/20">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Verifying your code...
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {verificationStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center py-4"
                      >
                        <div className="flex items-center space-x-3 rounded-xl border border-green-200 bg-green-50 px-6 py-3 dark:border-green-800 dark:bg-green-900/20">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                            Email verified successfully!
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {verificationStatus === 'error' && !isBlocked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center py-4"
                      >
                        <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 px-6 py-3 dark:border-red-800 dark:bg-red-900/20">
                          <XCircle className="h-6 w-6 text-red-600" />
                          <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                            Invalid code. {attempts}{' '}
                            {attempts === 1 ? 'attempt' : 'attempts'} remaining.
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Resend Section */}
                  <div className="space-y-4 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                          Didn&apos;t receive the code?
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || resendLoading || isBlocked}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary hover:border-primary/90 w-full transition-all duration-200 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      {resendLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : countdown > 0 ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend in {countdown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Help Text */}
                  <div className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20 dark:border-primary/30 rounded-xl border bg-gradient-to-r p-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="bg-primary h-2 w-2 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-primary mb-1 text-sm font-medium">
                          Check your email
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Look in your inbox and spam folder for the
                          verification code. It may take a few minutes to
                          arrive.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

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
                  <Button
                    variant="outline"
                    onClick={() => router.push('/app/auth/login')}
                    className="focus:ring-ring border-input bg-card hover:bg-accent hover:text-accent-foreground h-11 w-full border transition-colors focus:ring-2 focus:ring-offset-2 lg:h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
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
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
