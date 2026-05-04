import React from 'react';
import { Share2, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ICandidateProfile, logger } from '@/lib/shared';
import { toast } from 'sonner';
import { generatePublicProfileUrl } from '@/lib/utils/data-masking';

interface PublicProfileHeaderProps {
  profile: ICandidateProfile;
}

export const PublicProfileHeader = ({ profile }: PublicProfileHeaderProps) => {
  const handleShare = async () => {
    const url = generatePublicProfileUrl(profile.candidateId);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Professional Profile`,
          text: `Check out ${profile.name}'s professional profile`,
          url: url,
        });
      } catch (err) {
        logger.error('Error sharing profile:', err);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied!', {
          description: 'You can now share this professional profile.',
        });
      } catch (err) {
        logger.error('Error copying profile link:', err);
        toast.error('Failed to copy link', {
          description: 'Please try selecting and copying the URL manually.',
        });
      }
    }
  };

  return (
    <div className="border-border from-card via-card to-muted/20 dark:from-card dark:via-card dark:to-muted/10 relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-lg backdrop-blur-sm sm:p-6">
      {/* Background decoration */}
      <div className="bg-primary/5 dark:bg-primary/10 absolute -top-4 -right-4 h-24 w-24 rounded-full blur-xl" />
      <div className="bg-accent/5 dark:bg-accent/10 absolute -bottom-3 -left-3 h-20 w-20 rounded-full blur-lg" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary/10 dark:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
              <Sparkles className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-lg font-bold tracking-tight sm:text-2xl lg:text-3xl">
                {profile.name}&apos;s Profile
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                Discover exceptional talent and expertise
              </p>
            </div>
          </div>

          {/* Subtitle with enhanced styling */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs lg:text-sm">
            <div className="bg-primary/60 h-0.5 w-4 rounded-full sm:w-6" />
            <span className="font-medium">
              Powered by AI-driven talent matching
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="group bg-background/50 hover:bg-background relative overflow-hidden text-xs backdrop-blur-sm transition-all duration-200 hover:shadow-md sm:text-sm"
          >
            <Share2 className="mr-1 h-3 w-3 transition-transform group-hover:scale-110 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Share Profile</span>
            <span className="sm:hidden">Share</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            asChild
            className="group bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden text-xs shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:text-sm"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3 transition-transform group-hover:scale-110 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Powered by Teamcast</span>
              <span className="sm:hidden">Teamcast</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
