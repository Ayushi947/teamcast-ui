'use client';

import { FileText, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import { candidateResumeParsingService } from '@/lib/services/services';
import { ResumeParsingTaskStatusEnum } from '@/lib/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import { validateFileUpload } from '@/lib/utils/file-upload-utils';
import TourGuide from '@/components/tour/tour-guide';

const POLLING_INTERVAL = 2000; // 2 seconds

const PROCESSING_MESSAGES = [
  'Extracting information from your resume...',
  'Analyzing your work experience...',
  'Identifying your skills and expertise...',
  'Processing your education history...',
  'Mapping your professional journey...',
  'Almost there, just a few more details...',
  'Organizing your achievements...',
  'Fine-tuning the details...',
];

const ResumePage = () => {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsingMode, setParsingMode] = useState<
    'STRICT' | 'INFERRED' | 'GENERATIVE'
  >('GENERATIVE');
  const [_parsingTaskId, setParsingTaskId] = useState<string | null>(null);
  const [_isPolling, setIsPolling] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        return;
      }

      setFile(file);
      setError(null);
    }
  };

  const pollParsingTask = async (taskId: string, messageIndex: number = 0) => {
    try {
      const task =
        await candidateResumeParsingService.getParsingTaskForCandidate();

      if (!task) {
        throw new Error('No task data received');
      }

      switch (task.status) {
        case ResumeParsingTaskStatusEnum.COMPLETED: {
          setIsPolling(false);
          setUploadStatus('Resume parsed successfully!');

          // Store the parsed resume data in localStorage
          try {
            const parsedResume =
              await candidateResumeParsingService.getParsedResume(taskId);
            if (parsedResume && parsedResume.parsedResume) {
              localStorage.setItem(
                'candidateResumeDraft',
                JSON.stringify(parsedResume)
              );
              logger.info(
                'Resume parsed successfully and stored in localStorage',
                {
                  taskId,
                  context: 'ResumePage.pollParsingTask',
                }
              );
            }
          } catch (parseError) {
            logger.error('Failed to get parsed resume data:', parseError);
          }

          // Clean up task ID
          localStorage.removeItem('pendingResumeParsingTask');

          router.push('/app/candidate/onboard/profile');
          break;
        }
        case ResumeParsingTaskStatusEnum.FAILED: {
          setIsPolling(false);
          setError(
            `Failed to parse resume. - ${task.error} Please try again or skip for now.`
          );
          setFile(null);
          setIsUploading(false);
          setUploadStatus(null);
          localStorage.removeItem('pendingResumeParsingTask');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          break;
        }
        case ResumeParsingTaskStatusEnum.PENDING:
        case ResumeParsingTaskStatusEnum.PROCESSING:
          setUploadStatus(PROCESSING_MESSAGES[messageIndex]);
          logger.info('Processing status:', {
            currentIndex: messageIndex,
            message: PROCESSING_MESSAGES[messageIndex],
          });
          // Continue polling
          setTimeout(
            () =>
              pollParsingTask(
                taskId,
                (messageIndex + 1) % PROCESSING_MESSAGES.length
              ),
            POLLING_INTERVAL
          );
          break;
        default:
          setUploadStatus('Analyzing your resume...');
          // Continue polling
          setTimeout(
            () =>
              pollParsingTask(
                taskId,
                (messageIndex + 1) % PROCESSING_MESSAGES.length
              ),
            POLLING_INTERVAL
          );
      }
    } catch (error) {
      logger.error('Error polling parsing task:', error);
      setIsPolling(false);
      setError(
        'Failed to check resume parsing status. Please try again or skip for now.'
      );
      localStorage.removeItem('pendingResumeParsingTask');
    }
  };

  const handleUpload = async (fileToUpload: File) => {
    if (!fileToUpload) return;

    setError(null);
    setIsUploading(true);
    setUploadStatus('Uploading your resume...');

    try {
      // Upload resume with parsing mode
      const response = await candidateResumeParsingService.uploadResume(
        fileToUpload,
        parsingMode
      );

      const task = response;

      if (!task) {
        throw new Error('No task data received');
      }

      setParsingTaskId(task.id);
      setIsPolling(true);
      setUploadStatus('Processing your resume...');

      // Store task ID for background processing
      localStorage.setItem('pendingResumeParsingTask', task.id);

      // Start polling for task status
      pollParsingTask(task.id);
    } catch (error) {
      logger.error('Error uploading resume:', error);
      setError(`Failed to upload resume. Please try again. ${error}`);
      setIsUploading(false);
      setUploadStatus(null);
      localStorage.removeItem('pendingResumeParsingTask');
    }
  };

  useEffect(() => {
    if (file && !isUploading && !error) {
      handleUpload(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // const handleSkip = () => {
  //   router.push('/app/candidate/onboard/profile');
  // };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setIsUploading(false);
    setUploadStatus(null);
    setParsingTaskId(null);
    localStorage.removeItem('pendingResumeParsingTask');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Upload Your Resume
            </h1>
          </div>
          <p className="text-muted-foreground mt-3 text-base sm:mt-4 sm:text-lg">
            Let us do the work for you! Upload your resume and we&apos;ll
            automatically fill in your details.
          </p>
        </div>

        <div className="mt-8 sm:mt-12">
          <div className="mb-6">
            <Label htmlFor="parsing-mode">Parsing Mode</Label>
            <div data-tour="parsing-mode-selector">
              <Select
                value={parsingMode}
                onValueChange={(value: 'STRICT' | 'INFERRED' | 'GENERATIVE') =>
                  setParsingMode(value)
                }
                disabled={isUploading}
              >
                <SelectTrigger id="parsing-mode" className="w-full">
                  <SelectValue placeholder="Select parsing mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRICT">
                    Strict - Only extract information explicitly mentioned
                  </SelectItem>
                  <SelectItem value="INFERRED">
                    Inferred - Extract and infer information from context
                  </SelectItem>
                  <SelectItem value="GENERATIVE">
                    Generative - Use AI to generate additional insights
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          {!file && !isUploading ? (
            <div data-tour="resume-upload">
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`group border-border bg-background relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all duration-300 ease-in-out sm:p-12 ${
                  isUploading
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-primary hover:scale-[1.02] hover:shadow-lg'
                }`}
              >
                <Upload className="text-muted-foreground group-hover:text-primary h-8 w-8 transition-all duration-300 group-hover:scale-110 sm:h-10 sm:w-10" />
                <p className="text-muted-foreground group-hover:text-primary mt-3 text-sm font-medium transition-colors duration-300 sm:mt-4 sm:text-lg">
                  Click to upload or drag and drop
                </p>
                <p className="text-muted-foreground group-hover:text-primary mt-1 text-xs transition-colors duration-300">
                  PDF files up to 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="border-border bg-background rounded-lg border p-4 transition-all duration-300 ease-in-out hover:shadow-lg sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center space-x-3">
                  <FileText className="text-primary h-6 w-6 flex-shrink-0 transition-transform duration-300 hover:scale-110 sm:h-8 sm:w-8" />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {file?.name}
                    </p>
                    {file && (
                      <p className="text-muted-foreground text-xs">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
                {!isUploading && (
                  <button
                    onClick={removeFile}
                    className="hover:bg-muted ml-4 flex-shrink-0 rounded-full p-1 transition-all duration-300 hover:scale-110"
                    aria-label="Remove file"
                  >
                    <X className="text-muted-foreground hover:text-destructive h-4 w-4 transition-colors duration-300 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>

              {isUploading && uploadStatus && (
                <div className="mt-4 flex flex-col items-center justify-center gap-2 py-12">
                  <div className="mb-16 scale-125 pt-16">
                    <AIAvatar isSpeaking={true} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-foreground mb-4 text-xl font-semibold">
                      Analyzing Your Resume
                    </h3>
                    <p className="text-md text-muted-foreground mb-8">
                      {uploadStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="animate-fade-in mt-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* <div className="mt-6 flex justify-center sm:mt-8 sm:justify-end">
            <div data-tour="skip-resume-upload">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isUploading}
                className="w-full sm:w-auto"
              >
                 Skip for now 
              </Button>
            </div>
          </div> */}
        </div>
      </div>
      <TourGuide
        autoStart={true}
        showProgress={true}
        tourKey="candidate_onboarding_resume"
        className="fixed right-0 bottom-0"
      />
    </>
  );
};

export default ResumePage;
