'use client';

import {
  ArrowLeft,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Settings,
  Info,
  LucideIcon,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

interface OnboardLayoutProps {
  children: ReactNode;
}

interface Step {
  id: number;
  name: string;
  path: string;
  status?: 'complete' | 'current' | 'incomplete';
}

interface StepContent {
  title: string;
  description: string;
  illustration: LucideIcon;
  tips: string[];
}

interface StepContentMap {
  [key: number]: StepContent;
}

const initialSteps: Step[] = [
  { id: 1, name: 'Upload resume', path: '/app/candidate/onboard/resume' },
  { id: 2, name: 'Profile', path: '/app/candidate/onboard/profile' },
  { id: 3, name: 'Experience', path: '/app/candidate/onboard/experience' },
  { id: 4, name: 'Education', path: '/app/candidate/onboard/education' },
  { id: 5, name: 'Preferences', path: '/app/candidate/onboard/preferences' },
];

const stepContent: StepContentMap = {
  1: {
    title: "Let's Start with Your Resume",
    description:
      "Upload your resume to help us understand your professional journey better. We'll analyze your experience and skills to provide personalized recommendations.",
    illustration: FileText,
    tips: [
      'Make sure your resume is up to date',
      'Include all relevant work experience',
      'Highlight your key achievements',
      'List your technical skills',
    ],
  },
  2: {
    title: 'Build Your Professional Profile',
    description:
      'Create a compelling profile that showcases your unique value proposition. This helps recruiters understand who you are and what you bring to the table.',
    illustration: User,
    tips: [
      'Add a professional photo',
      'Write a compelling bio',
      'Include your contact information',
      'Highlight your career objectives',
    ],
  },
  3: {
    title: 'Showcase Your Experience',
    description:
      "Detail your professional journey. Each role you've held has shaped your expertise and contributed to your growth.",
    illustration: Briefcase,
    tips: [
      'List your most recent roles first',
      'Include key responsibilities',
      'Quantify your achievements',
      'Highlight leadership experience',
    ],
  },
  4: {
    title: 'Your Educational Background',
    description:
      "Your academic journey is an important part of your professional story. Let's capture your educational achievements.",
    illustration: GraduationCap,
    tips: [
      'Include your highest degree first',
      'Add relevant certifications',
      'List academic achievements',
      'Include relevant coursework',
    ],
  },
  5: {
    title: 'Set Your Preferences',
    description:
      'Tell us about your job preferences to help us match you with the right opportunities.',
    illustration: Settings,
    tips: [
      'Specify your desired role',
      'Set your salary expectations',
      'Choose your preferred location',
      'Select your work preferences',
    ],
  },
};

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

export default function OnboardLayout({ children }: OnboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  // First useEffect - Only depends on pathname, not steps
  useEffect(() => {
    const stepIndex = initialSteps.findIndex((step) => pathname === step.path);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1);
    }
  }, [pathname]);

  // Second useEffect - Only depends on currentStep, not steps
  useEffect(() => {
    setSteps(
      initialSteps.map((step) => {
        if (step.id === currentStep) {
          return { ...step, status: 'current' as const };
        } else if (step.id < currentStep) {
          return { ...step, status: 'complete' as const };
        } else {
          return { ...step, status: 'incomplete' as const };
        }
      })
    );
  }, [currentStep]);

  return (
    <TooltipProvider>
      <div className="bg-background h-[calc(100vh-5rem)]">
        {/* Top Navigation */}
        <div className="border-border bg-background/80 fixed top-0 right-0 left-0 z-10 flex h-20 items-center justify-between border-b px-4 backdrop-blur-sm sm:px-8">
          {currentStep > 1 ? (
            <button
              onClick={() => {
                router.back();
              }}
              className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm font-medium transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : (
            <div className="w-[72px]" />
          )}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex h-2 w-2 rounded-full transition-all duration-300 ${
                  index < currentStep - 1
                    ? 'bg-primary'
                    : index === currentStep - 1
                      ? 'ring-spacing-4 ring-primary/80 ring-4'
                      : 'bg-primary/20'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-4">
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
            <div className="text-foreground text-sm font-medium">
              <span className="hidden sm:inline">
                Step {currentStep} of {steps.length}
              </span>
              <span className="sm:hidden">
                {currentStep}/{steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-20 flex h-[calc(100vh-5rem)]">
          {/* Left Panel - Form */}
          <div className="h-[calc(100vh-5rem)] flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-7xl"
              >
                {/* Form Content */}
                <div className="mb-10 overflow-y-auto">{children}</div>
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Right Panel - Contextual Content */}
          <div className="border-border from-muted via-background to-muted hidden h-[calc(100vh-5rem)] w-[480px] border-l bg-gradient-to-br lg:block">
            <div className="h-full overflow-y-auto p-4 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-col items-center"
                >
                  {/* Illustration Container */}
                  <div className="relative mb-8 sm:mb-12">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 15,
                        duration: 0.5,
                      }}
                      className="relative z-10 text-6xl sm:text-8xl"
                    >
                      {React.createElement(
                        stepContent[currentStep].illustration,
                        {
                          className: 'h-16 w-16 sm:h-24 sm:w-24 text-primary',
                        }
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.5 }}
                      transition={{
                        delay: 0.2,
                        type: 'spring',
                        stiffness: 100,
                        damping: 15,
                        duration: 0.5,
                      }}
                      className="from-primary/10 to-primary/5 absolute -inset-4 rounded-full bg-gradient-to-r blur-xl"
                    />
                  </div>

                  {/* Content Container */}
                  <div className="w-full space-y-6 sm:space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-center"
                    >
                      <h2 className="text-foreground mb-2 text-xl font-bold sm:mb-3 sm:text-2xl">
                        {stepContent[currentStep].title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                        {stepContent[currentStep].description}
                      </p>
                    </motion.div>

                    {/* Tips Section */}
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="flex items-center justify-between"
                      >
                        <h3 className="text-foreground text-lg font-semibold">
                          Best Practices
                        </h3>
                        <div className="text-muted-foreground flex items-center space-x-1 text-sm">
                          <span>Step</span>
                          <span className="text-foreground font-medium">
                            {currentStep}
                          </span>
                          <span>of {steps.length}</span>
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-2 gap-3">
                        {stepContent[currentStep].tips.map((tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.5 + index * 0.1,
                              duration: 0.4,
                            }}
                            className="group relative"
                          >
                            <div className="from-primary to-primary/80 absolute -inset-0.5 rounded-lg bg-gradient-to-r opacity-0 blur transition duration-300 group-hover:opacity-20" />
                            <div className="bg-card ring-border relative flex items-center space-x-3 rounded-lg p-3 shadow-sm ring-1 transition-all duration-300 hover:shadow-md">
                              <div className="from-primary to-primary/80 text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-medium shadow-sm">
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-foreground text-sm">{tip}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Additional Info Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.4 }}
                        className="mt-6 space-y-4"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 h-4 w-4 rounded-full">
                            <Info className="text-primary h-4 w-4" />
                          </div>
                          <h4 className="text-foreground text-sm font-medium">
                            Did you know?
                          </h4>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-4">
                          <p className="text-foreground text-sm">
                            {currentStep === 1 &&
                              'A well-formatted resume increases your chances of getting noticed by 40%'}
                            {currentStep === 2 &&
                              'Profiles with professional photos receive 21 times more views'}
                            {currentStep === 3 &&
                              'Highlighting quantifiable achievements can increase interview chances by 60%'}
                            {currentStep === 4 &&
                              'Listing relevant certifications can boost your profile visibility by 30%'}
                            {currentStep === 5 &&
                              'Clear job preferences help match you with 3x more relevant opportunities'}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Progress Section */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="relative"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-foreground text-sm font-medium">
                            Onboarding Progress
                          </h4>
                          <p className="text-muted-foreground text-xs">
                            Complete all steps to finish your profile
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-foreground text-2xl font-bold">
                            {Math.round((currentStep / steps.length) * 100)}%
                          </span>
                          <span className="text-muted-foreground text-sm">
                            complete
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        {/* Background Steps */}
                        <div className="absolute inset-0 flex items-center justify-between">
                          {steps.map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 w-2 rounded-full ${
                                index < currentStep - 1
                                  ? 'bg-primary'
                                  : index === currentStep - 1
                                    ? 'bg-primary ring-primary/10 ring-4'
                                    : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(currentStep / steps.length) * 100}%`,
                            }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="from-primary via-primary/80 to-primary h-full rounded-full bg-gradient-to-r"
                          />
                        </div>
                      </div>

                      {/* Step Labels */}
                      <div className="mt-2 flex justify-between">
                        {steps.map((step, index) => (
                          <div
                            key={index}
                            className={`text-xs ${
                              index < currentStep - 1
                                ? 'text-primary'
                                : index === currentStep - 1
                                  ? 'text-primary font-medium'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {step.name}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
