import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MessageCircle, Send } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { AvatarFallback } from '@/components/ui/avatar';
import {
  ISupportTicketComment,
  UserTypeEnum,
  ISupportUser,
} from '@/lib/shared';
import { formatDateAndTime, formatEnumValue, cn } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { supportUserManagementService } from '@/lib/services/services';

interface TicketCommentSectionProps {
  comments: ISupportTicketComment[];
  ticketId: string;
  handleAddComment: (
    comment: string,
    isInternal?: boolean,
    mentionedUserIds?: string[]
  ) => void;
  isSubmitting?: boolean;
}

export function TicketCommentSection({
  comments,
  ticketId,
  handleAddComment,
  isSubmitting = false,
}: TicketCommentSectionProps) {
  const { user } = useApp();

  const [isMentionOpen, setIsMentionOpen] = useState<boolean>(false);
  const [newComment, setNewComment] = useState('');
  const [isMentionPopoverOpen, setIsMentionPopoverOpen] = useState(false);
  const [mentionSearchValue, setMentionSearchValue] = useState('');
  const [focusedMentionIndex, setFocusedMentionIndex] = useState(-1);
  const [selectedMentionedUsers, setSelectedMentionedUsers] = useState<
    ISupportUser[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch support users for mentioning
  const debouncedMentionSearch = useDebounce(mentionSearchValue, 300);
  const { data: supportUsersData, isLoading: isSearchingMentions } = useQuery({
    queryKey: ['support-users-mentions', debouncedMentionSearch],
    queryFn: () =>
      supportUserManagementService.getSupportUsers({
        page: 1,
        limit: 20,
        search: debouncedMentionSearch,
      }),
    enabled: isMentionPopoverOpen || isMentionOpen,
  });

  const supportUsers = supportUsersData?.items || [];

  useEffect(() => {
    // More robust @ detection logic
    const shouldShowMentionPopover = () => {
      // Don't show if no @ symbol
      if (!newComment.includes('@')) {
        return false;
      }

      // Find the last @ symbol in the text
      const lastAtIndex = newComment.lastIndexOf('@');
      const textAfterAt = newComment.substring(lastAtIndex + 1);

      // Don't show if there's no space before @ (like in email addresses)
      const textBeforeAt = newComment.substring(0, lastAtIndex);
      if (
        textBeforeAt &&
        !textBeforeAt.endsWith(' ') &&
        !textBeforeAt.endsWith('\n')
      ) {
        return false;
      }

      // Don't show if there's already a complete mention (space after @)
      if (textAfterAt.includes(' ')) {
        return false;
      }

      // Don't show if it looks like an email (contains @ and .)
      if (newComment.includes('.') && newComment.includes('@')) {
        const emailPattern = /\S+@\S+\.\S+/;
        if (emailPattern.test(newComment)) {
          return false;
        }
      }

      // Don't show if there's already a selected user with this name
      const mentionText = textAfterAt.toLowerCase();
      const hasSelectedUser = selectedMentionedUsers.some(
        (user) =>
          user.name.toLowerCase().includes(mentionText) ||
          user.email.toLowerCase().includes(mentionText)
      );

      if (hasSelectedUser && mentionText.length > 0) {
        return false;
      }

      // Show if there's a standalone @ or @ followed by partial text
      return textAfterAt.length === 0 || !textAfterAt.includes(' ');
    };

    setIsMentionOpen(shouldShowMentionPopover());
  }, [newComment, selectedMentionedUsers]);

  useEffect(() => {
    setNewComment('');
    setSelectedMentionedUsers([]);
  }, [ticketId]);

  // Handle mention search input keydown
  const handleMentionInputKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedMentionIndex((prev) =>
          prev < supportUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedMentionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedMentionIndex >= 0 && supportUsers[focusedMentionIndex]) {
          handleMentionSelect(supportUsers[focusedMentionIndex]);
        }
        break;
      case 'Escape':
        setIsMentionPopoverOpen(false);
        setMentionSearchValue('');
        setFocusedMentionIndex(-1);
        break;
    }
  };

  // Handle mention selection
  const handleMentionSelect = (user: ISupportUser) => {
    if (!selectedMentionedUsers.find((u) => u.id === user.id)) {
      setSelectedMentionedUsers((prev) => [...prev, user]);
    }

    // Replace the @mention text with the user's name
    const lastAtIndex = newComment.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textBeforeAt = newComment.substring(0, lastAtIndex);
      const textAfterAt = newComment.substring(lastAtIndex + 1);

      // If no space exists after mention, add one
      const spaceAfterMention = textAfterAt.includes(' ') ? '' : ' ';

      // Replace spaces in username with underscores
      const safeUsername = user.name.replace(/\s+/g, '_');

      // Replace @partialText with @username
      const newText = `${textBeforeAt}@${safeUsername}${spaceAfterMention}${textAfterAt}`;
      setNewComment(newText);
    }

    setIsMentionPopoverOpen(false);
    setMentionSearchValue('');
    setFocusedMentionIndex(-1);
    textareaRef.current?.focus();
  };

  // Remove mentioned user
  const removeMentionedUser = (userId: string) => {
    setSelectedMentionedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSubmitComment = () => {
    if (newComment.trim() && !isSubmitting) {
      const hasMention = selectedMentionedUsers.length > 0;
      const mentionedUserIds = selectedMentionedUsers.map((u) => u.id);
      handleAddComment(newComment, hasMention, mentionedUserIds);
      setNewComment('');
      setSelectedMentionedUsers([]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  // Helper function to highlight mentions in text
  const highlightMentions = (text: string) => {
    // Regex to match @mentions (word characters after @)
    const mentionRegex = /@(\w+)/g;

    const parts = text.split(mentionRegex);
    const matches = text.match(mentionRegex);

    if (!matches) {
      return text;
    }

    return parts.map((part, index) => {
      if (index % 2 === 1 && matches[Math.floor(index / 2)]) {
        // This is a mention part
        return (
          <span key={index} className="text-primary font-bold">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-card flex flex-col gap-6 rounded-xl">
      {/* Add Comment */}
      <div className="flex items-start gap-3 p-4">
        <Avatar className="h-9 w-9 border">
          <AvatarFallback className="bg-purple-100 text-xs font-semibold text-purple-600">
            {user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="relative flex-1">
          {/* Selected Mentioned Users - Only show for support users */}
          {user?.type === UserTypeEnum.SUPPORT &&
            selectedMentionedUsers.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedMentionedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    <span>@{user.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMentionedUser(user.id)}
                      className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

          <div className="relative">
            {/* Mention Popover - Only show for support users */}
            {user?.type === UserTypeEnum.SUPPORT ? (
              <Popover
                open={isMentionOpen}
                onOpenChange={setIsMentionPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={handleTextChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                      disabled={isSubmitting}
                      rows={1}
                      className="bg-card focus:border-primary w-full resize-none rounded-xl border px-4 py-2 pr-10 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="hover:text-primary absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-0"
                  align="start"
                  side="top"
                  sideOffset={8}
                >
                  <div className="p-3">
                    <div className="space-y-2">
                      <Input
                        placeholder="Search support users..."
                        value={mentionSearchValue}
                        onChange={(e) => {
                          setMentionSearchValue(e.target.value);
                          setFocusedMentionIndex(-1);
                        }}
                        className="h-9"
                        onKeyDown={handleMentionInputKeyDown}
                        aria-activedescendant={
                          focusedMentionIndex >= 0 &&
                          supportUsers[focusedMentionIndex]
                            ? `mention-option-${supportUsers[focusedMentionIndex].id}`
                            : undefined
                        }
                        aria-controls="mentions-listbox"
                        role="combobox"
                        aria-expanded="true"
                      />
                      {isSearchingMentions ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 dark:border-gray-600 dark:border-t-purple-400"></div>
                            <span>Searching...</span>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-48">
                          <div
                            id="mentions-listbox"
                            role="listbox"
                            aria-multiselectable="true"
                            className="rounded-md border border-gray-200 dark:border-gray-600"
                          >
                            {supportUsers.length > 0 ? (
                              supportUsers.map(
                                (supportUser: ISupportUser, idx: number) => (
                                  <div
                                    id={`mention-option-${supportUser.id}`}
                                    key={supportUser.id}
                                    role="option"
                                    aria-selected={false}
                                    tabIndex={-1}
                                    className={cn(
                                      'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700',
                                      idx === focusedMentionIndex &&
                                        'bg-purple-50 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100'
                                    )}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleMentionSelect(supportUser);
                                    }}
                                    onMouseEnter={() =>
                                      setFocusedMentionIndex(idx)
                                    }
                                  >
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="bg-purple-100 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        {supportUser.name?.charAt(0) || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {supportUser.name}
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        {supportUser.email}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No support users found.
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={handleTextChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  disabled={isSubmitting}
                  rows={1}
                  className="bg-card w-full resize-none rounded-xl border px-4 py-2 pr-10 text-sm focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="hover:text-primary absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="text-muted-foreground text-sm">
            <p>
              Pro Tip : Press{' '}
              <span className="text-primary font-semibold">Enter</span> to
              submit comment
              {user?.type === UserTypeEnum.SUPPORT && (
                <>
                  , type <span className="text-primary font-semibold">@</span>{' '}
                  to mention users
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div>
        {comments && comments.length > 0 ? (
          comments
            .filter((comment) => {
              // Filter out deleted comments
              if (comment.isDeleted) return false;

              // Filter out internal comments for non-support users
              if (comment.isInternal && user?.type !== UserTypeEnum.SUPPORT) {
                return false;
              }

              return true;
            })
            .map((comment) => (
              <React.Fragment key={comment.id}>
                <div className="group flex items-start gap-3 rounded-xl p-4 transition">
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-purple-100 text-xs font-semibold text-purple-600">
                      {comment.author?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Comment Body */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm font-semibold">
                          {comment.author?.name || 'Unknown User'}
                        </span>
                        <span className="text-primary flex items-center gap-1 text-xs">
                          (
                          {comment.author?.id === user?.id
                            ? 'Me'
                            : `${formatEnumValue(
                                comment.author?.type as UserTypeEnum
                              )} - ${comment.author?.role ? formatEnumValue(comment.author.role) : ''}`}
                          )
                        </span>
                        {comment.isInternal && (
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700"
                          >
                            Internal
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {formatDateAndTime(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                      {highlightMentions(comment.content)}
                    </p>
                  </div>
                </div>
                <Separator className="my-1" />
              </React.Fragment>
            ))
        ) : (
          <div className="text-muted-foreground py-10 text-center">
            <MessageCircle className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">No comments yet</p>
            <p className="text-xs">Be the first to contribute!</p>
          </div>
        )}
      </div>
    </div>
  );
}
