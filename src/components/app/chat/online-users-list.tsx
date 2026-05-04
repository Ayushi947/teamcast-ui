'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageSquare, Search, Users, Circle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, getInitials } from '@/lib/utils';
import {
  useCreateConversation,
  createDirectChat,
  ConvexUserType,
  useGetUserConversations,
} from '@/lib/services/chat-service/chat.service';
import {
  getUserTypeLabel,
  getUserTypeBadgeColor,
} from '@/lib/hooks/convex-chat-hooks/user-helpers';
import { logger } from '@/lib/logger';
import {
  useUserPresence,
  useSearchAllCandidates,
} from '@/lib/services/chat-service/user.service';
import { useDebounce } from '@/lib/hooks/use-debounce';

// Types
interface OnlineUser {
  id: string;
  userName: string;
  email: string;
  userType: ConvexUserType;
  avatar?: string;
  lastSeen?: number;
  isOnline: boolean;
}

interface SelectedUser {
  userId: string;
  userName: string;
  userType: ConvexUserType;
}

interface OnlineUsersListProps {
  currentUserId: string;
  currentUserName: string;
  currentUserType: ConvexUserType;
  onStartChat?: (conversationId: string) => void;
  onSelectUser?: (user: SelectedUser) => void;
  className?: string;
  selectionMode?: boolean;
}

const SCROLL_AREA_HEIGHT = 'h-80';

