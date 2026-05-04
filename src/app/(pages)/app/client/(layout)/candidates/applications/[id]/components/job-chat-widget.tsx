'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Minimize2,
  Maximize2,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logger } from '@/lib/logger';
import {
  useGetExistingChatByApplicationId,
  useGetJobRelatedMessages,
  useSendJobMessage,
} from '@/lib/services/chat-service/job-chat-service';
import { upsertJobRelatedChat } from '@/lib/services/chat-service/job-chat-service';
import { Id } from '../../../../../../../../../../convex/_generated/dataModel';
import { useCandidateOnlineStatus } from '@/lib/services/chat-service/user.service';

interface JobChatWidgetProps {
  jobPostingId: string;
  applicationId: string;
  jobTitle: string;
  candidateId: string;
  candidateJobTitle: string;
  candidateUserId: string;
  candidateName: string;
  hiringManagerId: string;
  clientId: string;
  clientName: string;
  candidateImageUrl: string;
}

export const JobChatWidget: React.FC<JobChatWidgetProps> = ({
  jobPostingId,
  applicationId,
  jobTitle,
  candidateId,
  candidateJobTitle,
  candidateUserId,
  candidateName,
  hiringManagerId,
  clientId,
  clientName,
  candidateImageUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] =
    useState<Id<'conversations'> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat hooks
  const sendMessage = useSendJobMessage();
  const existingChat = useGetExistingChatByApplicationId(applicationId);
  const messagesData = useGetJobRelatedMessages(
    conversationId,
    applicationId,
    50,
    undefined
  );

  const messages = messagesData?.filter((msg) => msg.messageType !== 'system');

  // Initialize conversation when existing chat is found
  useEffect(() => {
    if (existingChat && !conversationId) {
      setConversationId(existingChat._id);
    }
  }, [existingChat, conversationId]);

  const upsertJobChat = async () => {
    try {
      const result = await upsertJobRelatedChat(
        jobPostingId,
        applicationId,
        jobTitle,
        candidateId,
        candidateUserId,
        candidateName,
        hiringManagerId,
        clientId,
        clientName
      );
      if (result.success && result.conversationId) {
        setConversationId(result.conversationId);
        return result.conversationId;
      } else {
        logger.error('Failed to start job chat:', result);
      }
    } catch (error) {
      logger.error('Error starting job chat:', error);
    }
    return null;
  };

  const { isCandidateOnline } = useCandidateOnlineStatus(candidateUserId);
  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      let currentConversationId = conversationId;

      // If no conversation exists, create one first
      if (!currentConversationId) {
        currentConversationId = await upsertJobChat();
        if (!currentConversationId) {
          throw new Error('Failed to create conversation');
        }
      }

      // Send the message
      await sendMessage({
        conversationId: currentConversationId,
        senderId: clientId,
        senderType: 'client',
        content: messageContent,
        messageType: 'text',
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      // Optionally show error to user
    } finally {
      setIsSending(false);
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="text-muted-foreground h-3 w-3" />;
      case 'sent':
        return <CheckCircle className="text-muted-foreground h-3 w-3" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-purple-500" />;
      case 'read':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  // Get candidate initials for avatar fallback
  const getCandidateInitials = () => {
    return candidateName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed right-6 bottom-6 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group relative cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            {/* Pulsing background effect */}
            <div className="from-primary to-primary/70 absolute inset-0 animate-pulse rounded-full bg-gradient-to-r opacity-20" />

            {/* Main button with icon */}
            <div className="from-primary to-primary/70 relative rounded-full bg-gradient-to-r p-4 shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />

              {/* Unread count badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 p-0 text-xs font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed right-6 bottom-6 z-50 w-[450px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="overflow-hidden border-0 bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-gray-900/95">
              {/* Header */}
              <CardHeader className="bg-primary relative overflow-hidden p-4 text-white dark:bg-purple-700">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarImage
                            src={candidateImageUrl}
                            alt={candidateName}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-primary bg-white text-sm font-semibold">
                            {getCandidateInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>

                      {/* Animated status indicator */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"
                      >
                        <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-75" />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CardTitle className="text-base font-semibold text-white">
                        {candidateName}
                      </CardTitle>
                      <p className="flex flex-wrap items-center gap-1 text-sm text-white/90">
                        {candidateJobTitle} •{' '}
                        {isCandidateOnline ? 'Online' : 'Offline'}
                      </p>
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsMinimized(!isMinimized);
                      }}
                      className="text-white transition-colors hover:bg-white/20"
                    >
                      {isMinimized ? (
                        <div className="relative">
                          <Maximize2 className="h-4 w-4" />
                          {unreadCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-500 p-0 text-[10px] font-bold text-white">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Minimize2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-white transition-colors hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Content */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Messages */}
                      <div className="custom-scrollbar-thin h-[500px] space-y-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white p-4 dark:from-gray-900/50 dark:to-gray-900">
                        {(!messages || messages.length === 0) && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 text-center"
                          >
                            <div className="space-y-2">
                              <div className="text-4xl">👋</div>
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Start a conversation with {candidateName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Send a message to begin discussing the{' '}
                                {jobTitle} position
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {messages?.map((message, index) => (
                          <motion.div
                            key={message._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex ${message.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] space-y-1 ${
                                message.senderType === 'client'
                                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                  : 'border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
                              } rounded-2xl p-3 ${message.senderType === 'candidate' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                            >
                              {message.senderType === 'candidate' && (
                                <div className="mb-1 flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={candidateImageUrl}
                                      alt={candidateName}
                                    />
                                    <AvatarFallback className="bg-purple-100 text-xs text-purple-600">
                                      {getCandidateInitials()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {candidateName}
                                  </span>
                                </div>
                              )}
                              <p
                                className={`text-sm ${message.senderType === 'client' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}
                              >
                                {message.content}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span
                                  className={`text-xs ${message.senderType === 'client' ? 'text-white/70' : 'text-gray-400'}`}
                                >
                                  {new Date(
                                    message._creationTime
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {message.senderType === 'client' && (
                                  <div className="ml-2">
                                    {getMessageStatusIcon(message.status)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <div className="border-t bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex gap-2">
                          <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyDown={(e) =>
                              e.key === 'Enter' &&
                              !e.shiftKey &&
                              handleSendMessage()
                            }
                            disabled={isSending}
                            className="flex-1 rounded-full border-gray-200 px-4 focus:border-purple-400 focus:ring-purple-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-purple-500 dark:focus:ring-purple-500"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isSending}
                            size="sm"
                            className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-4 shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
                          >
                            {isSending ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
