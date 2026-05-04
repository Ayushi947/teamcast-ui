'use client';

import { useState } from 'react';
import { markMessagesAsRead as markMessagesAsReadService } from '@/lib/services/chat-service/chat.service';
import { Id } from '../../../../convex/_generated/dataModel';

export function useMarkMessagesAsRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const markMessagesAsRead = async (
    conversationId: Id<'conversations'>,
    userId: string,
    messageIds?: Id<'messages'>[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await markMessagesAsReadService(
        conversationId,
        userId,
        messageIds
      );
      if (!result.success) throw new Error(result.error);
      return result.markedCount;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return 0;
    } finally {
      setLoading(false);
    }
  };
  return {
    markMessagesAsRead,
    loading,
    error,
  };
}
