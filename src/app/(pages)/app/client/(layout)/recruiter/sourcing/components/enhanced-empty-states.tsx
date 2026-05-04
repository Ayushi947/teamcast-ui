'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Users,
  FileText,
  RefreshCw,
  Zap,
  Target,
  Send,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Handshake,
} from 'lucide-react';

interface EmptyStateProps {
  onAction?: () => void;
  actionLabel?: string;
  isLoading?: boolean;
  className?: string;
}

interface RecommendationsEmptyStateProps extends EmptyStateProps {
  variant?:
    | 'no-recommendations'
    | 'loading'
    | 'ai-processing'
    | 'visibility-expired'
    | 'not-selected';
}

interface ApplicationsEmptyStateProps extends EmptyStateProps {
  variant?: 'no-applications' | 'loading' | 'filtered';
  statusFilter?: string;
}

// Pulsing Dots Animation
const PulsingDots = () => (
  <div className="flex space-x-1">
    <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
    <div className="bg-primary h-2 w-2 animate-pulse rounded-full delay-75"></div>
    <div className="bg-primary h-2 w-2 animate-pulse rounded-full delay-150"></div>
  </div>
);

// Recommendations Empty States
export const RecommendationsEmptyState = ({
  variant = 'no-recommendations',
  onAction,
  actionLabel = 'Refresh Recommendations',
  isLoading = false,
  className = '',
}: RecommendationsEmptyStateProps) => {
  if (variant === 'loading' || (variant === 'ai-processing' && isLoading)) {
    return (
      <div
        className={`flex min-h-[400px] items-center justify-center ${className}`}
      >
        <div className="max-w-md space-y-6 text-center">
          <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
            <div className="border-primary/20 border-t-primary absolute inset-0 animate-spin rounded-full border-4"></div>
            <div className="border-primary/10 animate-reverse border-b-primary/60 absolute inset-4 animate-spin rounded-full border-4"></div>
            <Zap className="text-primary h-12 w-12 animate-pulse" />
          </div>

          <div className="space-y-3">
            <h3 className="text-foreground text-xl font-semibold">
              AI is Finding Your Perfect Matches
            </h3>
            <p className="text-muted-foreground">
              Our intelligent system is analyzing thousands of profiles to find
              candidates that perfectly match your requirements
            </p>
            <PulsingDots />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'visibility-expired') {
    return (
      <div
        className={`flex min-h-[400px] items-center justify-center ${className}`}
      >
        <Card className="max-w-2xl border-none bg-transparent shadow-none hover:shadow-none">
          <div className="space-y-8 text-center">
            {/* Centered Icon */}
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
              <div className="from-primary/10 to-primary/5 absolute inset-0 rounded-full bg-gradient-to-r"></div>
              <AlertCircle className="text-primary h-16 w-16" />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                  Candidate Details View Quota Expired
                </h2>
                <p className="text-muted-foreground text-lg">
                  Your candidate details view quota has expired. Upgrade your
                  plan to continue viewing candidate details.
                </p>
              </div>

              <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Candidate visibility temporarily unavailable</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-4">
                <Button
                  onClick={onAction}
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  {actionLabel}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (variant === 'not-selected') {
    return (
      <div
        className={`flex min-h-[400px] items-center justify-center ${className}`}
      >
        <Card className="from-card to-muted/50 max-w-2xl border-none bg-transparent shadow-none hover:shadow-none">
          <div className="space-y-8 text-center">
            {/* Animated Illustration */}
            <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
              <div className="from-primary/10 to-primary/5 absolute inset-0 rounded-full bg-gradient-to-r"></div>
              <Handshake className="text-primary h-20 w-20" />
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                  No Hires Yet
                </h2>
                <p className="text-muted-foreground text-lg">
                  Once you hire a candidate, their details will appear here
                </p>
              </div>

              <div className="bg-muted/50 flex flex-col items-center justify-center space-y-3 rounded-lg p-4">
                <h4 className="text-foreground flex items-center gap-2 font-medium">
                  <Lightbulb className="text-primary h-4 w-4" />
                  How to get started?
                </h4>
                <ul className="text-muted-foreground flex flex-col items-center justify-center space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    Review shortlisted candidates from Recommendations
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    Conduct interviews and assessments
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                    Mark your selected candidate as{' '}
                    <span className="font-medium">Hired</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[400px] items-center justify-center ${className}`}
    >
      <Card className="from-card to-muted/50 max-w-2xl border-none bg-transparent shadow-none hover:shadow-none">
        <div className="space-y-8 text-center">
          {/* Animated Illustration */}
          <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
            <div className="from-primary/10 to-primary/5 absolute inset-0 rounded-full bg-gradient-to-r"></div>
            <Users className="text-primary h-20 w-20" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                No Recommendations Yet
              </h2>
              <p className="text-muted-foreground text-lg">
                Our AI is searching for your perfect candidates
              </p>
            </div>

            <div className="bg-muted/50 flex flex-col items-center justify-center space-y-3 rounded-lg p-4">
              <h4 className="text-foreground flex items-center gap-2 font-medium">
                <Lightbulb className="text-primary h-4 w-4" />
                What happens next?
              </h4>
              <ul className="text-muted-foreground flex flex-col items-center justify-center space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  AI analyzes your job requirements and preferences
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                  Matches candidates based on skills, experience, and fit
                </li>
                <li className="flex items-start gap-2">
                  <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  Delivers personalized recommendations ranked by relevance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Applications Empty States
export const ApplicationsEmptyState = ({
  variant = 'no-applications',
  statusFilter,
  onAction,
  actionLabel = 'Invite Candidates',
  className = '',
}: ApplicationsEmptyStateProps) => {
  const getEmptyStateContent = () => {
    switch (variant) {
      case 'filtered':
        return {
          icon: Target,
          title: `No ${statusFilter} Applications`,
          description: `No applications match the selected "${statusFilter}" status filter.`,
          suggestion:
            'Try selecting a different status filter or check back later.',
        };

      case 'loading':
        return {
          icon: RefreshCw,
          title: 'Loading Applications',
          description: 'Fetching the latest application data...',
          suggestion: null,
        };

      default:
        return {
          icon: FileText,
          title: 'No Applications Yet',
          description:
            'Your job posting is live and ready to receive applications.',
          suggestion:
            'Start by inviting recommended candidates or sharing your job posting.',
        };
    }
  };

  const content = getEmptyStateContent();
  const IconComponent = content.icon;

  return (
    <div
      className={`flex min-h-[400px] items-center justify-center ${className}`}
    >
      <Card className="from-card to-muted/50 max-w-2xl border-none bg-transparent shadow-none hover:shadow-none">
        <div className="space-y-8 text-center">
          {/* Animated Illustration */}
          <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
            <div className="from-primary/10 to-primary/5 absolute inset-0 rounded-full bg-gradient-to-r"></div>
            <IconComponent className="text-primary h-20 w-20" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                {content.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {content.description}
              </p>
            </div>

            {variant === 'no-applications' && (
              <div className="bg-muted/50 flex flex-col items-center justify-center space-y-3 rounded-lg p-4">
                <h4 className="text-foreground flex items-center gap-2 font-medium">
                  <Lightbulb className="text-primary h-4 w-4" />
                  Quick actions to get started
                </h4>
                <ul className="text-muted-foreground flex flex-col items-center justify-center space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Send className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    Send invitations to recommended candidates
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    Share your job posting on social media
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                    Review and refine your job requirements
                  </li>
                </ul>
              </div>
            )}

            {content.suggestion && (
              <p className="text-muted-foreground bg-muted/30 rounded-lg p-3 text-sm">
                {content.suggestion}
              </p>
            )}

            {variant !== 'loading' && (
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  onClick={onAction}
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Send className="h-4 w-4" />
                  {actionLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Generic Loading State
export const LoadingState = ({
  message = 'Loading...',
  className = '',
}: {
  message?: string;
  className?: string;
}) => (
  <div
    className={`flex min-h-[400px] items-center justify-center ${className}`}
  >
    <div className="space-y-4 text-center">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <div className="border-primary/20 border-t-primary absolute inset-0 animate-spin rounded-full border-4"></div>
        <RefreshCw className="text-primary h-8 w-8 animate-spin" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);
