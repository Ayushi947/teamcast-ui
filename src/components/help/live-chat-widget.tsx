'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logger } from '@/lib/logger';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  agentName?: string;
  agentAvatar?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface SupportAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  specialties: string[];
  responseTime: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
}

const mockAgent: SupportAgent = {
  id: '1',
  name: 'Sarah Johnson',
  avatar: '/images/team/sarah.jpg',
  status: 'online',
  specialties: ['Technical Support', 'Account Setup', 'Billing'],
  responseTime: '< 2 min',
};

const quickActions: QuickAction[] = [
  {
    id: 'schedule-call',
    label: 'Schedule a Call',
    icon: Phone,
    action: () => logger.info('Schedule call'),
  },
  {
    id: 'send-email',
    label: 'Send Email',
    icon: Mail,
    action: () => logger.info('Send email'),
  },
  {
    id: 'book-demo',
    label: 'Book Demo',
    icon: Calendar,
    action: () => logger.info('Book demo'),
  },
];

const suggestedMessages = [
  'I need help setting up my account',
  'How do I create a job posting?',
  'I&apos;m having trouble with billing',
  'Can you help me with AI matching?',
];

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate agent typing
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
        addMessage({
          type: 'agent',
          content:
            'Hi! I&apos;m Sarah from Teamcast support. How can I help you today?',
          agentName: mockAgent.name,
          agentAvatar: mockAgent.avatar,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: message.type === 'user' ? 'sent' : undefined,
    };
    setMessages((prev) => [...prev, newMessage]);

    if (message.type === 'agent' && isMinimized) {
      setUnreadCount((prev) => prev + 1);
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
      setIsTyping(true);
    } else {
      // Simulate agent response
      setTimeout(() => {
        addMessage({
          type: 'agent',
          content:
            'Thanks for your message! I&apos;ll help you with that right away.',
          agentName: mockAgent.name,
          agentAvatar: mockAgent.avatar,
        });
      }, 1500);
    }
  };

  const handleQuickMessage = (message: string) => {
    addMessage({
      type: 'user',
      content: message,
    });

    if (!chatStarted) {
      setChatStarted(true);
      setIsTyping(true);
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
        return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed right-6 bottom-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-primary hover:bg-primary/90 relative h-14 w-14 rounded-full shadow-lg"
            >
              <MessageCircle className="h-6 w-6 text-white" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full p-0">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed right-6 bottom-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <Card className="border-0 shadow-2xl">
              {/* Header */}
              <CardHeader className="bg-primary rounded-t-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={mockAgent.avatar}
                          alt={mockAgent.name}
                        />
                        <AvatarFallback className="text-primary bg-white">
                          {mockAgent.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(mockAgent.status)}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base text-white">
                        {mockAgent.name}
                      </CardTitle>
                      <p className="text-sm text-white/80">
                        {mockAgent.status === 'online' ? 'Online' : 'Away'} •
                        Responds in {mockAgent.responseTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsMinimized(!isMinimized);
                        if (isMinimized) setUnreadCount(0);
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      {isMinimized ? (
                        <Maximize2 className="h-4 w-4" />
                      ) : (
                        <Minimize2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20"
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
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Messages */}
                      <div className="h-96 space-y-4 overflow-y-auto p-4">
                        {messages.length === 0 && !isTyping && (
                          <div className="space-y-4 text-center">
                            <div className="text-muted-foreground text-sm">
                              👋 Welcome to Teamcast Support!
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                Quick questions:
                              </p>
                              <div className="space-y-1">
                                {suggestedMessages.map((message, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="h-auto w-full justify-start p-2 text-left"
                                    onClick={() => handleQuickMessage(message)}
                                  >
                                    {message}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] space-y-1 ${
                                message.type === 'user'
                                  ? 'bg-primary text-white'
                                  : 'bg-muted'
                              } rounded-lg p-3`}
                            >
                              {message.type === 'agent' && (
                                <div className="mb-1 flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={message.agentAvatar}
                                      alt={message.agentName}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {message.agentName
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium">
                                    {message.agentName}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs opacity-70">
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {message.type === 'user' &&
                                  getMessageStatusIcon(message.status)}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={mockAgent.avatar}
                                    alt={mockAgent.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {mockAgent.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex space-x-1">
                                  <div className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full" />
                                  <div className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full delay-75" />
                                  <div className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full delay-150" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>

                      {/* Quick Actions */}
                      {chatStarted && (
                        <div className="border-t p-3">
                          <div className="flex gap-2">
                            {quickActions.map((action) => (
                              <Button
                                key={action.id}
                                variant="outline"
                                size="sm"
                                onClick={action.action}
                                className="flex flex-1 items-center gap-2"
                              >
                                <action.icon className="h-4 w-4" />
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Input */}
                      <div className="border-t p-4">
                        <div className="flex gap-2">
                          <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyDown={(e) =>
                              e.key === 'Enter' && handleSendMessage()
                            }
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            size="sm"
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
