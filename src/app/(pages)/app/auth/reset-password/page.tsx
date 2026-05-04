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
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type ResetPasswordFormErrors = {
  password?: string;
  confirmPassword?: string;
  form?: string;
};

function ResetPasswordComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const validateField = (
    field: string,
    value: string
  ): { success: boolean; error?: string } => {
    switch (field) {
      case 'password':
        if (!value) {
          return { success: false, error: 'Password is required' };
        }
        if (value.length < 8) {
          return {
            success: false,
            error: 'Password must be at least 8 characters long',
          };
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return {
            success: false,
            error:
              'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          };
        }
        return { success: true };

      case 'confirmPassword':
        if (!value) {
          return { success: false, error: 'Please confirm your password' };
        }
        if (value !== password) {
          return { success: false, error: 'Passwords do not match' };
        }
        return { success: true };

      default:
        return { success: true };
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ResetPasswordFormErrors = {};
    let isValid = true;

    // Check if token exists (but don't show user-facing error for this)
    if (!token.trim()) {
      setErrors({
        form: 'Invalid or missing reset token. Please check your email for the correct reset link.',
      });
      return false;
    }

    // Validate password
    const passwordValidation = validateField('password', password);
    if (!passwordValidation.success) {
      newErrors.password = passwordValidation.error;
      isValid = false;
    }

    // Validate confirm password
    const confirmPasswordValidation = validateField(
      'confirmPassword',
      confirmPassword
    );
    if (!confirmPasswordValidation.success) {
      newErrors.confirmPassword = confirmPasswordValidation.error;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });

    let value = '';
    switch (field) {
      case 'password':
        value = password;
        break;
      case 'confirmPassword':
        value = confirmPassword;
        break;
    }

    const validation = validateField(field, value);
    if (!validation.success) {
      setErrors({ ...errors, [field]: validation.error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleChange = (field: keyof typeof touched, value: string) => {
    // Update the appropriate state
    switch (field) {
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    // Clear form error when user starts typing
    if (errors.form) {
      setErrors({ ...errors, form: undefined });
    }

    // Validate if field has been touched
    if (touched[field]) {
      const validation = validateField(field, value);
      if (!validation.success) {
        setErrors({ ...errors, [field]: validation.error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set all fields as touched for full validation feedback
    setTouched({ password: true, confirmPassword: true });

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      toast.success(
        'Password reset successfully! You can now sign in with your new password.'
      );
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
                      Enter your new password below to complete the reset
                      process and get back to building amazing teams with our
                      AI-powered platform.
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
                  Enter your new password
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
                    Enter your new password below to complete the reset process
                  </p>
                </motion.div>
              </div>

              {/* Error Display */}
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive/10 border-destructive/20 mb-6 rounded-lg border p-4"
                >
                  <p className="text-destructive text-sm font-medium">
                    {errors.form}
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
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-800 dark:bg-green-900/20">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/40">
                        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-foreground mb-2 text-xl font-bold">
                      Password Reset Successfully
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Your password has been reset successfully. You can now
                      sign in with your new password.
                    </p>
                    <div className="space-y-4">
                      <Link href="/app/auth/login">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring h-11 w-full font-medium transition-colors focus:ring-2 focus:ring-offset-2 lg:h-12">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Continue to Sign In
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
                      className="text-foreground text-sm font-semibold"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) =>
                          handleChange('password', e.target.value)
                        }
                        onBlur={() => handleBlur('password')}
                        className={cn(
                          'bg-card focus-ring h-11 pr-12 transition-colors lg:h-12',
                          touched.password && errors.password
                            ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                            : 'border-input focus:border-ring focus:ring-ring/20'
                        )}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPassword(!showPassword);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        tabIndex={-1}
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-foreground text-sm font-semibold"
                    >
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) =>
                          handleChange('confirmPassword', e.target.value)
                        }
                        onBlur={() => handleBlur('confirmPassword')}
                        className={cn(
                          'bg-card focus-ring h-11 pr-12 transition-colors lg:h-12',
                          touched.confirmPassword && errors.confirmPassword
                            ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                            : 'border-input focus:border-ring focus:ring-ring/20'
                        )}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowConfirmPassword(!showConfirmPassword);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        tabIndex={-1}
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.confirmPassword}
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
                        Reset Password
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
