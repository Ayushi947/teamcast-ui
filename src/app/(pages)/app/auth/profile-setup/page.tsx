'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactPhoneInput } from '@/components/ui/contact-phone-input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Building2,
  ArrowRight,
  Loader2,
  Shield,
  Target,
  Rocket,
  Brain,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { TeamcastIcon } from '@/components/icons';
import { useApp } from '@/lib/context/app-context';
import {
  IClientProfileSetup,
  IPartnerProfileSetup,
  CompanyIndustryEnum,
  CompanySizeEnum,
  UserTypeEnum,
} from '@/lib/shared';

import {
  clientProfileSetupService,
  partnerProfileSetupService,
} from '@/lib/services/services';
import { logger } from '@/lib/logger';

import { getUser } from '@/lib/utils/auth-utils';

import { cn } from '@/lib/utils';

// Client profile setup schema
const clientProfileSetupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required'),
  companyIndustry: z.nativeEnum(CompanyIndustryEnum, {
    errorMap: () => ({ message: 'Please select an industry' }),
  }),
  companySize: z.nativeEnum(CompanySizeEnum, {
    errorMap: () => ({ message: 'Please select company size' }),
  }),
  jobTitle: z.string().min(2, 'Job title is required'),
  companyDescription: z.string().optional(),
});

