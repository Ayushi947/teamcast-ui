'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ConvexUserType,
  getConversationDisplayName,
  useGetSupportConversation,
} from '@/lib/services/chat-service/chat.service';

// Component imports
import { ConversationPanel } from '@/components/app/chat/conversation-panel';
import { ChatWindow } from '@/components/app/chat/chat-window';
import { useUserPresence } from '@/lib/services/chat-service/user.service';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Id } from '../../../../../../../../convex/_generated/dataModel';
import { initializeUserData } from '@/lib/hooks/convex-chat-hooks/convex-user-init-hooks';
import { SupportChatConfigDialog } from '@/components/app/chat/support-chat-config';
import { useApp } from '@/lib/context/app-context';
import { IAuthUser } from '@/lib/shared';

interface ChatLayoutProps {
  userId: string;
  userType: ConvexUserType;
  userName?: string;
  userRole?: string;
}

// Simple wrapper for ChatWindow to avoid duplication
function ChatWindowPanel({
  selectedConversationId,
  userName,
  userId,
  userType,
  onBack,
}: {
  selectedConversationId: Id<'conversations'> | null;
  userName: string;
  userId: string;
  userType: ConvexUserType;
  onBack: () => void;
}) {
  return (
    <div className="w-[80%]">
      <div className="bg-card flex h-full flex-col rounded-lg border">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            userName={userName}
            userId={userId}
            userType={userType}
            onBack={onBack}
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center p-8">
            <div className="space-y-6 text-center">
              <div className="bg-muted/50 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                <MessageSquare className="h-10 w-10 opacity-50" />
              </div>
              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold tracking-tight">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                  Choose a conversation from the list to start chatting, or
                  create a new one to begin your discussion
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SupportChatLayout({
  userId,
  userType,
  userName,
  userRole,
}: ChatLayoutProps) {
  const { user } = useApp();
  useEffect(() => {
    if (userId && userType && userName) {
      initializeUserData(user as IAuthUser);
    }
  }, [userId, userType, userName]);

  // State management
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<'conversations'> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get conversations and unread counts
  const { data: supportConversations, isLoading: supportConversationsLoading } =
    useGetSupportConversation(userType);

  // Get online users data
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { onlineUsers } = useUserPresence({
    currentUserId: userId,
    searchQuery: debouncedSearchQuery,
  });

  // Handle conversation selection
  const handleConversationSelect = (conversationId: Id<'conversations'>) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className={cn('bg-background space-y-6 dark:bg-gray-900/10')}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#6e55cf]">
            Support Chat
          </h2>
          <p className="text-muted-foreground">
            Manage and track all support chat across partners
          </p>
        </div>
        <SupportChatConfigDialog
          userId={userId}
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </div>

      {/* Tab Content */}
      <div className="h-[calc(100vh-13rem)] space-y-4 overflow-y-auto">
        <div className="flex h-full w-full justify-between gap-4 overflow-hidden md:gap-6">
          <div className="custom-scrollbar h-full w-xl overflow-auto">
            <ConversationPanel
              userId={userId}
              userName={userName}
              userRole={userRole}
              userType={userType}
              conversations={supportConversations}
              isLoading={supportConversationsLoading}
              onlineUsers={onlineUsers || []}
              selectedConversationId={selectedConversationId}
              onConversationSelect={handleConversationSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedConversationName={(conversationId) => {
                const conversation = supportConversations?.find(
                  (c) => c && c._id === conversationId
                );
                return conversation
                  ? getConversationDisplayName(conversation, userId)
                  : 'Conversation';
              }}
            />
          </div>

          <ChatWindowPanel
            selectedConversationId={selectedConversationId}
            userName={userName ?? ''}
            userId={userId}
            userType={userType}
            onBack={() => setSelectedConversationId(null)}
          />
        </div>
      </div>
    </div>
  );
}
