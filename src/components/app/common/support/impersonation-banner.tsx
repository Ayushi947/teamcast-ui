'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  X,
  LogOut,
  GripVertical,
  Clock,
  Shield,
  Timer,
  Info,
  User,
} from 'lucide-react';
import { useImpersonation } from '@/lib/utils/impersonation.utils';
import { useApp } from '@/lib/context/app-context';
import { formatEnumValue } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ImpersonationBanner() {
  const { stopImpersonation, isImpersonating, getImpersonationData } =
    useImpersonation();
  const { user } = useApp();
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [originalPosition, setOriginalPosition] = useState({ x: 20, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Check if currently impersonating using the new logic
  const [impersonating, setImpersonating] = useState(false);
  const [impersonationData, setImpersonationData] = useState<any>(null);

  useEffect(() => {
    // Check impersonation status on mount and when user changes
    const checkImpersonationStatus = () => {
      const isImp = isImpersonating();
      const data = getImpersonationData();
      setImpersonating(isImp);
      setImpersonationData(data);

      // Calculate session duration
      if (data?.startedAt) {
        const startTime = new Date(data.startedAt).getTime();
        const now = Date.now();
        setSessionDuration(Math.floor((now - startTime) / 1000));
      }
    };

    checkImpersonationStatus();

    // Listen for storage changes (in case impersonation state changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'is_impersonating' || e.key === 'impersonation_data') {
        checkImpersonationStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Update session duration every second
  useEffect(() => {
    if (!impersonating) return;

    const interval = setInterval(() => {
      if (impersonationData?.startedAt) {
        const startTime = new Date(impersonationData.startedAt).getTime();
        const now = Date.now();
        setSessionDuration(Math.floor((now - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [impersonating, impersonationData]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragStartPosition({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    // Check if we've moved enough to consider it a drag
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPosition.x, 2) +
        Math.pow(e.clientY - dragStartPosition.y, 2)
    );

    if (dragDistance > 5) {
      // 5px threshold
      setHasDragged(true);
    }

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - (isExpanded ? 320 : 48);
    const maxY = window.innerHeight - (isExpanded ? 400 : 48); // Increased for expanded height

    setPosition({
      x: Math.max(10, Math.min(newX, maxX)),
      y: Math.max(10, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset hasDragged after a short delay to allow for click detection
    setTimeout(() => {
      setHasDragged(false);
    }, 100);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, isExpanded]);

  const handleEndImpersonation = async () => {
    if (!impersonating) return;

    setIsEndingSession(true);
    try {
      await stopImpersonation();
    } catch (_error) {
      toast.error('Failed to end impersonation');
    } finally {
      setIsEndingSession(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `00:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Auto-collapse after inactivity
  useEffect(() => {
    if (!isExpanded) return;

    const timer = setTimeout(() => {
      if (!isHovered && !isDragging) {
        setIsExpanded(false);
      }
    }, 30000); // Auto-collapse after 30 seconds of inactivity

    return () => clearTimeout(timer);
  }, [isExpanded, isHovered, isDragging]);

  if (!impersonating || !user) {
    return null;
  }

  return (
    <>
      {/* Background Overlay for Mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        ref={buttonRef}
        className="fixed z-50 select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Floating Action Button */}
        <div
          className={cn(
            'transition-all duration-200 ease-in-out',
            isExpanded
              ? 'max-w-[320px] min-w-[320px] rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900'
              : 'bg-primary flex h-12 w-12 items-center justify-center rounded-[50px] shadow-sm transition-all duration-200 hover:shadow-md'
          )}
          onMouseDown={!isExpanded ? handleMouseDown : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Collapsed State - Floating Button */}
          {!isExpanded && (
            <div
              className="relative flex h-full w-full cursor-pointer items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                // Only expand if we haven't dragged
                if (!hasDragged) {
                  // Save original position before adjusting
                  setOriginalPosition({ ...position });

                  // Adjust position before expanding to ensure it stays within screen bounds
                  const newPosition = { ...position };
                  const maxX = window.innerWidth - 320;
                  const maxY = window.innerHeight - 400; // Increased for expanded height

                  // Ensure it doesn't go beyond right edge
                  if (newPosition.x > maxX) {
                    newPosition.x = maxX;
                  }

                  // Ensure it doesn't go beyond bottom edge
                  if (newPosition.y > maxY) {
                    newPosition.y = maxY;
                  }

                  // Ensure it doesn't go beyond left edge
                  if (newPosition.x < 10) {
                    newPosition.x = 10;
                  }

                  // Ensure it doesn't go beyond top edge
                  if (newPosition.y < 10) {
                    newPosition.y = 10;
                  }

                  setPosition(newPosition);
                  setIsExpanded(true);
                }
              }}
            >
              <Avatar className="pointer-events-none h-full w-full shadow-sm">
                <AvatarImage
                  src={impersonationData?.supportUserImage || ''}
                  alt={impersonationData?.supportUserName || 'Support Admin'}
                  className="pointer-events-none object-cover"
                  draggable={false}
                />
                <AvatarFallback className="bg-primary/20 text-primary-foreground pointer-events-none text-sm font-semibold">
                  {impersonationData?.supportUserName
                    ?.charAt(0)
                    ?.toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Expanded State - Detailed Info */}
          {isExpanded && (
            <div className="w-full space-y-3">
              {/* Header with drag handle and status */}
              <div
                className="flex cursor-grab items-center justify-between active:cursor-grabbing"
                onMouseDown={handleMouseDown}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <GripVertical className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary rounded-lg p-2">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-semibold">
                        Impersonating {user.type.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    // Restore original position when collapsing
                    setPosition(originalPosition);
                  }}
                  className="hover:bg-muted/50 h-8 w-8 rounded-lg p-0"
                >
                  <X className="text-muted-foreground h-4 w-4" />
                </Button>
              </div>

              {/* User Profile Section */}
              <div className="space-y-2">
                <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-3">
                  <div className="relative">
                    <Avatar className="pointer-events-none h-12 w-12 border-2 border-neutral-200 shadow-sm dark:border-neutral-600">
                      <AvatarImage
                        src={impersonationData?.supportUserImage || ''}
                        alt={
                          impersonationData?.supportUserName || 'Support Admin'
                        }
                        className="pointer-events-none object-cover"
                        draggable={false}
                      />
                      <AvatarFallback className="bg-primary pointer-events-none font-semibold text-white">
                        {impersonationData?.supportUserName
                          ?.charAt(0)
                          ?.toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status Indicator */}
                    <div className="absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-red-500 p-1 dark:border-neutral-800">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="text-foreground truncate text-base font-semibold">
                      {impersonationData?.supportUserName || 'Support Admin'}
                    </h3>
                    <p className="text-muted-foreground truncate text-sm">
                      {impersonationData?.supportUserEmail || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Info Section */}
              <div className="space-y-2">
                {/* Impersonated User Info */}
                <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-3">
                  <div className="rounded-lg bg-orange-100 p-2 text-orange-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase">
                      Impersonating
                    </span>
                    <p className="text-foreground text-sm font-medium">
                      {user.name} ({user.email})
                    </p>
                  </div>
                </div>

                {/* Duration Display */}
                <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-lg p-2">
                      <Timer className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        Session Duration
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        Active Time
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="text-foreground font-mono text-sm font-semibold">
                      {formatDuration(sessionDuration)}
                    </span>
                  </div>
                </div>

                {/* Reason Display */}
                {impersonationData?.reason && (
                  <div className="bg-muted/50 flex items-start gap-3 rounded-lg border p-3">
                    <div className="bg-primary/10 text-primary mt-0.5 rounded-lg p-2">
                      <Info className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase">
                        Session Reason
                      </span>
                      <p className="text-foreground text-sm font-medium">
                        {formatEnumValue(impersonationData.reason)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Session Started Time */}
                {impersonationData?.startedAt && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <span className="text-muted-foreground text-xs">
                      Session started at{' '}
                      {new Date(
                        impersonationData.startedAt
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {/* Secondary Action - Minimize */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsExpanded(false);
                    // Restore original position when minimizing
                    setPosition(originalPosition);
                  }}
                  className="h-10 flex-1 rounded-lg border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Minimize
                </Button>

                {/* Primary Action - Sign Out */}
                <Button
                  onClick={handleEndImpersonation}
                  disabled={isEndingSession}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 flex-[2] rounded-lg"
                >
                  {isEndingSession ? (
                    <>
                      <div className="mr-2 animate-spin">
                        <X className="h-4 w-4" />
                      </div>
                      Ending...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
