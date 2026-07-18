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
