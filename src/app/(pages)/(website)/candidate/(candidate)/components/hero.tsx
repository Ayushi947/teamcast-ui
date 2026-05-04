'use client';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Building2,
  Globe,
  Maximize2,
  Search,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import {
  candidateResumeParsingService,
  publicPracticeAssessmentService,
} from '@/lib/services/services';
import { validateFileUpload } from '@/lib/utils/file-upload-utils';
import { isValidUrl } from '@/lib/utils/validation-utils';
import { ResumeParsingTaskStatusEnum } from '@/lib/shared/models/common/enums';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  storePendingResumeTask,
  storeParsedResumeData,
  RESUME_PROCESSING_MESSAGES,
  POLLING_INTERVAL,
  MAX_POLL_ATTEMPTS,
} from '@/lib/utils/resume-draft.utils';

const stats = [
  { name: 'Active Jobs', value: '2,500+', icon: Briefcase },
  { name: 'Companies', value: '500+', icon: Building2 },
  { name: 'Candidates', value: '50K+', icon: Users },
  { name: 'Countries', value: '100+', icon: Globe },
];

const popularSearches = [
  'Software Engineer',
  'Product Designer',
  'Data Scientist',
  'Marketing Manager',
  'Sales Representative',
];

// POLLING_INTERVAL is now imported from resume-draft.utils.ts

