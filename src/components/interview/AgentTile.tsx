'use client';

import {
  type AgentState,
  BarVisualizer,
  type TrackReference,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';

interface AgentAudioTileProps {
  state: AgentState;
  audioTrack: TrackReference | undefined;
  className?: string;
}

export const AgentTile = ({
  state,
  audioTrack,
  className,
}: AgentAudioTileProps) => {
  if (!audioTrack) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <BarVisualizer
        barCount={5}
        state={state}
        options={{ minHeight: 20 }}
        trackRef={audioTrack}
        className={cn(
          'flex aspect-video w-40 items-center justify-center gap-1'
        )}
      >
        <span
          className={cn([
            'bg-primary/30 min-h-8 w-4 rounded-full',
            'origin-center transition-colors duration-250 ease-linear',
            'data-[lk-highlighted=true]:bg-primary data-[lk-muted=true]:bg-primary/20',
          ])}
        />
      </BarVisualizer>
    </div>
  );
};
