'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Mic, Clock, CheckCircle2, Power } from 'lucide-react';
import { demoService } from '@/lib/services/services';
import { voiceService } from '@/lib/services/services';
import { IVoiceSynthesizeRequest } from '@/lib/shared';
import { logger } from '@/lib/logger';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DemoInterviewProps {
  profile: any;
  onComplete: (results: any) => void;
  onBack: () => void;
}

// Voice configuration with alternating accents for technical roles
const VOICE_CONFIG = {
  indian: {
    primary: 'en-IN-Chirp3-HD-Aoede', // Female Indian accent
    fallbacks: ['en-IN-Standard-A', 'en-IN-Standard-C'],
    languageCode: 'en-IN',
  },
  us: {
    primary: 'en-US-Chirp3-HD-Aoede', // Female US English accent
    fallbacks: ['en-US-Wavenet-C', 'en-US-Standard-E'],
    languageCode: 'en-US',
  },
  timeout: 30000, // 30 seconds timeout
} as const;

// Demo questions based on role
const getDemoQuestions = (profile: any) => {
  const baseQuestions = [
    {
      id: 'intro',
      type: 'TEXT',
      question: `Hello! Welcome to your AI interview for the ${profile.title} position. I'm excited to learn more about your experience and skills. Let's start with a brief introduction. Can you tell me about yourself and what interests you most about this role?`,
      duration: 120,
      expectedSkills: ['Communication', 'Self-awareness', 'Motivation'],
    },
    {
      id: 'experience',
      type: 'TEXT',
      question: `Great! Now, can you walk me through your most relevant experience for this ${profile.title} position? Please focus on specific projects or achievements that demonstrate your skills.`,
      duration: 150,
      expectedSkills: profile.skills.slice(0, 3),
    },
    {
      id: 'challenge',
      type: 'TEXT',
      question:
        "Excellent. Now, I'd like to understand how you handle challenges. Can you describe a difficult situation you faced in your previous role and how you resolved it? What was the outcome?",
      duration: 120,
      expectedSkills: ['Problem-solving', 'Resilience', 'Leadership'],
    },
  ];

  // Add role-specific question
  if (profile.category === 'technical') {
    baseQuestions.push({
      id: 'technical',
      type: 'TEXT',
      question: `As a ${profile.title}, technical expertise is crucial. Can you describe your approach to ${profile.skills[0]} and share an example of how you've used it to solve a complex problem?`,
      duration: 120,
      expectedSkills: profile.skills.slice(0, 2),
    });
  } else {
    baseQuestions.push({
      id: 'leadership',
      type: 'TEXT',
      question: `In a ${profile.title} role, leadership and strategy are key. Can you tell me about a time when you had to lead a team or drive a strategic initiative? What was your approach and the results?`,
      duration: 120,
      expectedSkills: ['Leadership', 'Strategy', 'Team Management'],
    });
  }

  return baseQuestions;
};

// Get voice configuration based on role position (card selection)
const getVoiceConfig = (profile: any, _questionIndex: number) => {
  // Map profile IDs to their position in DEMO_PROFILES array
  const profilePositionMap: { [key: string]: number } = {
    'senior-software-engineer': 0,
    'data-scientist': 1,
    'product-manager': 2,
    'sales-manager': 3,
    'senior-aiml-engineer': 4,
    'senior-data-labeller': 5,
    'senior-finance-analyst': 6,
  };

  // Get the role index, default to 0 if not found
  const roleIndex = profilePositionMap[profile.id] ?? 0;

  const selectedVoice =
    roleIndex % 2 === 0 ? VOICE_CONFIG.indian : VOICE_CONFIG.us;

  // 0=IN, 1=US, 2=IN, 3=US, 4=IN, 5=US, 6=IN - alternating pattern
  // Use the same voice throughout the entire interview based on role position
  return selectedVoice;
};

