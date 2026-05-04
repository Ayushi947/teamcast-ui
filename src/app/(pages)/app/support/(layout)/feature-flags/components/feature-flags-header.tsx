'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon, GitCompare, Layers } from 'lucide-react';

interface FeatureFlagsHeaderProps {
  onCreateClick?: () => void;
  onDiffClick?: () => void;
  onPresetsClick?: () => void;
}

export function FeatureFlagsHeader({
  onCreateClick,
  onDiffClick,
  onPresetsClick,
}: FeatureFlagsHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          Feature Flags Management
        </h1>
        <p className="text-muted-foreground">
          Enable or disable features dynamically across the platform
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onDiffClick && (
          <Button
            type="button"
            variant="outline"
            size="default"
            className="rounded-md"
            onClick={onDiffClick}
          >
            <GitCompare className="mr-2 h-3.5 w-3.5" />
            Diff view
          </Button>
        )}
        {onPresetsClick && (
          <Button
            type="button"
            variant="outline"
            size="default"
            className="rounded-md"
            onClick={onPresetsClick}
          >
            <Layers className="mr-2 h-3.5 w-3.5" />
            Templates / presets
          </Button>
        )}
        {onCreateClick && (
          <Button onClick={onCreateClick} size="default" className="rounded-md">
            <PlusIcon className="mr-2 h-3.5 w-3.5" />
            Create Feature Flag
          </Button>
        )}
      </div>
    </div>
  );
}
