import { ActivityModuleEnum, ActivityEntityTypeEnum } from '../../common/enums';

/**
 * @openapi
 * components:
 *   schemas:
 *     IActivityLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the activity log
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who performed the action
 *         module:
 *           $ref: '#/components/schemas/ActivityModuleEnum'
 *         action:
 *           type: string
 *           description: Action that was performed
 *           example: "UPDATE_PROFILE"
 *         entityId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the affected entity, if any
 *         entityType:
 *           $ref: '#/components/schemas/ActivityEntityTypeEnum'
 *           nullable: true
 *         description:
 *           type: string
 *           description: Human-readable description of the action
 *           example: "Candidate updated personal information"
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Additional metadata for the action
 *           example:
 *             changes: ["email", "phoneNumber"]
 *         userAgent:
 *           type: string
 *           nullable: true
 *           description: User agent string of the client
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the action was performed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the record was last updated
 */
export interface IActivityLog {
  id: string;
  userId: string;
  module: ActivityModuleEnum;
  action: string;
  entityId?: string;
  entityType?: ActivityEntityTypeEnum;
  description: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  /** User display name when included in API response */
  userName?: string;
  /** User type (e.g. SUPPORT, CLIENT) when included in API response */
  userType?: string;
  /** User email when included in API response */
  userEmail?: string;
  /** User role (e.g. ADMIN, HR, RECRUITER) when included */
  userRole?: string;
  /** Client or partner company name when relevant */
  userCompanyName?: string;
  /** IP address when recorded */
  ipAddress?: string;
  /** Short device/browser label from userAgent */
  deviceLabel?: string;
  /** When support impersonated another user */
  impersonatedUserId?: string;
  impersonatedUserName?: string;
  /** Human-readable entity name (e.g. job title, candidate name) */
  entityName?: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IActivityLogCreate:
 *       type: object
 *       required:
 *         - module
 *         - action
 *         - description
 *       properties:
 *         module:
 *           $ref: '#/components/schemas/ActivityModuleEnum'
 *         action:
 *           type: string
 *           description: Action that was performed
 *           example: "UPDATE_PROFILE"
 *         entityId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the affected entity, if any
 *         entityType:
 *           $ref: '#/components/schemas/ActivityEntityTypeEnum'
 *           nullable: true
 *         description:
 *           type: string
 *           description: Human-readable description of the action
 *           example: "Candidate updated personal information"
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Additional metadata for the action
 *           example:
 *             changes: ["email", "phoneNumber"]
 */
export interface IActivityLogCreate {
  module: ActivityModuleEnum;
  action: string;
  entityId?: string;
  entityType?: ActivityEntityTypeEnum;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IActivityLogFilters:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: Filter by user ID
 *         module:
 *           $ref: '#/components/schemas/ActivityModuleEnum'
 *           description: Filter by module
 *         action:
 *           oneOf:
 *             - type: string
 *               description: Filter by single action
 *             - type: array
 *               items:
 *                 type: string
 *               description: Filter by multiple actions
 *           description: Filter by action(s)
 *           example: ["UPDATE_PROFILE", "LOGIN"]
 *         entityId:
 *           type: string
 *           format: uuid
 *           description: Filter by entity ID
 *         entityType:
 *           $ref: '#/components/schemas/ActivityEntityTypeEnum'
 *           description: Filter by entity type
 *         fromDate:
 *           type: string
 *           format: date-time
 *           description: Filter logs from this date
 *         toDate:
 *           type: string
 *           format: date-time
 *           description: Filter logs until this date
 *         clientId:
 *           type: string
 *           format: uuid
 *           description: Filter logs to only those by users belonging to this client (client scope)
 */
export interface IActivityLogFilters {
  userId?: string;
  module?: ActivityModuleEnum;
  action?: string | string[];
  entityId?: string;
  entityType?: ActivityEntityTypeEnum;
  fromDate?: Date;
  toDate?: Date;
  clientId?: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IActivityLogCreated:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Activity logged successfully"
 *         activityLog:
 *           $ref: '#/components/schemas/IActivityLog'
 */
export interface IActivityLogCreated {
  message: string;
  activityLog: IActivityLog;
}

// Transform function from API/Prisma to domain
export const toActivityLogDomain = (activityLog: any): IActivityLog => ({
  id: activityLog.id,
  userId: activityLog.userId,
  module: activityLog.module,
  action: activityLog.action,
  entityId: activityLog.entityId,
  entityType: activityLog.entityType,
  description: activityLog.description,
  metadata: activityLog.metadata,
  userAgent: activityLog.userAgent,
  timestamp: activityLog.timestamp,
  createdAt: activityLog.createdAt,
  updatedAt: activityLog.updatedAt,
  userName: activityLog.userName ?? activityLog.user?.name,
  userType: activityLog.userType ?? activityLog.user?.type,
  userEmail: activityLog.userEmail ?? activityLog.user?.email,
  userRole: activityLog.userRole,
  userCompanyName: activityLog.userCompanyName,
  ipAddress: activityLog.ipAddress,
  deviceLabel: activityLog.deviceLabel,
  impersonatedUserId: activityLog.impersonatedUserId,
  impersonatedUserName: activityLog.impersonatedUserName,
  entityName: activityLog.entityName ?? activityLog.metadata?.entityName,
});
