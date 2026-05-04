'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ConvexUserType } from '@/lib/services/chat-service/chat.service';
import { AnimatePresence, motion } from 'framer-motion';

interface TypingUser {
  userId: string;
  userType: ConvexUserType;
  displayName?: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
  position?: 'inline' | 'floating';
}

export function TypingIndicator({
  typingUsers,
  className,
  position = 'inline',
}: TypingIndicatorProps) {
  // Track if we should show the indicator
  const [showIndicator, setShowIndicator] = useState(false);
  // Track the last time we had typing users
  const lastTypingTimestampRef = useRef<number>(0);
  // Track the timeout for hiding the indicator
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastTypingUsers, setLastTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    const now = Date.now();

    if (typingUsers.length > 0) {
      setLastTypingUsers(typingUsers);
      lastTypingTimestampRef.current = now;
      setShowIndicator(true);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    } else if (now - lastTypingTimestampRef.current < 5000) {
      // Reduced from 8000ms to 5000ms for better UX
      if (!hideTimeoutRef.current) {
        hideTimeoutRef.current = setTimeout(
          () => {
            const timeSinceLast = Date.now() - lastTypingTimestampRef.current;
            if (timeSinceLast >= 5000) {
              setShowIndicator(false);
              // Keep the users in state for a smooth transition
              setTimeout(() => {
                setLastTypingUsers([]);
              }, 300); // Clear after animation completes
            }
            hideTimeoutRef.current = null;
          },
          5000 - (now - lastTypingTimestampRef.current)
        );
      }
    } else {
      setShowIndicator(false);
      setTimeout(() => {
        setLastTypingUsers([]);
      }, 300); // Clear after animation completes
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [typingUsers]);

  // Don't render anything if there are no typing users and the indicator shouldn't be shown
  if ((typingUsers.length === 0 && !showIndicator) || !showIndicator) {
    return null;
  }

  // If we're showing the indicator but don't have typing users anymore,
  // use the last known typing users (stored in state)
  const usersToDisplay = lastTypingUsers;

  // Don't show anything if we don't have users to display
  if (usersToDisplay.length === 0) return null;

  const getSenderInitials = (userId: string): string => {
    return userId.slice(0, 2).toUpperCase();
  };

  const getSenderDisplayName = (user: TypingUser): string => {
    if (user.displayName) return user.displayName;
    return `${user.userType.charAt(0).toUpperCase()}${user.userType.slice(1)}`;
  };

  const getTypingText = () => {
    if (usersToDisplay.length === 1) {
      return `${getSenderDisplayName(usersToDisplay[0])} is typing...`;
    } else if (usersToDisplay.length === 2) {
      return `${getSenderDisplayName(usersToDisplay[0])} and ${getSenderDisplayName(usersToDisplay[1])} are typing...`;
    } else {
      return `${getSenderDisplayName(usersToDisplay[0])} and ${usersToDisplay.length - 1} others are typing...`;
    }
  };

  const containerClasses = cn(
    'flex items-center gap-3 py-2',
    position === 'floating' && 'absolute bottom-2 left-4 right-4 z-10',
    className
  );

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          className={containerClasses}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Show first typing user's avatar */}
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {getSenderInitials(usersToDisplay[0].userId)}
            </AvatarFallback>
          </Avatar>

          {/* Typing indicator */}
          <div className="bg-muted flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm">
            <span className="text-muted-foreground text-sm">
              {getTypingText()}
            </span>

            {/* Animated dots */}
            <div className="flex space-x-1">
              <motion.div
                className="bg-muted-foreground h-1.5 w-1.5 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              />
              <motion.div
                className="bg-muted-foreground h-1.5 w-1.5 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.div
                className="bg-muted-foreground h-1.5 w-1.5 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
