'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Clock,
  CheckCircle2,
  Brain,
  Eye,
  Timer,
  Pause,
  Square,
} from 'lucide-react';
import { demoService, demoStorageService } from '@/lib/services/services';
import { logger } from '@/lib/logger';

interface DemoAssessmentFlowProps {
  profile: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface Question {
  id: string;
  type: 'video';
  question: string;
  duration: number;
  expectedSkills: string[];
}

export function DemoAssessmentFlow({
  profile,
  onComplete,
  onBack,
}: DemoAssessmentFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [_isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock questions based on profile
  const questions: Question[] = [
    {
      id: 'intro-1',
      type: 'video',
      question: `Tell me about yourself and your experience with ${profile.skills.slice(0, 2).join(' and ')}.`,
      duration: 90,
      expectedSkills: ['Communication', 'Technical Background'],
    },
    {
      id: 'scenario-1',
      type: 'video',
      question:
        profile.category === 'technical'
          ? 'How would you approach building a scalable system for a high-traffic application?'
          : 'How would you develop a strategy to increase customer retention by 20%?',
      duration: 120,
      expectedSkills: ['Problem Solving', 'Strategic Thinking'],
    },
    {
      id: 'challenge-1',
      type: 'video',
      question:
        profile.category === 'technical'
          ? 'Describe a challenging technical problem you solved and the impact it had.'
          : 'Tell me about a time you had to manage a difficult stakeholder situation.',
      duration: 90,
      expectedSkills: ['Experience', 'Communication', 'Problem Solving'],
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion) {
      setTimeRemaining(currentQuestion.duration);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (isRecording && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleStopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, timeRemaining]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isMicEnabled,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setCurrentAnswer(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      logger.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const handleNextQuestion = async () => {
    if (currentAnswer) {
      const answer = {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        duration: currentQuestion.duration - timeRemaining,
        submittedAt: new Date(),
      };

      setAnswers((prev) => [...prev, answer]);
      setCurrentAnswer('');

      // Submit answer to API if sessionId exists
      if (profile.sessionId) {
        try {
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
                // Video uploaded successfully
              } else {
                // Failed to upload video, continuing without video URL
              }
            } catch (error) {
              logger.error('Error uploading video:', error);
            }
          }

          // Prepare submission data
          const submissionData: any = {
            questionId: currentQuestion.id,
            answer: currentAnswer,
            duration: currentQuestion.duration - timeRemaining,
          };

          // Only include videoUrl if we have a valid one
          if (videoUrl && videoUrl.trim() !== '') {
            submissionData.videoUrl = videoUrl;
          }

          await demoService.submitAnswer(profile.sessionId, submissionData);
        } catch (error) {
          logger.error('Error submitting answer:', error);
        }
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev: number) => prev + 1);
      setTimeRemaining(questions[currentQuestionIndex + 1].duration);
    } else {
      handleCompleteAssessment();
    }
  };

  const handleCompleteAssessment = async () => {
    setIsProcessing(true);

    try {
      // Complete assessment via API if sessionId exists
      if (profile.sessionId) {
        await demoService.completeAssessment(profile.sessionId);
      }

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const assessmentData = {
        profile,
        questions,
        answers,
        completedAt: new Date(),
        totalDuration: answers.reduce(
          (sum, answer) => sum + answer.duration,
          0
        ),
        sessionId: profile.sessionId,
      };

      // Save to localStorage
      const currentSession = demoStorageService.getCurrentSession();
      if (currentSession) {
        currentSession.completedAt = new Date();
        currentSession.answers = answers;
        demoStorageService.saveCurrentSession(currentSession);
        demoStorageService.saveSessionToHistory(currentSession);
      }

      setIsAssessmentComplete(true);
      setIsProcessing(false);

      // Auto-proceed to results after a short delay
      setTimeout(() => {
        onComplete(assessmentData);
      }, 1500);
    } catch (error) {
      logger.error('Error completing assessment:', error);
      setIsProcessing(false);
      // Still proceed with local data
      const assessmentData = {
        profile,
        questions,
        answers,
        completedAt: new Date(),
        totalDuration: answers.reduce(
          (sum, answer) => sum + answer.duration,
          0
        ),
        sessionId: profile.sessionId,
      };
      onComplete(assessmentData);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress =
    ((currentQuestionIndex + (currentAnswer ? 1 : 0)) / questions.length) * 100;

  if (isAssessmentComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Assessment Complete!
          </h2>
          <p className="mb-6 text-lg text-gray-600">
            Your responses are being analyzed by our AI system.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Selection</span>
          </Button>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>AI Interview Demo</span>
            </Badge>
            <div className="text-sm text-gray-600">{profile.title}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Timer className="h-4 w-4" />
              <span>{formatTime(timeRemaining)} remaining</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Question Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>Question</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700">{currentQuestion.question}</p>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Expected Skills
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {currentQuestion.expectedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Time Limit
                    </Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatTime(currentQuestion.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Video Recording Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  <span>Record Your Response</span>
                </CardTitle>
                <CardDescription>
                  Click record to start your video response. You can pause and
                  resume as needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Video Preview */}
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-900">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />

                    {!isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                        <div className="text-center text-white">
                          <Video className="mx-auto mb-2 h-12 w-12 opacity-50" />
                          <p className="text-sm">Camera preview</p>
                        </div>
                      </div>
                    )}

                    {/* Recording Indicator */}
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-white">
                          REC
                        </span>
                      </div>
                    )}

                    {/* Timer */}
                    {isRecording && (
                      <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 font-mono text-sm text-white">
                        {formatTime(timeRemaining)}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    {/* Mic Toggle */}
                    <Button
                      variant={isMicEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsMicEnabled(!isMicEnabled)}
                      disabled={isRecording}
                    >
                      {isMicEnabled ? (
                        <Mic className="h-4 w-4" />
                      ) : (
                        <MicOff className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Video Toggle */}
                    <Button
                      variant={isVideoEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      disabled={isRecording}
                    >
                      {isVideoEnabled ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <VideoOff className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Record Button */}
                    {!isRecording ? (
                      <Button
                        size="lg"
                        onClick={startRecording}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Start Recording
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePauseRecording}
                        >
                          {isPaused ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="lg"
                          onClick={handleStopRecording}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          <Square className="mr-2 h-5 w-5" />
                          Stop Recording
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Answer Status */}
                  {currentAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Response recorded successfully
                      </span>
                    </motion.div>
                  )}

                  {/* Next Button */}
                  {currentAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center"
                    >
                      <Button
                        size="lg"
                        onClick={handleNextQuestion}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {currentQuestionIndex < questions.length - 1
                          ? 'Next Question'
                          : 'Complete Assessment'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Analysis Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    AI Analysis in Progress
                  </h3>
                  <p className="text-sm text-gray-600">
                    Our AI is analyzing your responses in real-time
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">
                    Communication Skills
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">
                    Technical Knowledge
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-600">Problem Solving</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
