'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Globe,
  Volume2,
  User,
  Users,
  HelpCircle,
  Loader,
  PlayCircle,
  Settings,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IVoiceSynthesizeRequest } from '@/lib/shared';
import { voiceService } from '@/lib/services/services';
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
    'Welcome to your onboarding assessment. Please listen carefully to each question and provide thoughtful responses.',
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
  interviewLanguage: z.string().min(1, 'Language is required'),
  interviewDialect: z.string().min(1, 'Dialect is required'),
  interviewVoiceGender: z.enum(['female', 'male']),
});

type FormValues = z.infer<typeof formSchema>;

interface OnboardingAssessmentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: {
    interviewLanguage?: string;
    interviewDialect?: string;
    interviewVoiceGender?: string;
  };
  isLoading?: boolean;
  onSave?: (values: FormValues) => Promise<void>;
}

export function OnboardingAssessmentSettingsDialog({
  open,
  onOpenChange,
  initialValues,
  isLoading: _isLoading = false,
  onSave,
}: OnboardingAssessmentSettingsDialogProps) {
  const [previewingDialect, setPreviewingDialect] = useState<{
    code: string;
    voiceType: 'female' | 'male';
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewLanguage: initialValues?.interviewLanguage || 'ENGLISH',
      interviewDialect: initialValues?.interviewDialect || 'en-US',
      interviewVoiceGender:
        (initialValues?.interviewVoiceGender as 'female' | 'male') || 'female',
    },
  });

  useEffect(() => {
    if (open && initialValues) {
      form.reset({
        interviewLanguage: initialValues.interviewLanguage || 'ENGLISH',
        interviewDialect: initialValues.interviewDialect || 'en-US',
        interviewVoiceGender:
          (initialValues.interviewVoiceGender as 'female' | 'male') || 'female',
      });
    }
  }, [open, initialValues, form]);

  const selectedDialect = form.watch('interviewDialect');
  const _selectedVoiceGender = form.watch('interviewVoiceGender') as
    | 'female'
    | 'male';

  const previewDialectAudio = useCallback(
    async (dialectCode: string, voiceType: 'female' | 'male') => {
      try {
        setPreviewingDialect({ code: dialectCode, voiceType });

        const dialect = ENGLISH_DIALECTS.find((d) => d.code === dialectCode);
        if (!dialect) {
          throw new Error('Dialect not found');
        }

        const _voice = dialect.voiceOptions[voiceType];
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

        const audioUrl = URL.createObjectURL(
          new Blob([Buffer.from(response.audioContent, 'base64')], {
            type: 'audio/mpeg',
          })
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
        // Error previewing dialect audio
        toast.error('Failed to preview audio');
        setPreviewingDialect(null);
      }
    },
    []
  );

  const onSubmit = async (values: FormValues) => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(values);
        toast.success('Onboarding assessment settings saved successfully');
        onOpenChange(false);
      } catch (_error) {
        // Error saving settings
        toast.error('Failed to save settings');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-blue-600" />
            Onboarding Assessment Voice Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="text-primary h-5 w-5" />
                    Voice Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure the voice settings for onboarding assessments.
                    These settings will be used as defaults for all new
                    onboarding assessments.
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">
                                  Select the primary language for onboarding
                                  assessments.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">
                                  Select the English dialect for voice
                                  synthesis. Use the preview buttons to hear how
                                  each dialect sounds with different voice
                                  types.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select dialect" />
                            </SelectTrigger>
                            <SelectContent>
                              {ENGLISH_DIALECTS.map((dialect) => (
                                <SelectItem
                                  key={dialect.code}
                                  value={dialect.code}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{dialect.flag}</span>
                                    <span>{dialect.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Select the English dialect for voice synthesis. Use
                          the preview buttons below to hear how each dialect
                          sounds with different voice types.
                        </FormDescription>
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">
                                  Select the gender of the voice for onboarding
                                  assessments.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        <FormDescription className="text-xs">
                          Choose whether to use a female or male voice for the
                          onboarding assessments.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dialect Preview Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="text-primary h-4 w-4" />
                      <span className="text-sm font-semibold">
                        Dialect Preview
                      </span>
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
                        const isPreviewing =
                          isPreviewingFemale || isPreviewingMale;

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
                                  <span className="text-2xl">
                                    {dialect.flag}
                                  </span>
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
            </form>
          </Form>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="-mx-4 flex items-center justify-end gap-3 rounded-b-lg border-t px-4 pt-4 pb-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="border-gray-300 transition-colors hover:bg-gray-100"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 transition-colors hover:bg-blue-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
