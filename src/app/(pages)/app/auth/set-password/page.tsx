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
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { authService } from '@/lib/services/services';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken, setUser as setUserInStorage } from '@/lib/utils/auth-utils';
import {
  Loader2,
  ArrowRight,
  Shield,
  Target,
  Check,
  ArrowLeft,
  Lock,
  Zap,
  EyeOff,
  Eye,
  User,
  UserCheck,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';
import TeamcastMobileIcon from '@/components/icons/TeamcastMobileIcon';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import { UserRoleEnum, UserTypeEnum } from '@/lib/shared';

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, setUser } = useApp();

  // Practice assessment flow state
  const isPracticeAssessment =
    searchParams.get('practice_assessment') === 'true';
  const practiceEmail = searchParams.get('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [otpAttempts, setOtpAttempts] = useState(3);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  // OTP countdown timer
  useEffect(() => {
    if (showOtpStep && otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showOtpStep, otpCountdown]);

  // Handle OTP input change
  const handleOtpChange = async (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Reset verification status when user starts typing
    if (verificationStatus !== 'idle') {
      setVerificationStatus('idle');
    }

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `set-password-otp-${index + 1}`
      );
      nextInput?.focus();
    }

    // Auto-verify when 6 digits entered
    if (newOtp.join('').length === 6) {
      setIsVerifyingOtp(true);
      setVerificationStatus('idle');
      try {
        const response = await authService.verifyOtp(newOtp.join(''));
        if (response.user && response.token) {
          setToken(response.token);
          setUserInStorage(response.user);
          setUser(response.user);
          setVerificationStatus('success');
          toast.success('Email verified successfully! Redirecting...');

          // Password is already set, just redirect after OTP verification
          // Hide OTP step and show redirecting message
          setShowOtpStep(false);
          setIsRedirecting(true);
          setTimeout(() => {
            let dashboardUrl: string;
            if (
              isPracticeAssessment &&
              response.user.type === UserTypeEnum.CANDIDATE
            ) {
              dashboardUrl = '/app/candidate/onboard/profile';
            } else {
              dashboardUrl = getDashboardUrl(
                response.user.type || 'CLIENT',
                response.user.role
              );
            }
            router.push(dashboardUrl);
          }, 2000);
        }
      } catch (err) {
        logger.error('OTP verification error:', err);
        const newAttempts = otpAttempts - 1;
        setOtpAttempts(newAttempts);
        setVerificationStatus('error');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('set-password-otp-0')?.focus();
      } finally {
        setIsVerifyingOtp(false);
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(
        `set-password-otp-${index - 1}`
      );
      prevInput?.focus();
    }
  };

  const getOtpInputStyle = (_index: number) => {
    const baseStyle =
      'h-14 w-14 text-center text-xl font-bold transition-all duration-500 ease-out';

    if (verificationStatus === 'success') {
      return cn(
        baseStyle,
        'border-2 border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-200/50 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300'
      );
    } else if (verificationStatus === 'error') {
      return cn(
        baseStyle,
        'border-2 border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-200/50 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300'
      );
    }

    return cn(
      baseStyle,
      'border-2 border-gray-200 bg-white text-gray-900 shadow-sm hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600'
    );
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string
  ) => {
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }

    if (touched.confirmPassword && confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, value),
      }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, password),
      }));
    }
  };

  const getDashboardUrl = (userType: string, userRole?: string) => {
    // If user role is PARTNER_RESOURCE, redirect to candidate dashboard
    if (
      userRole === UserRoleEnum.PARTNER_RESOURCE ||
      userType === UserTypeEnum.CANDIDATE
    ) {
      return '/app/candidate/onboard/resume';
    }

    switch (userType) {
      case UserTypeEnum.PARTNER:
        return '/app/partner/dashboard';
      case UserTypeEnum.CLIENT:
        return '/app/client/dashboard';
      case UserTypeEnum.SUPPORT:
        return '/app/support/dashboard';
      default:
        return '/app/client/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ password: true, confirmPassword: true });

    // Validate
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password
    );

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (passwordError || confirmPasswordError) {
      return;
    }

    // For practice assessment users without authentication, set password first, then send OTP
    if (isPracticeAssessment && !user && practiceEmail) {
      setIsLoading(true);
      try {
        // First, set the password using email (public endpoint, no auth required)
        await authService.setPasswordByEmail(practiceEmail, password);
        toast.success('Password set successfully! Verifying your email...');

        // Then send OTP for email verification
        await authService.sendOtpVerification(practiceEmail);
        setShowOtpStep(true);
        setOtpCountdown(60);
        setOtpAttempts(3);
        setVerificationStatus('idle');
        toast.success('Verification code sent to your email!');
      } catch (error) {
        logger.error('Failed to set password or send OTP:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to set password. Please try again.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For authenticated users, set password directly
    setIsLoading(true);

    try {
      await authService.setNewPassword(password);

      setIsSuccess(true);
      toast.success('Password set successfully! Welcome to your team.');

      // Redirect after 3 seconds with proper role-based routing
      setTimeout(() => {
        const dashboardUrl = getDashboardUrl(
          user?.type || 'CLIENT',
          user?.role
        );
        router.push(dashboardUrl);
      }, 3000);
    } catch (error) {
      logger.error('Set password error:', error);
      let errorMessage =
        error instanceof Error ? error.message : 'Failed to set password';

      // Handle specific error message for same password
      if (
        errorMessage.includes(
          'New password must be different from your current password'
        )
      ) {
        errorMessage = 'New password cannot be the same as your old password.';
      }

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

  // Password security features
  const passwordFeatures = [
    {
      icon: Shield,
      title: 'Strong Protection',
      description: 'Create a password that keeps your account secure',
    },
    {
      icon: Lock,
      title: 'Encrypted Storage',
      description: 'Your password is encrypted with industry standards',
    },
    {
      icon: Target,
      title: 'Best Practices',
      description: 'Follow security guidelines for optimal protection',
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Get back to your AI-powered workflows immediately',
    },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
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
          {/* Left Panel - Brand & Password Features */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative hidden overflow-hidden lg:flex lg:w-1/2"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6e55cf] via-[#5d46b8] to-[#4c3996]">
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
              <div className="absolute inset-0 bg-gradient-to-br from-[#6e55cf]/95 via-[#5d46b8]/90 to-[#4c3996]/95"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute right-20 bottom-40 h-24 w-24 animate-pulse rounded-full bg-white/6 blur-lg delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 h-16 w-16 animate-pulse rounded-full bg-white/4 blur-md delay-500"></div>

            <div className="relative z-10 flex flex-col justify-between p-8 text-white lg:p-12">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center space-x-3"
              >
                <TeamcastIcon className="h-10 w-auto lg:h-12" />
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
                      <UserCheck className="h-4 w-4 text-white/90" />
                      <span className="text-sm font-medium text-white">
                        Welcome Aboard
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl leading-tight font-bold lg:text-5xl xl:text-6xl"
                    >
                      Set Your Password
                      <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                        Join Your Team
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/90 lg:text-xl"
                    >
                      Welcome {user?.name}! You&apos;re almost ready to start
                      building amazing teams with AI. Set your password to
                      complete your account setup.
                    </motion.p>
                  </div>

                  {/* Password Features Grid */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {passwordFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={childVariant}
                        className="group"
                      >
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 lg:rounded-2xl lg:p-6">
                          <div className="flex items-start space-x-3 lg:space-x-4">
                            <div className="flex-shrink-0">
                              <div className="rounded-lg bg-white/10 p-2 shadow-sm backdrop-blur-sm lg:rounded-xl lg:p-3">
                                <feature.icon className="h-5 w-5 text-white lg:h-6 lg:w-6" />
                              </div>
                            </div>
                            <div>
                              <h3 className="mb-1 text-base font-semibold lg:mb-2 lg:text-lg">
                                {feature.title}
                              </h3>
                              <p className="text-xs leading-relaxed text-white/80 lg:text-sm">
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
                    256-bit
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Encryption
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    BCRYPT
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Hashing
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    GDPR
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Compliant
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Panel - Password Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex min-h-screen flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-8"
          >
            <div className="w-full max-w-sm lg:max-w-md">
              {/* Mobile Header */}
              <div className="mb-8 text-center lg:hidden">
                <TeamcastMobileIcon className="mx-auto mb-4 h-10 w-auto" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Set Password
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Complete your account setup
                </p>
              </div>

              {/* Desktop Header */}
              <div className="mb-8 hidden lg:mb-10 lg:block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {user && (
                    <div className="mb-4 flex items-center space-x-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                      <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/40">
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Welcome, {user.name}!
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
                    Set Your Password
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isPracticeAssessment && !user
                      ? 'Create a password and verify your email to unlock your assessment results'
                      : 'Create a strong and secure password to complete your account setup'}
                  </p>
                  {isPracticeAssessment && !user && practiceEmail && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      We&apos;ll send a verification code to{' '}
                      <span className="font-semibold">{practiceEmail}</span>
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Redirecting Message (after OTP verification for practice assessment) */}
              {isRedirecting && isPracticeAssessment && user && (
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
                      Email Verified!
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                      Your email has been verified successfully. Redirecting to
                      your profile...
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Redirecting...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* OTP Verification Step for Practice Assessment */}
              {showOtpStep &&
                isPracticeAssessment &&
                !user &&
                !isRedirecting && (
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
                          We&apos;ve sent a 6-digit code to{' '}
                          <span className="font-semibold">{practiceEmail}</span>
                        </p>

                        {/* Attempts Counter */}
                        <div className="flex items-center justify-center space-x-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3].map((attempt) => (
                              <div
                                key={attempt}
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                  attempt <= otpAttempts
                                    ? 'bg-primary'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {otpAttempts}{' '}
                            {otpAttempts === 1 ? 'attempt' : 'attempts'}{' '}
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
                                transition: {
                                  duration: 0.6,
                                  delay: index * 0.1,
                                },
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
                              id={`set-password-otp-${index}`}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className={getOtpInputStyle(index)}
                              disabled={
                                isVerifyingOtp ||
                                otpAttempts <= 0 ||
                                isRedirecting
                              }
                            />
                          </motion.div>
                        ))}
                      </div>

                      {isVerifyingOtp && (
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

                      {verificationStatus === 'success' && !isRedirecting && (
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

                      {isRedirecting && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center py-4"
                        >
                          <div className="flex items-center space-x-3 rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              Redirecting to dashboard...
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {verificationStatus === 'error' && otpAttempts > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center py-4"
                        >
                          <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 px-6 py-3 dark:border-red-800 dark:bg-red-900/20">
                            <XCircle className="h-6 w-6 text-red-600" />
                            <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                              Invalid code. {otpAttempts}{' '}
                              {otpAttempts === 1 ? 'attempt' : 'attempts'}{' '}
                              remaining.
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {otpAttempts <= 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center py-4"
                        >
                          <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 px-6 py-3 dark:border-red-800 dark:bg-red-900/20">
                            <XCircle className="h-6 w-6 text-red-600" />
                            <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                              Maximum attempts exceeded. Please try again later.
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
                        onClick={async () => {
                          if (otpCountdown > 0) return;
                          try {
                            await authService.sendOtpVerification(
                              practiceEmail || ''
                            );
                            toast.success('Code resent successfully!');
                            setOtpCountdown(60);
                            setVerificationStatus('idle');
                            setOtpAttempts(3);
                          } catch (err) {
                            toast.error('Failed to resend code' + err);
                          }
                        }}
                        disabled={otpCountdown > 0 || otpAttempts <= 0}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {otpCountdown > 0
                          ? `Resend in ${otpCountdown}s`
                          : 'Resend Code'}
                      </Button>
                    </div>
                  </motion.div>
                )}

              {/* Success or Form */}
              {!showOtpStep &&
                !isRedirecting &&
                (isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 text-center"
                  >
                    <div className="rounded-2xl border border-purple-200 bg-purple-50 p-8 dark:border-purple-800 dark:bg-purple-900/20">
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-purple-100 p-4 dark:bg-purple-900/40">
                          <Check className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                        Welcome to the Team!
                      </h3>
                      <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Your password has been set successfully. You&apos;ll be
                        redirected to your dashboard shortly.
                      </p>
                      <div className="space-y-4">
                        <Button
                          onClick={() => {
                            const dashboardUrl = getDashboardUrl(
                              user?.type || 'CLIENT',
                              user?.role
                            );
                            router.push(dashboardUrl);
                          }}
                          className="h-11 w-full transform rounded-lg bg-gradient-to-r from-[#6e55cf] to-[#5d46b8] font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#5d46b8] hover:to-[#4c3996] lg:h-12"
                        >
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Go to Dashboard
                        </Button>
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
                        htmlFor="password"
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a secure password"
                          value={password}
                          onChange={handlePasswordChange}
                          onBlur={() =>
                            setTouched((prev) => ({ ...prev, password: true }))
                          }
                          className={cn(
                            'bg-card focus-ring h-11 transition-colors lg:h-12',
                            touched.password && errors.password
                              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                              : 'border-input focus:border-ring focus:ring-ring/20'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {touched.password && errors.password && (
                        <p className="mt-1 text-xs font-medium text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          onBlur={() =>
                            setTouched((prev) => ({
                              ...prev,
                              confirmPassword: true,
                            }))
                          }
                          className={cn(
                            'bg-card focus-ring h-11 transition-colors lg:h-12',
                            touched.confirmPassword && errors.confirmPassword
                              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                              : 'border-input focus:border-ring focus:ring-ring/20'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <p className="mt-1 text-xs font-medium text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="default"
                      disabled={isLoading}
                      className="h-11 w-full transform rounded-lg lg:h-12"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <span className="flex items-center justify-center">
                          {isPracticeAssessment && !user
                            ? 'Continue & Verify Email'
                            : 'Set Password'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </motion.form>
                ))}

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="my-6 flex items-center lg:my-8"
              >
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                <div className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Or
                </div>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
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
                    className="h-11 w-full border-2 border-gray-200 transition-colors hover:border-gray-300 lg:h-12 dark:border-gray-700 dark:hover:border-gray-600"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500 lg:mt-8 lg:space-x-6 dark:text-gray-400"
              >
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>Fast</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
