'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Globe,
  Volume2,
  User,
  Users,
  Loader,
  PlayCircle,
  Settings,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Brain,
} from 'lucide-react';
import { IVoiceSynthesizeRequest } from '@/lib/shared';
import {
  voiceService,
  jobAiAssessmentGlobalSettingsService,
} from '@/lib/services/services';
import { getVoiceConfig } from '@/lib/utils/voice-utils';
import * as z from 'zod';

// English Dialect Configuration
interface EnglishDialect {
  code: string;
  name: string;
  nameNative: string;
  flag: string;
  voiceOptions: {
    female: string;
    male: string;
  };
}

const DEFAULT_SAMPLE_TEXT = {
  ENGLISH:
    'Welcome to your job AI assessment. Please listen carefully to each question and provide thoughtful responses.',
};

const createDialect = (
  code: string,
  name: string,
  nameNative: string,
  flag: string,
  fallbackCode?: string
): EnglishDialect => {
  const voiceCode = fallbackCode || code;
  return {
    code,
    name,
    nameNative,
    flag,
    voiceOptions: {
      female: `${voiceCode}-Chirp3-HD-Aoede`,
      male: `${voiceCode}-Chirp3-HD-Puck`,
    },
  };
};

const ENGLISH_DIALECTS: EnglishDialect[] = [
  createDialect('en-US', 'American English', 'American English', '🇺🇸'),
  createDialect('en-GB', 'British English', 'British English', '🇬🇧'),
  createDialect('en-AU', 'Australian English', 'Australian English', '🇦🇺'),
  createDialect('en-CA', 'Canadian English', 'Canadian English', '🇨🇦', 'en-US'),
  createDialect('en-IN', 'Indian English', 'Indian English', '🇮🇳'),
];

const formSchema = z.object({
  greetingMessage: z.string().optional(),
  defaultAssessmentDuration: z.number().min(1).max(14400).optional(),
  defaultPassingScore: z.number().min(0).max(1).optional(),
  requiredSections: z.string().optional(),
  maximumAttempts: z.number().min(1).max(10).optional(),
  cooldownPeriod: z.number().min(0).max(365).optional(),
  maxAssessmentDuration: z.number().min(1).max(14400).optional(),
  assessmentBuffer: z.number().min(0).max(3600).optional(),
  useCustomPrompts: z.boolean().optional(),
  aiDifficulty: z.string().optional(),
  maxSections: z.number().min(1).max(20).optional(),
  maxQuestionsPerSection: z.number().min(1).max(50).optional(),
  proctoringEnabled: z.boolean().optional(),
  maxWarnings: z.number().min(0).max(10).optional(),
  tabSwitchLimit: z.number().min(0).max(10).optional(),
  copyPasteAllowed: z.boolean().optional(),
  videoRecordingEnabled: z.boolean().optional(),
  minimumVideoLength: z.number().min(0).optional(),
  aiVideoAnalysisEnabled: z.boolean().optional(),
  autoPublishOnSuccess: z.boolean().optional(),
  autoNotifyOnComplete: z.boolean().optional(),
  interviewLanguage: z.string().min(1, 'Language is required'),
  interviewDialect: z.string().min(1, 'Dialect is required'),
  interviewVoiceGender: z.enum(['female', 'male']),
});

type FormValues = z.infer<typeof formSchema>;

export default function JobAiAssessmentConfigurationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [previewingDialect, setPreviewingDialect] = useState<{
    code: string;
    voiceType: 'female' | 'male';
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['globalJobAiAssessmentGlobalSettings'],
    queryFn: () =>
      jobAiAssessmentGlobalSettingsService.getGlobalJobAiAssessmentSettings(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      greetingMessage: settings?.greetingMessage || '',
      defaultAssessmentDuration: settings?.defaultAssessmentDuration || 3600,
      defaultPassingScore: settings?.defaultPassingScore || 0.7,
      requiredSections: settings?.requiredSections?.join(', ') || '',
      maximumAttempts: settings?.maximumAttempts || 3,
      cooldownPeriod: settings?.cooldownPeriod || 7,
      maxAssessmentDuration: settings?.maxAssessmentDuration || 7200,
      assessmentBuffer: settings?.assessmentBuffer || 300,
      useCustomPrompts: settings?.useCustomPrompts ?? false,
      aiDifficulty: settings?.aiDifficulty || 'MEDIUM',
      maxSections: settings?.maxSections || 5,
      maxQuestionsPerSection: settings?.maxQuestionsPerSection || 5,
      proctoringEnabled: settings?.proctoringEnabled ?? true,
      maxWarnings: settings?.maxWarnings || 3,
      tabSwitchLimit: settings?.tabSwitchLimit || 3,
      copyPasteAllowed: settings?.copyPasteAllowed ?? false,
      videoRecordingEnabled: settings?.videoRecordingEnabled ?? true,
      minimumVideoLength: settings?.minimumVideoLength || 300,
      aiVideoAnalysisEnabled: settings?.aiVideoAnalysisEnabled ?? true,
      autoPublishOnSuccess: settings?.autoPublishOnSuccess ?? false,
      autoNotifyOnComplete: settings?.autoNotifyOnComplete ?? true,
      interviewLanguage: settings?.interviewLanguage || 'ENGLISH',
      interviewDialect: settings?.interviewDialect || 'en-US',
      interviewVoiceGender:
        (settings?.interviewVoiceGender as 'female' | 'male') || 'female',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        greetingMessage: settings.greetingMessage || '',
        defaultAssessmentDuration: settings.defaultAssessmentDuration || 3600,
        defaultPassingScore: settings.defaultPassingScore || 0.7,
        requiredSections: settings.requiredSections?.join(', ') || '',
        maximumAttempts: settings.maximumAttempts || 3,
        cooldownPeriod: settings.cooldownPeriod || 7,
        maxAssessmentDuration: settings.maxAssessmentDuration || 7200,
        assessmentBuffer: settings.assessmentBuffer || 300,
        useCustomPrompts: settings.useCustomPrompts ?? false,
        aiDifficulty: settings.aiDifficulty || 'MEDIUM',
        maxSections: settings.maxSections || 5,
        maxQuestionsPerSection: settings.maxQuestionsPerSection || 5,
        proctoringEnabled: settings.proctoringEnabled ?? true,
        maxWarnings: settings.maxWarnings || 3,
        tabSwitchLimit: settings.tabSwitchLimit || 3,
        copyPasteAllowed: settings.copyPasteAllowed ?? false,
        videoRecordingEnabled: settings.videoRecordingEnabled ?? true,
        minimumVideoLength: settings.minimumVideoLength || 300,
        aiVideoAnalysisEnabled: settings.aiVideoAnalysisEnabled ?? true,
        autoPublishOnSuccess: settings.autoPublishOnSuccess ?? false,
        autoNotifyOnComplete: settings.autoNotifyOnComplete ?? true,
        interviewLanguage: settings.interviewLanguage || 'ENGLISH',
        interviewDialect: settings.interviewDialect || 'en-US',
        interviewVoiceGender:
          (settings.interviewVoiceGender as 'female' | 'male') || 'female',
      });
    }
  }, [settings, form]);

  const selectedDialect = form.watch('interviewDialect');

  const previewDialectAudio = useCallback(
    async (dialectCode: string, voiceType: 'female' | 'male') => {
      try {
        setPreviewingDialect({ code: dialectCode, voiceType });
        const dialect = ENGLISH_DIALECTS.find((d) => d.code === dialectCode);
        if (!dialect) {
          throw new Error('Dialect not found');
        }
        const voiceConfig = getVoiceConfig(dialectCode, voiceType);
        const request: IVoiceSynthesizeRequest = {
          text: DEFAULT_SAMPLE_TEXT.ENGLISH,
          voice: voiceConfig.voice,
          languageCode: voiceConfig.languageCode,
        };
        const response = await voiceService.synthesizeSpeech(request);
        if (!response.audioContent) {
          throw new Error('No audio content received');
        }
        const binaryString = atob(response.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioUrl = URL.createObjectURL(
          new Blob([bytes], { type: 'audio/mpeg' })
        );
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setPreviewingDialect(null);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setPreviewingDialect(null);
          URL.revokeObjectURL(audioUrl);
          toast.error('Failed to play audio preview');
        };
        await audioRef.current.play();
      } catch (_error) {
        toast.error('Failed to preview audio');
        setPreviewingDialect(null);
      }
    },
    []
  );

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      const requiredSectionsArray = values.requiredSections
        ? values.requiredSections
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      await jobAiAssessmentGlobalSettingsService.updateGlobalJobAiAssessmentSettings(
        {
          ...values,
          requiredSections: requiredSectionsArray as string[] | undefined,
        }
      );

      await queryClient.invalidateQueries({
        queryKey: ['globalJobAiAssessmentGlobalSettings'],
      });

      toast.success('Job AI assessment settings saved successfully');
      router.push('/app/support/configurations');
    } catch (_error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/app/support/configurations')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Job AI Assessment Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure global settings for job AI assessments
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Voice Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-primary h-5 w-5" />
                Voice Configuration
              </CardTitle>
              <CardDescription>
                Configure the voice settings for job AI assessments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="interviewLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Globe className="text-primary h-4 w-4" />
                      Interview Language
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENGLISH">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Currently only English is supported.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interviewDialect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Volume2 className="text-primary h-4 w-4" />
                      English Dialect
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select dialect" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENGLISH_DIALECTS.map((dialect) => (
                            <SelectItem key={dialect.code} value={dialect.code}>
                              <div className="flex items-center gap-2">
                                <span>{dialect.flag}</span>
                                <span>{dialect.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interviewVoiceGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Users className="text-primary h-4 w-4" />
                      Voice Gender
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select voice gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                              <span>Female</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="male">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span>Male</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dialect Preview Cards */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <PlayCircle className="text-primary h-4 w-4" />
                  <span className="text-sm font-semibold">Dialect Preview</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ENGLISH_DIALECTS.map((dialect) => {
                    const isSelected = selectedDialect === dialect.code;
                    const isPreviewingFemale =
                      previewingDialect?.code === dialect.code &&
                      previewingDialect?.voiceType === 'female';
                    const isPreviewingMale =
                      previewingDialect?.code === dialect.code &&
                      previewingDialect?.voiceType === 'male';
                    const isPreviewing = isPreviewingFemale || isPreviewingMale;

                    return (
                      <Card
                        key={dialect.code}
                        className={cn(
                          'relative transition-all',
                          isSelected && 'ring-primary ring-2 ring-offset-2'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{dialect.flag}</span>
                              <div>
                                <p className="text-sm font-medium">
                                  {dialect.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {dialect.nameNative}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1 text-xs"
                              onClick={() =>
                                previewDialectAudio(dialect.code, 'female')
                              }
                              disabled={isPreviewing}
                            >
                              {isPreviewingFemale ? (
                                <Loader className="text-primary h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <User className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                                  <span className="text-xs">Female</span>
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1 text-xs"
                              onClick={() =>
                                previewDialectAudio(dialect.code, 'male')
                              }
                              disabled={isPreviewing}
                            >
                              {isPreviewingMale ? (
                                <Loader className="text-primary h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                  <span className="text-xs">Male</span>
                                </>
                              )}
                            </Button>
                          </div>
                          {isSelected && (
                            <Badge
                              variant="default"
                              className="mt-2 w-full justify-center"
                            >
                              Selected
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="text-primary h-5 w-5" />
                Assessment Configuration
              </CardTitle>
              <CardDescription>
                Configure default assessment settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="defaultAssessmentDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultPassingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Passing Score (0-1)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAssessmentDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Assessment Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assessmentBuffer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Buffer (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxSections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Sections</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxQuestionsPerSection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Questions Per Section</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maximumAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attempts</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cooldownPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooldown Period (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="requiredSections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Sections (comma-separated)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="TECHNICAL_ASSESSMENT, BEHAVIORAL_ASSESSMENT"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter section types separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="greetingMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Greeting Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Welcome message for candidates"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* AI Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-primary h-5 w-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI assessment settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="useCustomPrompts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Use Custom Prompts
                        </FormLabel>
                        <FormDescription>
                          Enable custom AI prompts
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiDifficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Difficulty</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HARD">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Proctoring & Video Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="text-primary h-5 w-5" />
                Proctoring & Video Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="proctoringEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Proctoring Enabled
                        </FormLabel>
                        <FormDescription>
                          Enable proctoring features
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoRecordingEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Video Recording Enabled
                        </FormLabel>
                        <FormDescription>
                          Enable video recording
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiVideoAnalysisEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          AI Video Analysis Enabled
                        </FormLabel>
                        <FormDescription>
                          Enable AI video analysis
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="copyPasteAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Copy/Paste Allowed
                        </FormLabel>
                        <FormDescription>
                          Allow copy/paste during assessment
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoPublishOnSuccess"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Auto Publish On Success
                        </FormLabel>
                        <FormDescription>
                          Automatically publish on passing
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoNotifyOnComplete"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Auto Notify On Complete
                        </FormLabel>
                        <FormDescription>
                          Automatically notify on completion
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="maxWarnings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Warnings</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tabSwitchLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tab Switch Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumVideoLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Video Length (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/app/support/configurations')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
