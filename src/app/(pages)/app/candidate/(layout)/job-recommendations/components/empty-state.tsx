'use client';

import React from 'react';
import {
  Search,
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Zap,
  Shield,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface EmptyStateProps {
  /** When provided, "Browse Jobs" will switch to All Jobs tab instead of navigating */
  onBrowseJobs?: () => void;
}

const EmptyState = ({ onBrowseJobs }: EmptyStateProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleRefreshRecommendations = () => {
    // Invalidate all job recommendations queries to trigger a fresh fetch
    queryClient.invalidateQueries({
      queryKey: ['jobRecommendations'],
    });
  };

  const handleUpdateProfile = () => {
    // Navigate to candidate profile page
    router.push('/app/candidate/user/profile');
  };

  const handleViewAllJobs = () => {
    if (onBrowseJobs) {
      onBrowseJobs();
    } else {
      router.push('/app/candidate/job-recommendations');
    }
  };

  const handleTakeAssessment = () => {
    // Navigate to dashboard where assessment options are available
    router.push('/app/candidate/dashboard');
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center space-y-4 px-4 py-6">
      {/* Main Empty State - More Compact */}
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="bg-primary/10 border-primary/20 flex h-16 w-16 items-center justify-center rounded-full border shadow-lg">
            <Search className="text-primary h-8 w-8" />
          </div>
          <div className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full shadow-lg">
            <Target className="text-primary-foreground h-2.5 w-2.5" />
          </div>
        </div>

        <h2 className="text-foreground mb-2 text-xl font-bold">
          Your Perfect Match Awaits!
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Our AI is curating personalized recommendations. Boost your chances!
        </p>
      </div>

      {/* Compact Action Cards Grid */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-2.5 md:grid-cols-3">
        <Card className="group border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-3 text-center">
            <div className="mb-2 flex justify-center">
              <div className="bg-primary/10 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300">
                <Target className="text-primary h-4 w-4" />
              </div>
            </div>
            <h3 className="text-foreground mb-1.5 text-sm font-semibold">
              Complete Profile
            </h3>
            <p className="text-muted-foreground mb-2.5 text-xs">
              5x more matches
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateProfile}
              className="group-hover:bg-primary group-hover:text-primary-foreground h-7 w-full text-xs transition-colors duration-300"
            >
              Update
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="group border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-3 text-center">
            <div className="mb-2 flex justify-center">
              <div className="bg-primary/10 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300">
                <TrendingUp className="text-primary h-4 w-4" />
              </div>
            </div>
            <h3 className="text-foreground mb-1.5 text-sm font-semibold">
              AI Assessment
            </h3>
            <p className="text-muted-foreground mb-2.5 text-xs">
              Showcase skills
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTakeAssessment}
              className="group-hover:bg-primary group-hover:text-primary-foreground h-7 w-full text-xs transition-colors duration-300"
            >
              Start
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="group border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-3 text-center">
            <div className="mb-2 flex justify-center">
              <div className="bg-primary/10 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300">
                <Users className="text-primary h-4 w-4" />
              </div>
            </div>
            <h3 className="text-foreground mb-1.5 text-sm font-semibold">
              Browse Jobs
            </h3>
            <p className="text-muted-foreground mb-2.5 text-xs">
              50K+ opportunities
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAllJobs}
              className="group-hover:bg-primary group-hover:text-primary-foreground h-7 w-full text-xs transition-colors duration-300"
            >
              Explore
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Brand Advertisement Section - More Compact */}
      <div className="w-full max-w-3xl">
        <div className="bg-primary/5 border-primary/10 rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-center">
            <div className="bg-primary/10 flex items-center gap-1.5 rounded-full px-2.5 py-1">
              <Brain className="text-primary h-3.5 w-3.5" />
              <span className="text-primary text-xs font-semibold">
                Why Choose Teamcast AI?
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-center md:grid-cols-3">
            <div className="flex flex-col items-center space-y-1">
              <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                <Zap className="text-primary h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-foreground text-xs font-medium">
                  Lightning Fast
                </h4>
                <p className="text-muted-foreground text-xs">
                  Matches in seconds
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-1">
              <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                <Shield className="text-primary h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-foreground text-xs font-medium">
                  Privacy First
                </h4>
                <p className="text-muted-foreground text-xs">Data secured</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-1">
              <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                <Brain className="text-primary h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-foreground text-xs font-medium">
                  Smart Matching
                </h4>
                <p className="text-muted-foreground text-xs">
                  AI learns preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Section */}
      <div className="flex items-center justify-center gap-6 text-center">
        <div className="space-y-0.5">
          <div className="text-primary text-lg font-bold">97%</div>
          <div className="text-muted-foreground text-xs">Match Rate</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-primary text-lg font-bold">50K+</div>
          <div className="text-muted-foreground text-xs">Active Jobs</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-primary text-lg font-bold">3x</div>
          <div className="text-muted-foreground text-xs">Faster Hiring</div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={handleRefreshRecommendations}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Check New Recommendations
        </Button>

        {/* Compact Branding */}
        <div className="bg-primary/5 border-primary/10 flex items-center gap-1.5 rounded-full border px-3 py-1">
          <BookOpen className="text-primary h-3 w-3" />
          <span className="text-primary text-xs font-medium">
            Powered by Teamcast AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
