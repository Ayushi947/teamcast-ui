'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Reply,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  CheckCheck,
  Check,
  FileText,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import {
  MessageType,
  ConvexUserType,
  formatMessageTime,
} from '@/lib/services/chat-service/chat.service';
import { Id } from '../../../../convex/_generated/dataModel';
import { logger } from '@/lib/logger';

interface Message {
  _id: Id<'messages'>;
  conversationId: Id<'conversations'>;
  senderId: string;
  senderType: ConvexUserType;
  content: string;
  messageType: MessageType;
  replyToMessageId?: Id<'messages'>;
  replyToMessage?: Message;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
    thumbnailUrl?: string;
  }>;
  reactions?: Array<{
    userId: string;
    userType: ConvexUserType;
    reaction: string;
    createdAt: number;
  }>;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: number;
  updatedAt: number;
  readBy?: Array<{
    userId: string;
    userType: ConvexUserType;
    readAt: number;
  }>;
  // Additional fields from API
  senderName?: string;
  status?: string;
  systemMessageType?: string;
  systemMessageData?: any;
  readReceipts?: any[];
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  showReactions: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: Id<'messages'>, content: string) => void;
  onDelete?: (messageId: Id<'messages'>) => void;
  onReact?: (messageId: Id<'messages'>, reaction: string) => void;
  onCopy?: (content: string) => void;
  onReport?: (messageId: Id<'messages'>) => void;
  onReplyContextClick?: (messageId: Id<'messages'>) => void;
  _currentUserId?: string; // Prefix with underscore since it's unused
  className?: string;
}