// Helper functions
const formatLastSeen = (lastSeen: number): string => {
  const now = Date.now();
  const diff = now - lastSeen;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const canUserChat = (
  currentUserType: ConvexUserType,
  targetUserType: ConvexUserType
): boolean => {
  // Partners cannot directly message clients
  if (currentUserType === 'partner' && targetUserType === 'client') {
    return false;
  }
  return true;
};

// User Card Component
interface UserCardProps {
  user: OnlineUser;
  isOnline: boolean;
  selectionMode: boolean;
  onAction: (user: OnlineUser) => void;
  isLoading?: boolean;
}

const UserCard = ({
  user,
  isOnline,
  selectionMode,
  onAction,
  isLoading,
}: UserCardProps) => (
  <div
    className={cn(
      'hover:bg-muted/50 flex items-center justify-between rounded-lg p-2 transition-colors',
      !isOnline && 'opacity-75'
    )}
  >
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.userName} />
          <AvatarFallback className="text-xs">
            {getInitials(user.userName)}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{user.userName}</p>
          <Badge
            variant={isOnline ? 'secondary' : 'outline'}
            className={cn(
              'text-xs',
              isOnline && getUserTypeBadgeColor(user.userType)
            )}
          >
            {getUserTypeLabel(user.userType)}
          </Badge>
        </div>
        {user.email && (
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
        )}
        {!isOnline && (
          <p className="text-muted-foreground text-xs">
            {user.lastSeen ? formatLastSeen(user.lastSeen) : 'Offline'}
          </p>
        )}
      </div>
    </div>
    <Button
      size="sm"
      variant={selectionMode ? 'default' : 'ghost'}
      onClick={() => onAction(user)}
      disabled={isLoading}
      className={selectionMode ? 'h-8 px-3' : 'h-8 w-8 p-0'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : selectionMode ? (
        'Select'
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
    </Button>
  </div>
);

// Empty State Component
interface EmptyStateProps {
  searchQuery: string;
  hasOnlineUsers: boolean;
  hasExistingConversations: boolean;
}

const EmptyState = ({
  searchQuery,
  hasOnlineUsers,
  hasExistingConversations,
}: EmptyStateProps) => {
  const getMessage = () => {
    if (searchQuery) return 'No users found';
    if (hasOnlineUsers && hasExistingConversations) {
      return 'You already have conversations with all online users';
    }
    return 'No users currently online';
  };

  const getSubMessage = () => {
    if (searchQuery) return 'Try adjusting your search terms';
    if (hasOnlineUsers && hasExistingConversations) {
      return 'Check your existing conversations';
    }
    return 'Users will appear here when they come online';
  };

  return (
    <div className="py-8 text-center">
      <Users className="text-muted-foreground/50 mx-auto mb-2 h-12 w-12" />
      <p className="text-muted-foreground mb-1">{getMessage()}</p>
      <p className="text-muted-foreground/70 text-xs">{getSubMessage()}</p>
    </div>
  );
};

// Main Component
export function OnlineUsersList({
  currentUserId,
  currentUserName,
  currentUserType,
  onStartChat,
  onSelectUser,
  className,
  selectionMode = false,
}: OnlineUsersListProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [existingConversationUsers, setExistingConversationUsers] = useState<
    Set<string>
  >(new Set());

  // Hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 700);
  const createConversation = useCreateConversation();

  const { onlineUsers, isLoading: isOnlineLoading } = useUserPresence({
    currentUserId,
    searchQuery: debouncedSearchQuery,
  });

  const { data: searchCandidates, isLoading: isSearchLoading } =
    useSearchAllCandidates(debouncedSearchQuery, 50, currentUserId);
  const {
    data: existingConversations,
    isLoading: isExistingConversationsLoading,
  } = useGetUserConversations(currentUserId, currentUserType, 'direct');

  const isLoading =
    isOnlineLoading || isSearchLoading || isExistingConversationsLoading;

  // Process existing conversations
  useEffect(() => {
    if (!existingConversations) return;

    try {
      const userIds = new Set<string>();

      existingConversations.forEach((conversation) => {
        if (conversation?.otherParticipants) {
          conversation.otherParticipants.forEach((participant) => {
            userIds.add(participant.id);
          });
        }
      });

      setExistingConversationUsers(userIds);
      logger.info('Existing conversation users processed', {
        count: userIds.size,
      });
    } catch (error) {
      logger.error('Error processing existing conversations:', error);
    }
  }, [existingConversations]);

  // Memoized filtered users
  const { onlineFilteredUsers, offlineFilteredUsers, hasAnyUsers } =
    useMemo(() => {
      if (!searchCandidates) {
        return {
          onlineFilteredUsers: [],
          offlineFilteredUsers: [],
          hasAnyUsers: false,
        };
      }

      const uniqueUsersMap = new Map<string, OnlineUser>();

      // Filter based on search and permissions
      const filtered = searchCandidates
        .filter((user) => {
          if (user.id === currentUserId) return false;
          if (existingConversationUsers.has(user.id)) return false;
          return canUserChat(currentUserType, user.userType);
        })
        .slice(0, 50); // Soft limit

      // Map users by ID for uniqueness
      filtered.forEach((user) => {
        uniqueUsersMap.set(user.id, {
          ...user,
          isOnline: onlineUsers?.some((u) => u.id === user.id) || false,
        });
      });

      const allUsers = Array.from(uniqueUsersMap.values());

      const onlineFilteredUsers = allUsers.filter((user) => user.isOnline);
      const offlineFilteredUsers = allUsers.filter((user) => !user.isOnline);

      return {
        onlineFilteredUsers,
        offlineFilteredUsers,
        hasAnyUsers: allUsers.length > 0,
      };
    }, [
      searchCandidates,
      onlineUsers,
      currentUserId,
      currentUserType,
      existingConversationUsers,
    ]);

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery || !searchCandidates) return [];

    return searchCandidates.filter((user) => {
      // Skip current user
      if (user.id === currentUserId) return false;

      // Skip users with existing conversations
      if (existingConversationUsers.has(user.id)) return false;

      // Role-based filtering
      return canUserChat(currentUserType, user.userType);
    });
  }, [
    searchCandidates,
    searchQuery,
    currentUserId,
    existingConversationUsers,
    currentUserType,
  ]);

  // Handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleUserAction = useCallback(
    async (targetUser: OnlineUser) => {
      if (selectionMode && onSelectUser) {
        onSelectUser({
          userId: targetUser.id,
          userName: targetUser.userName,
          userType: targetUser.userType,
        });
        setIsOpen(false);
        return;
      }

      await handleStartChat(targetUser);
    },
    [selectionMode, onSelectUser]
  );

  const handleStartChat = useCallback(
    async (targetUser: OnlineUser) => {
      if (!onStartChat) return;

      setIsActionLoading(true);
      try {
        const result = await createDirectChat(
          createConversation,
          currentUserId,
          currentUserName,
          currentUserType,
          targetUser.id,
          targetUser.userName,
          targetUser.userType,
          `Chat with ${targetUser.userName}`
        );

        if (result.success && result.conversationId) {
          onStartChat(result.conversationId);
          setIsOpen(false);
          toast.success(`Started chat with ${targetUser.userName}`);
        } else {
          toast.error(result.error || 'Failed to start chat');
        }
      } catch (error) {
        logger.error('Error starting chat:', error);
        toast.error('Failed to start chat');
      } finally {
        setIsActionLoading(false);
      }
    },
    [
      createConversation,
      currentUserId,
      currentUserName,
      currentUserType,
      onStartChat,
    ]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  }, []);

  // Render
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Users className="mr-2 h-4 w-4" />
          Select Users
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Online Users ({onlineUsers?.length || 0})
          </DialogTitle>
          <DialogDescription>
            {selectionMode ? 'Select a user' : 'Select a user to start a chat'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>

          {/* Users List */}

          {isLoading ? (
            <div
              className={cn(
                SCROLL_AREA_HEIGHT,
                'flex items-center justify-center'
              )}
            >
              <div className="text-muted-foreground flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Loading users...</span>
              </div>
            </div>
          ) : (
            <ScrollArea className={SCROLL_AREA_HEIGHT}>
              <div className="space-y-4">
                {searchQuery ? (
                  // Search Results
                  <>
                    {searchResults.length > 0 ? (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <Search className="h-4 w-4" />
                          Search Results ({searchResults.length})
                        </h4>
                        <div className="space-y-2">
                          {searchResults.map((user) => (
                            <UserCard
                              key={user.id}
                              user={user as unknown as OnlineUser}
                              isOnline={user.isOnline || false}
                              selectionMode={selectionMode}
                              onAction={handleUserAction}
                              isLoading={isActionLoading}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        searchQuery={searchQuery}
                        hasOnlineUsers={!!onlineUsers?.length}
                        hasExistingConversations={
                          existingConversationUsers.size > 0
                        }
                      />
                    )}
                  </>
                ) : (
                  // Regular Online/Offline Users
                  <>
                    {/* Online Users */}
                    {onlineFilteredUsers.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-green-600">
                          <Circle className="h-2 w-2 fill-current" />
                          Online ({onlineFilteredUsers.length})
                        </h4>
                        <div className="space-y-2">
                          {onlineFilteredUsers.map((user) => (
                            <UserCard
                              key={user.id}
                              user={user}
                              isOnline={true}
                              selectionMode={selectionMode}
                              onAction={handleUserAction}
                              isLoading={isActionLoading}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Offline Users */}
                    {offlineFilteredUsers.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                          <Circle className="h-2 w-2 fill-current" />
                          Offline ({offlineFilteredUsers.length})
                        </h4>
                        <div className="space-y-2">
                          {offlineFilteredUsers.map((user) => (
                            <UserCard
                              key={user.id}
                              user={user}
                              isOnline={false}
                              selectionMode={selectionMode}
                              onAction={handleUserAction}
                              isLoading={isActionLoading}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!hasAnyUsers && (
                      <EmptyState
                        searchQuery={searchQuery}
                        hasOnlineUsers={!!onlineUsers?.length}
                        hasExistingConversations={
                          existingConversationUsers.size > 0
                        }
                      />
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
