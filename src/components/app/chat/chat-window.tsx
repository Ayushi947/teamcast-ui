'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Info,
  Users,
  Image,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import {
  useGetMessages,
  useSendMessage,
  useTypingIndicator,
  ConvexUserType,
  useGetConversation,
} from '@/lib/services/chat-service/chat.service';
import { Id } from '../../../../convex/_generated/dataModel';
import { logger } from '@/lib/logger';
import { useMarkMessagesAsRead } from '@/lib/hooks/convex-chat-hooks/messages-read-receipts-hooks';
interface ChatWindowProps {
  conversationId: Id<'conversations'>;
  userId: string;
  userType: ConvexUserType;
  userName: string;
  onBack?: () => void;
}

interface Message {
  _id: Id<'messages'>;
  conversationId: Id<'conversations'>;
  senderId: string;
  senderType: ConvexUserType;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system' | 'announcement';
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
    thumbnailUrl?: string;
  }>;
  status: 'sent' | 'delivered' | 'read' | 'edited' | 'deleted';
  replyToMessageId?: Id<'messages'>;
  replyToMessage?: Message;
  threadRootId?: Id<'messages'>;
  createdAt: number;
  updatedAt: number;
  systemMessageType?: string;
  systemMessageData?: any;
  reactions?: Array<{
    userId: string;
    userType: ConvexUserType;
    reaction: string;
    createdAt: number;
  }>;
  isEdited?: boolean;
  isDeleted?: boolean;
  readBy?: Array<{
    userId: string;
    userType: ConvexUserType;
    readAt: number;
  }>;
  readReceipts?: any[];
  senderName?: string;
}

