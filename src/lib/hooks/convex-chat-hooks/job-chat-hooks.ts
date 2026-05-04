'use client';

import { useState } from 'react';
import { upsertJobRelatedChat } from '@/lib/services/chat-service/job-chat-service';

export function useCreateJobChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const upsertJobChat = async ({
    jobPostingId,
    applicationId,
    jobTitle,
    candidateId,
    candidateUserId,
    candidateName,
    clientUserId,
    clientId,
    clientName,
  }: {
    jobPostingId: string;
    applicationId: string;
    jobTitle: string;
    candidateId: string;
    candidateUserId: string;
    candidateName: string;
    clientUserId: string;
    clientId: string;
    clientName: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await upsertJobRelatedChat(
        jobPostingId,
        applicationId,
        jobTitle,
        candidateId,
        candidateUserId,
        candidateName,
        clientUserId,
        clientId,
        clientName
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create chat');
      }

      return result.conversationId;
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    upsertJobChat,
    loading,
    error,
  };
}
