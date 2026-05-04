'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mcpInterviewPublicService } from '@/lib/services/services';
import { setToken, setUser } from '@/lib/utils/auth-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface InterviewStartClientPageProps {
  interviewId: string;
}

export function InterviewStartClientPage({
  interviewId,
}: InterviewStartClientPageProps) {
  // Guard against double-trigger in React StrictMode/dev remounts.
  const hasStartedRef = useRef(false);
  const startGuardKey = useMemo(
    () => `mcpInterview:start:${interviewId}`,
    [interviewId]
  );

  // Start interview mutation
  const startMutation = useMutation({
    mutationFn: () => mcpInterviewPublicService.startInterview(interviewId),
    onSuccess: (response) => {
      // Persist auth before redirecting into /app routes (prevents bouncing to login).
      if (response?.authUser && response?.authToken) {
        setUser(response.authUser);
        setToken(response.authToken);
      }
      if (response?.redirectUrl) {
        // Redirect to the assessment page with auth token
        window.location.href = response.redirectUrl;
      }
    },
    onError: () => {
      // Allow retry if the start call fails.
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(startGuardKey);
      }
      hasStartedRef.current = false;
    },
  });

  // Auto-start on mount
  useEffect(() => {
    if (hasStartedRef.current) return;

    // React Strict Mode (dev) mounts components twice; sessionStorage survives that.
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(startGuardKey) === '1') return;
      sessionStorage.setItem(startGuardKey, '1');
    }

    hasStartedRef.current = true;
    startMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, startGuardKey]);

  // Error state
  if (startMutation.isError) {
    const errorMessage =
      startMutation.error instanceof Error
        ? startMutation.error.message
        : 'Failed to start interview. Please try again.';

    return (
      <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Unable to Start Interview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <p className="text-muted-foreground text-sm">
              {errorMessage.includes('must be in ACCEPTED status')
                ? 'Please make sure you have accepted the interview invitation first.'
                : 'Please contact support if this problem persists.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <CardTitle className="text-xl">Starting Your Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <div className="text-muted-foreground space-y-1 text-center text-sm">
              <p>Setting up your assessment environment...</p>
              <p className="text-xs">This will only take a moment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
