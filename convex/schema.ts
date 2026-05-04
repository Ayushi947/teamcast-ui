import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table to store user information
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    avatar: v.optional(v.string()),
    isActive: v.boolean(),
    lastSeen: v.optional(v.number()),
    createdAt: v.number(),
    candidateId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    partnerId: v.optional(v.string()),
    supportId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userType', ['userType'])
    .index('by_email', ['email']),

  notifications: defineTable({
    // Core notification data
    userId: v.string(), // User ID who receives the notification
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('info'),
      v.literal('success'),
      v.literal('warning'),
      v.literal('error'),
      v.literal('interview'),
      v.literal('application'),
      v.literal('assessment'),
      v.literal('profile'),
      v.literal('system'),
      v.literal('integration')
    ),

    // Status and metadata
    isRead: v.boolean(),
    isArchived: v.boolean(),
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('urgent')
    ),

    // Optional action data
    actionUrl: v.optional(v.string()),
    actionText: v.optional(v.string()),

    // Additional metadata
    metadata: v.optional(
      v.object({
        entityId: v.optional(v.string()), // ID of related entity (job, interview, etc.)
        entityType: v.optional(v.string()), // Type of related entity
        category: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      })
    ),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()), // Optional expiration for temporary notifications
  })
    .index('by_user', ['userId'])
    .index('by_user_type', ['userId', 'userType'])
    .index('by_user_unread', ['userId', 'isRead'])
    .index('by_user_type_unread', ['userId', 'userType', 'isRead'])
    .index('by_created_at', ['createdAt'])
    .index('by_priority', ['priority'])
    .index('by_type', ['type']),

  // Chat Conversations Table
  conversations: defineTable({
    // Conversation metadata
    type: v.union(
      v.literal('direct'), // 1:1 chat
      v.literal('job_related'), // Job posting related chat (candidate + hiring manager)
      v.literal('support'), // Support initiated chat
      v.literal('community'), // Community group chat
      v.literal('internal') // Internal partner/client team chat
    ),

    // Job related fields (for job_related type)
    jobPostingId: v.optional(v.string()),
    applicationId: v.optional(v.string()),
    hiringManagerId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    candidateId: v.optional(v.string()),

    // Conversation status
    status: v.union(
      v.literal('active'),
      v.literal('archived'),
      v.literal('blocked'),
      v.literal('deleted')
    ),

    // Metadata
    title: v.optional(v.string()), // For group chats or named conversations
    description: v.optional(v.string()),

    // Settings
    isPublic: v.boolean(), // For community conversations
    allowFileSharing: v.boolean(),
    allowVideoCall: v.boolean(),

    // Creator and timestamps
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.optional(v.number()),

    // Archive fields
    archivedAt: v.optional(v.number()),
    archivedBy: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index('by_job_posting', ['jobPostingId'])
    .index('by_application', ['applicationId'])
    .index('by_hiring_manager', ['hiringManagerId'])
    .index('by_creator', ['createdBy'])
    .index('by_type', ['type'])
    .index('by_status', ['status'])
    .index('by_last_message', ['lastMessageAt'])
    .index('by_public', ['isPublic'])
    .index('by_metadata', ['metadata']),

  // Chat Participants Table
  conversationParticipants: defineTable({
    conversationId: v.id('conversations'),
    userId: v.string(),
    userName: v.optional(v.string()),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support'),
      v.literal('anonymous')
    ),
    isOnline: v.optional(v.boolean()),
    // Participant role in conversation
    role: v.union(
      v.literal('admin'),
      v.literal('moderator'),
      v.literal('member'),
      v.literal('observer')
    ),

    // Participant status
    status: v.union(
      v.literal('active'),
      v.literal('left'),
      v.literal('removed'),
      v.literal('blocked')
    ),

    // Permissions
    canSendMessages: v.boolean(),
    canAddParticipants: v.boolean(),
    canRemoveParticipants: v.boolean(),
    canArchiveConversation: v.boolean(),

    // Read status
    lastReadAt: v.optional(v.number()),
    unreadCount: v.number(),

    // Join/leave tracking
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
    addedBy: v.optional(v.string()),
    removedBy: v.optional(v.string()),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_user', ['userId'])
    .index('by_conversation_user', ['conversationId', 'userId'])
    .index('by_user_type', ['userId', 'userType'])
    .index('by_status', ['status'])
    .index('by_unread', ['userId', 'unreadCount']),

  // Chat Messages Table
  messages: defineTable({
    conversationId: v.id('conversations'),
    senderId: v.string(),
    senderType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support'),
      v.literal('system'),
      v.literal('anonymous')
    ),
    senderName: v.optional(v.string()),
    content: v.string(),
    messageType: v.union(
      v.literal('text'),
      v.literal('file'),
      v.literal('image'),
      v.literal('system'),
      v.literal('announcement')
    ),
    status: v.union(
      v.literal('sending'),
      v.literal('sent'),
      v.literal('delivered'),
      v.literal('read'),
      v.literal('failed')
    ),
    isDeleted: v.optional(v.boolean()),
    replyToMessageId: v.optional(v.id('messages')),
    threadRootId: v.optional(v.id('messages')),
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          // Support both old and new field names
          type: v.optional(v.string()),
          fileType: v.optional(v.string()),
          url: v.string(),
          name: v.optional(v.string()),
          fileName: v.optional(v.string()),
          size: v.optional(v.number()),
          fileSize: v.optional(v.number()),
          thumbnailUrl: v.optional(v.string()),
          metadata: v.optional(v.any()),
        })
      )
    ),
    metadata: v.optional(v.any()),
    // System message fields
    systemMessageType: v.optional(
      v.union(
        v.literal('user_joined'),
        v.literal('user_left'),
        v.literal('user_added'),
        v.literal('user_removed'),
        v.literal('conversation_created'),
        v.literal('job_application_submitted'),
        v.literal('interview_scheduled'),
        v.literal('conversation_archived')
      )
    ),
    systemMessageData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_sender', ['senderId'])
    .index('by_conversation_time', ['conversationId', 'createdAt'])
    .index('by_reply_to', ['replyToMessageId'])
    .index('by_thread_root', ['threadRootId'])
    .index('by_status', ['status'])
    .index('by_type', ['messageType']),

  // Message Read Receipts Table
  messageReadReceipts: defineTable({
    messageId: v.id('messages'),
    conversationId: v.id('conversations'),
    userId: v.string(),
    userName: v.optional(v.string()),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support'),
      v.literal('anonymous')
    ),
    readAt: v.number(),
  })
    .index('by_message', ['messageId'])
    .index('by_conversation', ['conversationId'])
    .index('by_user', ['userId'])
    .index('by_message_user', ['messageId', 'userId']),

  // Community Posts Table (for candidate community features)
  communityPosts: defineTable({
    authorId: v.string(),
    authorType: v.union(
      v.literal('candidate'),
      v.literal('partner'), // Partners can share insights
      v.literal('support') // Support can make announcements
    ),

    // Post content
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

    // Post metadata
    tags: v.array(v.string()),
    category: v.optional(v.string()),

    // Media attachments
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

    // Engagement metrics
    likeCount: v.number(),
    commentCount: v.number(),
    shareCount: v.number(),
    viewCount: v.number(),

    // Post status
    status: v.union(
      v.literal('published'),
      v.literal('draft'),
      v.literal('archived'),
      v.literal('deleted'),
      v.literal('moderated')
    ),

    // Moderation
    moderatedBy: v.optional(v.string()),
    moderatedAt: v.optional(v.number()),
    moderationReason: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index('by_author', ['authorId'])
    .index('by_author_type', ['authorType'])
    .index('by_status', ['status'])
    .index('by_type', ['postType'])
    .index('by_published_date', ['status', 'publishedAt'])
    .index('by_category', ['category'])
    .index('by_engagement', ['likeCount', 'commentCount']),

  // Community Post Interactions Table
  communityPostInteractions: defineTable({
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

    // Report metadata
    reportReason: v.optional(v.string()),
    reportDetails: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index('by_post', ['postId'])
    .index('by_user', ['userId'])
    .index('by_post_user', ['postId', 'userId'])
    .index('by_interaction_type', ['interactionType'])
    .index('by_post_interaction', ['postId', 'interactionType']),

  // Community Comments Table
  communityComments: defineTable({
    postId: v.id('communityPosts'),
    authorId: v.string(),
    authorType: v.union(
      v.literal('candidate'),
      v.literal('partner'),
      v.literal('support')
    ),

    content: v.string(),

    // Reply functionality
    parentCommentId: v.optional(v.id('communityComments')),
    threadLevel: v.number(), // 0 for top-level, 1+ for nested

    // Engagement
    likeCount: v.number(),

    // Status
    status: v.union(
      v.literal('published'),
      v.literal('deleted'),
      v.literal('moderated')
    ),

    // Moderation
    moderatedBy: v.optional(v.string()),
    moderatedAt: v.optional(v.number()),
    moderationReason: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_post', ['postId'])
    .index('by_author', ['authorId'])
    .index('by_parent', ['parentCommentId'])
    .index('by_post_date', ['postId', 'createdAt'])
    .index('by_status', ['status']),

  // Chat Settings Table (user preferences)
  chatSettings: defineTable({
    userId: v.string(),
    userName: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),

    // Notification preferences
    enableNotifications: v.boolean(),
    enableEmailNotifications: v.boolean(),
    enablePushNotifications: v.boolean(),
    notificationFrequency: v.union(
      v.literal('immediate'),
      v.literal('hourly'),
      v.literal('daily'),
      v.literal('never')
    ),

    // Privacy settings
    allowDirectMessages: v.boolean(),
    allowCommunityMessages: v.boolean(),
    showOnlineStatus: v.boolean(),
    // Availability settings
    availabilityStatus: v.union(
      v.literal('online'),
      v.literal('away'),
      v.literal('offline')
    ),

    chatStatus: v.union(v.literal('live'), v.literal('offline')),

    autoAwayEnabled: v.boolean(),

    workingHours: v.optional(
      v.object({
        start: v.string(),
        end: v.string(),
      })
    ),

    // Feature preferences
    enableFileSharing: v.boolean(),
    enableVideoChat: v.boolean(),
    autoArchiveOldChats: v.boolean(),
    autoArchiveDays: v.number(),

    // Theme and display
    theme: v.union(v.literal('light'), v.literal('dark'), v.literal('system')),
    fontSize: v.union(
      v.literal('small'),
      v.literal('medium'),
      v.literal('large')
    ),

    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_user_type', ['userType']),

  // Typing Indicators Table
  typingIndicators: defineTable({
    conversationId: v.id('conversations'),
    userId: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    displayName: v.string(),
    startedAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_user', ['userId'])
    .index('by_conversation_user', ['conversationId', 'userId'])
    .index('by_expiry', ['expiresAt']),

  liveAssessmentAnalytics: defineTable({
    assessmentId: v.string(),
    candidateId: v.string(),
    duration: v.number(),
    status: v.string(),
    result: v.optional(v.string()),
    assessmentType: v.union(
      v.literal('ONBOARDING_ASSESSMENT'),
      v.literal('JOB_AI_ASSESSMENT')
    ),
    userId: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    lastUpdatedAt: v.optional(v.number()),
  })
    .index('by_assessment', ['assessmentId'])
    .index('by_candidate', ['candidateId'])
    .index('by_status', ['status']),

  supportChatConfig: defineTable({
    isLive: v.boolean(),
    availabilityStatus: v.union(
      v.literal('online'),
      v.literal('away'),
      v.literal('offline')
    ),
    workingHours: v.object({
      start: v.string(),
      end: v.string(),
    }),
    updatedBy: v.string(),
    updatedAt: v.number(),
  })
    .index('by_is_live', ['isLive'])
    .index('by_availability_status', ['availabilityStatus'])
    .index('by_working_hours', ['workingHours']),
});
