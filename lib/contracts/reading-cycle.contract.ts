import { z } from "zod";

import { BookSchema } from "@/lib/contracts/book.contract";

export const ReadingCycleStatusSchema = z.enum([
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const ReadingCycleSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  bookId: z.string().uuid(),
  status: ReadingCycleStatusSchema,
  startDate: z.string().datetime(),
  targetEndDate: z.string().datetime(),
  goalDescription: z.string().nullable(),
  createdByUserId: z.string().uuid(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  book: BookSchema,
});

export const ReadingCyclesResponseSchema = z.object({
  readingCycles: z.array(ReadingCycleSchema),
});

export const ReadingCycleResponseSchema = z.object({
  readingCycle: ReadingCycleSchema,
});

export const NullableReadingCycleResponseSchema = z.object({
  readingCycle: ReadingCycleSchema.nullable(),
});

export const ReadingProgressStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
]);

export const ReadingProgressSchema = z.object({
  id: z.string().uuid().nullable(),
  status: ReadingProgressStatusSchema,
  progressPercentage: z.number().int().min(0).max(100),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

export const ReadingProgressMemberSchema = ReadingProgressSchema.extend({
  user: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    avatarUrl: z.string().url().nullable(),
    role: z.enum(["MEMBER", "MODERATOR", "OWNER"]),
  }),
});

export const ReadingProgressSummarySchema = z.object({
  totalMembers: z.number().int().nonnegative(),
  startedMembers: z.number().int().nonnegative(),
  inProgressMembers: z.number().int().nonnegative(),
  completedMembers: z.number().int().nonnegative(),
  averageProgressPercentage: z.number().int().min(0).max(100),
});

export const ReadingProgressResponseSchema = z.object({
  cycleId: z.string().uuid(),
  ownProgress: ReadingProgressSchema,
  summary: ReadingProgressSummarySchema,
  members: z.array(ReadingProgressMemberSchema),
});

export const UpdateReadingProgressPayloadSchema = z.object({
  progressPercentage: z.number().int().min(0).max(100),
});

export const ReadingTargetTypeSchema = z.enum(["CHAPTERS", "PAGES", "CUSTOM"]);
export const ReadingTargetStateSchema = z.enum([
  "UPCOMING",
  "CURRENT",
  "PREVIOUS",
]);

export const ReadingTargetSchema = z.object({
  id: z.string().uuid(),
  readingCycleId: z.string().uuid(),
  sequence: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().nullable(),
  targetType: ReadingTargetTypeSchema,
  startValue: z.number().int().positive().nullable(),
  endValue: z.number().int().positive().nullable(),
  rangeLabel: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  state: ReadingTargetStateSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ReadingTargetsResponseSchema = z.object({
  targets: z.array(ReadingTargetSchema),
});

export const ReadingTargetResponseSchema = z.object({
  target: ReadingTargetSchema,
});

export const CreateReadingTargetPayloadSchema = z.object({
  targetType: ReadingTargetTypeSchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).optional().nullable(),
  startValue: z.number().int().positive().optional().nullable(),
  endValue: z.number().int().positive().optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const UpdateReadingTargetPayloadSchema =
  CreateReadingTargetPayloadSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    {
      message: "At least one reading target field must be provided",
    },
  );

export const ReorderReadingTargetsPayloadSchema = z.object({
  targetIds: z.array(z.string().uuid()).min(1),
});

export const CreateReadingCyclePayloadSchema = z.object({
  bookSelection: z.discriminatedUnion("source", [
    z.object({
      source: z.literal("BOOKCIRCLE"),
      bookId: z.string().uuid(),
    }),
    z.object({
      source: z.literal("GOOGLE_BOOKS"),
      googleBooksId: z.string().min(1),
    }),
  ]),
  status: z.enum(["PLANNED", "ACTIVE"]),
  startDate: z.string().datetime(),
  targetEndDate: z.string().datetime(),
  goalDescription: z.string().trim().max(600).optional(),
});

export const UpdateReadingCyclePayloadSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    targetEndDate: z.string().datetime().optional(),
    goalDescription: z.string().trim().max(600).optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one reading cycle field must be provided",
  });
