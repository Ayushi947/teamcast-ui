'use client';

import React from 'react';
import { PlayCircle, X } from 'lucide-react';
import { useTourContext } from '@/lib/context/tour-context';

interface TourResumeButtonProps {
  onResume: () => void;
  onSkip: () => void;
  isVisible: boolean;
}

export const TourResumeButton: React.FC<TourResumeButtonProps> = ({
  onResume,
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
      <div className="group border-primary bg-primary flex h-12 w-48 items-center rounded-l-lg border border-r-0 text-white shadow-lg">
        {/* Resume Button */}
        <button
          className="focus:ring-opacity-50 hover:bg-primary focus:ring-primary flex h-full flex-1 items-center justify-center rounded-l-lg px-3 transition-colors duration-200 focus:ring-2 focus:outline-none"
          onClick={onResume}
          aria-label="Resume Tour"
        >
          <PlayCircle className="h-5 w-5 flex-shrink-0" />
          <span className="ml-2 text-sm font-medium whitespace-nowrap">
            Take Tour
          </span>
        </button>

        {/* Close Button */}
        <button
          className="focus:ring-opacity-50 border-primary hover:bg-primary focus:ring-primary flex h-12 w-12 items-center justify-center border-l transition-colors duration-200 focus:ring-2 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          title="End Tour"
          aria-label="End Tour"
        >
          <X className="h-4 w-4 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};
