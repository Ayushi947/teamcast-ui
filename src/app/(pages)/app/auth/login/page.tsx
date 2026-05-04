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
import { IAuthUser, UserRoleEnum, UserTypeEnum } from '@/lib/shared';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { loginSchema, ILogin } from '@/lib/shared';
import { authService } from '@/lib/services/services';
import { setUser as setUserInStorage, setToken } from '@/lib/utils/auth-utils';
import TeamcastMobileIcon from '@/components/icons/TeamcastMobileIcon';
import {
  Loader2,
  Brain,
  Users,
  Zap,
  ArrowRight,
  Shield,
  Target,
  Rocket,
  Handshake,
  Eye,
  EyeOff,
  User,
  Building2,
  Sparkles,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';
import { hasParsedJDData } from '@/lib/utils/jd-parser-utils';
import {
  hasParsedResumeData,
  hasPendingResumeTask,
} from '@/lib/utils/resume-draft.utils';
import { cn } from '@/lib/utils';

// Login form validation schema
const loginSchemaBody = loginSchema.shape.body;

type LoginFormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<ILogin>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Get user_type and redirect from URL parameters (Build error fix v2)
  const userType = searchParams.get('user_type')?.toLowerCase() || 'client';
  const redirectUrl = searchParams.get('redirectUrl');

  // Helper function to get user type display info
  const getUserTypeConfig = () => {
    switch (userType) {
      case 'client':
        return {
          title: 'Client Login',
          subtitle: 'Access your hiring dashboard and manage your team',
          description:
            'Sign in to post jobs, review candidates, and build your dream team with AI-powered matching.',
          badge: 'For Employers',
          badgeIcon: Building2,
          primaryColor: 'text-blue-600',
        };
      case 'candidate':
        return {
          title: 'Candidate Login',
          subtitle: 'Continue your career journey',
          description:
            'Sign in to explore opportunities, showcase your skills, and connect with top employers.',
          badge: 'For Job Seekers',
          badgeIcon: User,
          primaryColor: 'text-green-600',
        };
      case 'partner':
        return {
          title: 'Partner Login',
          subtitle: 'Access your partnership dashboard',
          description:
            'Sign in to manage your partnership and help connect talent with opportunities.',
          badge: 'For Partners',
          badgeIcon: Handshake,
          primaryColor: 'text-purple-600',
        };
      default:
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to your account',
          description: 'Continue your journey with AI-powered team building.',
          badge: 'Team Building',
          badgeIcon: Brain,
          primaryColor: 'text-primary',
        };
    }
  };

  const userTypeConfig = getUserTypeConfig();

  // Helper function to get signup link configuration based on user type
  const getSignupLinkConfig = () => {
    switch (userType) {
      case 'client':
        return {
          primaryLink: '/app/client/signup',
          secondaryLinks: [
            { href: '/app/candidate/signup', text: 'Candidate' },
            { href: '/app/partner/signup', text: 'Partner' },
          ],
        };
      case 'partner':
        return {
          primaryLink: '/app/partner/signup',
          secondaryLinks: [
            { href: '/app/client/signup', text: 'Client' },
            { href: '/app/candidate/signup', text: 'Candidate' },
          ],
        };
      case 'candidate':
        return {
          primaryLink: '/app/candidate/signup',
          secondaryLinks: [
            { href: '/app/client/signup', text: 'Client' },
            { href: '/app/partner/signup', text: 'Partner' },
          ],
        };
      default:
        // Default behavior when no user_type is specified
        return {
          primaryLink: '/app/candidate/signup',
          primaryText: 'Sign up as Candidate',
          secondaryLinks: [
            { href: '/app/client/signup', text: 'Client' },
            { href: '/app/partner/signup', text: 'Partner' },
          ],
        };
    }
  };

  const signupConfig = getSignupLinkConfig();

  const validateField = (field: keyof ILogin, value: string) => {
    try {
      const partialSchema = loginSchemaBody.pick({ [field]: true } as {
        [K in keyof ILogin]?: true;
      });
      const result = partialSchema.safeParse({ [field]: value });

      if (!result.success) {
        const fieldError = result.error.errors[0]?.message;
        return { success: false, error: fieldError };
      }

      return { success: true, error: undefined };
    } catch (error) {
      return { success: false, error: error || 'Invalid input' };
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchemaBody.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: LoginFormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginFormErrors;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleBlur = (field: keyof ILogin) => {
    setTouched({ ...touched, [field]: true });

    const validation = validateField(field, formData[field]);
    if (!validation.success) {
      setErrors({ ...errors, [field]: validation.error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ILogin
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });

    if (touched[field as keyof typeof touched]) {
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
    setTouched({ email: true, password: true });

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login(formData);

      if (!result || !result.user || !result.token) {
        throw new Error('Invalid login response');
      }

      // Store token and user data in localStorage
      setToken(result.token);
      setUserInStorage(result.user);

      // Set user in app context
      setUser(result.user);

      const user: IAuthUser = result.user;

      // Show success toast for successful login
      toast.success(`Welcome back, ${user.name}!`);

      // Check if there's a redirect URL
      if (redirectUrl) {
        try {
          const decodedUrl = decodeURIComponent(redirectUrl);
          router.push(decodedUrl);
          return;
        } catch (error) {
          logger.error('Invalid redirect URL:', error);
          // Fall through to default navigation
        }
      }

      if (user.type === UserTypeEnum.CLIENT) {
        // Store subscription data in localStorage as an object
        const subscriptionData = {
          isStarterPackage:
            result.subscriptionOverview?.isStarterPackage || false,
          overallQuotaUsedInPercentage:
            result.subscriptionOverview?.overallQuotaUsedInPercentage || 0,
          activePackRemainingDays:
            result.subscriptionOverview?.activePackRemainingDays || 0,
          subscriptionStatus: result.subscriptionOverview?.subscriptionStatus,
          activePackTotalDays: result.subscriptionOverview?.activePackTotalDays,
        };

        localStorage.setItem(
          'subscriptionData',
          JSON.stringify(subscriptionData)
        );
      }

      if (user.type === UserTypeEnum.CLIENT && hasParsedJDData()) {
        toast.info('Redirecting to job creation...');
        router.push('/app/client/recruiter/sourcing');
        return;
      }

      // Check if candidate has resume draft data
      if (
        user.type === UserTypeEnum.CANDIDATE ||
        user.role === UserRoleEnum.PARTNER_RESOURCE
      ) {
        if (hasParsedResumeData()) {
          toast.info('Redirecting to profile setup...');
          router.push('/app/candidate/onboard/profile');
          return;
        } else if (hasPendingResumeTask()) {
          toast.info(
            'Resume processing in background, redirecting to profile...'
          );
          router.push('/app/candidate/onboard/profile');
          return;
        }
      }

      // Clean up any pending JD data for non-client users or when no parsed JD exists
      localStorage.removeItem('pendingJDData');
      localStorage.removeItem('pendingJDParsingTask');

      // Role-based navigation
      switch (user.type) {
        case UserTypeEnum.CLIENT:
          router.push('/app/client/dashboard');
          break;
        case UserTypeEnum.PARTNER:
          if (user.role === UserRoleEnum.PARTNER_RESOURCE) {
            router.push('/app/candidate/resume');
          } else {
            router.push('/app/partner/dashboard');
          }
          break;
        case UserTypeEnum.CANDIDATE:
          router.push('/app/candidate/dashboard');
          break;
        case UserTypeEnum.SUPPORT:
          router.push('/app/support/dashboard');
          break;
        default:
          logger.error('Unknown user type:', user.type);
          router.push('/');
      }
    } catch (error) {
      logger.error('Login error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to login';
      setErrors({
        ...errors,
        form: errorMessage,
      });
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

  // AI-focused features
  const aiFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description:
        'Intelligent candidate-role matching using advanced AI algorithms',
    },
    {
      icon: Sparkles,
      title: 'Smart Interviews',
      description:
        'AI-driven interview processes that save time and improve accuracy',
    },
    {
      icon: Target,
      title: 'Precision Hiring',
      description: 'Find the perfect fit with our AI-enhanced talent discovery',
    },
    {
      icon: Rocket,
      title: 'Accelerated Growth',
      description: 'Scale your team faster with intelligent automation',
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
          {/* Left Panel - Brand & AI Features - FIXED */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative hidden overflow-hidden lg:fixed lg:top-0 lg:left-0 lg:flex lg:h-screen lg:w-1/2"
          >
            {/* Professional Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6e55cf] via-[#5d46b8] to-[#4c3996]">
              {/* Subtle geometric pattern overlay */}
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
                      <Brain className="h-4 w-4 text-white/90" />
                      <span className="text-sm font-medium text-white">
                        Powered by AI
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-2xl leading-tight font-bold tracking-tight lg:text-4xl xl:text-5xl"
                    >
                      The Future of
                      <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                        Team Building
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/85 lg:text-lg"
                    >
                      Experience the next generation of talent acquisition with
                      AI-powered matching, intelligent interviews, and seamless
                      team collaboration.
                    </motion.p>
                  </div>

                  {/* AI Features Grid */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {aiFeatures.map((feature, index) => (
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
                    Active Users
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    95%
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Match Accuracy
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    50%
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Faster Hiring
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Panel - Login Form - SCROLLABLE */}
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
                  <TeamcastMobileIcon
                    className="mx-auto mb-4 h-10 w-auto"
                    primaryColor=""
                  />
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

                {/* Login Form */}
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
                      className="text-foreground mb-4 text-sm font-semibold"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      placeholder="you@example.com"
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
                    <div className="mb-0 flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-foreground text-sm font-semibold"
                      >
                        Password
                      </Label>
                      <Link
                        href="/app/auth/reset-password/send"
                        className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        disabled={isLoading}
                        value={formData.password}
                        onChange={(e) => handleChange(e, 'password')}
                        onBlur={() => handleBlur('password')}
                        placeholder="Enter your password"
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

                  <Button
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring btn-hover-lift h-11 w-full rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none lg:h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center">
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.form>

                {/* User Type Guidance - Made More Prominent */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-6 lg:mt-8"
                >
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Don&apos;t have an account?{' '}
                      <Link
                        href={signupConfig.primaryLink}
                        className="text-primary hover:text-primary/80 font-semibold transition-colors"
                      >
                        Sign up
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
                    {userType === 'candidate' && (
                      <div className="text-center">
                        <div className="mb-2 flex items-center justify-center space-x-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="text-foreground font-semibold">
                            Looking to hire talent?
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          If you&apos;re an employer looking to post jobs and
                          find the perfect candidates for your team,{' '}
                          <Link
                            href="/app/auth/login?user_type=client"
                            className="font-semibold text-blue-600 transition-colors hover:text-blue-500"
                          >
                            sign in
                          </Link>{' '}
                          or{' '}
                          <Link
                            href="/app/client/signup?user_type=client"
                            className="font-semibold text-blue-600 transition-colors hover:text-blue-500"
                          >
                            sign up
                          </Link>{' '}
                          as a client instead.
                        </p>
                      </div>
                    )}

                    {userType === 'client' && (
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
                            href="/app/candidate/signup?user_type=candidate"
                            className="font-semibold text-green-600 transition-colors hover:text-green-500"
                          >
                            sign up
                          </Link>{' '}
                          as a candidate instead.
                        </p>
                      </div>
                    )}

                    {userType === 'partner' && (
                      <div className="text-center">
                        <div className="mb-2 flex items-center justify-center space-x-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="text-foreground font-semibold">
                            Looking for opportunities?
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          If you&apos;re looking for job opportunities and want
                          to create your profile,{' '}
                          <Link
                            href="/app/auth/login?user_type=candidate"
                            className="font-semibold text-green-600 transition-colors hover:text-green-500"
                          >
                            sign in
                          </Link>{' '}
                          or{' '}
                          <Link
                            href="/app/candidate/signup?user_type=candidate"
                            className="font-semibold text-green-600 transition-colors hover:text-green-500"
                          >
                            sign up
                          </Link>{' '}
                          as a candidate instead.
                        </p>
                      </div>
                    )}
                  </motion.div>
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
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Simple fallback for Suspense - no loading spinner
function LoginPageFallback() {
  return null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