// Partner profile setup schema
const partnerProfileSetupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required'),
  title: z.string().min(2, 'Title is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  experience: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientProfileSetupSchema>;
type PartnerFormData = z.infer<typeof partnerProfileSetupSchema>;

type ProfileSetupFormErrors = {
  name?: string;
  phone?: string;
  companyName?: string;
  companyIndustry?: string;
  companySize?: string;
  jobTitle?: string;
  companyDescription?: string;
  title?: string;
  specialization?: string;
  experience?: string;
  form?: string;
};

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserTypeEnum | null>(null);
  const [errors, setErrors] = useState<ProfileSetupFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [phoneValidationError, setPhoneValidationError] = useState<
    string | null
  >(null);

  // Client form data
  const [clientFormData, setClientFormData] = useState<ClientFormData>({
    name: '',
    phone: '',
    companyName: '',
    companyIndustry: CompanyIndustryEnum.TECHNOLOGY,
    companySize: CompanySizeEnum.ONE_TO_TEN,
    jobTitle: '',
    companyDescription: '',
  });

  // Partner form data
  const [partnerFormData, setPartnerFormData] = useState<PartnerFormData>({
    name: '',
    phone: '',
    companyName: '',
    title: '',
    specialization: '',
    experience: '',
  });

  // Determine user type and set initial form data
  useEffect(() => {
    if (user?.type) {
      setUserType(user.type as UserTypeEnum);
      // Set initial form data with user name
      setClientFormData((prev) => ({ ...prev, name: user.name || '' }));
      setPartnerFormData((prev) => ({ ...prev, name: user.name || '' }));
    } else {
      // Fallback: get from localStorage
      const userData = getUser();
      if (userData) {
        setUserType(userData.type as UserTypeEnum);
        setClientFormData((prev) => ({
          ...prev,
          name: userData.name || '',
        }));
        setPartnerFormData((prev) => ({
          ...prev,
          name: userData.name || '',
        }));
      } else {
        router.push('/app/auth/login');
      }
    }
  }, [user, router]);

  const validateClientField = (field: keyof ClientFormData, value: any) => {
    try {
      if (field === 'name') {
        clientProfileSetupSchema.shape.name.parse(value);
      } else if (field === 'companyName') {
        clientProfileSetupSchema.shape.companyName.parse(value);
      } else if (field === 'jobTitle') {
        clientProfileSetupSchema.shape.jobTitle.parse(value);
      } else if (field === 'companyIndustry') {
        clientProfileSetupSchema.shape.companyIndustry.parse(value);
      } else if (field === 'companySize') {
        clientProfileSetupSchema.shape.companySize.parse(value);
      } else if (field === 'phone') {
        if (value && value.trim() !== '') {
          clientProfileSetupSchema.shape.phone.parse(value);
        }
        return { success: true, error: undefined };
      } else if (field === 'companyDescription') {
        if (value && value.trim() !== '') {
          clientProfileSetupSchema.shape.companyDescription.parse(value);
        }
        return { success: true, error: undefined };
      }
      return { success: true, error: undefined };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0]?.message;
        return { success: false, error: fieldError };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid input',
      };
    }
  };

  const validatePartnerField = (field: keyof PartnerFormData, value: any) => {
    try {
      if (field === 'name') {
        partnerProfileSetupSchema.shape.name.parse(value);
      } else if (field === 'companyName') {
        partnerProfileSetupSchema.shape.companyName.parse(value);
      } else if (field === 'title') {
        partnerProfileSetupSchema.shape.title.parse(value);
      } else if (field === 'specialization') {
        partnerProfileSetupSchema.shape.specialization.parse(value);
      } else if (field === 'phone') {
        if (value && value.trim() !== '') {
          partnerProfileSetupSchema.shape.phone.parse(value);
        }
        return { success: true, error: undefined };
      } else if (field === 'experience') {
        if (value && value.trim() !== '') {
          partnerProfileSetupSchema.shape.experience.parse(value);
        }
        return { success: true, error: undefined };
      }
      return { success: true, error: undefined };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0]?.message;
        return { success: false, error: fieldError };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid input',
      };
    }
  };

  const validateClientForm = (): boolean => {
    try {
      clientProfileSetupSchema.parse(clientFormData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ProfileSetupFormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof ProfileSetupFormErrors;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validatePartnerForm = (): boolean => {
    try {
      partnerProfileSetupSchema.parse(partnerFormData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ProfileSetupFormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof ProfileSetupFormErrors;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleClientBlur = (field: keyof ClientFormData) => {
    setTouched({ ...touched, [field]: true });

    const validation = validateClientField(field, clientFormData[field]);
    if (!validation.success) {
      setErrors({ ...errors, [field]: validation.error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field as keyof typeof newErrors];
      setErrors(newErrors);
    }
  };

  const handlePartnerBlur = (field: keyof PartnerFormData) => {
    setTouched({ ...touched, [field]: true });

    const validation = validatePartnerField(field, partnerFormData[field]);
    if (!validation.success) {
      setErrors({ ...errors, [field]: validation.error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field as keyof typeof newErrors];
      setErrors(newErrors);
    }
  };

  const handleClientChange = (field: keyof ClientFormData, value: any) => {
    setClientFormData({ ...clientFormData, [field]: value });

    // Real-time validation for touched fields
    if (touched[field]) {
      const validation = validateClientField(field, value);
      if (!validation.success) {
        setErrors({ ...errors, [field]: validation.error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[field as keyof typeof newErrors];
        setErrors(newErrors);
      }
    }
  };

  const handlePartnerChange = (field: keyof PartnerFormData, value: any) => {
    setPartnerFormData({ ...partnerFormData, [field]: value });

    // Real-time validation for touched fields
    if (touched[field]) {
      const validation = validatePartnerField(field, value);
      if (!validation.success) {
        setErrors({ ...errors, [field]: validation.error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[field as keyof typeof newErrors];
        setErrors(newErrors);
      }
    }
  };

  const onClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      companyName: true,
      jobTitle: true,
      companyIndustry: true,
      companySize: true,
      phone: true,
      companyDescription: true,
    });

    if (!validateClientForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const profileData: IClientProfileSetup = {
        name: clientFormData.name.trim(),
        phone: clientFormData.phone?.trim(),
        companyName: clientFormData.companyName.trim(),
        companyIndustry: clientFormData.companyIndustry,
        companySize: clientFormData.companySize,
        jobTitle: clientFormData.jobTitle.trim(),
        companyDescription: clientFormData.companyDescription?.trim(),
      };

      await clientProfileSetupService.completeProfileSetup(profileData);

      toast.success('Profile setup completed successfully!');
      router.push('/app/client/dashboard');
    } catch (error) {
      logger.error('Failed to complete client profile setup', error);
      toast.error('Failed to complete profile setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      companyName: true,
      title: true,
      specialization: true,
      phone: true,
      experience: true,
    });

    if (!validatePartnerForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const profileData: IPartnerProfileSetup = {
        name: partnerFormData.name.trim(),
        phone: partnerFormData.phone?.trim(),
        companyName: partnerFormData.companyName.trim(),
        title: partnerFormData.title.trim(),
        specialization: partnerFormData.specialization.trim(),
        experience: partnerFormData.experience?.trim(),
      };

      await partnerProfileSetupService.completeProfileSetup(profileData);

      toast.success('Profile setup completed successfully!');
      router.push('/app/partner/dashboard');
    } catch (error) {
      logger.error('Failed to complete partner profile setup', error);
      toast.error('Failed to complete profile setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isClient = userType === UserTypeEnum.CLIENT;
  const isPartner = userType === UserTypeEnum.PARTNER;

  // If user is not client or partner, redirect
  if (!isClient && !isPartner) {
    router.push('/app/dashboard');
    return null;
  }

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

  // Partner-focused features
  const partnerFeatures = [
    {
      icon: Brain,
      title: 'Expert Network',
      description: 'Connect with industry professionals and thought leaders',
    },
    {
      icon: Sparkles,
      title: 'Premium Opportunities',
      description: 'Access exclusive partnership deals and collaborations',
    },
    {
      icon: Users,
      title: 'Collaboration Tools',
      description: 'Advanced project management and team coordination features',
    },
    {
      icon: Target,
      title: 'Skill Matching',
      description: 'Get matched with projects that align with your expertise',
    },
  ];

  const features = isClient ? clientFeatures : partnerFeatures;

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
            className="relative hidden overflow-hidden lg:flex lg:w-1/2"
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
                      <Building2 className="h-4 w-4 text-white/90" />
                      <span className="text-sm font-medium text-white/95">
                        {isClient ? 'For Clients' : 'For Partners'}
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl leading-tight font-bold tracking-tight lg:text-5xl xl:text-6xl"
                    >
                      {isClient ? 'Complete Your' : 'Setup Your'}
                      <span className="block bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                        {isClient ? 'Company Profile' : 'Partner Profile'}
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg leading-relaxed text-white/85 lg:text-xl"
                    >
                      {isClient
                        ? 'Set up your company profile to start finding the perfect candidates for your team.'
                        : 'Configure your partner profile to begin collaborating with top talent and clients.'}
                    </motion.p>
                  </div>

                  {/* Features Grid */}
                  <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6"
                  >
                    {features.map((feature, index) => (
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
                    {isClient ? 'Happy Clients' : 'Active Partners'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    50K+
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    {isClient ? 'Successful Hires' : 'Projects Completed'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white lg:text-2xl">
                    90%
                  </div>
                  <div className="text-xs text-white/70 lg:text-sm">
                    Satisfaction Rate
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Panel - Profile Setup Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-card flex min-h-screen flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-8"
          >
            <div className="w-full max-w-sm lg:max-w-md">
              {/* Mobile Header */}
              <div className="mb-8 text-center lg:hidden">
                <TeamcastIcon className="mx-auto mb-4 h-10 w-auto" />
                <h1 className="text-foreground text-2xl font-bold">
                  Profile Setup
                </h1>
                <p className="text-muted-foreground mt-2">
                  {isClient
                    ? 'Complete your company profile'
                    : 'Setup your partner profile'}
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
                    {isClient
                      ? 'Company Profile Setup'
                      : 'Partner Profile Setup'}
                  </h2>
                  <p className="text-muted-foreground">
                    {isClient
                      ? 'Tell us about your company to get started'
                      : 'Share your expertise to unlock opportunities'}
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

              {/* Client Form */}
              {isClient && (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onSubmit={onClientSubmit}
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
                      type="text"
                      placeholder="Enter your full name"
                      value={clientFormData.name}
                      onChange={(e) => {
                        handleClientChange('name', e.target.value);
                      }}
                      onBlur={() => handleClientBlur('name')}
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
                      type="text"
                      placeholder="Enter your company name"
                      value={clientFormData.companyName}
                      onChange={(e) => {
                        handleClientChange('companyName', e.target.value);
                      }}
                      onBlur={() => handleClientBlur('companyName')}
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
                      type="text"
                      placeholder="e.g., CEO, HR Manager, Recruiter"
                      value={clientFormData.jobTitle}
                      onChange={(e) => {
                        handleClientChange('jobTitle', e.target.value);
                      }}
                      onBlur={() => handleClientBlur('jobTitle')}
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
                    <ContactPhoneInput
                      value={clientFormData.phone}
                      onChange={(value) => handleClientChange('phone', value)}
                      onValidationError={setPhoneValidationError}
                      placeholder="Enter your phone number"
                      label="Phone Number (Optional)"
                      className="bg-card focus-ring border-input focus:border-ring focus:ring-ring/20 h-11 transition-colors lg:h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="companyIndustry"
                      className="text-foreground text-sm font-semibold"
                    >
                      Industry
                    </Label>
                    <Select
                      value={clientFormData.companyIndustry}
                      onValueChange={(value) => {
                        handleClientChange(
                          'companyIndustry',
                          value as CompanyIndustryEnum
                        );
                      }}
                    >
                      <SelectTrigger className="bg-card focus-ring border-input focus:border-ring focus:ring-ring/20 h-11 transition-colors lg:h-12">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CompanyIndustryEnum).map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="companySize"
                      className="text-foreground text-sm font-semibold"
                    >
                      Company Size
                    </Label>
                    <Select
                      value={clientFormData.companySize}
                      onValueChange={(value) => {
                        handleClientChange(
                          'companySize',
                          value as CompanySizeEnum
                        );
                      }}
                    >
                      <SelectTrigger className="bg-card focus-ring border-input focus:border-ring focus:ring-ring/20 h-11 transition-colors lg:h-12">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CompanySizeEnum).map((size) => (
                          <SelectItem key={size} value={size}>
                            {size
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="companyDescription"
                      className="text-foreground text-sm font-semibold"
                    >
                      Company Description (Optional)
                    </Label>
                    <Textarea
                      id="companyDescription"
                      placeholder="Tell us about your company..."
                      value={clientFormData.companyDescription}
                      onChange={(e) => {
                        handleClientChange(
                          'companyDescription',
                          e.target.value
                        );
                      }}
                      onBlur={() => handleClientBlur('companyDescription')}
                      rows={3}
                      className="bg-card focus-ring border-input focus:border-ring focus:ring-ring/20 transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || phoneValidationError !== null}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring btn-hover-lift h-11 w-full rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none lg:h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center">
                        Complete Setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              )}

              {/* Partner Form */}
              {isPartner && (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onSubmit={onPartnerSubmit}
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
                      type="text"
                      placeholder="Enter your full name"
                      value={partnerFormData.name}
                      onChange={(e) => {
                        handlePartnerChange('name', e.target.value);
                      }}
                      onBlur={() => handlePartnerBlur('name')}
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
                      Company/Organization Name
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Enter your company or organization name"
                      value={partnerFormData.companyName}
                      onChange={(e) => {
                        handlePartnerChange('companyName', e.target.value);
                      }}
                      onBlur={() => handlePartnerBlur('companyName')}
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
                      htmlFor="title"
                      className="text-foreground text-sm font-semibold"
                    >
                      Professional Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Senior Consultant, Technical Lead"
                      value={partnerFormData.title}
                      onChange={(e) => {
                        handlePartnerChange('title', e.target.value);
                      }}
                      onBlur={() => handlePartnerBlur('title')}
                      className={cn(
                        'bg-card focus-ring h-11 transition-colors lg:h-12',
                        touched.title && errors.title
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-input focus:border-ring focus:ring-ring/20'
                      )}
                    />
                    {touched.title && errors.title && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="specialization"
                      className="text-foreground text-sm font-semibold"
                    >
                      Specialization
                    </Label>
                    <Input
                      id="specialization"
                      type="text"
                      placeholder="e.g., Full-Stack Development, DevOps, Data Science"
                      value={partnerFormData.specialization}
                      onChange={(e) => {
                        handlePartnerChange('specialization', e.target.value);
                      }}
                      onBlur={() => handlePartnerBlur('specialization')}
                      className={cn(
                        'bg-card focus-ring h-11 transition-colors lg:h-12',
                        touched.specialization && errors.specialization
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-input focus:border-ring focus:ring-ring/20'
                      )}
                    />
                    {touched.specialization && errors.specialization && (
                      <p className="text-destructive mt-1 text-xs font-medium">
                        {errors.specialization}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <ContactPhoneInput
                      value={partnerFormData.phone}
                      onChange={(value) => handlePartnerChange('phone', value)}
                      onValidationError={setPhoneValidationError}
                      placeholder="Enter your phone number"
                      label="Phone Number (Optional)"
                      className="bg-card focus-ring border-input focus:border-ring focus:ring-ring/20 h-11 transition-colors lg:h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="experience"
                      className="text-foreground text-sm font-semibold"
                    >
                      Experience (Optional)
                    </Label>
                    <Textarea
                      id="experience"
                      placeholder="Briefly describe your experience and expertise..."
                      value={partnerFormData.experience}
                      onChange={(e) => {
                        handlePartnerChange('experience', e.target.value);
                      }}
                      onBlur={() => handlePartnerBlur('experience')}
                      rows={3}
                      className="bg-card focus-ring border-input focus:border-ring focus:ring-ring/20 transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || phoneValidationError !== null}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring btn-hover-lift h-11 w-full rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none lg:h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center">
                        Complete Setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              )}

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
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
