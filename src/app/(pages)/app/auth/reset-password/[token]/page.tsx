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
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { authService } from '@/lib/services/services';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowRight,
  Shield,
  Target,
  Check,
  ArrowLeft,
  Lock,
  Zap,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';

export default function ResetPasswordTokenPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
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

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);

      setIsSuccess(true);
      toast.success('Password reset successful');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/app/auth/login');
      }, 3000);
    } catch (error) {
      logger.error('Password reset error:', error);
      let errorMessage =
        error instanceof Error ? error.message : 'Failed to reset password';

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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-600 to-rose-700">
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
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 via-red-600/90 to-rose-700/90"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute right-20 bottom-40 h-24 w-24 animate-pulse rounded-full bg-orange-300/20 blur-lg delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 h-16 w-16 animate-pulse rounded-full bg-pink-300/30 blur-md delay-500"></div>

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
                      className="inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
                    >
                      <Lock className="h-4 w-4 text-orange-300" />
                      <span className="text-sm font-medium">
                        Secure Password
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl leading-tight font-bold lg:text-5xl xl:text-6xl"
                    >
                      Create New Password
                      <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                        Strong & Secure
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/90 lg:text-xl"
                    >
                      You&apos;re almost there! Create a strong password to
                      secure your account and get back to building amazing teams
                      with AI.
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
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:transform hover:bg-white/10 lg:rounded-2xl lg:p-6">
                          <div className="flex items-start space-x-3 lg:space-x-4">
                            <div className="flex-shrink-0">
                              <div className="rounded-lg bg-gradient-to-br from-orange-400 to-red-500 p-2 lg:rounded-xl lg:p-3">
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
                className="flex items-center justify-between border-t border-white/20 pt-6 lg:pt-8"
              >
                <div className="text-center">
                  <div className="text-xl font-bold lg:text-2xl">256-bit</div>
                  <div className="text-xs text-white/80 lg:text-sm">
                    Encryption
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold lg:text-2xl">BCRYPT</div>
                  <div className="text-xs text-white/80 lg:text-sm">
                    Hashing
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold lg:text-2xl">GDPR</div>
                  <div className="text-xs text-white/80 lg:text-sm">
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
                <TeamcastIcon className="mx-auto mb-4 h-10 w-auto" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  New Password
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Create a secure password
                </p>
              </div>

              {/* Desktop Header */}
              <div className="mb-8 hidden lg:mb-10 lg:block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
                    Create New Password
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please create a strong and secure password for your account
                  </p>
                </motion.div>
              </div>

              {/* Success or Form */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center"
                >
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-800 dark:bg-green-900/20">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/40">
                        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                      Password Reset Successful!
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                      Your password has been updated successfully. You&apos;ll
                      be redirected to sign in shortly.
                    </p>
                    <div className="space-y-4">
                      <Link href="/app/auth/login">
                        <Button className="h-11 w-full transform rounded-lg bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:from-orange-700 hover:to-red-700 lg:h-12">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Go to Sign In
                        </Button>
                      </Link>
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
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, password: true }))
                      }
                      className={`h-11 border-2 bg-white transition-colors lg:h-12 dark:bg-gray-800 ${
                        touched.password && errors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200 dark:border-gray-700'
                      }`}
                    />
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
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() =>
                        setTouched((prev) => ({
                          ...prev,
                          confirmPassword: true,
                        }))
                      }
                      className={`h-11 border-2 bg-white transition-colors lg:h-12 dark:bg-gray-800 ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200 dark:border-gray-700'
                      }`}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="mt-1 text-xs font-medium text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Password Requirements:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <li
                        className={`flex items-center ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}
                      >
                        <div
                          className={`mr-2 h-1 w-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`}
                        ></div>
                        At least 8 characters
                      </li>
                      <li className="flex items-center">
                        <div className="mr-2 h-1 w-1 rounded-full bg-gray-400"></div>
                        Mix of letters, numbers, and symbols recommended
                      </li>
                    </ul>
                  </div>

                  <Button
                    disabled={isLoading}
                    className="h-11 w-full transform rounded-lg bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:from-orange-700 hover:to-red-700 disabled:transform-none lg:h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center">
                        Update Password
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
