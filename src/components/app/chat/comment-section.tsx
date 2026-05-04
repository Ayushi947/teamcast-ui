'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  MessageCircle,
  Heart,
  Reply,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  formatMessageTime,
  ConvexUserType,
} from '@/lib/services/chat-service/chat.service';
import {
  getUserDisplayName,
  getUserInitials,
  getUserTypeLabel,
  getUserTypeBadgeColor,
} from '@/lib/hooks/convex-chat-hooks/user-helpers';
import { Id } from '../../../../convex/_generated/dataModel';

interface Comment {
  _id: Id<'communityComments'>;
  postId: Id<'communityPosts'>;
  authorId: string;
  authorType: ConvexUserType;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: string[];
  replies: Comment[];
  createdAt: number;
  updatedAt: number;
  isEdited: boolean;
  isDeleted: boolean;
}

interface CommentSectionProps {
  postId: Id<'communityPosts'>;
  userId: string;
  userType: ConvexUserType;
  comments: Comment[];
  onCommentAdded?: (comment: Comment) => void;
  onCommentUpdated?: (
    commentId: Id<'communityComments'>,
    content: string
  ) => void;
  onCommentDeleted?: (commentId: Id<'communityComments'>) => void;
  onCommentLiked?: (commentId: Id<'communityComments'>, liked: boolean) => void;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  currentUserType: ConvexUserType;
  onReply: (commentId: Id<'communityComments'>, content: string) => void;
  onLike: (commentId: Id<'communityComments'>) => void;
  level?: number;
}

const CommentItem = ({
  comment,
  currentUserId,
  currentUserType,
  onReply,
  onLike,
  level = 0,
}: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      onReply(comment._id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
      toast.success('Reply added');
    } catch (_error) {
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxLevel = 3; // Limit nesting depth

  return (
    <div
      className={cn(
        'space-y-3',
        level > 0 && 'border-muted ml-6 border-l-2 pl-4'
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="" />
          <AvatarFallback className="text-xs font-medium">
            {getUserInitials(comment.authorId)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          {/* Comment Header */}
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-medium">
              {getUserDisplayName(
                comment.authorId,
                comment.authorType,
                currentUserId
              )}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                'px-2 py-0.5 text-xs',
                getUserTypeBadgeColor(comment.authorType)
              )}
            >
              {getUserTypeLabel(comment.authorType)}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {formatMessageTime(comment.createdAt)}
            </span>
          </div>

          {/* Comment Content */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(comment._id)}
              className="h-7 gap-1.5 px-2 text-xs"
            >
              <Heart className="h-3 w-3" />
              <span>{comment.likes.length}</span>
            </Button>

            {level < maxLevel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-7 gap-1.5 px-2 text-xs"
              >
                <Reply className="h-3 w-3" />
                Reply
              </Button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-7 gap-1.5 px-2 text-xs"
              >
                {showReplies ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                <span>
                  {comment.replies.length}{' '}
                  {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem>Report</DropdownMenuItem>
                {comment.authorId === currentUserId && (
                  <>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 space-y-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[70px] resize-none text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isSubmitting || !replyContent.trim()}
                  className="h-8 px-3"
                >
                  {isSubmitting ? 'Replying...' : 'Reply'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  className="h-8 px-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  currentUserId={currentUserId}
                  currentUserType={currentUserType}
                  onReply={onReply}
                  onLike={onLike}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function CommentSection({
  postId,
  userId,
  userType,
  comments,
  onCommentAdded,
  onCommentLiked,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  useState<Id<'communityComments'> | null>(null);

  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const comment: Comment = {
        _id: `comment_${Date.now()}` as Id<'communityComments'>,
        postId,
        authorId: userId,
        authorType: userType,
        authorName: 'Current User',
        content: newComment.trim(),
        likes: [],
        replies: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isEdited: false,
        isDeleted: false,
      };

      onCommentAdded?.(comment);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (_error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: Id<'communityComments'>) => {
    try {
      const comment = comments.find((c) => c._id === commentId);
      if (!comment) return;

      const isLiked = comment.likes.includes(userId);
      onCommentLiked?.(commentId, !isLiked);
    } catch (_error) {
      toast.error('Failed to like comment');
    }
  };

  const handleReplyToComment = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const reply: Comment = {
        _id: `comment_${Date.now()}` as Id<'communityComments'>,
        postId,
        authorId: userId,
        authorType: userType,
        authorName: 'Current User',
        content: replyContent.trim(),
        likes: [],
        replies: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isEdited: false,
        isDeleted: false,
      };
      setReplyContent('');
      toast.success('Reply added successfully');
      return reply;
    } catch (_error) {
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group comments by thread level
  // const topLevelComments = comments.filter(
  //   (comment) => comment.threadLevel === 0
  // );

  return (
    <div className={cn('space-y-4')}>
      {/* Comment Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setShowAllComments(!showAllComments)}
          className="h-9 gap-2 px-3"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </span>
          {showAllComments ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Collapsible open={showAllComments} onOpenChange={setShowAllComments}>
        <CollapsibleContent className="space-y-4">
          {/* Add Comment Form */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs font-medium">
                  {getUserInitials(userId)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[80px] resize-none text-sm"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pl-11">
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                className="h-8 px-4"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <ScrollArea className="max-h-96">
              <div className="space-y-4 pr-2">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    currentUserId={userId}
                    currentUserType={userType}
                    onReply={handleReplyToComment}
                    onLike={handleLikeComment}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-8 text-center">
              <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <MessageCircle className="text-muted-foreground h-6 w-6" />
              </div>
              <h4 className="text-foreground mb-1 text-sm font-medium">
                No comments yet
              </h4>
              <p className="text-muted-foreground text-xs">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
