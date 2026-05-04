'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUserUpdateLastSeen } from '@/lib/services/chat-service/chat.service';
import { logger } from '@/lib/logger';

export const useHeartbeat = (userId?: string) => {
  const { updateLastSeen } = useUserUpdateLastSeen();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const sendHeartbeat = useCallback(async () => {
    if (!userId) return;

    if (document.visibilityState !== 'visible') return;

    const now = Date.now();

    // Minimum 10 seconds between updates
    if (now - lastUpdateRef.current < 10_000) {
      return;
    }

    logger.info('Sending heartbeat');

    try {
      const result = await updateLastSeen({ userId });
      if (result?.success) {
        lastUpdateRef.current = now;
      } else {
        logger.warn('Heartbeat failed');
      }
    } catch (error) {
      logger.error('Error sending heartbeat', error);
    }
  }, [userId, updateLastSeen]);

  useEffect(() => {
    if (!userId) {
      logger.warn('No userId provided for heartbeat');
      return;
    }

    // Send immediately
    sendHeartbeat();

    // Heartbeat interval
    intervalRef.current = setInterval(sendHeartbeat, 15_000);

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, sendHeartbeat]);
};