export function HeroSection() {
  const router = useRouter();
  const { user, token } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const practiceInterviewRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [_uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(
    null
  );
  const [jobParsingError, setJobParsingError] = useState<string | null>(null);
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [jobDescriptionTextFull, setJobDescriptionTextFull] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'description'>('url');
  const [isParsingJob, setIsParsingJob] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [urlDetectedInText, setUrlDetectedInText] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      interval = setInterval(() => {
        setCurrentMessageIndex(
          (prev) => (prev + 1) % RESUME_PROCESSING_MESSAGES.length
        );
        setUploadProgress((prev) => Math.min(prev + 5, 95));
      }, POLLING_INTERVAL);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isUploading]);

  // Auto-scroll to AI Practice Interview section on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (practiceInterviewRef.current) {
        practiceInterviewRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 1000); // Delay to allow page animations to complete

    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent upload if user is logged in
    if (user || token) {
      toast.info('Please use the profile page to update your resume.');
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        setResumeUploadError(validation.error || 'Invalid file');
        return;
      }

      // Reset animation state for fresh start
      setIsUploading(true);
      setUploadProgress(0);
      setCurrentMessageIndex(0);
      setUploadStatus('Uploading and parsing your resume...');
      setResumeUploadError(null);

      try {
        // Step 1: Upload resume and get task
        const uploadTask =
          await candidateResumeParsingService.uploadResumePublic(
            file,
            'GENERATIVE'
          );

        if (!uploadTask || !uploadTask.id) {
          throw new Error('Failed to start resume parsing');
        }

        // Store the task ID for background processing
        storePendingResumeTask(uploadTask.id);

        setUploadStatus('Resume uploaded! Redirecting to signup...');
        setUploadProgress(100);

        // Show success message and redirect after a delay to ensure toast is visible
        setTimeout(() => {
          setIsUploading(false);
          if (!user) {
            toast.success(
              'Resume uploaded! Please sign up to complete your profile.'
            );
            // Delay redirect to ensure toast is visible
            setTimeout(() => {
              router.push('/app/candidate/signup');
            }, 500);
          } else {
            toast.success('Resume uploaded! Processing in background...');
            // Delay redirect to ensure toast is visible
            setTimeout(() => {
              router.push('/app/candidate/onboard/profile');
            }, 500);
          }
        }, 1000);

        // Start background polling for task completion (non-blocking)
        let pollCount = 0;
        let shouldContinuePolling = true;

        const pollTask = async (): Promise<void> => {
          if (!shouldContinuePolling || pollCount >= MAX_POLL_ATTEMPTS) {
            if (pollCount >= MAX_POLL_ATTEMPTS) {
              localStorage.removeItem('pendingResumeParsingTask');
              logger.error('Resume parsing timeout after 5 minutes');
            }
            return;
          }
          pollCount++;

          try {
            const taskStatus =
              await candidateResumeParsingService.getPublicParsingTask(
                uploadTask.id
              );

            if (taskStatus.status === ResumeParsingTaskStatusEnum.COMPLETED) {
              // Step 3: Get parsed resume
              const parsedResume =
                await candidateResumeParsingService.getParsedResumeFromPublicTask(
                  uploadTask.id
                );

              if (!parsedResume || !parsedResume.parsedResume) {
                throw new Error('Failed to retrieve parsed resume data');
              }

              // Store the complete parsed resume data
              storeParsedResumeData(parsedResume);
              localStorage.removeItem('pendingResumeParsingTask'); // Clean up task ID

              logger.info('Resume parsed successfully in background');
            } else if (
              taskStatus.status === ResumeParsingTaskStatusEnum.FAILED
            ) {
              localStorage.removeItem('pendingResumeParsingTask'); // Clean up task ID
              logger.error('Resume parsing failed:', taskStatus.error);
            } else if (
              taskStatus.status === ResumeParsingTaskStatusEnum.PENDING ||
              taskStatus.status === ResumeParsingTaskStatusEnum.PROCESSING ||
              taskStatus.status ===
                ResumeParsingTaskStatusEnum.UPDATING_CANDIDATE_RESUME
            ) {
              // Continue polling only if still active
              if (shouldContinuePolling) {
                setTimeout(pollTask, POLLING_INTERVAL);
              }
            }
          } catch (pollError) {
            localStorage.removeItem('pendingResumeParsingTask'); // Clean up task ID
            logger.error('Resume polling error:', pollError);
          }
        };

        // Start background polling (non-blocking)
        pollTask();

        // Cleanup function to stop polling when component unmounts
        return () => {
          shouldContinuePolling = false;
        };
      } catch (err) {
        logger.error('Resume upload error:', err);
        setResumeUploadError(
          err instanceof Error
            ? err.message
            : 'Failed to process resume. Please try again.'
        );
        // Stop animation when there's an exception
        setIsUploading(false);
        setUploadProgress(100);
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/app/candidate/match?query=${searchQuery}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isNetworkError = (err: unknown): boolean => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }

    if (!(err instanceof Error)) {
      return false;
    }

    const errorAny = err as any;

    if (errorAny.request && !errorAny.response) {
      return true;
    }

    let errorMessage = err.message?.toLowerCase() || '';
    const errorName = err.name?.toLowerCase() || '';

    if (errorAny.response?.data) {
      const responseData = errorAny.response.data;
      if (typeof responseData === 'string') {
        errorMessage = responseData.toLowerCase();
      } else if (responseData.message) {
        errorMessage = responseData.message.toLowerCase();
      } else if (responseData.error) {
        errorMessage = responseData.error.toLowerCase();
      }
    }

    if (errorAny.originalError?.message) {
      const originalMsg = errorAny.originalError.message.toLowerCase();
      if (originalMsg) {
        errorMessage = originalMsg;
      }
    }

    if (errorAny.cause?.message) {
      const causeMsg = errorAny.cause.message.toLowerCase();
      if (causeMsg) {
        errorMessage = causeMsg;
      }
    }

    const errorString = String(err).toLowerCase();
    const fullErrorText = `${errorMessage} ${errorName} ${errorString}`;

    const networkErrorIndicators = [
      'fetch failed',
      'network request failed',
      'networkerror',
      'err_internet_disconnected',
      'err_network_changed',
      'econnrefused',
      'enotfound',
      'econnaborted',
      'econnreset',
      'exception posting request',
      'connection refused',
      'connection reset',
      'connection aborted',
      'connection closed',
      'timeout',
      'etimedout',
      'econnaborted',
      'googlegenerativeaierror',
      'vertexai',
    ];

    const hasNetworkIndicator = networkErrorIndicators.some(
      (indicator) =>
        fullErrorText.includes(indicator) || errorName.includes(indicator)
    );

    const statusCode = errorAny.status || errorAny.response?.status;
    if (statusCode && statusCode >= 400 && statusCode < 600) {
      if (statusCode === 503) {
        return true;
      }

      if (hasNetworkIndicator) {
        return true;
      }

      if ([502, 504].includes(statusCode)) {
        if (errorAny.response && errorAny.response.data) {
          return false;
        }
        return true;
      }

      return false;
    }

    const networkErrorCodes = [
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NETWORK_CHANGED',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ECONNRESET',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_RESET',
      'ERR_CONNECTION_ABORTED',
      'ERR_CONNECTION_CLOSED',
    ];
    if (errorAny.code && networkErrorCodes.includes(errorAny.code)) {
      return true;
    }

    if (errorAny.request && errorAny.status === undefined) {
      return true;
    }

    if (!errorAny.status) {
      if (err instanceof TypeError && hasNetworkIndicator) {
        return true;
      }

      return hasNetworkIndicator;
    }

    return false;
  };

  const handleJobUrlParse = async () => {
    if (!jobUrl.trim()) {
      const errorMsg = 'Please enter a valid job URL';
      setJobParsingError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsParsingJob(true);
    setJobParsingError(null);

    try {
      const response = await publicPracticeAssessmentService.parseJobUrl(
        jobUrl.trim()
      );

      toast.success('Job URL parsed successfully!');

      // Redirect to parse page with parsedJobDataId in URL
      router.push(
        `/app/candidate/assessments/practice/parse?id=${response.parsedJobDataId}`
      );
    } catch (err) {
      logger.error('Job URL parsing error:', err);

      if (isNetworkError(err)) {
        const errorMsg = 'Network Error';
        setJobParsingError(errorMsg);
        toast.error(errorMsg);
        setIsParsingJob(false);
        return;
      }

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to parse job URL. Please try again.';

      const isBlockedError =
        errorMessage.toLowerCase().includes('unable to access') ||
        errorMessage.toLowerCase().includes('blocking automated') ||
        errorMessage.toLowerCase().includes('copy and paste') ||
        errorMessage.toLowerCase().includes('403') ||
        errorMessage.toLowerCase().includes('forbidden');

      if (isBlockedError) {
        const errorMsg =
          "We can't access this job URL. The website may be blocking automated access.";
        setJobParsingError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg =
          'Unable to parse this job URL. Please try again or use the Text option instead.';
        setJobParsingError(errorMsg);
        toast.error(errorMsg);
      }

      setIsParsingJob(false);
    }
  };

  const handleJobDescriptionParse = async () => {
    const textToParse =
      jobDescriptionTextFull.trim() || jobDescriptionText.trim();
    if (!textToParse) {
      const errorMsg = 'Please enter job description text';
      setJobParsingError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Check if the text is actually a URL
    if (isValidUrl(textToParse)) {
      const errorMsg =
        'This appears to be a URL. Please use URL mode instead, or paste the actual job description text.';
      setJobParsingError(errorMsg);
      toast.error(errorMsg);
      setUrlDetectedInText(true);
      return;
    }

    setIsParsingJob(true);
    setJobParsingError(null);
    setUrlDetectedInText(false);

    try {
      const response =
        await publicPracticeAssessmentService.parseJobDescription(textToParse);

      toast.success('Job description parsed successfully!');

      router.push(
        `/app/candidate/assessments/practice/parse?id=${response.parsedJobDataId}`
      );
    } catch (err) {
      logger.error('Job description parsing error:', err);

      if (isNetworkError(err)) {
        const errorMsg = 'Network Error';
        setJobParsingError(errorMsg);
        toast.error(errorMsg);
        setIsParsingJob(false);
        return;
      }

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to parse job description. Please try again.';

      if (
        errorMessage.toLowerCase().includes('validation') ||
        errorMessage.toLowerCase().includes('invalid') ||
        errorMessage.toLowerCase().includes('required') ||
        errorMessage.toLowerCase().includes('too short') ||
        errorMessage.toLowerCase().includes('minimum') ||
        errorMessage.toLowerCase().includes('lacks') ||
        errorMessage.toLowerCase().includes('essential')
      ) {
        const errorMsg =
          'The provided job description is too short and lacks essential information such as job title, responsibilities, requirements, and company details.';
        setJobParsingError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg =
          'Unable to parse. Please ensure the text is complete and includes job title, responsibilities, and requirements.';
        setJobParsingError(errorMsg);
        toast.error(errorMsg);
      }

      setIsParsingJob(false);
    }
  };

  return (
    <div className="from-muted/50 to-background relative isolate overflow-hidden bg-gradient-to-b">
      {/* Background Elements */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="from-primary/20 to-primary/10 relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-32 lg:px-8">
        <div className="mx-auto mt-8 text-center sm:mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary/10 text-primary ring-primary/10 inline-flex items-center rounded-full px-4 py-1 text-sm font-medium ring-1 ring-inset">
              <Sparkles className="mr-2 h-4 w-4" />
              Your dream job awaits
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-foreground mt-8 text-4xl leading-tight font-bold tracking-tight sm:text-6xl"
          >
            Find Your Dream Job with <br />
            <span className="bg-gradient-to-r from-[#6e55cf] to-[#8b6edb] bg-clip-text text-transparent">
              Top US Companies
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-6 text-lg leading-8"
          >
            Connect with top US-based companies looking for Candidate
            professionals like you. Get access to remote opportunities,
            competitive salaries, and a chance to work with industry leaders.
          </motion.p>

          {/* Main CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <div className="group relative w-full max-w-xl">
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search for your dream job..."
                    className="border-border bg-background text-foreground placeholder-muted-foreground group-hover:border-primary/30 focus:border-primary focus:ring-primary w-full rounded-xl border-1 px-6 py-4 pr-12 pl-14 shadow-lg transition-all duration-300 focus:ring-1 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Search className="text-muted-foreground group-hover:text-primary absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 transition-colors duration-300" />
                  <div className="absolute top-1/2 right-4 -translate-y-1/2">
                    <kbd className="border-border bg-muted text-muted-foreground hidden items-center rounded-lg border px-2 py-1 text-xs font-medium sm:inline-flex">
                      ⌘K
                    </kbd>
                  </div>
                </div>
                <div className="relative w-full sm:w-auto">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    disabled={!!user || !!token}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      {user || token ? (
                        <>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled
                              className="border-border/50 bg-muted/50 text-muted-foreground/50 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-sm font-medium opacity-50 transition-all duration-300 sm:w-auto"
                            >
                              <Upload className="h-5 w-5" />
                              <span>Upload Resume</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Please update your resume from your profile page
                            </p>
                          </TooltipContent>
                        </>
                      ) : (
                        <TooltipTrigger asChild>
                          <label
                            htmlFor="resume-upload"
                            className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed ${
                              isUploading
                                ? 'border-primary/30 bg-primary/10 text-primary cursor-pointer'
                                : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-primary cursor-pointer'
                            } w-full px-4 py-4 text-sm font-medium transition-all duration-300 sm:w-auto`}
                          >
                            {isUploading ? (
                              <>
                                <svg
                                  className="mr-2 h-5 w-5 animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="h-5 w-5" />
                                <span>Upload Resume</span>
                              </>
                            )}
                          </label>
                        </TooltipTrigger>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {isUploading ? (
                <div className="mt-2 space-y-2">
                  <p className="text-muted-foreground text-sm">
                    {RESUME_PROCESSING_MESSAGES[currentMessageIndex]}
                  </p>
                  <div className="bg-muted mx-auto h-1.5 w-48 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : user || token ? (
                <p className="text-muted-foreground mt-4 text-sm">
                  Update your resume from your profile page for AI-powered
                  matching
                </p>
              ) : (
                <p className="text-muted-foreground mt-4 text-sm">
                  Upload your resume to get AI-powered matching with higher
                  accuracy
                </p>
              )}
              {resumeUploadError && (
                <p className="text-destructive mt-2 text-sm">
                  {resumeUploadError}
                </p>
              )}
            </div>
          </motion.div>

          {/* Popular Searches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <p className="text-muted-foreground text-sm font-medium">
              Popular searches:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {popularSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  className="border-border bg-background text-foreground hover:bg-muted transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch();
                  }}
                >
                  {search}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Job Input for Practice Assessment */}
          <TooltipProvider delayDuration={200}>
            <motion.div
              ref={practiceInterviewRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mx-auto mt-10 w-full max-w-xl"
            >
              {/* Rotating Border Highlight */}
              <div className="relative">
                {/* Animated border with traveling light effect */}
                <div className="absolute -inset-[2px] overflow-hidden rounded-xl">
                  <div
                    className="absolute inset-0 animate-[spin_3s_linear_infinite]"
                    style={{
                      background:
                        'conic-gradient(from 0deg, transparent 70%, #6e55cf 85%, #8b6edb 92%, #6e55cf 99%, transparent 100%)',
                    }}
                  ></div>
                </div>
                <div className="bg-card relative overflow-hidden rounded-xl border border-[#6e55cf]/10 shadow-2xl backdrop-blur-sm">
                  {/* Gradient Background Accent */}
                  <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-[#6e55cf]/20 to-transparent blur-2xl" />
                  <div className="absolute bottom-0 left-0 h-32 w-32 bg-gradient-to-tr from-[#8b6edb]/15 to-transparent blur-2xl" />

                  {/* Header Section */}
                  <div className="relative border-b border-[#6e55cf]/20 bg-gradient-to-r from-[#6e55cf]/5 via-transparent to-[#8b6edb]/5 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6e55cf] to-[#8b6edb] shadow-lg ring-2 ring-[#6e55cf]/20"
                        >
                          <Sparkles className="h-5 w-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-foreground text-start text-base font-bold">
                            AI Practice Interview
                          </h3>
                          <p className="text-muted-foreground text-xs">
                            Get personalized mock questions for any job
                          </p>
                        </div>
                      </div>
                      {/* Toggle Tabs */}
                      <div className="bg-muted/60 flex rounded-md p-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setInputMode('url');
                                setJobParsingError(null);
                                setUrlDetectedInText(false);
                              }}
                              className={`flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                                inputMode === 'url'
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              disabled={isParsingJob}
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span>URL</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Paste a job link</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setInputMode('description');
                                setJobParsingError(null);
                                setUrlDetectedInText(false);
                              }}
                              className={`flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                                inputMode === 'description'
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              disabled={isParsingJob}
                            >
                              <Briefcase className="h-3.5 w-3.5" />
                              <span>Text</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Paste job description</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="relative p-5">
                    <div className="space-y-3">
                      {/* Input Area */}
                      <div>
                        {inputMode === 'url' ? (
                          <div className="border-border bg-background/50 focus-within:border-primary focus-within:ring-primary group flex items-center gap-2 rounded-lg border px-3 py-3 transition-all focus-within:shadow-md focus-within:ring-1">
                            <Globe className="text-muted-foreground h-4 w-4 shrink-0" />
                            <input
                              type="url"
                              placeholder="Paste job URL (LinkedIn, Company website's careers page, etc.)"
                              className="text-foreground placeholder-muted-foreground flex-1 bg-transparent text-sm focus:outline-none"
                              value={jobUrl}
                              onChange={(e) => setJobUrl(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isParsingJob) {
                                  handleJobUrlParse();
                                }
                              }}
                              disabled={isParsingJob}
                            />
                          </div>
                        ) : (
                          <div className="border-border bg-background/50 focus-within:border-primary focus-within:ring-primary group flex items-center gap-2 rounded-lg border px-3 py-3 transition-all focus-within:shadow-md focus-within:ring-1">
                            <Briefcase className="text-muted-foreground h-4 w-4 shrink-0" />
                            <input
                              type="text"
                              placeholder="Paste job description text..."
                              className="text-foreground placeholder-muted-foreground flex-1 bg-transparent text-sm focus:outline-none"
                              value={jobDescriptionText}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setJobDescriptionText(newValue);
                                setJobDescriptionTextFull(newValue);

                                // Check if the input is a URL (for validation on submit)
                                const isUrl = isValidUrl(newValue);
                                setUrlDetectedInText(isUrl);

                                // Clear error if URL is no longer detected
                                if (!isUrl && urlDetectedInText) {
                                  setJobParsingError(null);
                                }
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pastedText =
                                  e.clipboardData.getData('text');

                                // Check if pasted text is a URL (for validation on submit)
                                const isUrl = isValidUrl(pastedText);
                                setUrlDetectedInText(isUrl);

                                setJobDescriptionTextFull(pastedText);
                                // Show first line or truncated version in input
                                const firstLine = pastedText.split('\n')[0];
                                setJobDescriptionText(
                                  firstLine.length > 80
                                    ? firstLine.substring(0, 80) + '...'
                                    : firstLine
                                );

                                // Clear any previous error
                                if (!isUrl) {
                                  setJobParsingError(null);
                                }
                              }}
                              disabled={isParsingJob}
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    // Initialize full text if empty but preview has content
                                    if (
                                      !jobDescriptionTextFull &&
                                      jobDescriptionText
                                    ) {
                                      setJobDescriptionTextFull(
                                        jobDescriptionText
                                      );
                                    }
                                    setIsTextDialogOpen(true);
                                  }}
                                  disabled={isParsingJob}
                                  className="text-muted-foreground hover:text-primary cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Expand to full editor</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>

                      {/* Error Message */}
                      {jobParsingError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="border-destructive/20 bg-destructive/5 overflow-hidden rounded-lg border p-3"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-destructive text-sm">⚠️</span>
                            <div className="flex-1">
                              <p className="text-destructive text-sm leading-relaxed">
                                {jobParsingError}
                              </p>
                              {inputMode === 'url' &&
                                jobParsingError !== 'Network Error' && (
                                  <button
                                    onClick={() => {
                                      setInputMode('description');
                                      setJobParsingError(null);
                                    }}
                                    className="text-primary hover:text-primary/80 mt-2 text-xs font-semibold underline"
                                  >
                                    Try Text mode instead →
                                  </button>
                                )}
                              {inputMode === 'description' &&
                                urlDetectedInText && (
                                  <button
                                    onClick={() => {
                                      setInputMode('url');
                                      setJobUrl(
                                        jobDescriptionTextFull.trim() ||
                                          jobDescriptionText.trim()
                                      );
                                      setJobDescriptionText('');
                                      setJobDescriptionTextFull('');
                                      setJobParsingError(null);
                                      setUrlDetectedInText(false);
                                    }}
                                    className="text-primary hover:text-primary/80 mt-2 text-xs font-semibold underline"
                                  >
                                    Switch to URL mode →
                                  </button>
                                )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={
                          inputMode === 'url'
                            ? handleJobUrlParse
                            : handleJobDescriptionParse
                        }
                        disabled={
                          isParsingJob ||
                          (inputMode === 'url'
                            ? !jobUrl.trim()
                            : !(
                                jobDescriptionTextFull.trim() ||
                                jobDescriptionText.trim()
                              ))
                        }
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#6e55cf] to-[#8b6edb] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#6e55cf]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isParsingJob ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Analyzing Job Details...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Start AI Practice Assessment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Full Screen Text Dialog */}
            <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Enter Job Description
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <textarea
                    placeholder="Paste the complete job description here... Include job title, responsibilities, requirements, and qualifications for best results."
                    className="border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary h-96 w-full resize-none rounded-lg border px-4 py-3 text-sm transition-all focus:shadow-md focus:ring-1 focus:outline-none"
                    value={jobDescriptionTextFull || jobDescriptionText}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setJobDescriptionTextFull(newValue);

                      // Check if the input is a URL (for validation on submit)
                      const isUrl = isValidUrl(newValue);
                      setUrlDetectedInText(isUrl);

                      // Clear error if URL is no longer detected
                      if (!isUrl && urlDetectedInText) {
                        setJobParsingError(null);
                      }

                      // Update preview - show first line or truncated
                      const firstLine = newValue.split('\n')[0];
                      setJobDescriptionText(
                        firstLine.length > 80
                          ? firstLine.substring(0, 80) + '...'
                          : firstLine || newValue
                      );
                    }}
                    onPaste={(e) => {
                      const pastedText = e.clipboardData.getData('text');
                      const isUrl = isValidUrl(pastedText);
                      setUrlDetectedInText(isUrl);

                      // Always allow pasting, error will be shown on submit if it's a URL
                      // Clear any previous error if not a URL
                      if (!isUrl) {
                        setJobParsingError(null);
                      }
                    }}
                    disabled={isParsingJob}
                  />
                  {(jobDescriptionTextFull?.trim() ||
                    jobDescriptionText?.trim()) && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          const textToParse = (
                            jobDescriptionTextFull || jobDescriptionText
                          ).trim();
                          if (textToParse) {
                            // Check if it's a URL before proceeding
                            if (isValidUrl(textToParse)) {
                              const errorMsg =
                                'This appears to be a URL. Please use URL mode instead, or paste the actual job description text.';
                              setJobParsingError(errorMsg);
                              toast.error(errorMsg);
                              setUrlDetectedInText(true);
                              return;
                            }
                            setIsTextDialogOpen(false);
                            handleJobDescriptionParse();
                          }
                        }}
                        disabled={
                          isParsingJob ||
                          !(jobDescriptionTextFull || jobDescriptionText).trim()
                        }
                        className="bg-gradient-to-r from-[#6e55cf] to-[#8b6edb]"
                      >
                        {isParsingJob ? (
                          <>
                            <svg
                              className="mr-2 h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Continue
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TooltipProvider>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.name} className="relative">
                <div className="flex flex-col items-center">
                  <stat.icon className="text-primary h-8 w-8" />
                  <dt className="text-muted-foreground mt-4 text-sm leading-6">
                    {stat.name}
                  </dt>
                  <dd className="text-foreground text-2xl leading-9 font-bold tracking-tight">
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Platform Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-card/50 ring-border/50 mt-8 rounded-2xl p-8 shadow-lg ring-1 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="group cursor-pointer text-center">
                <h4 className="text-primary group-hover:text-primary/90 transform-gpu text-sm font-semibold transition-all duration-300 will-change-transform group-hover:scale-105 group-hover:drop-shadow-[0_2px_4px_rgba(110,85,207,0.3)]">
                  Remote Work
                </h4>
                <p className="text-muted-foreground group-hover:text-foreground/80 mt-1 transform-gpu text-sm transition-all duration-300 will-change-transform group-hover:scale-105 group-hover:drop-shadow-[0_1px_3px_rgba(110,85,207,0.25)]">
                  Work from anywhere in the world
                </p>
              </div>
              <div className="group cursor-pointer text-center">
                <h4 className="text-primary group-hover:text-primary/90 transform-gpu text-sm font-semibold transition-all duration-300 will-change-transform group-hover:scale-105 group-hover:drop-shadow-[0_2px_4px_rgba(110,85,207,0.3)]">
                  Competitive Pay
                </h4>
                <p className="text-muted-foreground group-hover:text-foreground/80 mt-1 transform-gpu text-sm transition-all duration-300 will-change-transform group-hover:scale-105 group-hover:drop-shadow-[0_1px_3px_rgba(110,85,207,0.25)]">
                  US market rates for global candidate
                </p>
              </div>
              <div className="group cursor-pointer text-center">
                <h4 className="text-primary group-hover:text-primary/90 transform-gpu text-sm font-semibold transition-all duration-300 will-change-transform group-hover:scale-105 group-hover:drop-shadow-[0_2px_4px_rgba(110,85,207,0.3)]">
                  Career Growth
                </h4>
                <p className="text-muted-foreground group-hover:text-foreground/80 mt-1 transform-gpu text-sm transition-all duration-300 will-change-transform group-hover:scale-105 group-hover:drop-shadow-[0_1px_3px_rgba(110,85,207,0.25)]">
                  Opportunities for advancement
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
