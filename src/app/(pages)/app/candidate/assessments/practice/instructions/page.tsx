'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  PublicPracticeAssessmentStatusEnum,
  IPublicPracticeAssessment,
  IPublicPracticeAssessmentSettings,
  logger,
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
  publicPracticeAssessmentService,
  voiceService,
} from '@/lib/services/services';
import { IVoiceSynthesizeRequest } from '@/lib/shared';
import { getVoiceConfig } from '@/lib/utils/voice-utils';

// Types
interface Section {
  id: string;
  title: string;
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
      This practice assessment consists of {sections.length} sections designed
      to evaluate your skills and experience required for the job requirements.
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
  settings?: IPublicPracticeAssessmentSettings;
}) => {
  if (!settings?.proctoringEnabled) {
    return (
      <Section
        title="Proctoring Guidelines"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="bg-muted/50 text-muted-foreground rounded-md p-3 text-sm">
          Proctoring is not enabled for this practice assessment.
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
  settings?: IPublicPracticeAssessmentSettings;
}) => {
  if (!settings?.videoRecordingEnabled) {
    return (
      <Section title="Video Recording" icon={<Video className="h-5 w-5" />}>
        <div className="bg-muted/50 text-muted-foreground rounded-md p-3 text-sm">
          Video recording is not enabled for this practice assessment.
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

const PracticeAssessmentInstructionsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const [isStarting, setIsStarting] = useState(false);
  const [assessment, setAssessment] =
    useState<IPublicPracticeAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioPlayed, setIsAudioPlayed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop speaking
  const stopSpeaking = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
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

    setIsSpeaking(true);

    try {
      // Get voice configuration from assessment settings
      const dialectCode =
        assessment?.publicPracticeAssessmentSettings?.interviewDialect ||
        'en-US';
      const voiceGender =
        (assessment?.publicPracticeAssessmentSettings?.interviewVoiceGender as
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
        audioRef.current = new Audio();
      }

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
        router.replace('/');
        return;
      }

      try {
        const data =
          await publicPracticeAssessmentService.getAssessment(assessmentId);
        setAssessment(data);

        // Extract sections and settings from assessment if available
        if (data.sections && data.sections.length > 0) {
          setSections(
            data.sections.map((s) => ({
              id: s.id,
              title: s.title,
            }))
          );
        } else {
          // Default sections if not provided
          setSections([
            { id: '1', title: 'Technical Skills' },
            { id: '2', title: 'Behavioral Questions' },
          ]);
        }
      } catch (error) {
        logger.error('Error fetching assessment:', error);
        toast.error('Failed to load assessment');
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, router]);

  const playWelcomeAudio = async () => {
    const welcomeText = `${assessment?.publicPracticeAssessmentSettings?.greetingMessage || 'Welcome to your practice assessment'}.
     Please read all instructions carefully before starting. Once you've read through everything, 
     click the I am Ready button to begin.`;
    await speakText(welcomeText);
    setIsAudioPlayed(true);
  };

  // Handle initial assessment status - matches job AI assessment flow
  useEffect(() => {
    if (!assessment) return;

    switch (assessment.status) {
      case PublicPracticeAssessmentStatusEnum.AI_INITIALIZATION_IN_PROGRESS:
        // Redirect back to check page if initialization is still in progress
        router.replace(
          `/app/candidate/assessments/practice/check?id=${assessmentId}`
        );
        break;
      case PublicPracticeAssessmentStatusEnum.AI_INITIALIZATION_COMPLETED:
        // Play welcome audio when initialization is completed
        playWelcomeAudio();
        break;
      case PublicPracticeAssessmentStatusEnum.IN_PROGRESS:
        // If already in progress, redirect directly to assessment
        router.replace(
          `/app/candidate/assessments/practice/assessment?id=${assessmentId}`
        );
        break;
      default:
        toast.error('Invalid assessment status');
        router.replace('/');
        break;
    }
  }, [assessment, assessmentId, router]);

  const handleStartAssessment = async () => {
    if (!assessmentId || !assessment) {
      toast.error('Assessment ID is required');
      return;
    }

    setIsStarting(true);
    try {
      const data =
        await publicPracticeAssessmentService.startAssessment(assessmentId);
      if (data.status === PublicPracticeAssessmentStatusEnum.IN_PROGRESS) {
        router.replace(
          `/app/candidate/assessments/practice/assessment?id=${assessmentId}`
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

  return (
    <TooltipProvider>
      <div
        className="bg-background min-h-screen"
        role="main"
        aria-label="Assessment Instructions"
      >
        <TopNavigation
          duration={
            assessment.publicPracticeAssessmentSettings
              ?.defaultAssessmentDuration ||
            assessment.duration ||
            3600
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
                <AssessmentOverview sections={sections} />
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-6">
                    <ProctoringGuidelines
                      settings={assessment.publicPracticeAssessmentSettings}
                    />
                  </div>
                  <div className="space-y-6">
                    <VideoRecordingInfo
                      settings={assessment.publicPracticeAssessmentSettings}
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

const PracticeAssessmentInstructionsPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PracticeAssessmentInstructionsPageContent />
    </Suspense>
  );
};

export default PracticeAssessmentInstructionsPage;