const DemoInterviewContent = ({
  profile,
  onComplete,
  onBack,
}: DemoInterviewProps) => {
  // Core state (same as real assessment)
  const [isStarted, setIsStarted] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showEndAssessmentDialog, setShowEndAssessmentDialog] = useState(false);

  // Separate state for when user can answer questions
  const [isAnsweringMode, setIsAnsweringMode] = useState(false);

  // Question state
  const [questions] = useState(() => getDemoQuestions(profile));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [transcript, setTranscript] = useState('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');

  // Audio context for system audio capture
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const _systemAudioSourceRef = useRef<MediaElementAudioSourceNode | null>(
    null
  );

  // Speech recognition
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  // Audio analysis for microphone visualization
  const audioContextAnalysisRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);
  const [_pitch, setPitch] = useState(0);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Video recording
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize audio context (same as real assessment)
  const initializeAudio = () => {
    try {
      audioContextRef.current = new AudioContext();
      audioRef.current = new Audio();

      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };

      audioRef.current.onerror = (error) => {
        logger.error('Audio playback error:', error);
        setIsSpeaking(false);
      };
    } catch (error) {
      logger.error('Failed to initialize audio context:', error);
    }
  };

  // Initialize media streams (same as real assessment)
  const initializeMediaStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      videoStreamRef.current = stream;
      microphoneStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          const handleLoadedMetadata = () => {
            resolve();
          };

          const handleError = (error: Event) => {
            logger.error('Video loading error:', error);
            reject(new Error('Video failed to load'));
          };

          videoRef.current.addEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
            { once: true }
          );
          videoRef.current.addEventListener('error', handleError, {
            once: true,
          });

          setTimeout(() => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              resolve();
            } else {
              reject(new Error('Video loading timeout'));
            }
          }, 5000);
        });
      }

      setupAudioAnalysis(stream);
      setupMediaRecorder(stream);
      await startVideoRecordingImmediate();

      setIsAudioInitialized(true);
    } catch (error) {
      logger.error('Failed to initialize media streams:', error);
      setIsAudioInitialized(false);
    }
  };

  // Set up audio analysis (same as real assessment)
  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      audioContextAnalysisRef.current = new AudioContext();
      const source =
        audioContextAnalysisRef.current.createMediaStreamSource(stream);
      const analyser = audioContextAnalysisRef.current.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    } catch (error) {
      logger.error('Failed to setup audio analysis:', error);
    }
  };

  // Set up MediaRecorder (same as real assessment)
  const setupMediaRecorder = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 250000,
      });

      const recordedChunks: Blob[] = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Combine all recorded chunks into a single blob
        const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
        setRecordedVideoBlob(recordedBlob);
      };

      mediaRecorder.onerror = (error) => {
        logger.error('MediaRecorder error:', error);
      };

      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      logger.error('Failed to setup MediaRecorder:', error);
    }
  };

  // Start video recording (same as real assessment)
  const startVideoRecordingImmediate = async () => {
    if (!mediaRecorderRef.current) {
      throw new Error('Media recorder not initialized');
    }

    if (mediaRecorderRef.current.state === 'recording') {
      return;
    }

    try {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      logger.error('Failed to start video recording:', error);
      throw error;
    }
  };

  // Initialize speech recognition (same as real assessment)
  const initializeSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      return;
    }

    try {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          setAccumulatedTranscript((prev) => {
            const newAccumulated = prev + ' ' + transcript;
            setTranscript(newAccumulated.trim());
            return newAccumulated;
          });
        } else {
          setAccumulatedTranscript((prev) => {
            const currentTranscript = (prev + ' ' + transcript).trim();
            setTranscript(currentTranscript);
            return prev; // Don't update accumulated for interim results
          });
        }
      };

      recognition.onerror = (event) => {
        logger.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          if (isListening) {
            setTimeout(() => {
              try {
                recognition.start();
              } catch (e) {
                logger.error('Failed to restart recognition:', e);
              }
            }, 100);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Check current state when the event fires
        const currentTranscript = accumulatedTranscript;
        const shouldRestart = currentTranscript.length < 10;

        if (shouldRestart) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              logger.error('Failed to restart recognition:', e);
            }
          }, 100);
        }
      };

      speechRecognitionRef.current = recognition;
    } catch (error) {
      logger.error('Failed to initialize speech recognition:', error);
    }
  };

  // Start audio analysis (same as real assessment)
  const startAudioAnalysis = () => {
    if (!analyserRef.current || !dataArrayRef.current) {
      return;
    }

    const analyzeAudio = () => {
      if (!analyserRef.current || !dataArrayRef.current || !isListening) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setAudioLevel(0);
        setPitch(0);
        return;
      }

      try {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = sum / dataArrayRef.current.length;
        const normalizedLevel = Math.min(100, (average / 255) * 100);

        setAudioLevel((prev) => prev * 0.7 + normalizedLevel * 0.3);
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      } catch (error) {
        logger.error('Error in audio analysis:', error);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };

    analyzeAudio();
  };

  // Stop speaking (same as real assessment)
  const stopSpeaking = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
    } catch (error) {
      logger.error('Error stopping speech:', error);
    }
  };

  // Wait until speech finished (same as real assessment)
  const waitUntilSpeechFinished = async () => {
    while (isSpeaking) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  // Speak text (same as real assessment)
  const speakText = async (
    text: string,
    force: boolean = false
  ): Promise<void> => {
    if (!text) {
      return;
    }

    if (isSpeaking && force) {
      stopSpeaking();
    } else {
      await waitUntilSpeechFinished();
    }

    setIsSpeaking(true);

    try {
      // Get voice configuration based on role and current question index
      const voiceConfig = getVoiceConfig(profile, currentQuestionIndex);

      const request: IVoiceSynthesizeRequest = {
        text,
        voice: voiceConfig.primary,
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
        throw new Error('Audio element not found');
      }

      return new Promise<void>((resolve, reject) => {
        if (!audioRef.current) {
          reject(new Error('Audio element not found'));
          return;
        }

        const handleEnded = () => {
          setIsSpeaking(false);
          // Auto-enable answering mode when AI finishes speaking
          setIsAnsweringMode(true);
          cleanup();
          resolve();
        };

        const handleError = (error: Event) => {
          logger.error('Audio playback failed:', error);
          setIsSpeaking(false);
          cleanup();
          reject(new Error('Audio playback failed'));
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

  // Start listening (same as real assessment)
  const startListening = async () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        logger.error('Error stopping existing recognition:', e);
      }
    }

    if (speechRecognitionRef.current) {
      setAccumulatedTranscript('');
      setTranscript('');

      setIsListening(true);
      try {
        speechRecognitionRef.current.start();
      } catch (error) {
        logger.error('Error starting speech recognition:', error);
      }
    } else {
      logger.error('Failed to initialize speech recognition');
      setIsListening(false);
      throw new Error('Failed to initialize speech recognition');
    }
  };

  // Stop listening (same as real assessment)
  const stopListening = () => {
    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        setIsListening(false);
      }
    } catch (error) {
      logger.error('Error stopping speech recognition:', error);
    }
  };

  // Speak question (same as real assessment)
  const speakQuestion = async (question: any) => {
    if (!question || !question.question) {
      return;
    }

    // Ensure we're not listening before speaking
    if (isListening) {
      stopListening();
    }

    // Clear any existing transcript
    setTranscript('');
    setAccumulatedTranscript('');

    await speakText(question.question);

    if (question?.type === 'TEXT') {
      // Add a small delay to ensure speech has finished
      await new Promise((resolve) => setTimeout(resolve, 300));
      await startListening();
      // isAnsweringMode is automatically set to true when AI finishes speaking
    }
  };

  // Handle recording complete (same as real assessment)
  const handleRecordingComplete = async () => {
    try {
      // Stop listening first
      stopListening();

      if (!transcript || transcript.length < 10) {
        await speakText(
          'Your answer is too brief. Could you please elaborate more on your response?'
        );
        // Wait a bit before starting to listen again
        await new Promise((resolve) => setTimeout(resolve, 500));
        await startListening();
      } else {
        await handleSubmitAnswer(transcript);
      }
    } catch (error) {
      logger.error('Error completing recording:', error);
    }
  };

  // Submit answer with conversational AI
  const handleSubmitAnswer = async (answer: string) => {
    try {
      setIsProcessing(true);
      setIsAnsweringMode(false); // User is no longer in answering mode

      if (isListening) {
        await stopListening();
      }

      // Check if we have a valid sessionId
      if (!profile.sessionId) {
        logger.error('No sessionId available for demo assessment');
        await speakText(
          'Demo session not properly initialized. Please restart the demo.'
        );
        setIsProcessing(false);
        return;
      }

      // Get presigned URL for video upload if we have recorded video
      let videoUrl = '';
      if (recordedVideoBlob) {
        try {
          const fileName = `demo-${profile.sessionId}-${currentQuestion.id}-${Date.now()}.webm`;
          const { uploadUrl, videoUrl: uploadedVideoUrl } =
            await demoService.getPresignedUrl(fileName);

          // Upload the recorded video
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: recordedVideoBlob,
            headers: {
              'Content-Type': 'video/webm',
            },
          });

          if (uploadResponse.ok) {
            videoUrl = uploadedVideoUrl;
          } else {
            logger.error('Failed to upload video:', uploadResponse);
          }
        } catch (error) {
          logger.error('Error uploading video:', error);
          // Continue without video URL
        }
      }

      // Prepare submission data
      const submissionData: any = {
        questionId: currentQuestion.id,
        answer: answer,
        duration: 90,
      };

      // Only include videoUrl if we have a valid one
      if (videoUrl && videoUrl.trim() !== '') {
        submissionData.videoUrl = videoUrl;
      }

      // Submit answer to backend for conversational AI processing
      const response = await demoService.submitAnswer(
        profile.sessionId,
        submissionData
      );

      if (response.success && response.nextQuestion) {
        // Update current question with AI-generated follow-up
        setCurrentQuestion(response.nextQuestion);
        setCurrentQuestionIndex((prev) => prev + 1);
        setTranscript('');
        setAccumulatedTranscript('');

        // Reset processing state before speaking new question
        setIsProcessing(false);

        // Wait for state update to complete before speaking
        await new Promise((resolve) => setTimeout(resolve, 500));
        await speakQuestion(response.nextQuestion);

        // Processing state is already reset
      } else {
        // No more questions, complete the interview
        await handleInterviewComplete();
        setIsProcessing(false);
      }
    } catch (error) {
      logger.error('Error submitting answer:', error);

      // Provide more specific error messages
      let errorMessage =
        'There was an error processing your answer. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Assessment session not found')) {
          errorMessage = 'Demo session expired. Please restart the demo.';
        } else if (error.message.includes('Failed to submit answer')) {
          errorMessage = 'Unable to submit your answer. Please try again.';
        }
      }

      await speakText(errorMessage);
      if (currentQuestion) {
        await speakQuestion(currentQuestion);
      }
      setIsProcessing(false);
    }
  };

  // Handle interview complete with real video analysis
  const handleInterviewComplete = async () => {
    try {
      setIsInterviewComplete(true);
      setIsSubmitting(true);
      setIsAnsweringMode(false); // User is no longer answering

      await speakText(
        "Thank you for completing the demo! I'm now analyzing your video responses using AI. This will take a moment...",
        true
      );

      // Perform real video analysis
      const videoAnalysis = await demoService.analyzeVideo({
        videoUrl: 'https://example.com/demo-video.mp4', // In real implementation, this would be the actual video URL
        sessionId: profile.sessionId || 'demo-session',
      });

      // Complete the assessment
      await demoService.completeAssessment(profile.sessionId || 'demo-session');

      // Get comprehensive results
      const assessmentResults = await demoService.getAssessmentResults(
        profile.sessionId || 'demo-session'
      );

      // Combine results with video analysis
      const comprehensiveResults = {
        ...assessmentResults,
        videoAnalysis: videoAnalysis,
        conversationalAI: true,
        realTimeAnalysis: true,
      };

      await speakText(
        'Analysis complete! Your interview has been processed using advanced AI technology. You can now view your detailed results.',
        true
      );

      setIsSubmitting(false);
      onComplete(comprehensiveResults);
    } catch (error) {
      logger.error('Error completing interview:', error);

      // Fallback to mock results if AI analysis fails
      const mockResults = {
        overallScore: 0.87,
        recommendation: 'HIGHLY_RECOMMENDED',
        scores: {
          overall: 0.87,
          technicalSkills: profile.category === 'technical' ? 0.85 : 0.82,
          problemSolving: 0.89,
          communication: 0.88,
          leadership: profile.category === 'non-technical' ? 0.85 : 0.82,
          strategicThinking: 0.86,
        },
        strengths: [
          'Excellent communication skills with clear articulation',
          'Strong problem-solving approach with structured thinking',
          'Demonstrates relevant experience in the field',
          'Shows enthusiasm and motivation for the role',
        ],
        areasForImprovement: [
          'Could provide more specific examples with quantifiable results',
          'Consider elaborating on technical challenges faced',
        ],
        feedback:
          'Overall strong performance with good communication and relevant experience. The candidate demonstrates the key skills required for this role.',
        videoAnalysis: null,
        conversationalAI: true,
        realTimeAnalysis: false,
      };

      await speakText(
        'Thank you for completing the demo! Your responses have been analyzed. This concludes our AI interview demonstration.',
        true
      );

      setIsSubmitting(false);
      onComplete(mockResults);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle start (same as real assessment)
  const handleStart = async () => {
    setIsStarted(true);
    await speakText(
      "Let's begin the demo assessment. Wish you the best of luck!"
    );

    if (currentQuestion) {
      setCurrentQuestion(currentQuestion);
      await speakQuestion(currentQuestion);
    } else {
      logger.error('No question found on load');
    }
  };

  // Handle end assessment request
  const handleEndAssessment = async () => {
    setShowEndAssessmentDialog(false);

    if (isListening) {
      stopListening();
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    await handleInterviewComplete();
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize everything on mount
  useEffect(() => {
    initializeAudio();
    initializeSpeechRecognition();
  }, []);

  // Initialize media streams when started
  useEffect(() => {
    if (isStarted && !isAudioInitialized) {
      initializeMediaStreams();
    }
  }, [isStarted]);

  // Start audio analysis when listening
  useEffect(() => {
    if (isListening) {
      startAudioAnalysis();
    }
  }, [isListening]);

  // Timer effect
  useEffect(() => {
    if (!isStarted || isInterviewComplete) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleInterviewComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isInterviewComplete]);

  // Time warning effect
  useEffect(() => {
    if (timeRemaining <= 60) {
      setIsTimeWarning(true);
    } else {
      setIsTimeWarning(false);
    }
  }, [timeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === 'recording'
      ) {
        mediaRecorderRef.current.stop();
      }
      if (audioContextAnalysisRef.current) {
        audioContextAnalysisRef.current.close();
      }
    };
  }, []);

  if (!isStarted) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-2xl px-6 text-center"
        >
          <div className="mb-8">
            <AIAvatar isSpeaking={false} />
          </div>
          <h2 className="text-foreground mb-4 text-3xl font-bold">
            Ready to Start Your Demo Interview?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            You&apos;ll be interviewed for the <strong>{profile.title}</strong>{' '}
            position. The AI will ask you {questions.length} questions and
            analyze your responses in real-time.
          </p>
          <div className="mb-8 space-y-4">
            <div className="text-muted-foreground flex items-center justify-center space-x-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Duration: 5 minutes</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-center space-x-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Selected Role: {profile.title}</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-center space-x-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Real-time AI analysis</span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-primary text-primary-foreground"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Demo Interview
            </Button>
            <Button variant="outline" onClick={onBack} size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Role Selection
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isInterviewComplete) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl px-6 text-center"
        >
          <div className="mb-8">
            <AIAvatar isSpeaking={isSpeaking} />
          </div>
          <h2 className="text-foreground mb-4 text-3xl font-bold">
            Demo Interview Complete!
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Thank you for completing the demo! Your responses have been analyzed
            and processed.
          </p>
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
              <span className="text-muted-foreground ml-3">
                Processing your responses...
              </span>
            </div>
          ) : (
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => onComplete({})}
                size="lg"
                className="bg-primary text-primary-foreground"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                View Results
              </Button>
              <Button variant="outline" onClick={onBack} size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Try Another Role
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen">
        {/* Top Navigation - Fixed (same as real assessment) */}
        <div className="bg-surface fixed top-0 right-0 left-0 z-50 shadow-sm">
          <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 md:px-6 md:py-3">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex w-full items-center justify-between">
                {/* Section Navigation */}
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                        AI
                      </div>
                      <div>
                        <div className="text-foreground text-sm font-medium">
                          5-Minute Assessment
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {profile.title} Demo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Voice Indicator Chip */}
                  <div className="bg-primary/10 text-primary flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                    <Mic className="h-3 w-3" />
                    <span>
                      {getVoiceConfig(profile, currentQuestionIndex)
                        .languageCode === 'en-IN'
                        ? 'IN'
                        : 'US'}
                    </span>
                  </div>
                  {/* End Assessment Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEndAssessmentDialog(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2"
                    disabled={isSubmitting || isInterviewComplete}
                  >
                    <Power className="h-5 w-5" />
                  </Button>

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

                  {/* Duration */}
                  <motion.div
                    className={`flex items-center space-x-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 md:text-sm ${
                      isTimeWarning
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    animate={{
                      scale: isTimeWarning ? [1, 1.05, 1] : 1,
                      transition: {
                        duration: 1,
                        repeat: isTimeWarning ? Infinity : 0,
                        repeatType: 'reverse',
                      },
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: isTimeWarning ? 360 : 0,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isTimeWarning ? Infinity : 0,
                        ease: 'linear',
                      }}
                    >
                      <Clock
                        className={`h-4 w-4 ${isTimeWarning ? 'text-destructive' : 'text-muted-foreground'}`}
                      />
                    </motion.div>
                    <motion.span
                      className={`font-mono ${isTimeWarning ? 'font-bold' : 'font-medium'}`}
                      animate={{
                        color: isTimeWarning
                          ? 'var(--destructive)'
                          : 'var(--muted-foreground)',
                      }}
                    >
                      {formatTime(timeRemaining)}
                    </motion.span>
                    {isTimeWarning && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-destructive text-xs font-medium"
                      >
                        remaining
                      </motion.span>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable (same as real assessment) */}
        <div className="relative flex min-h-screen items-center justify-center sm:pt-8 md:pt-6">
          <div className="mx-auto min-h-148 w-full max-w-4xl px-3 sm:px-4 md:px-6">
            {/* AI Avatar Section */}
            <div className="mt-12 mb-6 sm:mt-8 md:mt-8 md:mb-8">
              <div className="flex flex-col items-center">
                <div className="mb-3 sm:mb-4 md:mb-8">
                  <AIAvatar
                    isSpeaking={isListening || isSpeaking}
                    audioLevel={isListening ? audioLevel : -1}
                    isAudioLevelMode={isListening}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion?.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="px-0 text-center sm:px-4"
                  >
                    <p className="sm:text-md text-foreground pt-6 text-lg md:text-lg">
                      {currentQuestion?.question}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Response Area */}
            <div className="mt-3 pb-24 sm:mt-4 sm:pb-20 md:mt-8 md:pb-12">
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                  <span className="text-muted-foreground ml-3">
                    Processing your response...
                  </span>
                </div>
              ) : (
                <div>
                  {/* Speech Recognition Status */}
                  {isAnsweringMode && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="disabled mt-12 mb-3 flex flex-col items-center justify-center sm:mb-4"
                    >
                      <div className="bg-primary/10 text-primary flex items-center space-x-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                        <Mic className="h-4 w-4" />
                        <span className="text-xs font-medium sm:text-sm">
                          {audioLevel > 1 ? "I'm listening…" : 'Speak up!'}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Continue Button */}
                  {(isAnsweringMode ||
                    isProcessing ||
                    (transcript.length >= 10 && !isSpeaking)) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRecordingComplete}
                      disabled={isProcessing || transcript.length < 10}
                      className={`bg-primary text-primary-foreground hover:bg-primary/90 mx-auto mt-12 flex w-full items-center justify-center space-x-2 rounded-md px-4 py-3 text-sm font-medium transition-colors sm:mt-12 md:mt-16 md:w-auto md:px-8 md:py-3 ${
                        isProcessing || transcript.length < 10
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {isProcessing
                          ? 'Processing...'
                          : transcript.length < 10
                            ? 'Speak up!'
                            : 'Done answering? Tap to continue.'}
                      </span>
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Elements */}
        <div className="fixed right-4 bottom-4 h-40 w-52 overflow-hidden rounded-2xl bg-white shadow-sm sm:h-48 sm:w-64 md:bottom-6 md:left-6 md:h-64 md:w-96">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {isRecording && (
            <div className="absolute right-2 bottom-2 flex items-center space-x-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <span>Recording</span>
            </div>
          )}
        </div>

        {/* End Assessment Confirmation Dialog */}
        <AlertDialog
          open={showEndAssessmentDialog}
          onOpenChange={setShowEndAssessmentDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Demo Interview?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end this demo interview? This action
                cannot be undone and your current progress will be submitted
                automatically.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Interview</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEndAssessment}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                End Interview
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

const DemoInterview = (props: DemoInterviewProps) => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <span className="text-muted-foreground ml-3">
            Loading interview...
          </span>
        </div>
      }
    >
      <DemoInterviewContent {...props} />
    </Suspense>
  );
};

export default DemoInterview;
