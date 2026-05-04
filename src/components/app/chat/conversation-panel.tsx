'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ConversationsList } from './conversations-list';
import { NewChatDialog } from './new-chat-dialog';
import { ConvexUserType } from '@/lib/services/chat-service/chat.service';
import { Id } from '../../../../convex/_generated/dataModel';

interface ConversationPanelProps {
  userId: string;
  userName?: string;
  userType: ConvexUserType;
  userRole?: string;
  conversations: any[];
  isLoading: boolean;
  onlineUsers: any[];
  selectedConversationId: Id<'conversations'> | null;
  onConversationSelect: (conversationId: Id<'conversations'>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedConversationName: (conversationId: Id<'conversations'>) => string;
}
interface Participant {
  id: string;
  isOnline: boolean;
}

export function ConversationPanel({
  userId,
  userName,
  userType,
  conversations,
  onlineUsers,
  isLoading,
  selectedConversationId,
  onConversationSelect,
  searchQuery,
  onSearchChange,
}: ConversationPanelProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  // Tab state and options
  const [activeTab, setActiveTab] = useState(
    userType === 'candidate'
      ? 'all'
      : userType === 'support'
        ? 'support'
        : userType === 'client'
          ? 'jobs'
          : 'all'
  );
  const tabOptions = [
    { id: 'all', label: 'All' },
    { id: 'jobs', label: 'Job' },
    { id: 'support', label: 'Support' },
  ];

  // Enhance conversations with online status information
  const enhancedConversations = useMemo(() => {
    if (!conversations || !onlineUsers) return conversations;
    const onlineUserMap = new Map();
    onlineUsers.forEach((user) => {
      onlineUserMap.set(user.id, user.isOnline);
    });
    return conversations.map((conversation) => {
      if (!conversation) return conversation;
      const updatedOtherParticipants = conversation.otherParticipants?.map(
        (participant: Participant) => ({
          ...participant,
          isOnline: onlineUserMap.get(participant.id) || false,
        })
      );
      return {
        ...conversation,
        otherParticipants: updatedOtherParticipants,
      };
    });
  }, [conversations, onlineUsers]);

  // Filter conversations based on active tab
  const filteredConversations = useMemo(() => {
    if (activeTab === 'jobs') {
      return enhancedConversations?.filter((c) => c?.type === 'job_related');
    }
    if (activeTab === 'support') {
      return enhancedConversations?.filter((c) => c?.type === 'support');
    }
    return enhancedConversations;
  }, [enhancedConversations, activeTab]);

  return (
    <div className="bg-card h-full space-y-2 border lg:col-span-1">
      <div className="bg-card rounded-lg">
        <div className="flex flex-col">
          {/* Search Bar */}
          <div className="border-b px-6 py-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Type to search conversations..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-10 pl-9 text-sm"
                />
              </div>
            </div>
          </div>
          {/* Tabs below search bar */}

          {userType === 'client' && (
            <div className="flex border-b px-6 pt-2">
              {tabOptions
                .filter((tab) => tab.id !== 'all')
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 text-center font-medium transition-colors focus:outline-none ${
                      activeTab === tab.id
                        ? 'text-primary border-primary border-b-2 font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    style={{ borderBottomWidth: activeTab === tab.id ? 2 : 0 }}
                    aria-pressed={activeTab === tab.id}
                    role="tab"
                  >
                    {tab.label}
                  </button>
                ))}
            </div>
          )}

          {userType === 'candidate' && (
            <div className="flex border-b px-6 pt-2">
              {tabOptions.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-center font-medium transition-colors focus:outline-none ${
                    activeTab === tab.id
                      ? 'text-primary border-primary border-b-2 font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ borderBottomWidth: activeTab === tab.id ? 2 : 0 }}
                  aria-pressed={activeTab === tab.id}
                  role="tab"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          <ConversationsList
            conversations={
              (filteredConversations?.filter(Boolean) as any) || []
            }
            selectedConversationId={selectedConversationId}
            onConversationSelect={onConversationSelect}
            userId={userId}
            userType={userType}
            currentUserName={userName ?? ''}
            searchQuery={searchQuery}
            isLoading={isLoading}
            activeTab={activeTab}
          />
        </div>
      </div>
      {/* New Chat Dialog */}
      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
        userId={userId}
        userName={userName ?? ''}
        userType={userType}
        onConversationCreated={onConversationSelect}
      />
    </div>
  );
}
