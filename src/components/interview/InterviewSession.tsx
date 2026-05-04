'use client';

import { EnhancedLiveKitInterview } from './EnhancedLiveKitInterview';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface InterviewSessionProps {
  assessmentId: string;
  videoRecordingEnabled: boolean;
  proctoringEnabled: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export function InterviewSession({
  assessmentId,
  videoRecordingEnabled,
  proctoringEnabled,
  onConnectionChange,
}: InterviewSessionProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full">
          <EnhancedLiveKitInterview
            assessmentId={assessmentId}
            assessmentType="ONBOARDING"
            videoRecordingEnabled={videoRecordingEnabled}
            proctoringEnabled={proctoringEnabled}
            onConnectionChange={onConnectionChange}
            onError={(error) => {
              logger.error('LiveKit error:', error);
              toast.error('Connection error. Please try again.');
            }}
            onRecordingStart={() => {
              logger.info('Video recording started');
              toast.success('Recording started');
            }}
            onRecordingStop={() => {
              logger.info('Video recording stopped');
            }}
          />
        </div>
      </div>
    </div>
  );
}
