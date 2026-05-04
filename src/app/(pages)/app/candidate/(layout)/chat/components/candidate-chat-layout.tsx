'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ConvexUserType,
  getConversationDisplayName,
} from '@/lib/services/chat-service/chat.service';
import { initializeUserData } from '@/lib/hooks/convex-chat-hooks/convex-user-init-hooks';
import { useUserPresence } from '@/lib/services/chat-service/user.service';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Id } from '../../../../../../../../convex/_generated/dataModel';
import { ChatWindow } from '@/components/app/chat/chat-window';
import { ChatSettings } from '@/components/app/chat/chat-settings';
import { ConversationPanel } from '@/components/app/chat/conversation-panel';
import { NewChatDialog } from '@/components/app/chat/new-chat-dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context/app-context';
import { IAuthUser } from '@/lib/shared';
import { useGetCandidateConversations } from '@/lib/services/chat-service/candidate-chat-service';

interface ChatWindowPanelProps {
  selectedConversationId: Id<'conversations'> | null;
  userName: string;
  userId: string;
  userType: ConvexUserType;
  onBack: () => void;
  isMobile: boolean;
}

// Enhanced ChatWindowPanel with better error handling and loading states
function ChatWindowPanel({
  selectedConversationId,
  userName,
  userId,
  userType,
  onBack,
  isMobile,
}: ChatWindowPanelProps) {
  return (
    <div className="h-[calc(100vh-12rem)] min-w-0 flex-1 overflow-hidden">
      <div className="bg-card flex h-full flex-col overflow-hidden rounded-lg border shadow-sm">
        {selectedConversationId ? (
          <>
            <ChatWindow
              conversationId={selectedConversationId}
              userName={userName}
              userId={userId}
              userType={userType}
              onBack={isMobile ? onBack : undefined}
            />
          </>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center p-8">
            <div className="max-w-md space-y-6 text-center">
              <div className="bg-muted/50 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                <MessageSquare className="h-10 w-10 opacity-50" />
              </div>
              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold tracking-tight">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
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

export function CandidateChatLayout() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<'conversations'> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const { user } = useApp();
  const userId = user?.id ?? '';
  const userType = user?.type?.toLocaleLowerCase() as ConvexUserType;
  const userName = user?.name ?? '';
  const userRole = user?.role ?? '';
  const [isMobile, setIsMobile] = useState(false);
  // Initialize user data when component mounts
  useEffect(() => {
    if (userId && userType && userName) {
      initializeUserData(user as IAuthUser);
    }
  }, [userId, userType, userName]);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Data fetching hooks

  const { data: allConversations, isLoading: isConversationsLoading } =
    useGetCandidateConversations(userId);

  // Get online users data
  const { onlineUsers } = useUserPresence({
    currentUserId: userId,
    searchQuery: debouncedSearchQuery,
  });

  // Event handlers
  const handleConversationSelect = useCallback(
    (conversationId: Id<'conversations'>) => {
      setSelectedConversationId(conversationId);
    },
    []
  );

  const getSelectedConversationName = useCallback(
    (conversationId: Id<'conversations'> | null) => {
      if (!conversationId) return 'Conversation';
      const conversation = allConversations?.find(
        (c) => c && c._id === conversationId
      );
      return conversation
        ? getConversationDisplayName(conversation, userId)
        : 'Conversation';
    },
    [allConversations, userId]
  );

  // Settings view
  if (showSettings) {
    return (
      <div className={cn('bg-background space-y-6 p-4')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="text-primary h-6 w-6" />
            <h1 className="text-foreground text-2xl font-semibold">
              Chat Settings
            </h1>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Chat
          </button>
        </div>

        <div className="bg-card rounded-lg border">
          <ChatSettings
            userId={userId}
            userType={userType}
            open={showSettings}
            onOpenChange={setShowSettings}
          />
        </div>
      </div>
    );
  }

  // Mobile view - show only conversation panel or chat window
  if (isMobile) {
    return (
      <div className="bg-background flex flex-col pb-10">
        {selectedConversationId ? (
          // Show chat window with back button
          <div className="flex h-full min-h-0 flex-1 flex-col">
            <ChatWindowPanel
              selectedConversationId={selectedConversationId}
              userName={userName ?? ''}
              userId={userId}
              userType={userType}
              onBack={() => setSelectedConversationId(null)}
              isMobile={true}
            />
          </div>
        ) : (
          // Show conversation panel with header
          <div className="flex h-screen flex-col">
            {/* Mobile Header */}
            <div className="bg-card flex items-center justify-between border-b p-4">
              <div>
                <h1 className="text-primary dark:text-muted-foreground text-xl font-bold">
                  Teamcast Chats
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review and respond to assessment invitations
                </p>
              </div>
              <Button
                onClick={() => setShowNewChatDialog(true)}
                className="hover:bg-primary/80 flex items-center gap-1"
                size="sm"
                title="Start a new chat"
                aria-label="New chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Conversation Panel */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ConversationPanel
                userId={userId}
                userName={userName}
                userRole={userRole}
                userType={userType}
                conversations={allConversations || []}
                onlineUsers={onlineUsers || []}
                isLoading={isConversationsLoading}
                selectedConversationId={selectedConversationId}
                onConversationSelect={handleConversationSelect}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedConversationName={getSelectedConversationName}
              />
            </div>

            <NewChatDialog
              open={showNewChatDialog}
              onConversationCreated={handleConversationSelect}
              onOpenChange={setShowNewChatDialog}
              userId={userId}
              userName={userName ?? ''}
              userType={userType}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop view - original layout
  return (
    <div className={cn('bg-background px-4 py-2', 'dark:bg-gray-900/10')}>
      {/*Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center">
            <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
              Teamcast Chats
            </h1>
          </div>
          <p className="text-md text-gray-600 dark:text-gray-400">
            Engage directly with professionals in your talent pool
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowNewChatDialog(true)}
            className="hover:bg-primary/80 flex items-center gap-1"
            title="Start a new chat"
            aria-label="New chat"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 h-[calc(100vh-12rem)]">
        <div className="flex h-full min-h-0 w-full flex-wrap justify-between gap-4 overflow-hidden md:gap-6">
          <div className="custom-scrollbar h-full w-lg overflow-auto">
            <ConversationPanel
              userId={userId}
              userName={userName}
              userRole={userRole}
              userType={userType}
              conversations={allConversations || []}
              onlineUsers={onlineUsers || []}
              isLoading={isConversationsLoading}
              selectedConversationId={selectedConversationId}
              onConversationSelect={handleConversationSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedConversationName={getSelectedConversationName}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <ChatWindowPanel
              selectedConversationId={selectedConversationId}
              userName={userName ?? ''}
              userId={userId}
              userType={userType}
              onBack={() => setSelectedConversationId(null)}
              isMobile={false}
            />
          </div>
        </div>
      </div>

      <NewChatDialog
        open={showNewChatDialog}
        onConversationCreated={handleConversationSelect}
        onOpenChange={setShowNewChatDialog}
        userId={userId}
        userName={userName ?? ''}
        userType={userType}
      />
    </div>
  );
}
