'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare, Mic, MicOff, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InterviewWelcomeProps {
  onStartInterview: () => void;
}

export function InterviewWelcome({ onStartInterview }: InterviewWelcomeProps) {
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMicPermission(true);
        stream.getTracks().forEach((track) => track.stop());
      } catch (_error) {
        setMicPermission(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkMicPermission();
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="bg-card rounded-xl border p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
              <MessageSquare className="text-primary h-10 w-10" />
            </div>
            <h2 className="text-foreground mb-4 text-3xl font-bold">
              Welcome to Your AI Interview
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              You&apos;ll be interviewed by our AI interviewer, EVA. This is a
              natural conversation where you&apos;ll discuss your background,
              skills, and experiences.
            </p>
          </div>

          {/* Pre-interview Checklist */}
          <div className="bg-muted/50 mb-8 rounded-lg p-6">
            <h3 className="text-foreground mb-4 flex items-center text-lg font-semibold">
              <CheckCircle className="text-primary mr-2 h-5 w-5" />
              Pre-Interview Checklist
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {isChecking ? (
                      <div className="border-primary/20 border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
                    ) : micPermission ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <MicOff className="text-destructive h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Microphone Access
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {isChecking
                        ? 'Checking permissions...'
                        : micPermission
                          ? 'Microphone is ready'
                          : 'Please grant microphone access'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mic className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Audio Quality
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Find a quiet place with minimal background noise
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Duration
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Interview typically lasts 20-30 minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageSquare className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Natural Conversation
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Speak clearly and naturally, as if talking to a person
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={onStartInterview}
              disabled={micPermission === false}
              className="px-8 py-3 text-base font-medium"
            >
              {micPermission === false ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Grant Microphone Access First
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start AI Interview
                </>
              )}
            </Button>

            {micPermission === false && (
              <p className="text-destructive mt-3 text-sm">
                Please grant microphone access to continue with the interview
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
