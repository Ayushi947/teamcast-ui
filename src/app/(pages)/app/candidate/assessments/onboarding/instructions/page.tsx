'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  OnboardingAssessmentStatusEnum,
  ICandidateOnboardingAssessment,
  logger,
  FEATURE_FLAGS,
} from '@/lib/shared';
import {
  Video,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wifi,
  Link,
  ArrowRight,
  ClipboardList,
  Shield,
  Sun,
  Moon,
  Volume2,
} from 'lucide-react';

import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  candidateOnboardingAssessmentService,
  voiceService,
} from '@/lib/services/services';
import { IVoiceSynthesizeRequest } from '@/lib/shared';
import { getAssessmentRoute } from '@/lib/env';
import { getVoiceConfig } from '@/lib/utils/voice-utils';
import { useFeature } from '@/lib/context/feature-flag-context';
import { useTheme } from 'next-themes';

// Types
interface Section {
  id: string;
  title: string;
}

interface AssessmentSettings {
  assessmentDuration?: number;
  proctoringEnabled?: boolean;
  videoRecordingEnabled?: boolean;
  copyPasteAllowed?: boolean;
}

// Components
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
  </div>
);

const TopNavigation = ({
  duration,
  isStarting,
  onStart,
  isAudioPlayed,
}: {
  duration?: number;
  isStarting: boolean;
  onStart: () => void;
  isAudioPlayed: boolean;
}) => (
  <div className="bg-card fixed top-0 right-0 left-0 z-50 border-b">
    <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 md:px-6 md:py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-muted-foreground text-sm">
            Duration: {duration ? Math.round(duration / 60) : 45} minutes
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            disabled={isStarting || !isAudioPlayed}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 pl-8 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <div className="flex items-center space-x-2">
              {isStarting ? (
                <>
                  <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <span>I am ready, start the assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  </div>
);

const Header = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="mt-12 mb-6 sm:mt-16 md:mt-32 md:mb-12">
    <div className="flex flex-col items-center">
      <div className="mb-8">
        <AIAvatar isSpeaking={isSpeaking} />
      </div>
      <h2 className="text-foreground text-center text-2xl font-bold">
        Read the Instructions Carefully
      </h2>
      <p className="text-muted-foreground text-center">
        Please read all instructions carefully before starting the assessment
      </p>
    </div>
  </div>
);

const Section = ({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <section className="bg-card rounded-lg border p-4">
    <h3 className="text-foreground mb-3 flex items-center text-base font-semibold">
      {icon && <span className="text-primary mr-2">{icon}</span>}
      {title}
    </h3>
    {children}
  </section>
);

const AssessmentOverview = ({ sections }: { sections: Section[] }) => (
  <Section
    title="Assessment Overview"
    icon={<ClipboardList className="h-5 w-5" />}
  >
    <p className="text-muted-foreground mb-4 text-sm">
      This assessment consists of {sections.length} sections designed to
      evaluate your skills and experience.
    </p>
    <div className="grid gap-2 sm:grid-cols-2">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="bg-background flex items-center space-x-2 rounded-md p-2"
        >
          <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-sm">
            {index + 1}
          </div>
          <span className="text-muted-foreground text-sm">{section.title}</span>
        </div>
      ))}
    </div>
  </Section>
);

