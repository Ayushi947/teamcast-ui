'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  Heart,
  Users,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger, candidateSignupValidator } from '@/lib/shared';
import { publicPracticeAssessmentService } from '@/lib/services/services';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { z } from 'zod';

const calculateNameSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  if (str1.includes(str2) || str2.includes(str1)) return 0.9;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const commonChars = shorter
    .split('')
    .filter((char) => longer.includes(char)).length;

  return commonChars / longer.length;
};

const ParsePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();
  const parsedJobDataId = searchParams.get('id');
  const [parsedJobData, setParsedJobData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeParsingTaskId, setResumeParsingTaskId] = useState<string | null>(
    null
  );
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [resumeError, setResumeError] = useState<string>('');
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    resume: false,
  });

  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [namePreFilled, setNamePreFilled] = useState(false);
  const [preFilledName, setPreFilledName] = useState<string>('');

  const [resumeRequired, setResumeRequired] = useState(!user);
  const [showResumeUpdateWarning, setShowResumeUpdateWarning] = useState(false);
  const [pendingResumeFile, setPendingResumeFile] = useState<File | null>(null);

  const signupSchemaBody = candidateSignupValidator.shape.body;

  useEffect(() => {
    const checkLoggedInUserResume = async () => {
      if (user && user.type === 'CANDIDATE') {
        setCandidateName(user.name || '');
        setCandidateEmail(user.email || '');
        setTouched({ name: true, email: true, resume: false });

        // Check if logged-in user has existing resume
        try {
          logger.info('Checking resume status for logged-in user', {
            email: user.email,
          });
          const candidateInfo =
            await publicPracticeAssessmentService.checkCandidateByEmail(
              user.email
            );

          logger.info('Resume check result for logged-in user', {
            exists: candidateInfo.exists,
            hasResume: candidateInfo.hasResume,
            resumeParsed: candidateInfo.resumeParsed,
          });

          if (candidateInfo.exists && candidateInfo.hasResume) {
            setHasExistingResume(true);
            setResumeRequired(!candidateInfo.resumeParsed);
          } else {
            setHasExistingResume(false);
            setResumeRequired(true);
          }
        } catch (err) {
          logger.error('Error checking logged-in user resume:', err);
          setHasExistingResume(false);
          setResumeRequired(false); // Don't require resume for logged-in users by default
        }
      } else {
        setResumeRequired(true);
      }
    };

    checkLoggedInUserResume();
  }, [user]);

  // Debug log for hasExistingResume state changes
  useEffect(() => {
    logger.info('hasExistingResume state changed', {
      hasExistingResume,
      resumeRequired,
    });
  }, [hasExistingResume, resumeRequired]);

  useEffect(() => {
    const fetchParsedJobData = async () => {
      if (!parsedJobDataId) {
        setError(
          'Parsed job data ID is required. Please parse a job URL first.'
        );
        setIsLoading(false);
        return;
      }

      try {
        const data =
          await publicPracticeAssessmentService.getParsedJobData(
            parsedJobDataId
          );
        setParsedJobData(data.parsedData);
      } catch (err) {
        logger.error('Error fetching parsed job data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load parsed job data. Please try again.'
        );
        toast.error('Failed to load parsed job data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParsedJobData();
  }, [parsedJobDataId]);

  const handleContinue = () => {
    if (!parsedJobData) {
      setError('No parsed job data available');
      return;
    }
    setShowDetailsDialog(true);
  };

  const validateName = (value: string) => {
    try {
      signupSchemaBody.shape.name.parse(value);
      setNameError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setNameError(error.errors[0]?.message || 'Invalid name');
      } else {
        setNameError('Invalid name');
      }
      return false;
    }
  };

  const validateEmail = (value: string) => {
    try {
      signupSchemaBody.shape.email.parse(value);
      setEmailError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0]?.message || 'Invalid email');
      } else {
        setEmailError('Invalid email');
      }
      return false;
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (emailExists && namePreFilled && preFilledName) {
      setCandidateName(value);

      if (touched.name) {
        const isValid = validateName(value);
        if (isValid) {
          const normalizedValue = value
            .trim()
            .toLowerCase()
            .replace(/[^\w\s]/g, '');
          const normalizedPreFilled = preFilledName
            .trim()
            .toLowerCase()
            .replace(/[^\w\s]/g, '');

          const similarity = calculateNameSimilarity(
            normalizedValue,
            normalizedPreFilled
          );

          if (similarity < 0.8) {
            setNameError(
              'Name must match the account associated with this email. If your name has changed, please contact support.'
            );
          } else {
            setNameError('');
          }
        }
      }
    } else {
      setCandidateName(value);
      if (touched.name) {
        validateName(value);
      }
    }
  };

  const handleNameBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }));
    validateName(candidateName);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCandidateEmail(value);
    if (emailExists) {
      setEmailExists(false);
      setNamePreFilled(false);
      setPreFilledName('');
      setCandidateName('');
      setHasExistingResume(false);
      setResumeRequired(!user);
    }
    if (touched.email) {
      validateEmail(value);
    }
  };

  const handleEmailBlur = async () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const isValid = validateEmail(candidateEmail);

    if (!user && isValid && candidateEmail.trim()) {
      setIsCheckingEmail(true);
      try {
        const candidateInfo =
          await publicPracticeAssessmentService.checkCandidateByEmail(
            candidateEmail.trim()
          );

        if (candidateInfo.exists) {
          setEmailExists(true);

          if (
            candidateInfo.userType &&
            candidateInfo.userType !== 'CANDIDATE'
          ) {
            setEmailError(
              `This email is already registered as a ${candidateInfo.userType.toLowerCase()} account. Please use a different email.`
            );
            setIsCheckingEmail(false);
            return;
          }

          if (candidateInfo.name) {
            setCandidateName(candidateInfo.name);
            setPreFilledName(candidateInfo.name);
            setNamePreFilled(true);

            setTouched((prev) => ({ ...prev, name: true }));
            validateName(candidateInfo.name);
          }

          // Handle resume status
          if (candidateInfo.hasResume) {
            setHasExistingResume(true);
            setResumeRequired(!candidateInfo.resumeParsed);
          } else {
            setHasExistingResume(false);
            setResumeRequired(true);
          }
        } else {
          setEmailExists(false);
          setNamePreFilled(false);
          setHasExistingResume(false);
          setResumeRequired(true);
        }
      } catch (err) {
        logger.error('Error checking candidate by email:', err);
        // Don't show error to user, just continue with normal flow
        setEmailExists(false);
        setNamePreFilled(false);
      } finally {
        setIsCheckingEmail(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!touched.email || emailError || !candidateEmail.trim()) {
        setResumeError('Please enter and validate your email first');
        setError(
          'Please enter and validate your email before uploading resume'
        );
        if (e.target) {
          e.target.value = '';
        }
        return;
      }

      if (
        emailExists &&
        (!touched.name || nameError || !candidateName.trim())
      ) {
        setResumeError(
          'Please ensure your name is correct before uploading resume'
        );
        setError(
          'Please ensure your name matches the account before uploading resume'
        );
        if (e.target) {
          e.target.value = '';
        }
        return;
      }

      if (file.type !== 'application/pdf') {
        setResumeError('Please upload a PDF document');
        setError('Please upload a PDF document');
        if (e.target) {
          e.target.value = '';
        }
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setResumeError('File size must be less than 10MB');
        setError('File size must be less than 10MB');
        if (e.target) {
          e.target.value = '';
        }
        return;
      }

      // Show warning if user has existing resume
      if (hasExistingResume) {
        logger.info('Existing resume detected, showing update warning', {
          fileName: file.name,
          hasExistingResume,
        });
        setPendingResumeFile(file);
        setShowResumeUpdateWarning(true);
        if (e.target) {
          e.target.value = '';
        }
        return;
      }

      logger.info('No existing resume, uploading directly', {
        fileName: file.name,
        hasExistingResume,
      });

      setResumeFile(file);
      setResumeFileName(file.name);
      setResumeError('');
      setError(null);
      setTouched((prev) => ({ ...prev, resume: true }));
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeFileName('');
    if (resumeParsingTaskId) {
      setResumeParsingTaskId(null);
    }
  };

  const handleConfirmResumeUpdate = () => {
    logger.info('User confirmed resume update');
    if (pendingResumeFile) {
      setResumeFile(pendingResumeFile);
      setResumeFileName(pendingResumeFile.name);
      setResumeError('');
      setError(null);
      setTouched((prev) => ({ ...prev, resume: true }));
      setPendingResumeFile(null);
      logger.info('Resume file set, will update existing resume', {
        fileName: pendingResumeFile.name,
      });
    }
    setShowResumeUpdateWarning(false);
  };

  const handleCancelResumeUpdate = () => {
    logger.info('User cancelled resume update');
    setPendingResumeFile(null);
    setShowResumeUpdateWarning(false);
  };

  const handleStartAssessment = async () => {
    setTouched({ name: true, email: true, resume: true });

    if (!candidateEmail || !candidateEmail.trim()) {
      setEmailError('Email is required');
      setError('Please enter your email address');
      return;
    }

    const isEmailValid = validateEmail(candidateEmail);
    if (!isEmailValid) {
      setError('Please fix the email errors before submitting');
      return;
    }

    if (emailExists && namePreFilled) {
      const isNameValid = validateName(candidateName);
      if (!isNameValid) {
        setError('Name must match the account associated with this email');
        return;
      }

      // Double-check name matches (allowing minor formatting differences)
      const candidateInfo =
        await publicPracticeAssessmentService.checkCandidateByEmail(
          candidateEmail.trim()
        );
      if (candidateInfo.exists && candidateInfo.name) {
        const providedName = candidateName
          .trim()
          .toLowerCase()
          .replace(/[^\w\s]/g, '');
        const existingName = candidateInfo.name
          .trim()
          .toLowerCase()
          .replace(/[^\w\s]/g, '');

        // Allow if names are similar (at least 80% match) to allow minor corrections
        const similarity = calculateNameSimilarity(providedName, existingName);

        if (similarity < 0.8 && providedName !== existingName) {
          setNameError(
            'The provided name does not match the existing account. Please use the correct name or contact support if your name has changed.'
          );
          setError(
            'The provided name does not match the existing account. Please use the correct name or contact support if your name has changed.'
          );
          return;
        }
      }
    } else {
      const isNameValid = validateName(candidateName);
      if (!isNameValid) {
        setError('Please fix the name errors before submitting');
        return;
      }
    }

    const isResumeValid = !resumeRequired || !!resumeFile;
    if (resumeRequired && !resumeFile) {
      setResumeError('Please upload your resume');
      setError('Please upload your resume');
      return;
    }

    if (!isEmailValid || !isResumeValid) {
      setError('Please fix the errors before submitting');
      return;
    }

    if (!parsedJobData) {
      setError('No parsed job data available');
      return;
    }

    setIsCreatingAssessment(true);
    setIsUploadingResume(true);
    setError(null);
    setNameError('');
    setEmailError('');
    setResumeError('');
    setUploadStatus('Creating candidate and uploading resume...');

    try {
      setUploadStatus('Uploading resume and parsing...');
      const result = await publicPracticeAssessmentService.createAssessment({
        parsedJobDataId: parsedJobDataId || undefined,
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        resumeFile: resumeFile || undefined, // Optional if candidate has existing resume
      });

      const { assessment, metadata } = result;

      if (metadata) {
        setHasExistingResume(metadata.hasResume);
        setResumeRequired(!metadata.resumeParsed);

        sessionStorage.setItem(
          `practice-assessment-${assessment.id}-metadata`,
          JSON.stringify(metadata)
        );
      }

      // Close dialog and redirect to check page
      setShowDetailsDialog(false);

      router.push(
        `/app/candidate/assessments/practice/check?id=${assessment.id}`
      );
    } catch (err) {
      logger.error('Assessment creation error:', err);

      // Handle specific error types
      let errorMessage = 'Failed to create assessment. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;

        // Check for user type conflict
        if (err.message.includes('already registered as a')) {
          errorMessage = `${err.message} Please use a different email or log in with your existing account.`;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
      setIsCreatingAssessment(false);
      setIsUploadingResume(false);
      setUploadStatus(null);
    }
  };

  const jobData = parsedJobData?.parsedJob;
  const additionalData = jobData?._additionalData;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error && !parsedJobData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4 text-lg">{error}</p>
          <Button onClick={() => router.push('/candidate')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-muted/30 min-h-screen pb-24">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <h1 className="text-foreground text-2xl font-bold">
              Job Posting Details
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Confirm your information to get skill based AI assessment
              instantly
            </p>
          </motion.div>

          {parsedJobData && jobData && (
            <div className="space-y-4">
              {/* Job Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-card rounded-xl border p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                      <Building2 className="text-muted-foreground h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-foreground text-lg font-semibold">
                        {jobData.title || 'Job Title'}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {additionalData?.companyName || 'Company Name'}
                      </p>
                      {additionalData?.employeeCount && (
                        <p className="text-muted-foreground text-xs">
                          {additionalData.employeeCount} employees
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {jobData.preferredLocations &&
                    jobData.preferredLocations.length > 0 && (
                      <div className="text-muted-foreground flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{jobData.preferredLocations.join(', ')}</span>
                      </div>
                    )}
                  {jobData.employmentType && (
                    <span className="rounded-full border bg-[#6e55cf]/10 px-3 py-1 text-xs font-medium text-[#6e55cf]">
                      {jobData.employmentType}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Job Description Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-card rounded-xl border p-6 shadow-sm"
              >
                {jobData.description && (
                  <div className="mb-6">
                    <h3 className="text-foreground mb-3 font-semibold">
                      Job Description
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {jobData.description}
                    </p>
                  </div>
                )}

                {jobData.responsibilities &&
                  jobData.responsibilities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-foreground mb-3 font-semibold">
                        Key Responsibilities
                      </h3>
                      <ul className="space-y-2">
                        {jobData.responsibilities.map(
                          (item: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6e55cf]" />
                              <span className="text-muted-foreground">
                                {item}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {jobData.requiredSkills &&
                  jobData.requiredSkills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-foreground mb-3 font-semibold">
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {jobData.requiredSkills.map(
                          (skill: string, index: number) => (
                            <span
                              key={index}
                              className="text-foreground bg-muted/50 rounded-lg border px-3 py-1.5 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {jobData.preferredSkills &&
                  jobData.preferredSkills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-foreground mb-3 font-semibold">
                        Preferred Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {jobData.preferredSkills.map(
                          (skill: string, index: number) => (
                            <span
                              key={index}
                              className="text-foreground bg-muted/50 rounded-lg border px-3 py-1.5 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {jobData.benefits && jobData.benefits.length > 0 && (
                  <div>
                    <h3 className="text-foreground mb-3 font-semibold">
                      Benefits & Perks
                    </h3>
                    <ul className="space-y-2">
                      {jobData.benefits.map(
                        (benefit: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Heart className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                            <span className="text-muted-foreground">
                              {benefit}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </motion.div>

              {/* About Company Section */}
              {additionalData?.companyName && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-card rounded-xl border p-6 shadow-sm"
                >
                  <h3 className="text-foreground mb-4 font-semibold">
                    About Company
                  </h3>

                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                      <Building2 className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {additionalData.companyName}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-3 text-xs">
                        {additionalData.employeeCount && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {additionalData.employeeCount} employees
                          </span>
                        )}
                        {additionalData.rating && (
                          <span className="flex items-center gap-1">
                            ⭐ {additionalData.rating} Rating
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {additionalData.companyDescription && (
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {additionalData.companyDescription}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {additionalData.founded && (
                      <div>
                        <p className="text-muted-foreground text-xs">Founded</p>
                        <p className="text-foreground font-medium">
                          {additionalData.founded}
                        </p>
                      </div>
                    )}
                    {additionalData.headquarters && (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Headquarter
                        </p>
                        <p className="text-foreground font-medium">
                          {additionalData.headquarters}
                        </p>
                      </div>
                    )}
                    {additionalData.industry && (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Industry
                        </p>
                        <p className="text-foreground font-medium">
                          {additionalData.industry}
                        </p>
                      </div>
                    )}
                    {additionalData.website && (
                      <div>
                        <p className="text-muted-foreground text-xs">Website</p>
                        <a
                          href={additionalData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-[#6e55cf] hover:underline"
                        >
                          {additionalData.website.replace(
                            /^https?:\/\/(www\.)?/,
                            ''
                          )}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="bg-card fixed right-0 bottom-0 left-0 border-t px-4 py-4">
          <div className="mx-auto flex max-w-5xl justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/candidate')}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              className="gap-2 bg-gradient-to-r from-[#6e55cf] to-[#8b6edb] px-6 text-white hover:shadow-lg"
            >
              Start Assessment
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Name and Email Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Your Details</DialogTitle>
            <DialogDescription>
              Please provide your name and email to start the practice
              assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {user && user.type === 'CANDIDATE' && (
              <div className="bg-muted/50 border-border rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">
                  You&apos;re logged in as <strong>{user.email}</strong>. This
                  assessment will be linked to your account.
                </p>
              </div>
            )}
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Your Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className={`border-border bg-background text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:ring-1 focus:outline-none ${
                  touched.name && nameError
                    ? 'border-destructive focus:border-destructive'
                    : 'focus:border-primary'
                } ${user || namePreFilled ? 'bg-muted/50' : ''}`}
                value={candidateName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                disabled={
                  isCreatingAssessment ||
                  isUploadingResume ||
                  !!(user && user.type === 'CANDIDATE') ||
                  (emailExists && namePreFilled)
                }
              />
              {touched.name && nameError && (
                <p className="text-destructive mt-1 text-xs">{nameError}</p>
              )}
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Your Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className={`border-border bg-background text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-lg border px-4 py-2.5 pr-10 text-sm transition-all focus:ring-1 focus:outline-none ${
                    touched.email && emailError
                      ? 'border-destructive focus:border-destructive'
                      : 'focus:border-primary'
                  } ${user ? 'bg-muted/50' : ''}`}
                  value={candidateEmail}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  disabled={
                    isCreatingAssessment ||
                    isUploadingResume ||
                    !!(user && user.type === 'CANDIDATE')
                  }
                />
                {isCheckingEmail && (
                  <div className="absolute top-1/2 right-3 -translate-y-1/2">
                    <svg
                      className="text-muted-foreground h-4 w-4 animate-spin"
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
                  </div>
                )}
              </div>
              {touched.email && emailError && (
                <p className="text-destructive mt-1 text-xs">{emailError}</p>
              )}
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Resume{' '}
                {resumeRequired && <span className="text-destructive">*</span>}
              </label>
              {hasExistingResume && !resumeFile && (
                <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/20">
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">
                        Resume on file
                      </p>
                      <p className="mt-1 text-blue-700 dark:text-blue-400">
                        You already have a resume on file. Upload a new one to
                        update it (you&apos;ll be asked to confirm), or continue
                        with your existing resume.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!resumeFile ? (
                <label
                  className={`border-border bg-background flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
                    !touched.email ||
                    !!emailError ||
                    !candidateEmail.trim() ||
                    (emailExists &&
                      (!touched.name || !!nameError || !candidateName.trim()))
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-muted/50 cursor-pointer'
                  }`}
                >
                  <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {!touched.email || !!emailError || !candidateEmail.trim()
                      ? 'Please enter and validate your email first'
                      : emailExists &&
                          (!touched.name ||
                            !!nameError ||
                            !candidateName.trim())
                        ? 'Please ensure your name is correct first'
                        : hasExistingResume
                          ? 'Click to upload new resume (will replace existing)'
                          : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {!touched.email || !!emailError || !candidateEmail.trim()
                      ? 'Email validation required before upload'
                      : 'PDF document only (max 10MB)'}
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    disabled={
                      isCreatingAssessment ||
                      isUploadingResume ||
                      !touched.email || // Disable until email is entered
                      !!emailError || // Disable if email has errors
                      !candidateEmail.trim() || // Disable if email is empty
                      (emailExists &&
                        (!touched.name || !!nameError || !candidateName.trim())) // Disable if email exists but name not validated
                    }
                  />
                </label>
              ) : (
                <div className="border-border bg-muted/30 flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {resumeFileName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isCreatingAssessment || isUploadingResume}
                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {touched.resume && resumeError && (
                <p className="text-destructive mt-1 text-xs">{resumeError}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
              disabled={isCreatingAssessment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartAssessment}
              disabled={
                isCreatingAssessment ||
                isUploadingResume ||
                !candidateName.trim() ||
                !candidateEmail.trim() ||
                (resumeRequired && !resumeFile) ||
                !!nameError ||
                !!emailError ||
                (resumeRequired && !!resumeError)
              }
            >
              {isUploadingResume || isCreatingAssessment ? (
                <span className="flex items-center gap-2">
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
                  {uploadStatus || 'Processing...'}
                </span>
              ) : (
                'Start Practice Assessment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Update Warning Dialog */}
      <Dialog
        open={showResumeUpdateWarning}
        onOpenChange={setShowResumeUpdateWarning}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Your Resume?</DialogTitle>
            <DialogDescription>
              You are about to upload a new resume. This will replace your
              existing resume and update your profile information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-600 dark:text-amber-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                    Important Information
                  </h4>
                  <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Your existing resume data will be replaced with the new
                        one
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        All information from the new resume will be parsed and
                        updated
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        This assessment will use your newly uploaded resume
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {pendingResumeFile && (
              <div className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-3">
                <FileText className="text-muted-foreground h-5 w-5" />
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">
                    {pendingResumeFile.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {(pendingResumeFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelResumeUpdate}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmResumeUpdate}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Yes, Update Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ParsePage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      }
    >
      <ParsePageContent />
    </Suspense>
  );
};

export default ParsePage;
