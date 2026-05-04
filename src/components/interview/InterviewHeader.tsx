'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';

interface InterviewHeaderProps {
  onBack: () => void;
  isConnected: boolean;
  disabled?: boolean;
}

export function InterviewHeader({
  onBack,
  isConnected,
  disabled = false,
}: InterviewHeaderProps) {
  return (
    <div className="bg-card flex-shrink-0 border-b shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="bg-border h-6 w-px" />
          <div>
            <h1 className="text-foreground text-xl font-semibold">
              AI Interview
            </h1>
            <p className="text-muted-foreground text-sm">
              Onboarding Assessment
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  Connecting...
                </span>
              </>
            )}
          </div>

          {isConnected && (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-muted-foreground text-xs">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
