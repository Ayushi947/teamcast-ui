'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mcpInterviewPublicService } from '@/lib/services/services';
import { McpInterviewStatusEnum } from '@/lib/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Loader2,
  MapPin,
  Clock,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface InterviewAcceptClientPageProps {
  interviewId: string;
}

function TeamcastNavbar() {
  return (
    <nav className="px-4 py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          href="/"
          className="group focus-visible:ring-ring flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Go to Teamcast home"
        >
          <div className="bg-primary/10 ring-border/60 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1">
            <Image
              src="/logos/teamcast-t-logo.svg"
              alt="Teamcast"
              width={22}
              height={22}
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Teamcast.ai
          </span>
        </Link>

        <ThemeToggle />
      </div>
    </nav>
  );
}

function AssessmentStyleFooterHelp() {
  return (
    <div className="text-text-tertiary fixed right-0 bottom-2 left-0 z-40 px-4 text-center text-xs sm:text-sm">
      Need help? email{' '}
      <a href="mailto:help@teamcast.ai" className="text-info hover:underline">
        help@teamcast.ai
      </a>
    </div>
  );
}

function InterviewAcceptShell({
  children,
  centerContent,
}: {
  children: React.ReactNode;
  centerContent?: boolean;
}) {
  return (
    <div className="bg-muted/30 min-h-screen">
      <TeamcastNavbar />

      <main className="flex flex-1 items-center px-4 pb-16">
        <div className="mx-auto w-full max-w-7xl">
          <div
            className={
              centerContent
                ? 'flex min-h-[60vh] items-center justify-center'
                : 'py-6'
            }
          >
            {children}
          </div>
        </div>
      </main>

      <AssessmentStyleFooterHelp />
    </div>
  );
}

