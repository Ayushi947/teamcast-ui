'use client';

import { useApp } from '@/lib/context/app-context';
import { useHeartbeat } from '@/lib/hooks/convex-chat-hooks/convex-heartbeats';
import { initializeUserData } from '@/lib/hooks/convex-chat-hooks/convex-user-init-hooks';
import { IAuthUser } from '@/lib/shared';
import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

export function ConvexHeartbeatWrapper() {
  const { user, setConvexUserInitializationLoading } = useApp();
  const userId = user?.id;
  const initializationAttempted = useRef(false);

  useHeartbeat(userId);

  useEffect(() => {
    if (!userId || !user) {
      logger.warn('No user data available for initialization', {
        userId,
        hasUser: !!user,
      });
      return;
    }

    // Prevent multiple initialization attempts
    if (initializationAttempted.current) {
      logger.info('User initialization already attempted, skipping');
      return;
    }

    initializationAttempted.current = true;

    const initializeUser = async () => {
      try {
        logger.info('Starting user initialization');
        setConvexUserInitializationLoading(true);
        const success = await initializeUserData(user as IAuthUser);

        if (success) {
          logger.info('User initialization successful');
        } else {
          logger.error('User initialization failed');
          // Reset flag to allow retry on next mount
          initializationAttempted.current = false;
        }
      } catch (error) {
        logger.error('Error during user initialization:', error);
        // Reset flag to allow retry on next mount
        initializationAttempted.current = false;
      } finally {
        setConvexUserInitializationLoading(false);
      }
    };

    initializeUser();
  }, [userId, user]);

  return null;
}
