import { z } from "zod";

export const DiscussionTopicTypeSchema = z.enum([
  "GENERAL",
  "READING_CYCLE",
  "READING_TARGET",
  "PROMPT",
]);

export const DiscussionAuthorSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1),
  avatarUrl: z.string().nullable(),
  role: z.enum(["MEMBER", "MODERATOR", "OWNER"]),
});

export const DiscussionTopicSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  topicType: DiscussionTopicTypeSchema,
  title: z.string().min(1),
  prompt: z.string().nullable(),
  isPinned: z.boolean(),
  isLocked: z.boolean(),
  readingCycle: z.object({ id: z.string().uuid(), bookTitle: z.string() }).nullable(),
  readingTarget: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      rangeLabel: z.string(),
    })
    .nullable(),
  createdBy: z.object({
    id: z.string().uuid(),
    displayName: z.string().min(1),
    avatarUrl: z.string().nullable(),
  }),
  postCount: z.number().int().nonnegative(),
  lastActivityAt: z.string().datetime(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canModerate: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DiscussionPostSchema = z.object({
  id: z.string().uuid(),
  topicId: z.string().uuid(),
  content: z.string(),
  author: DiscussionAuthorSchema.nullable(),
  parentPostId: z.string().uuid().nullable(),
  replyCount: z.number().int().nonnegative(),
  isDeleted: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DiscussionTopicPageSchema = z.object({
  items: z.array(DiscussionTopicSchema),
  pagination: z.object({
    nextCursor: z.string().datetime().nullable(),
    hasMore: z.boolean(),
  }),
});

export const DiscussionPostPageSchema = z.object({
  items: z.array(DiscussionPostSchema),
  pagination: z.object({
    nextCursor: z.string().datetime().nullable(),
    hasMore: z.boolean(),
  }),
});

export const DiscussionTopicResponseSchema = z.object({
  topic: DiscussionTopicSchema,
});

export const DiscussionPostResponseSchema = z.object({
  post: DiscussionPostSchema,
});

export const CreateDiscussionTopicPayloadSchema = z.object({
  title: z.string().trim().min(3).max(140),
  prompt: z.string().trim().max(1200).optional().nullable(),
  topicType: DiscussionTopicTypeSchema.default("GENERAL"),
  readingCycleId: z.string().uuid().optional().nullable(),
  readingTargetId: z.string().uuid().optional().nullable(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export const UpdateDiscussionTopicPayloadSchema =
  CreateDiscussionTopicPayloadSchema.pick({
    title: true,
    prompt: true,
    isPinned: true,
    isLocked: true,
  })
    .partial()
    .refine((value) => Object.keys(value).length > 0);

export const CreateDiscussionPostPayloadSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  parentPostId: z.string().uuid().optional().nullable(),
});

export const UpdateDiscussionPostPayloadSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});