const ProctoringGuidelines = ({
  settings,
}: {
  settings?: AssessmentSettings;
}) => {
  if (!settings?.proctoringEnabled) {
    return (
      <Section
        title="Proctoring Guidelines"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="bg-muted/50 text-muted-foreground rounded-md p-3 text-sm">
          Proctoring is not enabled for this assessment.
        </div>
      </Section>
    );
  }

  return (
    <Section
      title="Proctoring Guidelines"
      icon={<Shield className="h-5 w-5" />}
    >
      <div className="space-y-3">
        <ul className="space-y-2">
          {[
            'Please ensure you are in a well-lit, quiet environment',
            'Keep your face visible to the camera at all times',
            'Do not switch browser tabs or windows',
            'Do not use any external devices or materials',
            ...(settings.copyPasteAllowed
              ? []
              : ['Copy-paste functionality is disabled']),
          ].map((item, index) => (
            <li
              key={index}
              className="text-muted-foreground flex items-center space-x-2 text-sm"
            >
              <CheckCircle2 className="text-success h-4 w-4" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};

const VideoRecordingInfo = ({
  settings,
}: {
  settings?: AssessmentSettings;
}) => {
  if (!settings?.videoRecordingEnabled) {
    return (
      <Section
        title="Proctoring Guidelines"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="bg-muted/50 text-muted-foreground rounded-md p-3 text-sm">
          Video recording is not enabled for this assessment.
        </div>
      </Section>
    );
  }

  return (
    <Section title="Video Recording" icon={<Video className="h-5 w-5" />}>
      <div className="bg-info/10 flex items-center space-x-3 rounded-md p-2">
        <p className="text-info text-sm">
          Your responses will be recorded for review. Please ensure your camera
          and microphone are working properly.
        </p>
      </div>
    </Section>
  );
};

const ImportantNotes = () => (
  <Section title="Important Notes" icon={<AlertCircle className="h-5 w-5" />}>
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        {
          icon: <Clock className="text-warning h-5 w-5" />,
          text: 'The assessment must be completed in one session',
        },
        {
          icon: <AlertCircle className="text-warning h-5 w-5" />,
          text: 'You cannot pause or save your progress',
        },
        {
          icon: <Wifi className="text-warning h-5 w-5" />,
          text: 'Ensure you have a stable internet connection',
        },
        {
          icon: <Link className="text-warning h-5 w-5" />,
          text: 'Have a pen and paper ready for notes if needed',
        },
      ].map((item, index) => (
        <div
          key={index}
          className="bg-warning/10 flex items-center space-x-2 rounded-md p-2"
        >
          {item.icon}
          <span className="text-muted-foreground text-sm">{item.text}</span>
        </div>
      ))}
    </div>
  </Section>
);

const HelpText = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="text-muted-foreground m-8 text-center text-xs"
  >
    Need help? Contact{' '}
    <a
      href="mailto:hello@teamcast.ai"
      className="text-primary hover:text-primary/80 transition-colors hover:underline"
    >
      hello@teamcast.ai
    </a>
  </motion.div>
);

// New Instructions Design (V2) - Improved UX with feature flag
const InstructionsV2 = ({
  assessment,
  isStarting,
  onStart,
  isAudioPlayed,
  isSpeaking,
  onPlayAudio,
}: {
  assessment: ICandidateOnboardingAssessment;
  isStarting: boolean;
  onStart: () => void;
  isAudioPlayed: boolean;
  isSpeaking: boolean;
  onPlayAudio: () => void;
}) => {
  const { theme, setTheme } = useTheme();
  const sections = assessment.sections;
  const settings = assessment.onboardingAssessmentSettings;

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const duration = settings?.defaultAssessmentDuration
    ? Math.round(settings.defaultAssessmentDuration / 60)
    : 45;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              {duration} min assessment
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="hidden h-5 w-5 text-yellow-400 dark:block" />
            </button>
            {isAudioPlayed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                Audio played
              </motion.div>
            )}
            <motion.button
              type="button"
              whileHover={!isStarting && isAudioPlayed ? { scale: 1.02 } : {}}
              whileTap={!isStarting && isAudioPlayed ? { scale: 0.98 } : {}}
              onClick={onStart}
              disabled={isStarting || !isAudioPlayed}
              className="bg-primary shadow-primary/20 flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <span>I am ready, start the assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[90rem] px-6 py-8">
        {/* Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 0.1 }}
            className="mb-6"
          >
            <AIAvatar isSpeaking={isSpeaking} />
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold">
            Read the Instructions Carefully
          </h1>
          <p className="mb-6 max-w-xl text-base text-slate-600 dark:text-slate-400">
            Please read all instructions before starting. Click below to hear
            the welcome message.
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAudio}
            disabled={isSpeaking}
            className="bg-primary shadow-primary/20 flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSpeaking ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Playing...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                Play welcome message
              </>
            )}
          </motion.button>
          {!isAudioPlayed && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
              You must play the audio before starting
            </p>
          )}
        </motion.header>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assessment Overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="text-primary h-6 w-6" />
              <h2 className="text-lg font-bold">Assessment Overview</h2>
            </div>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              This assessment has {sections.length} sections to evaluate your
              skills and experience.
            </p>
            <div className="flex flex-wrap gap-2">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-primary/10 flex items-center gap-2 rounded-lg px-4 py-2"
                >
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {section.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Proctoring Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center gap-2">
              <Shield className="text-primary h-6 w-6" />
              <h2 className="text-lg font-bold">Proctoring Guidelines</h2>
            </div>
            {settings?.proctoringEnabled ? (
              <ul className="space-y-3">
                {[
                  'Ensure you are in a well-lit, quiet environment',
                  'Keep your face visible to the camera at all times',
                  'Do not switch browser tabs or windows',
                  'Do not use external devices or materials',
                  ...(settings.copyPasteAllowed
                    ? []
                    : ['Copy-paste is disabled']),
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
                Proctoring is not enabled for this assessment.
              </p>
            )}
          </motion.div>

          {/* Video Recording */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center gap-2">
              <Video className="text-primary h-6 w-6" />
              <h2 className="text-lg font-bold">Video Recording</h2>
            </div>
            {settings?.videoRecordingEnabled ? (
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="mt-3 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your responses will be recorded for review. Ensure your camera
                  and microphone are working properly.
                </p>
              </div>
            ) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
                Video recording is not enabled.
              </p>
            )}
          </motion.div>

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="text-primary h-6 w-6" />
              <h2 className="text-lg font-bold">Important Notes</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Clock, text: 'Complete in one session' },
                { icon: AlertCircle, text: 'No pause or save progress' },
                { icon: Wifi, text: 'Stable internet required' },
                { icon: Link, text: 'Pen and paper ready if needed' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20"
                >
                  <item.icon className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Help */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-sm text-slate-600 dark:text-slate-400"
        >
          Need help?{' '}
          <a
            href="mailto:hello@teamcast.ai"
            className="text-primary cursor-pointer font-medium hover:underline"
          >
            hello@teamcast.ai
          </a>
        </motion.p>
      </main>
    </div>
  );
};

const OnboardingInstructionsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const useNewDesign = useFeature(FEATURE_FLAGS.ASSESSMENT_INSTRUCTIONS_NEW_UI);
  const [isStarting, setIsStarting] = useState(false);
  const [assessment, setAssessment] =
    useState<ICandidateOnboardingAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioPlayed, setIsAudioPlayed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop speaking
  const stopSpeaking = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        // Clear any event listeners to prevent memory leaks
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
      logger.debug('Speech stopped successfully');
    } catch (error) {
      logger.error('Error stopping speech:', error);
    }
  };

  // Speak text
  const speakText = async (
    text: string,
    force: boolean = false
  ): Promise<void> => {
    if (!text) {
      logger.warn('Empty text provided to speakText');
      return;
    }

    if (isSpeaking && force) {
      stopSpeaking();
    }

    // Set isSpeaking to true
    setIsSpeaking(true);

    try {
      // Get voice configuration from assessment settings
      const dialectCode =
        assessment?.onboardingAssessmentSettings?.interviewDialect || 'en-US';
      const voiceGender =
        (assessment?.onboardingAssessmentSettings?.interviewVoiceGender as
          | 'female'
          | 'male') || 'female';

      const voiceConfig = getVoiceConfig(dialectCode, voiceGender);

      const request: IVoiceSynthesizeRequest = {
        text,
        voice: voiceConfig.voice,
        languageCode: voiceConfig.languageCode,
      };
      const response = await voiceService.synthesizeSpeech(request);
      if (!response.audioContent) {
        throw new Error('No audio content received');
      }
      const audioUrl = URL.createObjectURL(
        new Blob([Buffer.from(response.audioContent, 'base64')], {
          type: 'audio/mpeg',
        })
      );
      if (!audioRef.current) {
        logger.debug('Creating new audio element');
        audioRef.current = new Audio();
      }

      // Return a promise that resolves when audio playback is complete
      return new Promise<void>((resolve, reject) => {
        if (!audioRef.current) {
          reject(new Error('Audio element not found'));
          return;
        }

        const handleEnded = () => {
          setIsSpeaking(false);
          cleanup();
          resolve();
        };

        const handleError = (error: Event) => {
          setIsSpeaking(false);
          cleanup();
          reject(new Error('Audio playback failed'));
          logger.error('Audio playback failed:', error);
        };

        const cleanup = () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('ended', handleEnded);
            audioRef.current.removeEventListener('error', handleError);
            // Clean up the blob URL to prevent memory leaks
            URL.revokeObjectURL(audioUrl);
          }
        };

        audioRef.current.addEventListener('ended', handleEnded);
        audioRef.current.addEventListener('error', handleError);
        audioRef.current.src = audioUrl;

        audioRef.current.play().catch((playError) => {
          setIsSpeaking(false);
          cleanup();
          reject(new Error(`Failed to play audio: ${playError.message}`));
        });
      });
    } catch (error) {
      setIsSpeaking(false);
      throw error;
    }
  };

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) {
        toast.error('Assessment ID is required');
        router.replace('/app/candidate/dashboard');
        return;
      }

      try {
        const data =
          await candidateOnboardingAssessmentService.getAssessment(
            assessmentId
          );
        setAssessment(data);
      } catch (error) {
        logger.error('Error fetching assessment:', error);
        toast.error('Failed to load assessment');
        router.replace('/app/candidate/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, router]);

  const playWelcomeAudio = async () => {
    const welcomeText = `${assessment?.onboardingAssessmentSettings?.greetingMessage}.
     Please read all instructions carefully before starting. Once you've read through everything, 
     click the I am Ready button to begin.`;
    await speakText(welcomeText);
    setIsAudioPlayed(true);
  };

  const pathname = usePathname();

  // Handle initial assessment status
  useEffect(() => {
    if (!assessment) return;

    const assessmentRoute = getAssessmentRoute();

    let targetPath = null;
    switch (assessment.status) {
      case OnboardingAssessmentStatusEnum.AI_INITIALIZATION_IN_PROGRESS:
        targetPath = `/app/candidate/assessments/onboarding/check?id=${assessmentId}`;
        break;
      case OnboardingAssessmentStatusEnum.AI_INITIALIZATION_COMPLETED:
        playWelcomeAudio();
        return; // no redirect
      case OnboardingAssessmentStatusEnum.CANDIDATE_ASSESSMENT_IN_PROGRESS:
        targetPath = `/app/candidate/assessments/onboarding/${assessmentRoute}?id=${assessmentId}`;
        break;
      default:
        toast.error('Invalid assessment');
        targetPath = '/app/candidate/dashboard';
        break;
    }

    if (targetPath && pathname !== targetPath) {
      router.replace(targetPath);
    }
  }, [assessment, pathname]);

  const handleStartAssessment = async () => {
    if (!assessmentId || !assessment) {
      toast.error('Assessment ID is required');
      return;
    }

    setIsStarting(true);
    try {
      const assessmentRoute = getAssessmentRoute();
      const data =
        await candidateOnboardingAssessmentService.startAssessment(
          assessmentId
        );
      if (
        data.status ===
        OnboardingAssessmentStatusEnum.CANDIDATE_ASSESSMENT_IN_PROGRESS
      ) {
        router.replace(
          `/app/candidate/assessments/onboarding/${assessmentRoute}?id=${assessmentId}`
        );
      } else {
        toast.error('Failed to start assessment');
        setIsStarting(false);
      }
    } catch (error) {
      logger.error('Error starting assessment:', error);
      toast.error('Failed to start assessment');
      setIsStarting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!assessment) return null;

  if (useNewDesign) {
    return (
      <InstructionsV2
        assessment={assessment}
        isStarting={isStarting}
        onStart={handleStartAssessment}
        isAudioPlayed={isAudioPlayed}
        isSpeaking={isSpeaking}
        onPlayAudio={playWelcomeAudio}
      />
    );
  }

  return (
    <TooltipProvider>
      <div
        className="bg-background min-h-screen"
        role="main"
        aria-label="Assessment Instructions"
      >
        <TopNavigation
          duration={
            assessment.onboardingAssessmentSettings?.defaultAssessmentDuration
          }
          isStarting={isStarting}
          onStart={handleStartAssessment}
          isAudioPlayed={isAudioPlayed}
        />

        <div className="relative min-h-screen pt-16 sm:pt-18 md:pt-16">
          <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 md:px-6">
            <Header isSpeaking={isSpeaking} />

            <div className="bg-card rounded-lg border p-6">
              <div className="space-y-6">
                <AssessmentOverview sections={assessment.sections} />
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-6">
                    <ProctoringGuidelines
                      settings={assessment.onboardingAssessmentSettings}
                    />
                  </div>
                  <div className="space-y-6">
                    <VideoRecordingInfo
                      settings={assessment.onboardingAssessmentSettings}
                    />
                    <ImportantNotes />
                  </div>
                </div>
              </div>
            </div>

            <HelpText />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

const OnboardingInstructionsPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OnboardingInstructionsPageContent />
    </Suspense>
  );
};

export default OnboardingInstructionsPage;
