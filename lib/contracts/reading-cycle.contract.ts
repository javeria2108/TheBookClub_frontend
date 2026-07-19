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
