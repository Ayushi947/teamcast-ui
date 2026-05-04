'use client';

import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, X } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import {
  ConvexUserType,
  formatMessageTime,
} from '@/lib/services/chat-service/chat.service';
import { Id } from '../../../../convex/_generated/dataModel';
import { useGetSupportChatConfig } from '@/lib/services/chat-service/anonymous-chat.service';
import { Button } from '@/components/ui/button';
import { useCreateSupportChat } from '@/lib/hooks/convex-chat-hooks/support-chat-hooks';
import { useApp } from '@/lib/context/app-context';

interface Conversation {
  _id: Id<'conversations'>;
  type: 'direct' | 'job_related' | 'support' | 'community' | 'internal';
  title?: string;
  description?: string;
  jobPostingId?: string;
  lastMessage?: {
    content: string;
    createdAt: number;
    senderId: string;
    messageType: string;
  };
  participantCount: number;
  unreadCount: number;
  userRole?: string;
  createdAt: number;
  updatedAt: number;
  isOnline?: boolean;
  otherParticipants?: Array<{
    id: string;
    userType: 'candidate' | 'client' | 'partner' | 'support';
    role: string;
    isOnline?: boolean;
  }>;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId: Id<'conversations'> | null;
  onConversationSelect: (conversationId: Id<'conversations'>) => void;
  userId: string;
  currentUserName: string;
  searchQuery?: string;
  isLoading?: boolean;
  userType: ConvexUserType;
  activeTab?: string;
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onConversationSelect,
  currentUserName,
  userType,
  searchQuery: externalSearchQuery = '',
  isLoading = false,
  userId,
  activeTab = 'all',
}: ConversationsListProps) {
  const { convexUserInitializationLoading } = useApp();
  const supportChatConfig = useGetSupportChatConfig();
  const {
    startSupportChat,
    loading: supportLoading,
    error: supportError,
  } = useCreateSupportChat();
  const handleStartSupportChat = async () => {
    if (supportLoading) return;
    const conversationId = await startSupportChat(
      userId,
      currentUserName,
      userType
    );
    if (conversationId) {
      onConversationSelect(conversationId);
    }
  };

  // Filter and sort conversations
  const filteredAndSortedConversations = useMemo(() => {
    let filtered = conversations;

    // Filter out anonymous support chats older than 1 day
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    filtered = filtered.filter((conversation) => {
      // Keep non-support chats
      if (conversation.type !== 'support') return true;

      // Keep non-anonymous support chats
      if (
        !conversation.otherParticipants?.some(
          (p) => p.userType === 'support' && p.role === 'anonymous'
        )
      )
        return true;

      // For anonymous support chats, only keep if less than 1 day old
      const lastActivityTime =
        conversation.lastMessage?.createdAt ||
        conversation.updatedAt ||
        conversation.createdAt;
      return lastActivityTime > oneDayAgo;
    });

    // Apply search filter
    if (externalSearchQuery.trim()) {
      const query = externalSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((conversation) => {
        const title = conversation.title?.toLowerCase() || '';
        const description = conversation.description?.toLowerCase() || '';
        const lastMessageContent =
          conversation.lastMessage?.content?.toLowerCase() || '';

        return (
          title.includes(query) ||
          description.includes(query) ||
          lastMessageContent.includes(query)
        );
      });
    }

    // Sort by last message time (most recent first)
    return filtered.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return bTime - aTime;
    });
  }, [conversations, externalSearchQuery]);

  const getConversationDisplayName = (conversation: Conversation): string => {
    if (!conversation.title) return 'Untitled Conversation';

    const participants = conversation.title
      .split('&')
      .map((name) => name.trim())
      .filter((name) => {
        // Exclude current user by name
        if (name === currentUserName) return false;

        // Also exclude generic labels for support users
        if (userType === 'support' && name.toLowerCase() === 'support')
          return false;

        return true;
      });

    return participants.join(' & ') || 'Untitled Conversation';
  };

  const getConversationDescription = (conversation: Conversation): string => {
    if (conversation.lastMessage) {
      const content = conversation.lastMessage.content;
      return content.length > 60 ? content.substring(0, 60) + '...' : content;
    }

    if (conversation.description) {
      return conversation.description.length > 60
        ? conversation.description.substring(0, 60) + '...'
        : conversation.description;
    }

    return 'No messages yet';
  };

  const getParticipantType = (conversation: Conversation): string => {
    if (conversation.otherParticipants?.length === 1) {
      return conversation?.otherParticipants?.[0]?.userType;
    }
    return conversation.type;
  };
  const getParticipantTypeBadgeColor = (
    conversation: Conversation
  ):
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info'
    | 'error' => {
    if (conversation.otherParticipants?.length === 1) {
      if (conversation?.otherParticipants?.[0]?.userType === 'candidate') {
        return 'success';
      }
      if (conversation?.otherParticipants?.[0]?.userType === 'client') {
        return 'info';
      }
      if (conversation?.otherParticipants?.[0]?.userType === 'partner') {
        return 'secondary';
      }
    }
    if (conversation.type === 'job_related') {
      return 'warning';
    }
    if (conversation.type === 'support') {
      return 'destructive';
    }
    if (conversation.type === 'direct') {
      return 'info';
    }
    if (conversation.type === 'internal') {
      return 'secondary';
    }

    return 'default';
  };

  const getLastMessageTime = (conversation: Conversation): string => {
    const timestamp =
      conversation.lastMessage?.createdAt || conversation.createdAt;
    return formatMessageTime(timestamp);
  };

  const isConversationRead = (conversation: Conversation): boolean => {
    return conversation.unreadCount === 0;
  };

  // Check if any participant in the conversation is online (except current user)
  const isAnyParticipantOnline = (conversation: Conversation): boolean => {
    if (!conversation.otherParticipants) return false;
    return conversation.otherParticipants.some((p) => p.isOnline === true);
  };

  if (isLoading || convexUserInitializationLoading) {
    return (
      <div className="custom-scrollbar flex h-full flex-col overflow-y-auto">
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex cursor-pointer items-center gap-3 overflow-y-auto rounded-lg border p-3"
              >
                {/* Avatar skeleton with online status indicator */}
                <div className="relative flex-shrink-0">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  {/* Online status indicator skeleton */}
                  <Skeleton className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full" />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Header row with title and timestamp */}
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      {/* Badge skeleton */}
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>

                  {/* Message preview and unread count row */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-48" />
                    <div className="ml-2 flex flex-shrink-0 items-center gap-1">
                      {/* Participant count skeleton */}
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-4" />
                      </div>
                      {/* Unread count badge skeleton */}
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar flex h-full flex-col overflow-y-auto">
      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredAndSortedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <img
                src="/illustrations/empy_chat_illustration.svg"
                alt="Empty chat illustration"
                className="mb-6 h-44 w-auto object-contain"
                style={{ maxWidth: 340 }}
              />

              <h3 className="text-foreground mb-2 text-lg font-semibold">
                {externalSearchQuery
                  ? 'No conversations found'
                  : 'No conversations yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-64 text-sm">
                {externalSearchQuery
                  ? 'Try a different search or start a new conversation.'
                  : 'Start a new conversation to begin chatting.'}
              </p>
              {activeTab === 'support' && userType !== 'support' && (
                <Button
                  onClick={handleStartSupportChat}
                  disabled={supportLoading}
                  className="mt-2 w-56"
                >
                  {supportLoading
                    ? 'Starting Support Chat...'
                    : 'Start Support Chat'}
                </Button>
              )}
              {supportError && (
                <div className="mt-2 text-xs text-red-500">{supportError}</div>
              )}
            </div>
          ) : (
            filteredAndSortedConversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation._id;
              const isRead = isConversationRead(conversation);
              const isOnline = isAnyParticipantOnline(conversation);

              return (
                <div
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation._id)}
                  className={cn(
                    'hover:bg-muted/50 flex cursor-pointer items-center gap-3 overflow-y-auto rounded-lg border p-3 transition-colors',
                    isSelected && 'bg-primary/10 border-primary/20 border',
                    !isRead && 'bg-muted/30'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {getInitials(getConversationDisplayName(conversation))}
                      </AvatarFallback>
                    </Avatar>
                    {!isRead && (
                      <div className="bg-primary absolute -top-1 -right-1 h-3 w-3 rounded-full"></div>
                    )}
                    {/* Online status indicaator */}
                    {isOnline ? (
                      supportChatConfig?.availabilityStatus === 'online' ? (
                        <div className="border-background absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 bg-green-500" />
                      ) : supportChatConfig?.availabilityStatus === 'away' ? (
                        <div className="border-background absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 bg-yellow-500" />
                      ) : (
                        <div className="border-background absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 bg-red-500" />
                      )
                    ) : (
                      <div className="border-background absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-gray-400">
                        <X className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            'truncate text-sm',
                            !isRead
                              ? 'text-foreground font-semibold'
                              : 'text-foreground font-medium'
                          )}
                        >
                          {getConversationDisplayName(conversation)}
                        </h4>{' '}
                        {conversation?.type !== 'support' &&
                          !(
                            userType === 'candidate' &&
                            conversation?.type === 'direct'
                          ) && (
                            <span>
                              <Badge
                                variant={getParticipantTypeBadgeColor(
                                  conversation
                                )}
                              >
                                {getParticipantType(conversation)}
                              </Badge>
                            </span>
                          )}
                      </div>
                      <span className="text-muted-foreground ml-2 flex-shrink-0 text-xs">
                        {getLastMessageTime(conversation)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          'truncate text-xs',
                          !isRead
                            ? 'text-muted-foreground font-medium'
                            : 'text-muted-foreground'
                        )}
                      >
                        {getConversationDescription(conversation)}
                      </p>

                      <div className="ml-2 flex flex-shrink-0 items-center gap-1">
                        {conversation?.participantCount > 2 &&
                          conversation.type !== 'support' && (
                            <div className="flex items-center gap-1">
                              <Users className="text-muted-foreground h-3 w-3" />
                              <span className="text-muted-foreground text-xs">
                                {conversation.participantCount}
                              </span>
                            </div>
                          )}

                        {conversation?.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                          >
                            {conversation.unreadCount > 99
                              ? '99+'
                              : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
