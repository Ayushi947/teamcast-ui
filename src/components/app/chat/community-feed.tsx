'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  MoreVertical,
  Plus,
  Users,
  Lightbulb,
  HelpCircle,
  FileText,
  Briefcase,
  Search,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CommentSection } from './comment-section';
import {
  getUserDisplayName,
  getUserInitials,
  getUserTypeLabel,
  getUserTypeBadgeColor,
} from '@/lib/hooks/convex-chat-hooks/user-helpers';
import {
  useGetCommunityPosts,
  useCreateCommunityPost,
  useInteractWithPost,
  useIncrementPostViewCount,
  useAddComment,
  PostType,
  InteractionType,
  ConvexUserType,
  formatMessageTime,
} from '@/lib/services/chat-service/chat.service';
import { Id } from '../../../../convex/_generated/dataModel';

interface CommunityFeedProps {
  userId: string;
  userType: ConvexUserType;
  className?: string;
}

// Type guard to check if user can interact with community
const canInteractWithCommunity = (
  userType: ConvexUserType
): userType is 'candidate' | 'partner' | 'support' => {
  return userType !== 'client';
};

interface Post {
  _id: Id<'communityPosts'>;
  authorId: string;
  authorType: ConvexUserType;
  title: string;
  content: string;
  postType: PostType;
  tags: string[];
  category?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  status: string;
  createdAt: number;
  updatedAt: number;
  recentComments?: any[];
}

