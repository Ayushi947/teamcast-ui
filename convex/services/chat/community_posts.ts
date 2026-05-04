import { v } from 'convex/values';
import { mutation, query } from '../../../convex/_generated/server';

// ============================================================================
// COMMUNITY FEATURES
// ============================================================================

/**
 * Create a community post
 */
export const createCommunityPost = mutation({
  args: {
    authorId: v.string(),
    authorType: v.union(
      v.literal('candidate'),
      v.literal('partner'),
      v.literal('support')
    ),
    title: v.string(),
    content: v.string(),
    postType: v.union(
      v.literal('discussion'),
      v.literal('experience_sharing'),
      v.literal('job_tip'),
      v.literal('question'),
      v.literal('announcement'),
      v.literal('resource_sharing')
    ),
    tags: v.array(v.string()),
    category: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          fileName: v.string(),
          fileSize: v.number(),
          fileType: v.string(),
          url: v.string(),
          thumbnailUrl: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert('communityPosts', {
      authorId: args.authorId,
      authorType: args.authorType,
      title: args.title,
      content: args.content,
      postType: args.postType,
      tags: args.tags,
      category: args.category,
      attachments: args.attachments,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      viewCount: 0,
      status: 'published',
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });
  },
});

/**
 * Get community posts with pagination
 */
export const getCommunityPosts = query({
  args: {
    postType: v.optional(
      v.union(
        v.literal('discussion'),
        v.literal('experience_sharing'),
        v.literal('job_tip'),
        v.literal('question'),
        v.literal('announcement'),
        v.literal('resource_sharing')
      )
    ),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    sortBy: v.optional(
      v.union(v.literal('recent'), v.literal('popular'), v.literal('trending'))
    ),
  },
  handler: async (ctx, args) => {
    // Apply sorting with index first
    const sortBy = args.sortBy ?? 'recent';
    let query;

    if (sortBy === 'recent') {
      query = ctx.db
        .query('communityPosts')
        .withIndex('by_published_date', (q) => q.eq('status', 'published'))
        .order('desc');
    } else if (sortBy === 'popular') {
      query = ctx.db
        .query('communityPosts')
        .withIndex('by_engagement')
        .filter((q) => q.eq(q.field('status'), 'published'))
        .order('desc');
    } else {
      query = ctx.db
        .query('communityPosts')
        .withIndex('by_status', (q) => q.eq('status', 'published'))
        .order('desc');
    }

    // Apply additional filters
    if (args.postType) {
      query = query.filter((q) => q.eq(q.field('postType'), args.postType));
    }

    if (args.category) {
      query = query.filter((q) => q.eq(q.field('category'), args.category));
    }

    const posts = await query.take(args.limit ?? 20);

    // Get additional data for each post
    const postsWithData = await Promise.all(
      posts.map(async (post) => {
        // Get all comments for this post (not just recent ones for proper threading)
        const allComments = await ctx.db
          .query('communityComments')
          .withIndex('by_post_date', (q) => q.eq('postId', post._id))
          .filter((q) => q.eq(q.field('status'), 'published'))
          .order('asc')
          .collect();

        // Build comment hierarchy
        const commentMap = new Map();
        const topLevelComments: any[] = [];

        // First pass: create comment objects
        allComments.forEach((comment) => {
          commentMap.set(comment._id, {
            ...comment,
            replies: [],
          });
        });

        // Second pass: build hierarchy
        allComments.forEach((comment) => {
          const commentWithReplies = commentMap.get(comment._id);
          if (comment.parentCommentId) {
            const parent = commentMap.get(comment.parentCommentId);
            if (parent) {
              parent.replies.push(commentWithReplies);
            }
          } else {
            topLevelComments.push(commentWithReplies);
          }
        });

        return {
          ...post,
          recentComments: topLevelComments,
        };
      })
    );

    return postsWithData;
  },
});

/**
 * Get comments for a specific community post
 */
