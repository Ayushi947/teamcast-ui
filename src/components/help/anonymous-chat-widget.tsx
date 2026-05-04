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
  Headphones,
  Sparkles,
  Bot,
  User,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logger } from '@/lib/logger';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { type Doc } from '../../../convex/_generated/dataModel';
import { useCreateAnonymousChat } from '@/lib/hooks/convex-chat-hooks/support-chat-hooks';
import { useGetSupportChatConfig } from '@/lib/services/chat-service/anonymous-chat.service';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  agentName?: string;
  agentAvatar?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface ServerMessage extends Doc<'messages'> {
  content: string;
  createdAt: number;
  senderType: 'support' | 'anonymous';
  senderId: string;
  senderName?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  readReceipts?: Array<{
    userId: string;
    readAt: number;
  }>;
}

// Support agent info
const supportAgent = {
  id: 'support-agent',
  name: 'Teamcast Support',
  email: 'hello@teamcast.ai',
  avatar: '/images/support-avatar.png',
  status: 'online',
  responseTime: '5 minutes',
};

// Suggested messages for quick replies
const suggestedMessages = [
  { text: 'How can I create an account?', icon: User },
  { text: 'What features does Teamcast offer?', icon: Sparkles },
  { text: 'How do I post a job?', icon: Zap },
  { text: 'I need help with my profile', icon: Bot },
];

