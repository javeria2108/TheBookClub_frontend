import { z } from "zod";

export const NotificationTypeSchema = z.enum([
  "JOIN_REQUEST_APPROVED",
  "JOIN_REQUEST_REJECTED",
  "CLUB_JOINED",
  "READING_CYCLE_STARTED",
  "READING_CYCLE_UPDATED",
  "READING_TARGET_UPCOMING",
  "VOTING_OPENED",
  "VOTING_CLOSED",
  "DISCUSSION_TOPIC_CREATED",
  "DISCUSSION_REPLY",
  "READING_ENTRY_CREATED",
]);

export const NotificationEntityTypeSchema = z.enum([
  "CLUB",
  "JOIN_REQUEST",
  "READING_CYCLE",
  "READING_TARGET",
  "DISCUSSION_TOPIC",
  "DISCUSSION_POST",
  "BOOK_VOTE",
  "READING_ENTRY",
]);

export const NotificationActorSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1),
  avatarUrl: z.string().nullable(),
});

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  actionUrl: z.string().min(1),
  isRead: z.boolean(),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().nullable(),
  actor: NotificationActorSchema.nullable(),
  clubId: z.string().uuid().nullable(),
  entityId: z.string().nullable(),
  entityType: NotificationEntityTypeSchema.nullable(),
});

export const NotificationPageSchema = z.object({
  items: z.array(NotificationSchema),
  pagination: z.object({
    nextCursor: z.string().datetime().nullable(),
    hasMore: z.boolean(),
  }),
});

export const UnreadNotificationCountSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
});
