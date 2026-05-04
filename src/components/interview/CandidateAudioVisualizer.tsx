'use client';

import {
  BarVisualizer,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { cn } from '@/lib/utils';

interface CandidateAudioVisualizerProps {
  className?: string;
}

export function CandidateAudioVisualizer({
  className,
}: CandidateAudioVisualizerProps) {
  const { localParticipant } = useLocalParticipant();

  // Get the local audio track
  const tracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const audioTrack = tracks.find(
    (track) =>
      track.participant.identity === localParticipant.identity &&
      track.source === Track.Source.Microphone
  );

  if (!audioTrack) {
    return (
      <div
        className={cn('flex h-8 items-center justify-center gap-1', className)}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-muted-foreground/20 h-2 w-1 rounded-full"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <BarVisualizer
        barCount={8}
        trackRef={audioTrack}
        options={{ minHeight: 4, maxHeight: 32 }}
        className="flex h-8 w-20 items-center justify-center gap-0.5"
      >
        <span
          className={cn(
            'min-h-1 w-1 rounded-full bg-green-500 transition-all duration-150',
            'data-[lk-highlighted=true]:bg-green-400',
            'data-[lk-muted=true]:bg-muted-foreground/30'
          )}
        />
      </BarVisualizer>
    </div>
  );
}