export function InterviewAcceptClientPage({
  interviewId,
}: InterviewAcceptClientPageProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Fetch interview landing data
  const {
    data: landingData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['interview-landing', interviewId],
    queryFn: () => mcpInterviewPublicService.getInterviewLanding(interviewId),
  });

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (landingData?.isNewCandidate) {
        return mcpInterviewPublicService.acceptInterview(interviewId, {
          password,
          acceptTerms,
        });
      }
      return mcpInterviewPublicService.acceptInterview(interviewId, {});
    },
    onSuccess: (response) => {
      if (response?.redirectUrl) {
        router.push(response.redirectUrl);
      }
    },
  });

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: () =>
      mcpInterviewPublicService.declineInterview(interviewId, {
        reason: declineReason || undefined,
      }),
    onSuccess: () => {
      setShowDeclineDialog(false);
    },
  });

  // Validate password
  useEffect(() => {
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
      } else if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  // Check if can accept
  const canAccept = landingData?.isNewCandidate
    ? password.length >= 8 && password === confirmPassword && acceptTerms
    : true;

  const durationMinutes =
    landingData?.expectedDurationMinutes ?? landingData?.estimatedDuration ?? 0;
  const sectionsCount =
    landingData?.maxSections ?? landingData?.skillsCount ?? 0;

  if (isLoading) {
    return (
      <InterviewAcceptShell centerContent>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading interview details...</p>
        </div>
      </InterviewAcceptShell>
    );
  }

  if (error || !landingData) {
    return (
      <InterviewAcceptShell centerContent>
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Interview Not Found</CardTitle>
            </div>
            <CardDescription>
              This interview invitation could not be found or may have been
              removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </InterviewAcceptShell>
    );
  }

  // Show status-specific screens
  if (landingData.status !== McpInterviewStatusEnum.INVITED) {
    return (
      <InterviewAcceptShell centerContent>
        <Card className="w-full max-w-md">
          <CardHeader>
            {landingData.status === McpInterviewStatusEnum.ACCEPTED && (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <CardTitle>Interview Accepted</CardTitle>
                </div>
                <CardDescription>
                  You have already accepted this interview invitation.
                </CardDescription>
              </>
            )}
            {landingData.status === McpInterviewStatusEnum.DECLINED && (
              <>
                <div className="text-muted-foreground flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  <CardTitle>Interview Declined</CardTitle>
                </div>
                <CardDescription>
                  You have declined this interview invitation.
                </CardDescription>
              </>
            )}
            {landingData.isExpired && (
              <>
                <div className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <CardTitle>Interview Expired</CardTitle>
                </div>
                <CardDescription>
                  This interview invitation has expired.
                </CardDescription>
              </>
            )}
            {!['INVITED', 'ACCEPTED', 'DECLINED'].includes(
              landingData.status
            ) &&
              !landingData.isExpired && (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <CardTitle>Interview In Progress</CardTitle>
                  </div>
                  <CardDescription>
                    This interview is currently in progress or has been
                    completed.
                  </CardDescription>
                </>
              )}
          </CardHeader>
        </Card>
      </InterviewAcceptShell>
    );
  }

  // Show declined success screen
  if (declineMutation.isSuccess) {
    return (
      <InterviewAcceptShell centerContent>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <XCircle className="text-muted-foreground h-6 w-6" />
            </div>
            <CardTitle>Interview Declined</CardTitle>
            <CardDescription>
              Thank you for letting us know. We wish you the best in your career
              journey.
            </CardDescription>
          </CardHeader>
        </Card>
      </InterviewAcceptShell>
    );
  }

  return (
    <InterviewAcceptShell>
      {/* Split Layout */}
      <div className="grid justify-center gap-8 lg:grid-cols-2">
        {/* Left Column - Job Details */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div>
            <Badge variant="secondary" className="mb-4 tracking-wide uppercase">
              Invitation Received
            </Badge>
            <h1 className="mb-3 text-3xl font-bold tracking-tight lg:text-4xl">
              Join {landingData.companyName || 'our team'} as a{' '}
              <span className="text-primary">
                {landingData.jobTitle || 'Technical Interview'}
              </span>
            </h1>
            {landingData.jobDescription && (
              <p className="text-muted-foreground leading-relaxed">
                {landingData.jobDescription}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-primary mb-1 flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
                <Clock className="h-4 w-4" />
                Duration
              </div>
              <div className="text-lg font-semibold">
                {durationMinutes} Minutes
              </div>
            </div>
            <div>
              <div className="text-primary mb-1 flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
                <Clock className="h-4 w-4" />
                Sections
              </div>
              <div className="text-lg font-semibold">{sectionsCount}</div>
            </div>
            <div>
              <div className="text-primary mb-1 flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
                <Building2 className="h-4 w-4" />
                Format
              </div>
              <div className="text-lg font-semibold">Technical Questions</div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-primary/5 rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold">What to expect</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Real-world {landingData.jobTitle || 'technical'} challenges
                  and system design questions.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Browser-based IDE environment, no local setup required.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  The assessment begins as soon as you create your account.
                </span>
              </li>
            </ul>
          </div>

          {/* Additional Info */}
          {landingData.jobLocation && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{landingData.jobLocation}</span>
            </div>
          )}
        </div>

        {/* Right Column - Registration Form */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {landingData.isNewCandidate
                  ? 'Create Your Account'
                  : 'Start Interview'}
              </CardTitle>
              <CardDescription>
                {landingData.isNewCandidate
                  ? 'Enter your details to start the interview session.'
                  : 'Click the button below to begin your interview.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {landingData.isNewCandidate && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={landingData.candidateName}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={landingData.candidateEmail}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  {passwordError && (
                    <p className="text-destructive text-sm">{passwordError}</p>
                  )}
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) =>
                        setAcceptTerms(checked as boolean)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-muted-foreground text-sm leading-relaxed font-normal"
                    >
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="text-primary hover:underline"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </Label>
                  </div>
                </>
              )}

              {/* Error Alert */}
              {acceptMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {acceptMutation.error instanceof Error
                      ? acceptMutation.error.message
                      : 'Failed to accept interview. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => acceptMutation.mutate()}
                  disabled={!canAccept || acceptMutation.isPending}
                  className="w-full py-6 text-base"
                  size="lg"
                >
                  {acceptMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {landingData.isNewCandidate
                    ? 'Create Account & Continue'
                    : 'Accept & Start Interview'}
                </Button>
                <div className="text-center">
                  <button
                    onClick={() => setShowDeclineDialog(true)}
                    disabled={acceptMutation.isPending}
                    className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    No longer interested? Decline
                  </button>
                </div>
              </div>

              {/* Deadline Info */}
              <div className="bg-muted/50 mt-4 rounded-lg p-4 text-center">
                <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Complete by{' '}
                    <span className="font-medium">
                      {format(new Date(landingData.expiresAt), 'MMMM dd, yyyy')}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this interview invitation?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="declineReason">Reason (optional)</Label>
              <Textarea
                id="declineReason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Let us know why you're declining..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
              disabled={declineMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
            >
              {declineMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Decline Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </InterviewAcceptShell>
  );
}