export const getPostComments = query({
  args: {
    postId: v.id('communityPosts'),
  },
  handler: async (ctx, args) => {
    // Get all comments for this post
    const allComments = await ctx.db
      .query('communityComments')
      .withIndex('by_post_date', (q) => q.eq('postId', args.postId))
      .filter((q) => q.eq(q.field('status'), 'published'))
      .order('asc')
      .collect();

    // Build comment hierarchy
    const commentMap = new Map();
    const topLevelComments: any[] = [];

    // First pass: create comment objects
    allComments.forEach((comment) => {
      commentMap.set(comment._id, {
        ...comment,
        replies: [],
      });
    });

    // Second pass: build hierarchy
    allComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment._id);
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        topLevelComments.push(commentWithReplies);
      }
    });

    return topLevelComments;
  },
});

/**
 * Interact with a community post (like, share, etc.)
 */
export const interactWithPost = mutation({
  args: {
    postId: v.id('communityPosts'),
    userId: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('partner'),
      v.literal('support')
    ),
    interactionType: v.union(
      v.literal('like'),
      v.literal('dislike'),
      v.literal('share'),
      v.literal('bookmark'),
      v.literal('report')
    ),
    reportReason: v.optional(v.string()),
    reportDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Check if interaction already exists
    const existingInteraction = await ctx.db
      .query('communityPostInteractions')
      .withIndex('by_post_user', (q) =>
        q.eq('postId', args.postId).eq('userId', args.userId)
      )
      .filter((q) => q.eq(q.field('interactionType'), args.interactionType))
      .first();

    if (existingInteraction) {
      // Remove existing interaction (toggle)
      await ctx.db.delete(existingInteraction._id);

      // Update post counters
      if (args.interactionType === 'like') {
        await ctx.db.patch(args.postId, {
          likeCount: Math.max(0, post.likeCount - 1),
        });
      } else if (args.interactionType === 'share') {
        await ctx.db.patch(args.postId, {
          shareCount: Math.max(0, post.shareCount - 1),
        });
      }

      return { action: 'removed' };
    } else {
      // Create new interaction
      await ctx.db.insert('communityPostInteractions', {
        postId: args.postId,
        userId: args.userId,
        userType: args.userType,
        interactionType: args.interactionType,
        reportReason: args.reportReason,
        reportDetails: args.reportDetails,
        createdAt: Date.now(),
      });

      // Update post counters
      if (args.interactionType === 'like') {
        await ctx.db.patch(args.postId, {
          likeCount: post.likeCount + 1,
        });
      } else if (args.interactionType === 'share') {
        await ctx.db.patch(args.postId, {
          shareCount: post.shareCount + 1,
        });
      }

      return { action: 'added' };
    }
  },
});

/**
 * Add a comment to a community post
 */
export const addComment = mutation({
  args: {
    postId: v.id('communityPosts'),
    authorId: v.string(),
    authorType: v.union(
      v.literal('candidate'),
      v.literal('partner'),
      v.literal('support')
    ),
    content: v.string(),
    parentCommentId: v.optional(v.id('communityComments')),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Calculate thread level
    let threadLevel = 0;
    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (parentComment) {
        threadLevel = parentComment.threadLevel + 1;
      }
    }

    const commentId = await ctx.db.insert('communityComments', {
      postId: args.postId,
      authorId: args.authorId,
      authorType: args.authorType,
      content: args.content,
      parentCommentId: args.parentCommentId,
      threadLevel,
      likeCount: 0,
      status: 'published',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update post comment count
    await ctx.db.patch(args.postId, {
      commentCount: post.commentCount + 1,
    });

    return commentId;
  },
});

/**
 * Increment view count for a community post
 */
export const incrementPostViewCount = mutation({
  args: {
    postId: v.id('communityPosts'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Update view count
    await ctx.db.patch(args.postId, {
      viewCount: post.viewCount + 1,
    });

    return { success: true };
  },
});
