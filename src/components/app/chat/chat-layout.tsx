'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Settings } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ConvexUserType,
  useGetUserConversations,
  useGetUnreadCount,
  getConversationDisplayName,
} from '@/lib/services/chat-service/chat.service';
import { Id } from '../../../../convex/_generated/dataModel';
import { initializeUserData } from '@/lib/hooks/convex-chat-hooks/convex-user-init-hooks';

// Component imports
import { ChatSettings } from './chat-settings';
import { ChatTabs } from './chat-tabs';
import { ConversationPanel } from './conversation-panel';
import { ChatWindow } from './chat-window';
import { CommunityPanel } from './community-panel';
import { useUserPresence } from '@/lib/services/chat-service/user.service';
import { useDebounce } from '@/lib/hooks/use-debounce';
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

export function ChatLayout({
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
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<'conversations'> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get conversations and unread counts
  const unreadData = useGetUnreadCount(userId);
  const { data: allConversations, isLoading: isConversationsLoading } =
    useGetUserConversations(userId, userType);
  const { data: jobConversations, isLoading: isJobConversationsLoading } =
    useGetUserConversations(userId, userType, 'job_related');
  const {
    data: supportConversations,
    isLoading: isSupportConversationsLoading,
  } = useGetUserConversations(userId, userType, 'support');
  const {
    data: internalConversations,
    isLoading: isInternalConversationsLoading,
  } = useGetUserConversations(userId, userType, 'internal');

  // Get online users data
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { onlineUsers } = useUserPresence({
    currentUserId: userId,
    searchQuery: debouncedSearchQuery,
  });

  // Get current conversations based on active tab
  const getCurrentConversations = () => {
    switch (activeTab) {
      case 'jobs':
        return jobConversations || [];
      case 'support':
        return supportConversations || [];
      case 'internal':
        return internalConversations || [];
      case 'community':
        return []; // Community doesn't use conversations list
      default:
        return allConversations || [];
    }
  };

  const currentConversations = getCurrentConversations();
  const isLoading =
    isConversationsLoading ||
    isJobConversationsLoading ||
    isSupportConversationsLoading ||
    isInternalConversationsLoading;

  // Handle conversation selection
  const handleConversationSelect = (conversationId: Id<'conversations'>) => {
    setSelectedConversationId(conversationId);
  };

  // Get tab specific configurations based on user type
  const getTabsConfig = () => {
    const baseTabs = [
      {
        id: 'all',
        label: 'All Chats',
        icon: 'MessageSquare',
        badge: unreadData?.totalUnread || 0,
      },
    ];

    // Add user-type specific tabs
    if (userType === 'candidate') {
      baseTabs.push(
        {
          id: 'jobs',
          label: 'Job Chats',
          icon: 'Briefcase',
          badge: 0,
        },
        {
          id: 'community',
          label: 'Community',
          icon: 'Users',
          badge: 0,
        }
      );
    }

    if (userType === 'client' || userType === 'partner') {
      baseTabs.push(
        {
          id: 'jobs',
          label: 'Hiring',
          icon: 'Briefcase',
          badge: 0,
        },
        {
          id: 'internal',
          label: 'Team',
          icon: 'Users',
          badge: 0,
        }
      );
    }

    // Support tab for everyone
    baseTabs.push({
      id: 'support',
      label: 'Support',
      icon: 'HeadphonesIcon',
      badge: 0,
    });

    return baseTabs;
  };

  const tabsConfig = getTabsConfig();

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

  return (
    <div className={cn('bg-background space-y-6 dark:bg-gray-900/10')}>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-2"
      >
        {userType !== 'support' && (
          <div className="w-full">
            <ChatTabs tabsConfig={tabsConfig} />
          </div>
        )}

        {/* Tab Content */}
        <div className="h-[calc(100vh-10rem)] overflow-y-auto">
          {tabsConfig.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="m-0 h-full">
              {activeTab === 'community' ? (
                <CommunityPanel userId={userId} userType={userType} />
              ) : (
                <div className="flex h-full w-full justify-between gap-4 overflow-hidden md:gap-6">
                  <div className="custom-scrollbar h-full w-xl overflow-auto">
                    <ConversationPanel
                      userId={userId}
                      userName={userName}
                      userRole={userRole}
                      userType={userType}
                      conversations={currentConversations}
                      isLoading={isLoading}
                      onlineUsers={onlineUsers || []}
                      selectedConversationId={selectedConversationId}
                      onConversationSelect={handleConversationSelect}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedConversationName={(conversationId) => {
                        const conversation = currentConversations.find(
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
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
