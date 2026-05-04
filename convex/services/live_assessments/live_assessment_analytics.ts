import { v } from 'convex/values';
import { mutation, query } from '../../_generated/server';

// Create or update live assessment analytics
export const upsertLiveAssessmentAnalytics = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existingAnalytics = await ctx.db
      .query('liveAssessmentAnalytics')
      .filter((q) =>
        q.and(
          q.eq(q.field('candidateId'), args.candidateId),
          q.eq(q.field('assessmentType'), args.assessmentType)
        )
      )
      .first();

    if (existingAnalytics) {
      return await ctx.db.patch(existingAnalytics._id, {
        duration: args.duration,
        status: args.status,
        result: args.result,
        lastUpdatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert('liveAssessmentAnalytics', {
        assessmentId: args.assessmentId,
        candidateId: args.candidateId,
        duration: args.duration,
        status: args.status,
        result: args.result,
        assessmentType: args.assessmentType,
        userId: args.userId,
        userType: args.userType,
        lastUpdatedAt: Date.now(),
      });
    }
  },
});

// Get live assessment analytics by assessment ID
export const getLiveAssessmentAnalytics = query({
  args: {
    candidateId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('liveAssessmentAnalytics')
      .filter((q) => q.eq(q.field('candidateId'), args.candidateId))
      .first();
  },
});

// Get all live assessment analytics

export const getAllLiveAnalytics = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
    result: v.optional(v.string()),
    assessmentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { limit = 100, status, assessmentType, result } = args;

    let q = ctx.db.query('liveAssessmentAnalytics');

    if (status) {
      q = q.filter((q) => q.eq(q.field('status'), status));
    }

    if (assessmentType) {
      q = q.filter((q) => q.eq(q.field('assessmentType'), assessmentType));
    }

    if (result) {
      q = q.filter((q) => q.eq(q.field('result'), result));
    }

    const analytics = await q.take(limit);

    const userIds = [...new Set(analytics.map((r) => r.userId))];

    const users = await ctx.db.query('users').collect();
    const userMap = new Map(
      users.map((u) => [u.userId, { name: u.name, email: u.email }])
    );

    return analytics.map((record) => ({
      ...record,
      userName: userMap.get(record.userId)?.name ?? 'Unknown',
      userEmail: userMap.get(record.userId)?.email ?? 'Unknown',
    }));
  },
});

// Get assessment history with pagination and filtering
export const getAssessmentHistory = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    status: v.optional(v.string()),
    result: v.optional(v.string()),
    assessmentType: v.optional(v.string()),
    timeRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      page = 1,
      pageSize = 20,
      status,
      assessmentType,
      timeRange = '30d',
      result,
    } = args;

    // Calculate date range
    const now = Date.now();
    let startDate = now;

    switch (timeRange) {
      case '7d':
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '90d':
        startDate = now - 90 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = now - 30 * 24 * 60 * 60 * 1000;
    }

    let q = ctx.db.query('liveAssessmentAnalytics');

    // Filter by creation time (date range)
    q = q.filter((q) => q.gte(q.field('_creationTime'), startDate));

    // Filter by status if provided
    if (status && status !== 'all') {
      q = q.filter((q) => q.eq(q.field('status'), status));
    }

    // Filter by assessment type if provided
    if (assessmentType && assessmentType !== 'all') {
      q = q.filter((q) => q.eq(q.field('assessmentType'), assessmentType));
    }

    if (result) {
      q = q.filter((q) => q.eq(q.field('result'), result));
    }

    // Get total count for pagination
    const allResults = await q.collect();
    const totalItems = allResults.length;

    // Sort by creation time in descending order (newest first)
    const sortedResults = allResults.sort(
      (a, b) => b._creationTime - a._creationTime
    );

    // Apply pagination
    const skip = (page - 1) * pageSize;
    const paginatedResults = sortedResults.slice(skip, skip + pageSize);

    // Get user data for the paginated results
    const userIds = [...new Set(paginatedResults.map((r) => r.userId))];
    const users = await ctx.db.query('users').collect();
    const userMap = new Map(
      users.map((u) => [u.userId, { name: u.name, email: u.email }])
    );

    const enrichedResults = paginatedResults.map((record) => ({
      ...record,
      userName: userMap.get(record.userId)?.name ?? 'Unknown',
      userEmail: userMap.get(record.userId)?.email ?? 'Unknown',
    }));

    return {
      data: enrichedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems,
        pageSize,
      },
    };
  },
});

// Get assessment history for charts (no pagination)
export const getAssessmentHistoryForCharts = query({
  args: {
    status: v.optional(v.string()),
    assessmentType: v.optional(v.string()),
    timeRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { status, assessmentType, timeRange = '30d' } = args;

    // Calculate date range
    const now = Date.now();
    let startDate = now;

    switch (timeRange) {
      case '7d':
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '90d':
        startDate = now - 90 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = now - 30 * 24 * 60 * 60 * 1000;
    }

    let q = ctx.db.query('liveAssessmentAnalytics');

    // Filter by creation time (date range)
    q = q.filter((q) => q.gte(q.field('_creationTime'), startDate));

    // Filter by status if provided
    if (status && status !== 'all') {
      q = q.filter((q) => q.eq(q.field('status'), status));
    }

    // Filter by assessment type if provided
    if (assessmentType && assessmentType !== 'all') {
      q = q.filter((q) => q.eq(q.field('assessmentType'), assessmentType));
    }

    // Get all results for charts (no pagination)
    const allResults = await q.collect();

    // Sort by creation time in descending order (newest first)
    const sortedResults = allResults.sort(
      (a, b) => b._creationTime - a._creationTime
    );

    // Get user data
    const userIds = [...new Set(sortedResults.map((r) => r.userId))];
    const users = await ctx.db.query('users').collect();
    const userMap = new Map(
      users.map((u) => [u.userId, { name: u.name, email: u.email }])
    );

    const enrichedResults = sortedResults.map((record) => ({
      ...record,
      userName: userMap.get(record.userId)?.name ?? 'Unknown',
      userEmail: userMap.get(record.userId)?.email ?? 'Unknown',
    }));

    return enrichedResults;
  },
});

// Get all live assessment analytics for a candidate
export const getCandidateLiveAssessmentAnalytics = query({
  args: {
    candidateId: v.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('liveAssessmentAnalytics')
      .filter((q) => q.eq(q.field('candidateId'), args.candidateId))
      .collect();

    return await Promise.all(
      analytics.map(async (record) => {
        const user = await ctx.db
          .query('users')
          .withIndex('by_userId', (q) => q.eq('userId', record.userId))
          .first();

        return {
          ...record,
          userName: user?.name ?? 'Unknown',
          userEmail: user?.email ?? 'Unknown',
        };
      })
    );
  },
});

// Update assessment duration
export const updateAssessmentDuration = mutation({
  args: {
    candidateId: v.string(),
    duration: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('liveAssessmentAnalytics')
      .filter((q) => q.eq(q.field('candidateId'), args.candidateId))
      .first();

    if (!analytics) {
      throw new Error('Assessment analytics not found');
    }

    return await ctx.db.patch(analytics._id, {
      duration: args.duration,
      status: args.status,
      lastUpdatedAt: Date.now(),
    });
  },
});