export function ChatWindow({
  conversationId,
  userId,
  userName,
  userType,
  onBack,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSendingRef = useRef<boolean>(false);

  // Hooks
  const messages = useGetMessages(conversationId, userId, 50);
  const sendMessage = useSendMessage();
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(
    conversationId,
    userId,
    userType
  );

  // Get conversation data
  const conversation = useGetConversation(conversationId, userId);
  const { markMessagesAsRead } = useMarkMessagesAsRead();
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  }, [messages]);

  // Debounced function to mark messages as read
  const debouncedMarkMessagesRead = useCallback(async () => {
    if (
      conversationId &&
      userId &&
      messages &&
      messages.length > 0 &&
      !isSendingRef.current
    ) {
      try {
        // Get unread message IDs
        const unreadMessageIds = messages
          .filter(
            (msg) =>
              // Message is not from current user
              msg.senderId !== userId &&
              // Message has no read receipt from current user
              !msg.readReceipts?.some((receipt) => receipt.userId === userId)
          )
          .map((msg) => msg._id);

        if (unreadMessageIds.length > 0) {
          await markMessagesAsRead(conversationId, userId, unreadMessageIds);
        }
      } catch (error) {
        logger.error('Error marking messages as read:', error);
      }
    }
  }, [conversationId, userId, messages, markMessagesAsRead]);

  // Mark messages as read when conversation is opened or new messages arrive
  useEffect(() => {
    // Clear any existing timeout
    if (markReadTimeoutRef.current) {
      clearTimeout(markReadTimeoutRef.current);
    }

    // Set a timeout to mark messages as read after a delay
    // This prevents race conditions with sendMessage
    markReadTimeoutRef.current = setTimeout(() => {
      debouncedMarkMessagesRead();
      markReadTimeoutRef.current = null;
    }, 1000); // 1 second delay

    return () => {
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current);
        markReadTimeoutRef.current = null;
      }
    };
  }, [conversationId, userId, messages, debouncedMarkMessagesRead]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageText]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      // Set flag to prevent markMessagesAsRead from running during send
      isSendingRef.current = true;

      await sendMessage({
        conversationId,
        senderId: userId,
        senderName: userName,
        senderType: userType as 'candidate' | 'client' | 'partner' | 'support',
        content,
        messageType: 'text',
        replyToMessageId: replyToMessage?._id,
      });

      setReplyToMessage(null);

      // Add a small delay before allowing markMessagesAsRead to run again
      setTimeout(() => {
        isSendingRef.current = false;
      }, 500);
    } catch (error) {
      toast.error('Failed to send message');
      logger.error('Send message error:', error);
      setMessageText(content); // Restore message text on error
      isSendingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      stopTyping();
    } else {
      // Start typing indicator when user types
      startTyping();

      // Clear previous timeout if it exists
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after 5 seconds of inactivity
      // This is a backup to the service's own timeout
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
        typingTimeoutRef.current = null;
      }, 5000);
    }
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
    textareaRef.current?.focus();
  };

  const clearReply = () => {
    setReplyToMessage(null);
  };

  const handleReplyContextClick = (messageId: Id<'messages'>) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      // Add a brief highlight effect
      messageElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
      setTimeout(() => {
        messageElement.classList.remove(
          'ring-2',
          'ring-primary',
          'ring-opacity-50'
        );
      }, 2000);
    }
  };

  const getConversationTitleName = (conversation: any): string => {
    if (!conversation || !conversation.title) return 'Untitled Conversation';

    const participants = conversation.title
      .split('&')
      .map((name: string) => name.trim())
      .filter((name: string) => name !== userName);

    return participants.join(' & ') || 'Untitled Conversation';
  };

  const getConversationSubtitle = (): string => {
    // This would show participant count, online status, etc.
    const onlineUsers = typingUsers.length;
    return onlineUsers > 0 ? `${onlineUsers} typing...` : 'Active now';
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      // Here you would typically upload the file to your storage service
      // and get back a URL to use in the message
      toast.promise(
        (async () => {
          // Set flag to prevent markMessagesAsRead from running during send
          isSendingRef.current = true;

          // Simulate file upload
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // In a real implementation, you would upload the file and get back a URL
          const mockFileUrl = URL.createObjectURL(file);

          await sendMessage({
            conversationId,
            senderId: userId,
            senderName: userName,
            senderType: userType as
              | 'candidate'
              | 'client'
              | 'partner'
              | 'support',
            content: `Sent a file: ${file.name}`,
            messageType: 'file',
            attachments: [
              {
                id: Math.random().toString(36).substring(7),
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                url: mockFileUrl,
              },
            ],
            replyToMessageId: replyToMessage?._id,
          });

          setReplyToMessage(null);

          // Add a small delay before allowing markMessagesAsRead to run again
          setTimeout(() => {
            isSendingRef.current = false;
          }, 500);

          return true;
        })(),
        {
          loading: 'Uploading file...',
          success: 'File sent successfully',
          error: 'Failed to send file',
        }
      );
    } catch (error) {
      toast.error('Failed to upload file');
      logger.error('File upload error:', error);
      isSendingRef.current = false;
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      // Here you would typically upload the image to your storage service
      // and get back a URL to use in the message
      toast.promise(
        (async () => {
          // Set flag to prevent markMessagesAsRead from running during send
          isSendingRef.current = true;

          // Simulate image upload
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // In a real implementation, you would upload the image and get back a URL
          const mockImageUrl = URL.createObjectURL(file);

          await sendMessage({
            conversationId,
            senderId: userId,
            senderName: userName,
            senderType: userType as
              | 'candidate'
              | 'client'
              | 'partner'
              | 'support',
            content: 'Sent an image',
            messageType: 'image',
            attachments: [
              {
                id: Math.random().toString(36).substring(7),
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                url: mockImageUrl,
                thumbnailUrl: mockImageUrl,
              },
            ],
            replyToMessageId: replyToMessage?._id,
          });

          setReplyToMessage(null);

          // Add a small delay before allowing markMessagesAsRead to run again
          setTimeout(() => {
            isSendingRef.current = false;
          }, 500);

          return true;
        })(),
        {
          loading: 'Uploading image...',
          success: 'Image sent successfully',
          error: 'Failed to send image',
        }
      );
    } catch (error) {
      toast.error('Failed to upload image');
      logger.error('Image upload error:', error);
      isSendingRef.current = false;
    }

    // Reset the input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Cleanup typing timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current);
        markReadTimeoutRef.current = null;
      }
      stopTyping();
    };
  }, [stopTyping]);

  if (!messages) {
    return (
      <div className="flex h-full flex-col">
        <div className="bg-background flex h-full items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground text-sm">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="bg-background flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-sm font-medium">
                {getConversationTitleName(conversation).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h3 className="text-foreground truncate text-sm font-semibold">
                {getConversationTitleName(conversation)}
              </h3>
              <p className="text-muted-foreground truncate text-xs">
                {getConversationSubtitle()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Info className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  View Participants
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Info className="mr-2 h-4 w-4" />
                  Conversation Info
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Leave Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className="flex-1 overflow-y-auto p-4 dark:bg-gray-900"
        type="always"
      >
        <div className="relative min-h-full overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-center text-sm">
                No messages yet. Start a conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pb-2">
              {messages.map((message) => (
                <div
                  key={message._id}
                  ref={(el) => {
                    if (el) {
                      messageRefs.current.set(message._id, el);
                    } else {
                      messageRefs.current.delete(message._id);
                    }
                  }}
                >
                  <MessageBubble
                    message={message as Message}
                    isOwnMessage={message.senderId === userId}
                    showAvatar={true}
                    showTimestamp={true}
                    showReactions={true}
                    onReply={() => handleReplyToMessage(message as Message)}
                    onReplyContextClick={handleReplyContextClick}
                  />
                </div>
              ))}
              {/* Show typing indicator at the end of messages */}
              {typingUsers.length > 0 && (
                <TypingIndicator
                  typingUsers={typingUsers}
                  position="inline"
                  className="mt-2"
                />
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Preview */}
      {replyToMessage && (
        <div className="bg-muted/30 border-t px-4 py-3">
          <div className="bg-background flex items-center justify-between rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-primary text-xs font-medium">
                  Replying to{' '}
                  {replyToMessage.senderId === userId ? 'yourself' : 'message'}
                </span>
              </div>
              <p className="text-muted-foreground truncate text-sm">
                {replyToMessage.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearReply}
              className="ml-2 h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Message Input */}
      <div className="bg-background sticky bottom-0 border-t p-4">
        <div className="flex items-end gap-3">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="max-h-[120px] min-h-[40px] resize-none pr-12 text-sm"
              rows={1}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            size="sm"
            className="h-10 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
