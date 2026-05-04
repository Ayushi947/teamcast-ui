'use client';

import React from 'react';
import { PlayCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTourContext } from '@/lib/context/tour-context';

interface TourStartButtonProps {
  onStart: () => void;
  onSkip: () => void;
  isVisible: boolean;
}

export const TourStartButton: React.FC<TourStartButtonProps> = ({
  onStart,
  onSkip,
  isVisible,
}) => {
  const { dialogState } = useTourContext();
  const isDialogOpen = dialogState.isOpen;
  if (!isVisible) return null;

  return (
    <div
      className={`fixed right-0 z-50 ${isDialogOpen ? 'top-16' : 'bottom-4'}`}
    >
      <div className="group bg-primary flex h-12 w-48 items-center justify-center overflow-hidden rounded-l-lg border-y border-l border-gray-200 text-white shadow-lg dark:border-gray-700 dark:hover:bg-gray-900">
        <Button
          variant="ghost"
          size="sm"
          className="flex h-full w-full flex-1 cursor-pointer items-center justify-center gap-2 p-0 text-white hover:bg-transparent"
          onClick={onStart}
          tooltip="Start Tour"
          aria-label="Start Tour"
        >
          <PlayCircle className="h-5 w-5 flex-shrink-0 text-white" />
          <span className="text-sm font-medium whitespace-nowrap text-white">
            Take Tour
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 cursor-pointer p-0 text-white transition-all duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          tooltip="Skip Tour"
          aria-label="Skip Tour"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
