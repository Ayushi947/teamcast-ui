/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as notifications from "../notifications.js";
import type * as services_chat_chat from "../services/chat/chat.js";
import type * as services_chat_chat_settings from "../services/chat/chat_settings.js";
import type * as services_chat_community_posts from "../services/chat/community_posts.js";
import type * as services_chat_job_conversations from "../services/chat/job_conversations.js";
import type * as services_chat_messages_management from "../services/chat/messages_management.js";
import type * as services_chat_support_conversation from "../services/chat/support_conversation.js";
import type * as services_chat_typing_indicators from "../services/chat/typing_indicators.js";
import type * as services_live_assessments_live_assessment_analytics from "../services/live_assessments/live_assessment_analytics.js";
import type * as services_users_users_service from "../services/users/users_service.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  notifications: typeof notifications;
  "services/chat/chat": typeof services_chat_chat;
  "services/chat/chat_settings": typeof services_chat_chat_settings;
  "services/chat/community_posts": typeof services_chat_community_posts;
  "services/chat/job_conversations": typeof services_chat_job_conversations;
  "services/chat/messages_management": typeof services_chat_messages_management;
  "services/chat/support_conversation": typeof services_chat_support_conversation;
  "services/chat/typing_indicators": typeof services_chat_typing_indicators;
  "services/live_assessments/live_assessment_analytics": typeof services_live_assessments_live_assessment_analytics;
  "services/users/users_service": typeof services_users_users_service;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
