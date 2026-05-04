'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OnlineUsersList } from './online-users-list';
import {
  useCreateConversation,
  createDirectChat,
  ConvexUserType,
} from '@/lib/services/chat-service/chat.service';
import { getUserTypeLabel } from '@/lib/hooks/convex-chat-hooks/user-helpers';
import { Id } from '../../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { useCreateSupportChat } from '@/lib/hooks/convex-chat-hooks/support-chat-hooks';
import {
  Loader2,
  X,
  MessageCircle,
  Users,
  HelpCircle,
  Building,
} from 'lucide-react';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userType: ConvexUserType;
  onConversationCreated: (conversationId: Id<'conversations'>) => void;
}

type ConversationType = 'direct' | 'job_related' | 'support' | 'internal';

interface SelectedUser {
  userId: string;
  userName: string;
  userType: ConvexUserType;
}

interface ChatFormData {
  title: string;
  description: string;
  type: ConversationType;
  selectedUser: SelectedUser | null;
}

const getConversationTypes = (userType: ConvexUserType) => {
  const types = [
    { value: 'direct', label: 'Direct Message', icon: MessageCircle },

    { value: 'internal', label: 'Internal/Team', icon: Building },
  ];

  if (userType !== 'candidate' && userType !== 'client') {
    types.push({ value: 'job_related', label: 'Job Related', icon: Users });
  }

  if (userType !== 'support') {
    types.push({ value: 'support', label: 'Support', icon: HelpCircle });
  }

  return types;
};

const INITIAL_FORM_STATE: ChatFormData = {
  title: '',
  description: '',
  type: 'direct',
  selectedUser: null,
};

export function NewChatDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userType,
  onConversationCreated,
}: NewChatDialogProps) {
  const [formData, setFormData] = useState<ChatFormData>(INITIAL_FORM_STATE);
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const createConversation = useCreateConversation();
  const {
    startSupportChat,
    loading: supportLoading,
    error: supportError,
  } = useCreateSupportChat();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Clear validation errors when form changes
  useEffect(() => {
    setValidationErrors({});
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Please enter a conversation title';
    }

    if (formData.type === 'direct' && !formData.selectedUser) {
      errors.selectedUser = 'Please select a user to chat with';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<ChatFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleTypeChange = useCallback(
    (newType: ConversationType) => {
      updateFormData({
        type: newType,
        selectedUser: null,
        title: newType === 'support' ? 'Support Request' : '',
      });
    },
    [updateFormData]
  );

  const handleUserSelection = useCallback(
    (user: SelectedUser) => {
      updateFormData({
        selectedUser: user,
        title: `${user.userName} & ${userName}`,
      });
    },
    [updateFormData, userName]
  );

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setValidationErrors({});
    setIsCreating(false);
  }, []);

  const createDirectConversation = async (): Promise<Id<'conversations'>> => {
    if (!formData.selectedUser) {
      throw new Error('No user selected for direct conversation');
    }

    const result = await createDirectChat(
      createConversation,
      userId,
      userName,
      userType,
      formData.selectedUser.userId,
      formData.selectedUser.userName,
      formData.selectedUser.userType,
      formData.title
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to create direct conversation');
    }

    return result.conversationId;
  };

  const createSupportConversation = async (): Promise<Id<'conversations'>> => {
    const result = await startSupportChat(userId, userName, userType);

    if (!result) {
      throw new Error('Failed to start support conversation');
    }

    logger.info('Support conversation started', result);
    return result;
  };

  const createRegularConversation = async (): Promise<Id<'conversations'>> => {
    return await createConversation({
      type: formData.type,
      title: formData.title,
      description: formData.description,
      participants: [
        {
          userId,
          userName,
          userType: userType as 'candidate' | 'client' | 'partner',
          role: 'admin',
        },
      ],
    });
  };

  const handleCreateNewChat = async () => {
    if (!validateForm()) return;

    setIsCreating(true);

    try {
      let conversationId: Id<'conversations'>;

      switch (formData.type) {
        case 'direct':
          conversationId = await createDirectConversation();
          break;
        case 'support':
          conversationId = await createSupportConversation();
          break;
        default:
          conversationId = await createRegularConversation();
      }

      onConversationCreated(conversationId);
      onOpenChange(false);
      toast.success('New conversation created successfully!');
    } catch (error) {
      logger.error('Error creating conversation:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create conversation'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  const isLoading = isCreating || supportLoading;
  const isFormValid =
    formData.title.trim() &&
    (formData.type !== 'direct' || formData.selectedUser);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Start New Conversation
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Create a new conversation with team members
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Conversation Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Conversation Type
            </Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getConversationTypes(userType).map(
                  ({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Conversation Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter conversation title..."
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              className={`w-full ${validationErrors.title ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-500">{validationErrors.title}</p>
            )}
          </div>

          {/* User Selection for Direct Messages */}
          {formData.type === 'direct' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Select User to Chat With *
              </Label>

              {formData.selectedUser ? (
                <div className="bg-muted/50 mb-2 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {formData.selectedUser.userName
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {formData.selectedUser.userName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {getUserTypeLabel(formData.selectedUser.userType)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateFormData({ selectedUser: null, title: '' })
                    }
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={
                    validationErrors.selectedUser
                      ? 'rounded-lg border border-red-500 p-2'
                      : ''
                  }
                >
                  <OnlineUsersList
                    currentUserId={userId}
                    currentUserName={userName}
                    currentUserType={userType}
                    onSelectUser={handleUserSelection}
                    selectionMode={true}
                    className="w-full justify-start"
                  />
                </div>
              )}

              {validationErrors.selectedUser && (
                <p className="text-sm text-red-500">
                  {validationErrors.selectedUser}
                </p>
              )}
            </div>
          )}

          {/* Description Field */}
          {formData.type !== 'support' && (
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the conversation..."
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                rows={3}
                className="resize-none"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Error Display */}
          {supportError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">
              Support chat error: {supportError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateNewChat}
              className="flex-1"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Conversation'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
