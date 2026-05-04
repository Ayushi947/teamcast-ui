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
import TeamcastMobileIcon from '@/components/icons/TeamcastMobileIcon';
import {
  IAuthUser,
  ICandidateSignup,
  candidateSignupValidator,
} from '@/lib/shared';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { z } from 'zod';
import {
  Loader2,
  ArrowRight,
  Shield,
  Target,
  User,
  Briefcase,
  TrendingUp,
  Award,
  Eye,
  EyeOff,
  Building2,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { TeamcastIcon } from '@/components/icons';

import { cn } from '@/lib/utils';
import { setToken, setUser as setUserInStorage } from '@/lib/utils/auth-utils';
import { initializeUserData } from '@/lib/hooks/convex-chat-hooks/convex-user-init-hooks';
import {
  candidateSignupService,
  clientJobInviteApiService,
} from '@/lib/services/services';
import { getParsedResumeData } from '@/lib/utils/resume-draft.utils';
import { setJobInviteContext } from '@/lib/utils/job-invite-context.utils';

// Helper function to normalize GPA values
function _normalizeGpa(gpa: unknown): number | undefined {
  if (gpa === null || gpa === undefined || gpa === '') return undefined;

  const numGpa = typeof gpa === 'string' ? parseFloat(gpa) : Number(gpa);
  if (isNaN(numGpa)) return undefined;
  if (numGpa >= 0 && numGpa <= 10) {
    return Math.round(numGpa * 100) / 100;
  }

  return undefined;
}

// Signup form validation schema
const signupSchemaBody = candidateSignupValidator.shape.body;

type SignupFormErrors = {
  name?: string;
  email?: string;
  password?: string;
  jobTitle?: string;
  terms?: string;
  form?: string;
};

type _SocialLinks = {
  linkedin?: string;
  twitter?: string;
  github?: string;
  portfolio?: string;
  leetcode?: string;
};

function CandidateSignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Invite-related state
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteValidation, setInviteValidation] = useState<{
    isValid: boolean;
    email: string;
    name: string;
    jobId: string;
    inviteId: string;
    message?: string;
    isUSBasedJob?: boolean;
  } | null>(null);
  const [isValidatingInvite, setIsValidatingInvite] = useState(false);

  const [formData, setFormData] = useState<ICandidateSignup>({
    name: '',
    email: '',
    password: '',
    jobTitle: '',
  });

  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    jobTitle: false,
    terms: false,
  });

  const userType = searchParams?.get('user_type') ?? 'candidate';

  // Helper function to get user type display info
  const getUserTypeConfig = () => {
    return {
      title: 'Candidate Signup',
      subtitle: 'Start your career journey',
      description:
        'Create your profile and get discovered by top companies looking for your skills.',
      badge: 'For Job Seekers',
      badgeIcon: User,
      primaryColor: 'text-green-600',
    };
  };

  const userTypeConfig = getUserTypeConfig();

  // Validate invite token on component mount
  useEffect(() => {
    const inviteId = searchParams?.get('inviteId');
    const email = searchParams?.get('email');

    if (inviteId) {
      setInviteToken(inviteId);
      validateInviteToken(inviteId);
    }

    // Pre-fill email if provided in URL
    if (email) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(email),
      }));
    }
  }, [searchParams]);

  // Validate invite token
  const validateInviteToken = async (token: string) => {
    setIsValidatingInvite(true);
    try {
      const validation =
        await clientJobInviteApiService.validateInviteToken(token);
      setInviteValidation(validation);

      if (validation.isValid) {
        setJobInviteContext({
          inviteId: validation.inviteId,
          jobId: validation.jobId,
          isUSBasedJob: validation.isUSBasedJob ?? false,
          timestamp: Date.now(),
        });

        // Pre-fill form with invite data (from API response, not storage)
        setFormData((prev) => ({
          ...prev,
          email: validation.email,
          name: validation.name,
        }));

        // Mark email as touched since it's pre-filled
        setTouched((prev) => ({
          ...prev,
          email: true,
        }));

        logger.info('Job invite validated and stored securely', {
          inviteId: validation.inviteId,
          isUSBasedJob: validation.isUSBasedJob,
        });
      } else {
        toast.error(validation.message || 'Invalid invitation link');
      }
    } catch (error) {
      logger.error('Error validating invite token:', error);
      setInviteValidation({
        isValid: false,
        email: '',
        name: '',
        jobId: '',
        inviteId: '',
        message: 'Failed to validate invitation',
      });
      toast.error('Failed to validate invitation link');
    } finally {
      setIsValidatingInvite(false);
    }
  };

  // Prepopulate jobTitle, name, and email from resume draft if available
  useEffect(() => {
    const resumeDraft = getParsedResumeData();
    if (resumeDraft && !inviteValidation?.isValid) {
      // Only use draft if no valid invite
      try {
        const parsedResume = resumeDraft.parsedResume || resumeDraft;
        setFormData((prev) => ({
          ...prev,
          jobTitle:
            typeof parsedResume.currentJobTitle === 'string'
              ? parsedResume.currentJobTitle
              : prev.jobTitle,
          name:
            typeof parsedResume.name === 'string' && !prev.name
              ? parsedResume.name
              : prev.name,
          email:
            typeof parsedResume.email === 'string' && !prev.email
              ? parsedResume.email
              : prev.email,
        }));
      } catch (error) {
        logger.error('Failed to parse resume draft:', error);
      }
    }
  }, [inviteValidation]);

  const validateField = (
    field: keyof ICandidateSignup | 'terms',
    value: unknown
  ) => {
    logger.debug(`validateField ${field} ${value}`);
    try {
      if (field === 'name') {
        signupSchemaBody.shape.name.parse(value);
      } else if (field === 'email') {
        signupSchemaBody.shape.email.parse(value);
      } else if (field === 'password') {
        signupSchemaBody.shape.password.parse(value);
      } else if (field === 'jobTitle') {
        signupSchemaBody.shape.jobTitle.parse(value);
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

  const handleBlur = (field: keyof ICandidateSignup | 'terms') => {
    setTouched({ ...touched, [field]: true });

    const validation = validateField(
      field,
      field === 'terms'
        ? termsAgreed
        : formData[field as keyof ICandidateSignup]
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
    field: keyof ICandidateSignup | 'terms'
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

      // Real-time validation for touched fields
      if (touched[field as keyof typeof touched]) {
        const validation = validateField(field, value);
        if (!validation.success) {
          setErrors({ ...errors, [field]: validation.error });
        } else {
          const newErrors = { ...errors };
          delete newErrors[field as keyof typeof newErrors];
          setErrors(newErrors);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTouched({
      name: true,
      email: true,
      password: true,
      jobTitle: true,
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
        email: formData.email.trim(),
        password: formData.password.trim(),
        jobTitle: formData.jobTitle?.trim() || '',
        timezone: timezone,
      };

      // Call signup with invite token if available
      const result = inviteToken
        ? await candidateSignupService.signup(trimmedFormData, inviteToken)
        : await candidateSignupService.signup(trimmedFormData);

      if (!result.user) {
        throw new Error(`Error creating account: ${result.message}`);
      }

      // Store token and user data in localStorage
      setToken(result.token);
      setUserInStorage(result.user);

      // Set user in app context
      setUser(result.user);

      initializeUserData(result.user as IAuthUser);

      // Use the backend response message to determine redirect logic
      // Backend returns different messages for invite vs regular signup
      const isInviteBasedSignup = result.message.includes('via invitation');

      if (isInviteBasedSignup) {
        toast.success(
          `Welcome ${result.user.name}! Your account has been created via invitation.`
        );
        // Redirect to onboarding for invite-based signup (email already verified)
        router.push('/app/candidate/onboard/resume');
      } else {
        toast.success(
          `Account created successfully! Welcome ${result.user.name}. Please verify your email to continue.`
        );
        // Always redirect to email verification for regular signup
        router.push('/app/auth/email-verification');
      }
    } catch (err) {
      logger.error('Error during signup:', err);

      let errorMessage = 'Failed to create account. Please try again.';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
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

      toast.error(extractedMessage);
      setErrors({ form: extractedMessage });
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

  // Candidate-focused features
  const candidateFeatures = [
    {
      icon: Briefcase,
      title: 'Dream Opportunities',
      description:
        'Access exclusive jobs from top companies looking for your skills',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description:
        'AI-powered career insights and personalized growth recommendations',
    },
    {
      icon: Award,
      title: 'Skill Recognition',
      description:
        'Showcase your expertise and get recognized by industry leaders',
    },
    {
      icon: Target,
      title: 'Perfect Matches',
      description: 'Get matched with roles that align with your career goals',
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
          {/* Left Panel - Brand & Candidate Features - FIXED */}
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
                onClick={() => router.push('/candidate')}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex cursor-pointer items-center space-x-3"
              >
                <TeamcastIcon
                  className="h-10 w-auto text-white lg:h-12"
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
                      <User className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium text-white">
                        For Candidates
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl leading-tight font-bold tracking-tight text-white lg:text-5xl xl:text-6xl"
                    >
                      Launch Your
                      <span className="block bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                        Dream Career
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/90 lg:text-xl"
                    >
                      Join thousands of professionals who found their perfect
                      roles through our AI-powered platform. Get discovered by
                      top companies and accelerate your career growth.
                    </motion.p>
                  </div>

                  {/* Candidate Features Grid with Glass Effect */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {candidateFeatures.map((feature, index) => (
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

                {/* Social Login */}
                {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mb-6 space-y-3 lg:space-y-4"
              >
                <div className="py-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    Authentication methods are being updated. Please contact
                    support for signup assistance.
                  </p>
                </div>
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
                      disabled={isLoading || isValidatingInvite}
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
                      htmlFor="email"
                      className="text-foreground text-sm font-semibold"
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
                      disabled={
                        isLoading ||
                        isValidatingInvite ||
                        (inviteValidation?.isValid && !!inviteValidation.email)
                      }
                      value={formData.email}
                      onChange={(e) => handleChange(e, 'email')}
                      onBlur={() => handleBlur('email')}
                      className={cn(
                        'bg-card focus-ring h-11 transition-colors lg:h-12',
                        inviteValidation?.isValid && inviteValidation.email
                          ? 'bg-gray-50 dark:bg-gray-800'
                          : '',
                        touched.email && errors.email
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-input focus:border-ring focus:ring-ring/20'
                      )}
                    />
                    {inviteValidation?.isValid && inviteValidation.email && (
                      <p className="mt-1 text-xs font-medium text-green-600">
                        Email from verification link
                      </p>
                    )}
                    {touched.email && errors.email && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="jobTitle"
                      className="text-foreground text-sm font-semibold"
                    >
                      Current Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g. Software Engineer, Product Manager"
                      type="text"
                      autoComplete="organization-title"
                      disabled={isLoading || isValidatingInvite}
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
                        disabled={isLoading || isValidatingInvite}
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
                      disabled={isValidatingInvite}
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
                    disabled={isLoading || isValidatingInvite}
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
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-foreground font-semibold">
                          Looking to hire talent?
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        If you&apos;re an employer looking to post jobs and find
                        the perfect candidates for your team,{' '}
                        <Link
                          href="/app/auth/login?user_type=client"
                          className="font-semibold text-blue-600 transition-colors hover:text-blue-500"
                        >
                          sign in
                        </Link>{' '}
                        or{' '}
                        <Link
                          href="/app/client/signup"
                          className="font-semibold text-blue-600 transition-colors hover:text-blue-500"
                        >
                          sign up
                        </Link>{' '}
                        as a client instead.
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
                    <Target className="h-3 w-3" />
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>50K+ Professionals</span>
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
      <CandidateSignupContent />
    </Suspense>
  );
}
