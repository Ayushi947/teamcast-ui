'use client';

import { useApp } from '@/lib/context/app-context';
import { ConvexUserType } from '@/lib/services/chat-service/chat.service';
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { SupportChatLayout } from './components/support-chat-layout';

export default function ChatPage() {
  const { user } = useApp();
  const [hasCleanedUp, setHasCleanedUp] = useState(false);

  // Get the cleanup mutation
  const cleanupExpiredSessions = useMutation(
    api.services.chat.support_conversation.cleanupExpiredAnonymousSessions
  );

  // Run cleanup when page loads
  useEffect(() => {
    const runCleanup = async () => {
      if (!hasCleanedUp) {
        try {
          const deletedCount = await cleanupExpiredSessions();
          if (deletedCount > 0) {
            toast.info(
              `Cleaned up ${deletedCount} expired anonymous chat${deletedCount === 1 ? '' : 's'}`
            );
          }
          setHasCleanedUp(true);
        } catch (error) {
          logger.error('Failed to clean up expired sessions:', error);
        }
      }
    };

    runCleanup();
  }, [cleanupExpiredSessions, hasCleanedUp]);

  return (
    <div>
      <SupportChatLayout
        userId={user?.id ?? ''}
        userType={
          (user?.type?.toLocaleLowerCase() || 'support') as ConvexUserType
        }
        userName={user?.name ?? ''}
        userRole={user?.role ?? ''}
      />
    </div>
  );
}