const POST_TYPES: {
  value: PostType;
  label: string;
  icon: any;
  color: string;
}[] = [
  {
    value: 'discussion',
    label: 'Discussion',
    icon: MessageCircle,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  {
    value: 'experience_sharing',
    label: 'Experience',
    icon: Users,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  {
    value: 'job_tip',
    label: 'Job Tip',
    icon: Lightbulb,
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  {
    value: 'question',
    label: 'Question',
    icon: HelpCircle,
    color:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  {
    value: 'announcement',
    label: 'Announcement',
    icon: FileText,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  {
    value: 'resource_sharing',
    label: 'Resource',
    icon: Briefcase,
    color:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  },
];

const CATEGORIES = [
  'General',
  'Interview Tips',
  'Resume Help',
  'Career Advice',
  'Job Search',
  'Networking',
  'Salary Negotiation',
  'Skills Development',
  'Industry News',
  'Work-Life Balance',
];

export function CommunityFeed({
  userId,
  userType,
  className,
}: CommunityFeedProps) {
  const [selectedPostType, setSelectedPostType] = useState<
    PostType | undefined
  >();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>(
    'recent'
  );
  const expandedPost: string | null = null;

  // Post creation state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    postType: 'discussion' as PostType,
    tags: [] as string[],
    category: '',
  });
  const [tagInput, setTagInput] = useState('');

  // Hooks
  const posts = useGetCommunityPosts(selectedPostType, 20, 0);
  const createPost = useCreateCommunityPost();
  const interactWithPost = useInteractWithPost();
  const incrementViewCount = useIncrementPostViewCount();
  const addComment = useAddComment();

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    // Only allow candidates, partners, and support to create posts
    if (!canInteractWithCommunity(userType)) {
      toast.error('Clients cannot create community posts');
      return;
    }

    try {
      await createPost({
        authorId: userId,
        authorType: userType,
        title: newPost.title,
        content: newPost.content,
        postType: newPost.postType,
        tags: newPost.tags,
        category: newPost.category,
      });

      setShowCreatePost(false);
      setNewPost({
        title: '',
        content: '',
        postType: 'discussion',
        tags: [],
        category: '',
      });
      setTagInput('');
      toast.success('Post created successfully!');
    } catch (_error) {
      toast.error('Failed to create post');
    }
  };

  const handleInteraction = async (postId: string, type: InteractionType) => {
    // Only allow candidates, partners, and support to interact with posts
    if (!canInteractWithCommunity(userType)) {
      toast.error('Clients cannot interact with community posts');
      return;
    }

    try {
      await interactWithPost({
        postId: postId as Id<'communityPosts'>,
        userId,
        userType,
        interactionType: type,
      });

      if (type === 'like') {
        toast.success('Post liked!');
      } else if (type === 'share') {
        toast.success('Post shared!');
      } else if (type === 'bookmark') {
        toast.success('Post bookmarked!');
      }
    } catch (_error) {
      toast.error('Failed to interact with post');
    }
  };

  const handleViewPost = async (postId: string) => {
    try {
      await incrementViewCount({
        postId: postId as Id<'communityPosts'>,
        userId,
      });
    } catch (_error) {
      // Silently fail for view count
    }
  };

  const handleComment = async (
    postId: string,
    content: string,
    parentCommentId?: string
  ) => {
    // Only allow candidates, partners, and support to comment
    if (!canInteractWithCommunity(userType)) {
      toast.error('Clients cannot comment on community posts');
      return;
    }

    try {
      await addComment({
        postId: postId as Id<'communityPosts'>,
        authorId: userId,
        authorType: userType,
        content,
        parentCommentId: parentCommentId as Id<'communityComments'> | undefined,
      });

      toast.success('Comment added successfully!');
    } catch (_error) {
      toast.error('Failed to add comment');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost({ ...newPost, tags: [...newPost.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const getPostTypeConfig = (type: PostType) => {
    return POST_TYPES.find((t) => t.value === type) || POST_TYPES[0];
  };

  return (
    <div className={cn('bg-background flex h-full flex-col', className)}>
      {/* Header */}
      <div className="bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-foreground text-xl font-semibold">Community</h1>
            <Badge variant="secondary" className="text-xs">
              {posts?.length || 0} posts
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 pl-9 text-sm"
              />
            </div>

            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>

            {canInteractWithCommunity(userType) && (
              <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                <DialogTrigger asChild>
                  <Button className="h-9 px-4">
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                      Create New Post
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 pt-4">
                    {/* Post Type Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Post Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {POST_TYPES.map((type) => (
                          <Button
                            key={type.value}
                            variant={
                              newPost.postType === type.value
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() =>
                              setNewPost({ ...newPost, postType: type.value })
                            }
                            className="h-10 justify-start"
                          >
                            <type.icon className="mr-2 h-4 w-4" />
                            <span className="text-xs">{type.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        placeholder="Enter post title..."
                        value={newPost.title}
                        onChange={(e) =>
                          setNewPost({ ...newPost, title: e.target.value })
                        }
                        className="text-sm"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        placeholder="Share your thoughts, experiences, or questions..."
                        value={newPost.content}
                        onChange={(e) =>
                          setNewPost({ ...newPost, content: e.target.value })
                        }
                        rows={6}
                        className="resize-none text-sm"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Category (Optional)
                      </label>
                      <Select
                        value={newPost.category}
                        onValueChange={(value) =>
                          setNewPost({ ...newPost, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && (e.preventDefault(), addTag())
                          }
                          className="text-sm"
                        />
                        <Button onClick={addTag} variant="outline" size="sm">
                          Add
                        </Button>
                      </div>
                      {newPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newPost.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="cursor-pointer text-xs"
                              onClick={() => removeTag(tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreatePost(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreatePost}
                        disabled={
                          !newPost.title.trim() || !newPost.content.trim()
                        }
                      >
                        Create Post
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPostType === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPostType(undefined)}
              className="h-8 text-xs"
            >
              All Posts
            </Button>
            {POST_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={
                  selectedPostType === type.value ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedPostType(type.value)}
                className="h-8 text-xs"
              >
                <type.icon className="mr-1 h-3 w-3" />
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-6">
          {posts && posts.length > 0 ? (
            posts.map((post: Post) => {
              const typeConfig = getPostTypeConfig(post.postType);
              const isExpanded = expandedPost === post._id;

              return (
                <Card
                  key={post._id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm font-medium">
                            {getUserInitials(post.authorId)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground text-sm font-medium">
                              {getUserDisplayName(
                                post.authorId,
                                post.authorType,
                                userId
                              )}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'h-5 text-xs',
                                getUserTypeBadgeColor(post.authorType)
                              )}
                            >
                              {getUserTypeLabel(post.authorType)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn('h-5 text-xs', typeConfig.color)}
                            >
                              <typeConfig.icon className="mr-1 h-3 w-3" />
                              {typeConfig.label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {formatMessageTime(post.createdAt)}
                            {post.category && ` • ${post.category}`}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleInteraction(post._id, 'bookmark')
                            }
                          >
                            <Bookmark className="mr-2 h-4 w-4" />
                            Bookmark
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleInteraction(post._id, 'share')}
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleInteraction(post._id, 'report')
                            }
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4">
                    <h3 className="text-foreground mb-3 text-base font-semibold">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0 pb-4">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInteraction(post._id, 'like');
                          }}
                          className="h-8 gap-2 px-3"
                        >
                          <Heart className="h-4 w-4" />
                          <span className="text-xs">{post.likeCount}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2 px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPost(post._id);
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs">{post.commentCount}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInteraction(post._id, 'share');
                          }}
                          className="h-8 gap-2 px-3"
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="text-xs">{post.shareCount}</span>
                        </Button>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Eye className="h-3 w-3" />
                        <span>{post.viewCount} views</span>
                      </div>
                    </div>
                  </CardFooter>

                  {/* Comments Section */}
                  {isExpanded && (
                    <div className="border-t px-6 pb-4">
                      <CommentSection
                        postId={post._id as Id<'communityPosts'>}
                        userId={userId}
                        userType={userType}
                        comments={post.recentComments || []}
                        onCommentAdded={(comment) =>
                          handleComment(post._id, comment.content)
                        }
                      />
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                  <Users className="text-muted-foreground h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-medium">
                    No posts yet
                  </h3>
                  <p className="text-muted-foreground max-w-sm text-sm">
                    Be the first to start a discussion in the community!
                  </p>
                </div>
                {canInteractWithCommunity(userType) && (
                  <Button
                    className="mt-4"
                    onClick={() => setShowCreatePost(true)}
                  >
                    Create First Post
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