export const AnonymousChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supportChatConfig = useGetSupportChatConfig();
  const now = new Date();
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(
    Date.now()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { createChat, sessionId, conversationId } = useCreateAnonymousChat(
    supportAgent?.email ?? ''
  );

  // Subscribe to messages if we have a conversation
  const serverMessages = useQuery(
    api.services.chat.messages_management.getMessages,
    conversationId
      ? {
          conversationId: conversationId as Id<'conversations'>,
          userId: `anonymous-${sessionId}`,
          limit: 100,
        }
      : 'skip'
  ) as ServerMessage[] | undefined;

  // Update unread count when new messages arrive
  useEffect(() => {
    if (
      serverMessages &&
      Array.isArray(serverMessages) &&
      serverMessages?.length > 0
    ) {
      // Count messages that are:
      // 1. From the support agent (not from the anonymous user)
      // 2. Newer than the last read timestamp
      // 3. Not already seen (if chat is open and not minimized)
      const newUnreadCount = serverMessages.filter(
        (msg: ServerMessage) =>
          msg.senderType === 'support' &&
          msg.createdAt > lastReadTimestamp &&
          !(isOpen && !isMinimized)
      )?.length;

      setUnreadCount(newUnreadCount);
    }
  }, [serverMessages, lastReadTimestamp, isOpen, isMinimized]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setLastReadTimestamp(Date.now());
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Update messages when server messages change
  useEffect(() => {
    if (serverMessages && Array.isArray(serverMessages)) {
      const formattedMessages: ChatMessage[] = serverMessages.map(
        (msg: ServerMessage) => ({
          id: msg._id,
          type: msg.senderType === 'anonymous' ? 'user' : 'agent',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          agentName:
            msg.senderType === 'anonymous' ? undefined : msg.senderName,
          agentAvatar:
            msg.senderType === 'anonymous' ? undefined : supportAgent.avatar,
          status: msg.status,
        })
      );
      setMessages(formattedMessages);
    }
  }, [serverMessages]);

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

  const addMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    try {
      if (message.type === 'user' && sessionId) {
        await createChat(message.content);
      }
    } catch (error) {
      logger.error('Error sending anonymous message:', error);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    addMessage({
      type: 'user',
      content: inputMessage,
    });

    setInputMessage('');

    if (!chatStarted) {
      setChatStarted(true);
    }
  };

  const handleQuickMessage = (message: string) => {
    addMessage({
      type: 'user',
      content: message,
    });

    if (!chatStarted) {
      setChatStarted(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
  const isWorkingHours =
    now.getHours() >= parseInt(supportChatConfig?.workingHours?.start ?? '0') &&
    now.getHours() <= parseInt(supportChatConfig?.workingHours?.end ?? '23');

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
            className="relative cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            {/* Pulsing background effect */}
            <div className="from-primary to-primary/70 absolute inset-0 animate-pulse rounded-full bg-gradient-to-r opacity-20" />

            {/* Main button with icon */}
            <div className="from-primary to-primary/70 relative rounded-full bg-gradient-to-r p-4 shadow-lg">
              <Headphones className="h-6 w-6 text-white" />

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
            className="fixed right-6 bottom-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
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
                        <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-200">
                          <img
                            src={'/logos/teamcast-t-logo.svg'}
                            alt={supportAgent.name}
                            className="h-6 w-6"
                          />
                        </div>
                      </motion.div>

                      {/* Animated status indicator */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(isWorkingHours ? (supportChatConfig?.availabilityStatus ?? 'offline') : 'offline')}`}
                      >
                        {isWorkingHours &&
                          supportChatConfig?.availabilityStatus ===
                            'online' && (
                            <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-75" />
                          )}
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CardTitle className="text-base font-semibold text-white">
                        {supportAgent.name}
                      </CardTitle>
                      <p className="flex flex-wrap items-center gap-1 text-sm text-white/90">
                        {isWorkingHours
                          ? supportChatConfig?.availabilityStatus === 'online'
                            ? 'Online'
                            : supportChatConfig?.availabilityStatus === 'away'
                              ? 'Away'
                              : 'Offline'
                          : `${supportChatConfig?.workingHours?.start} - ${supportChatConfig?.workingHours?.end}`}
                      </p>
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsMinimized(!isMinimized);
                        if (!isMinimized) {
                          // When minimizing, update the last read timestamp
                          setLastReadTimestamp(Date.now());
                        }
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
                      <div className="custom-scrollbar-thin h-96 space-y-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white p-4 dark:from-gray-900/50 dark:to-gray-900">
                        {messages?.length === 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 text-center"
                          >
                            <div className="space-y-2">
                              <div className="text-4xl">👋</div>
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Welcome to Teamcast Support!
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                We&apos;re here to help you get the most out of
                                Teamcast
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                Quick questions:
                              </p>
                              <div className="space-y-2">
                                {suggestedMessages.map((message, index) => {
                                  const IconComponent = message.icon;
                                  return (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="group h-auto w-full justify-start p-3 text-left transition-all duration-200 hover:border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50 dark:border-gray-700 dark:hover:border-purple-800 dark:hover:from-purple-950/30 dark:hover:to-purple-950/30"
                                        onClick={() =>
                                          handleQuickMessage(message.text)
                                        }
                                      >
                                        <IconComponent className="mr-2 h-4 w-4 text-purple-500 transition-colors group-hover:text-purple-500" />
                                        {message.text}
                                      </Button>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] space-y-1 ${
                                message.type === 'user'
                                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                  : 'border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
                              } rounded-2xl p-3 ${message.type === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                            >
                              {message.type === 'agent' && (
                                <div className="mb-1 flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={supportAgent.avatar}
                                      alt={supportAgent.name}
                                    />
                                    <AvatarFallback className="bg-purple-100 text-xs text-purple-600">
                                      {supportAgent.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {supportAgent.name}
                                  </span>
                                </div>
                              )}
                              <p
                                className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}
                              >
                                {message.content}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span
                                  className={`text-xs ${message.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}
                                >
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {message.type === 'user' && (
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
                              e.key === 'Enter' && handleSendMessage()
                            }
                            className="flex-1 rounded-full border-gray-200 px-4 focus:border-purple-400 focus:ring-purple-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-purple-500 dark:focus:ring-purple-500"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            size="sm"
                            className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-4 shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
                          >
                            <Send className="h-4 w-4" />
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
