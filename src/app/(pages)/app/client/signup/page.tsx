'use client';

import { useApp } from '@/lib/context/app-context';
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
import { IAuthUser, IClientSignup, clientSignupValidator } from '@/lib/shared';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { z } from 'zod';
import {
  Loader2,
  ArrowRight,
  Shield,
  Target,
  Rocket,
  Brain,
  Sparkles,
  Users,
  User,
  Zap,
  Building2,
  EyeOff,
  Eye,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';
import TeamcastMobileIcon from '@/components/icons/TeamcastMobileIcon';
import { cn } from '@/lib/utils';

import { initializeUserData } from '@/lib/hooks/convex-chat-hooks/convex-user-init-hooks';
import { clientSignupService } from '@/lib/services/services';
import { setToken, setUser as setUserInStorage } from '@/lib/utils/auth-utils';

// Signup form validation schema
const signupSchemaBody = clientSignupValidator.shape.body;

type SignupFormErrors = {
  name?: string;
  companyName?: string;
  jobTitle?: string;
  email?: string;
  password?: string;
  terms?: string;
  form?: string;
};

function ClientSignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<IClientSignup>({
    name: '',
    companyName: '',
    jobTitle: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [touched, setTouched] = useState({
    name: false,
    companyName: false,
    jobTitle: false,
    email: false,
    password: false,
    terms: false,
  });

  const userType = searchParams.get('user_type') ?? 'client';
  const validity = searchParams.get('validity');

  // Debug logging for validity parameter

  // Helper function to get user type display info
  const getUserTypeConfig = () => {
    return {
      title: 'Client Signup',
      subtitle: 'Create your hiring account',
      description:
        'Join thousands of companies building exceptional teams with AI-powered matching.',
      badge: 'For Employers',
      badgeIcon: Building2,
      primaryColor: 'text-blue-600',
    };
  };

  const userTypeConfig = getUserTypeConfig();

  const validateField = (field: keyof IClientSignup | 'terms', value: any) => {
    logger.debug(`validateField ${field} ${value}`);
    try {
      if (field === 'name') {
        signupSchemaBody.shape.name.parse(value);
      } else if (field === 'companyName') {
        signupSchemaBody.shape.companyName.parse(value);
      } else if (field === 'jobTitle') {
        signupSchemaBody.shape.jobTitle.parse(value);
      } else if (field === 'email') {
        signupSchemaBody.shape.email.parse(value);
      } else if (field === 'password') {
        signupSchemaBody.shape.password.parse(value);
      } else if (field === 'terms') {
        if (!value) {
          throw new Error(
            'You must agree to the Terms of Service and Privacy Policy'
          );
        }
      }
      return { success: true, error: undefined };
    } catch (error) {
      if (error instanceof Error) {
        const fieldError = (error as z.ZodError).errors[0]?.message;
        return { success: false, error: fieldError };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid input',
      };
    }
  };

  const validateForm = (): boolean => {
    try {
      // Validate signup data
      signupSchemaBody.parse(formData);

      // Validate terms agreement separately
      if (!termsAgreed) {
        setErrors({
          ...errors,
          terms: 'You must agree to the Terms of Service and Privacy Policy',
        });
        return false;
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: SignupFormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof SignupFormErrors;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleBlur = (field: keyof IClientSignup | 'terms') => {
    setTouched({ ...touched, [field]: true });

    const validation = validateField(
      field,
      field === 'terms' ? termsAgreed : formData[field as keyof IClientSignup]
    );

    if (!validation.success) {
      setErrors({ ...errors, [field]: validation.error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field as keyof typeof newErrors];
      setErrors(newErrors);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof IClientSignup | 'terms'
  ) => {
    if (field === 'terms') {
      setTermsAgreed(e.target.checked);

      if (touched.terms) {
        const validation = validateField('terms', e.target.checked);
        if (!validation.success) {
          setErrors({ ...errors, terms: validation.error });
        } else {
          const newErrors = { ...errors };
          delete newErrors.terms;
          setErrors(newErrors);
        }
      }
    } else {
      const value = e.target.value;
      setFormData({ ...formData, [field]: value });

      // Real-time validation for all fields
      const validation = validateField(field, value);
      if (!validation.success) {
        setErrors({ ...errors, [field]: validation.error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[field as keyof typeof newErrors];
        setErrors(newErrors);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      companyName: true,
      jobTitle: true,
      email: true,
      password: true,
      terms: true,
    });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Trim all string values before submission
      const trimmedFormData = {
        ...formData,
        name: formData.name.trim(),
        companyName: formData.companyName.trim(),
        jobTitle: formData.jobTitle.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        selectedPlan: searchParams.get('selected_plan') ?? '',
        validity: validity ? parseInt(validity, 10) : undefined,
      };

      const result = await clientSignupService.signup(
        trimmedFormData as IClientSignup
      );

      if (!result || !result.user || !result.token) {
        throw new Error('Invalid login response');
      }

      // Store token and user data in localStorage
      setToken(result.token);
      setUserInStorage(result.user);

      // Set user in app context
      setUser(result.user);

      initializeUserData(result.user as IAuthUser);
      toast.success(
        `Account created successfully! Welcome ${result.user.name}`
      );
      router.push('/app/auth/email-verification');
    } catch (error) {
      logger.error('Signup error:', error);

      let errorMessage = 'Failed to register. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }

      // Extract the actual error message if it's in a nested format
      let extractedMessage =
        errorMessage.split(':').pop()?.trim() || errorMessage;

      // Handle case where error might still be a stringified object
      try {
        const parsed = JSON.parse(extractedMessage);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          extractedMessage = parsed[0].message;
        }
      } catch {
        // If it's not JSON, keep the original message
      }

      setErrors({ ...errors, form: extractedMessage });
      toast.error(extractedMessage);
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

  // Client-focused features
  const clientFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description:
        'Find the perfect candidates with intelligent AI matching algorithms',
    },
    {
      icon: Sparkles,
      title: 'Smart Screening',
      description:
        'Automated candidate screening saves time and improves quality',
    },
    {
      icon: Target,
      title: 'Precision Hiring',
      description:
        'Target the right talent with data-driven insights and analytics',
    },
    {
      icon: Rocket,
      title: 'Rapid Deployment',
      description: 'Scale your team quickly with streamlined hiring processes',
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
          {/* Left Panel - Brand & Client Features - FIXED */}
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
            {/* Additional glass orbs for depth */}
            <div className="absolute top-1/3 right-1/4 h-20 w-20 animate-pulse rounded-full bg-white/8 blur-2xl backdrop-blur-md delay-700"></div>
            <div className="absolute bottom-1/3 left-1/4 h-28 w-28 animate-pulse rounded-full bg-white/12 blur-xl backdrop-blur-lg delay-300"></div>

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
                      <Building2 className="h-4 w-4 text-white/90" />
                      <span className="text-sm font-medium text-white/95">
                        For Clients
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl leading-tight font-bold tracking-tight lg:text-5xl xl:text-6xl"
                    >
                      Scale Your Team
                      <span className="block bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                        With AI Power
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/85 lg:text-xl"
                    >
                      Connect with top-tier talent through our AI-powered
                      platform. Streamline your hiring process and build
                      exceptional teams faster than ever before.
                    </motion.p>
                  </div>

                  {/* Client Features Grid */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {clientFeatures.map((feature, index) => (
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

          {/* Right Panel - Signup Form - SCROLLABLE */}
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

                  <div className="mb-2 flex items-center justify-center">
                    <div
                      className={cn(
                        'inline-flex items-center space-x-2 rounded-full border px-3 py-1 text-xs font-medium',
                        userTypeConfig.primaryColor,
                        'border-current/20 bg-current/5'
                      )}
                    >
                      <userTypeConfig.badgeIcon className="h-3 w-3" />
                      <span>{userTypeConfig.badge}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {userTypeConfig.subtitle}
                  </p>
                </div>

                {/* Desktop Header */}
                <div className="mb-8 hidden lg:mb-10 lg:block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="mb-3 flex items-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={cn(
                          'inline-flex items-center space-x-2 rounded-full border px-4 py-2 backdrop-blur-sm',
                          userTypeConfig.primaryColor,
                          'border-current/20 bg-current/10'
                        )}
                      >
                        <userTypeConfig.badgeIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {userTypeConfig.badge}
                        </span>
                      </motion.div>
                    </div>
                    <p className="text-muted-foreground">
                      {userTypeConfig.description}
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

                {/* Authentication Notice */}
                {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mb-6 py-6 text-center"
              >
                <p className="text-muted-foreground text-sm">
                  Authentication methods are being updated. Please contact
                  support for signup assistance.
                </p>
              </motion.div> */}

                {/* Divider */}
                {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="my-6 flex items-center lg:my-8"
              >
                <div className="border-border flex-1 border-t"></div>
                <div className="text-muted-foreground px-4 text-sm font-medium">
                  Or continue with email
                </div>
                <div className="border-border flex-1 border-t"></div>
              </motion.div> */}

                {/* Signup Form */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 lg:space-y-5"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-foreground text-sm font-semibold"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      type="text"
                      autoComplete="name"
                      disabled={isLoading}
                      value={formData.name}
                      onChange={(e) => handleChange(e, 'name')}
                      onBlur={() => handleBlur('name')}
                      className={cn(
                        'bg-card focus-ring h-11 transition-colors lg:h-12',
                        touched.name && errors.name
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-input focus:border-ring focus:ring-ring/20'
                      )}
                    />
                    {touched.name && errors.name && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="companyName"
                      className="text-foreground text-sm font-semibold"
                    >
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Enter your company name"
                      type="text"
                      autoComplete="organization"
                      disabled={isLoading}
                      value={formData.companyName}
                      onChange={(e) => handleChange(e, 'companyName')}
                      onBlur={() => handleBlur('companyName')}
                      className={cn(
                        'bg-card focus-ring h-11 transition-colors lg:h-12',
                        touched.companyName && errors.companyName
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-input focus:border-ring focus:ring-ring/20'
                      )}
                    />
                    {touched.companyName && errors.companyName && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="jobTitle"
                      className="text-foreground text-sm font-semibold"
                    >
                      Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      placeholder="Enter your job title"
                      type="text"
                      autoComplete="organization-title"
                      disabled={isLoading}
                      value={formData.jobTitle}
                      onChange={(e) => handleChange(e, 'jobTitle')}
                      onBlur={() => handleBlur('jobTitle')}
                      className={cn(
                        'bg-card focus-ring h-11 transition-colors lg:h-12',
                        touched.jobTitle && errors.jobTitle
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-input focus:border-ring focus:ring-ring/20'
                      )}
                    />
                    {touched.jobTitle && errors.jobTitle && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.jobTitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-foreground text-sm font-semibold"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      placeholder="you@company.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      value={formData.email}
                      onChange={(e) => handleChange(e, 'email')}
                      onBlur={() => handleBlur('email')}
                      className={cn(
                        'bg-card focus-ring h-11 transition-colors lg:h-12',
                        touched.email && errors.email
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-input focus:border-ring focus:ring-ring/20'
                      )}
                    />
                    {touched.email && errors.email && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-foreground text-sm font-semibold"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={isLoading}
                        value={formData.password}
                        onChange={(e) => handleChange(e, 'password')}
                        onBlur={() => handleBlur('password')}
                        placeholder="Create a secure password"
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

                  {/* Terms Checkbox */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAgreed}
                      onChange={(e) => handleChange(e, 'terms')}
                      onBlur={() => handleBlur('terms')}
                      className={cn(
                        'text-primary focus:ring-primary/20 mt-1 h-4 w-4 cursor-pointer rounded border',
                        touched.terms && errors.terms
                          ? 'border-destructive'
                          : 'border-input'
                      )}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="terms"
                        className="text-muted-foreground cursor-pointer text-sm"
                      >
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          className="text-primary hover:text-primary/80 hover:underline"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/privacy"
                          className="text-primary hover:text-primary/80 hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                      {touched.terms && errors.terms && (
                        <p className="text-destructive mt-1 text-xs font-medium">
                          {errors.terms}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring btn-hover-lift h-11 w-full rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none lg:h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center">
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.form>

                {/* Sign In Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-6 lg:mt-8"
                >
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Already have an account?{' '}
                      <Link
                        href={`/app/auth/login?user_type=${userType}`}
                        className="text-primary hover:text-primary/80 font-semibold transition-colors"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>

                  {/* Enhanced User Type Guidance */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="border-border/50 bg-card/50 mt-4 rounded-xl border p-4 backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <div className="mb-2 flex items-center justify-center space-x-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="text-foreground font-semibold">
                          Looking for job opportunities?
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        If you&apos;re a job seeker looking to create your
                        profile and get discovered by top companies,{' '}
                        <Link
                          href="/app/auth/login?user_type=candidate"
                          className="font-semibold text-green-600 transition-colors hover:text-green-500"
                        >
                          sign in
                        </Link>{' '}
                        or{' '}
                        <Link
                          href="/app/candidate/signup"
                          className="font-semibold text-green-600 transition-colors hover:text-green-500"
                        >
                          sign up
                        </Link>{' '}
                        as a candidate instead.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-muted-foreground mt-6 flex items-center justify-center space-x-4 text-xs lg:mt-8 lg:space-x-6"
                >
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>Fast Setup</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Trusted by 5K+</span>
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

export default function ClientSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientSignupContent />
    </Suspense>
  );
}
