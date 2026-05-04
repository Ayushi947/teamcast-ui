import {
  createSupportChat,
  ConvexUserType,
} from '@/lib/services/chat-service/chat.service';
import { useCallback, useEffect, useState } from 'react';
import { createAnonymousChat } from '@/lib/services/chat-service/anonymous-chat.service';
import { logger } from '@/lib/logger';

export const useCreateSupportChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSupportChat = async (
    userId: string,
    userName: string,
    userType: ConvexUserType
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createSupportChat(
        userId,
        userName,
        userType as ConvexUserType
      );
      if (!result.success) throw new Error(result.error);
      return result.conversationId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { startSupportChat, loading, error };
};

const LOCAL_KEY = 'anonymousConversationSessionId';

export function useCreateAnonymousChat(recipientEmail: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load or generate session ID from localStorage
  useEffect(() => {
    let existingSession = localStorage.getItem(LOCAL_KEY);
    if (!existingSession) {
      existingSession = crypto.randomUUID();
      localStorage.setItem(LOCAL_KEY, existingSession);
    }
    setSessionId(existingSession);
  }, []);

  const createChat = useCallback(
    async (content: string) => {
      if (!sessionId) return;

      const result = await createAnonymousChat(
        sessionId,
        content,
        recipientEmail
      );

      if (result.success) {
        localStorage.setItem(
          'anonymous_chat_conversation_id',
          result.conversationId
        );
        setConversationId(result.conversationId);
      } else {
        setError(result.error);

        // Handle invalid session: clear local storage and reload
        if (
          result.error.includes('conversation') ||
          result.error.includes('access')
        ) {
          logger.warn('Clearing anonymous session and refreshing');
          localStorage.removeItem(LOCAL_KEY);
          window.location.reload(); // Refresh to reinit session
        }
      }
    },
    [sessionId, recipientEmail]
  );

  return {
    sessionId,
    conversationId,
    createChat,
    error,
  };
}
