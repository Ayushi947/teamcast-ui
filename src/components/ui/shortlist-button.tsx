'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, BookmarkPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shortlistService, ShortlistCandidate } from '@/lib/models/shortlist';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ShortlistButtonProps {
  candidate: ShortlistCandidate;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
  onShortlistChange?: (isShortlisted: boolean) => void;
  disabled?: boolean;
}

export function ShortlistButton({
  candidate,
  variant = 'outline',
  size = 'default',
  showText = true,
  className,
  onShortlistChange,
  disabled = false,
}: ShortlistButtonProps) {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if candidate is shortlisted on mount and when candidate changes
  useEffect(() => {
    const checkShortlistStatus = () => {
      const shortlisted = shortlistService.isShortlisted(candidate.id);
      setIsShortlisted(shortlisted);
    };

    checkShortlistStatus();

    // Listen for storage changes to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamcast_shortlisted_candidates') {
        checkShortlistStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [candidate.id]);

  const handleToggleShortlist = async () => {
    if (disabled) return;

    setIsLoading(true);
    try {
      const success = await shortlistService.toggleShortlist(candidate);

      if (success) {
        const newStatus = !isShortlisted;
        setIsShortlisted(newStatus);

        // Notify parent component
        if (onShortlistChange) {
          onShortlistChange(newStatus);
        }
      }
    } catch (error) {
      logger.error('Error toggling shortlist:', error);
      toast.error('Failed to update shortlist');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Updating...';
    if (isShortlisted) return 'Shortlisted';
    return 'Shortlist';
  };

  const getButtonIcon = () => {
    if (isShortlisted) {
      return (
        <Heart
          className={cn('h-4 w-4 fill-current', size === 'sm' && 'h-3 w-3')}
        />
      );
    }
    return (
      <BookmarkPlus className={cn('h-4 w-4', size === 'sm' && 'h-3 w-3')} />
    );
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleShortlist}
      disabled={disabled || isLoading}
      className={cn(
        'transition-all duration-200',
        isShortlisted &&
          variant === 'outline' &&
          'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
        isShortlisted &&
          variant === 'ghost' &&
          'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
        className
      )}
    >
      {getButtonIcon()}
      {showText && size !== 'icon' && (
        <span className={cn('ml-1', size === 'sm' && 'text-xs')}>
          {getButtonText()}
        </span>
      )}
    </Button>
  );
}

// Hook for managing shortlist state
export function useShortlist(candidateId: string) {
  const [isShortlisted, setIsShortlisted] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setIsShortlisted(shortlistService.isShortlisted(candidateId));
    };

    checkStatus();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamcast_shortlisted_candidates') {
        checkStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [candidateId]);

  return {
    isShortlisted,
    toggleShortlist: async (candidate: ShortlistCandidate) => {
      const success = await shortlistService.toggleShortlist(candidate);
      if (success) {
        setIsShortlisted(!isShortlisted);
      }
      return success;
    },
  };
}