export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  showTimestamp,
  onReply,
  onDelete,
  onCopy,
  onReplyContextClick,
  className,
}: MessageBubbleProps) {
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.(message.content);
    toast.success('Message copied to clipboard');
  };

  logger.info('message', message);

  const handleReply = () => {
    onReply?.(message);
  };

  const handleDelete = () => {
    onDelete?.(message._id);
  };

  const getMessageStatus = () => {
    if (message.isDeleted) {
      return { icon: <Trash2 className="h-3 w-3" />, text: 'Deleted' };
    }

    if (message.isEdited) {
      return { icon: <Edit className="h-3 w-3" />, text: 'Edited' };
    }

    // Check if message is read
    if (message.readBy) {
      const isRead = message.readBy.length > 0;
      if (isRead) {
        return { icon: <CheckCheck className="h-3 w-3" />, text: 'Read' };
      }
    }

    return { icon: <Check className="h-3 w-3" />, text: 'Sent' };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSenderInitials = (senderId: string): string => {
    // This would typically come from user data
    return senderId.slice(0, 2).toUpperCase();
  };

  const getSenderDisplayName = (
    senderId: string,
    senderType: ConvexUserType,
    senderName?: string
  ): string => {
    // This would typically come from user data
    if (senderId === 'system') return 'System';
    return (
      senderName ||
      `${senderType.charAt(0).toUpperCase()}${senderType.slice(1)}`
    );
  };

  // Handle system messages
  if (message.messageType === 'system') {
    return (
      <div className={cn('flex justify-center py-2', className)}>
        <div className="bg-muted/50 text-muted-foreground rounded-full px-3 py-1 text-xs">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex gap-3 py-1',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs font-medium">
            {getSenderInitials(message.senderId)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div
        className={cn('flex max-w-[75%] flex-col', isOwnMessage && 'items-end')}
      >
        {/* Sender Info */}
        {!isOwnMessage && showAvatar && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-foreground text-xs font-medium">
              {getSenderDisplayName(
                message.senderId,
                message.senderType,
                message.senderName
              )}
            </span>
            {showTimestamp && (
              <span className="text-muted-foreground text-xs">
                {formatMessageTime(message.createdAt)}
              </span>
            )}
          </div>
        )}

        {/* Reply Context */}
        {message.replyToMessage && (
          <div
            className="bg-muted/50 border-primary/50 hover:bg-muted/70 mb-2 cursor-pointer rounded-r-md border-l-2 p-2 text-xs transition-colors"
            onClick={() => onReplyContextClick?.(message.replyToMessage!._id)}
          >
            <div className="text-muted-foreground flex items-center gap-1">
              <Reply className="h-3 w-3" />
              <span className="font-medium">
                {getSenderDisplayName(
                  message.replyToMessage.senderId,
                  message.replyToMessage.senderType,
                  message.replyToMessage.senderName
                )}
              </span>
            </div>
            <div className="text-foreground mt-1 truncate">
              {message.replyToMessage.content.length > 80
                ? `${message.replyToMessage.content.substring(0, 80)}...`
                : message.replyToMessage.content}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'relative rounded-lg px-3 py-2',
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'border-border bg-background border'
          )}
        >
          {/* Message Content */}
          <div className="space-y-2">
            {/* Text Content */}
            {message.content && (
              <p
                className={cn(
                  'text-sm leading-relaxed break-words whitespace-pre-wrap',
                  isOwnMessage ? 'text-primary-foreground' : 'text-foreground'
                )}
              >
                {message.content}
              </p>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border p-2',
                      isOwnMessage
                        ? 'border-primary-foreground/20 bg-primary-foreground/10'
                        : 'border-border bg-muted/50'
                    )}
                  >
                    {attachment.fileType.startsWith('image/') ? (
                      <div className="flex items-center gap-2">
                        {attachment.thumbnailUrl && (
                          <img
                            src={attachment.thumbnailUrl}
                            alt={attachment.fileName}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate text-xs font-medium',
                              isOwnMessage
                                ? 'text-primary-foreground'
                                : 'text-foreground'
                            )}
                          >
                            {attachment.fileName}
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              isOwnMessage
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'bg-muted flex h-10 w-10 items-center justify-center rounded'
                          )}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate text-xs font-medium',
                              isOwnMessage
                                ? 'text-primary-foreground'
                                : 'text-foreground'
                            )}
                          >
                            {attachment.fileName}
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              isOwnMessage
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.open(attachment.url, '_blank');
                      }}
                      className={cn(
                        'h-8 w-8 p-0',
                        isOwnMessage
                          ? 'text-primary-foreground hover:bg-primary-foreground/20'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div
            className={cn(
              'absolute top-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100',
              isOwnMessage ? '-left-12' : '-right-12'
            )}
          >
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="h-6 w-6 p-0"
              >
                <Reply className="h-3 w-3" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="mr-2 h-3 w-3" />
                  Copy
                </DropdownMenuItem>
                {onReply && (
                  <DropdownMenuItem onClick={handleReply}>
                    <Reply className="mr-2 h-3 w-3" />
                    Reply
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {isOwnMessage && onDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Message Footer */}
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs',
            isOwnMessage ? 'justify-end' : 'justify-start'
          )}
        >
          {/* Timestamp for own messages */}
          {isOwnMessage && showTimestamp && (
            <span className="text-muted-foreground">
              {formatMessageTime(message.createdAt)}
            </span>
          )}

          {/* Message Status */}
          {isOwnMessage && getMessageStatus().icon}

          {/* Edited Badge */}
          {message.isEdited && (
            <Badge variant="secondary" className="h-4 text-xs">
              {getMessageStatus().text}
            </Badge>
          )}
        </div>

        {/* Read Receipts */}
        {isOwnMessage && message.readBy && message.readBy.length > 0 && (
          <div className="mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReactionsMenu(!showReactionsMenu)}
              className="text-muted-foreground h-auto p-0 text-xs"
            >
              Read by {message.readBy.length}
            </Button>
            {showReactionsMenu && (
              <div className="bg-background mt-1 space-y-1 rounded border p-2 shadow-sm">
                {message.readBy.map((receipt) => (
                  <div
                    key={receipt.userId}
                    className="flex justify-between text-xs"
                  >
                    <span>
                      {getSenderDisplayName(receipt.userId, receipt.userType)}
                    </span>
                    <span className="text-muted-foreground">
                      {formatMessageTime(receipt.readAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
