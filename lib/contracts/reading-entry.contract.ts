import { z } from "zod";

export const ReadingEntryTypeSchema = z.enum(["REFLECTION", "QUOTE"]);

export const ReadingEntrySchema = z.object({
  id: z.string().uuid(),
  entryType: ReadingEntryTypeSchema,
  body: z.string(),
  commentary: z.string().nullable(),
  pageNumber: z.number().int().positive().nullable(),
  chapterReference: z.string().nullable(),
  readingTarget: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      rangeLabel: z.string(),
    })
    .nullable(),
  author: z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ReadingEntryPageSchema = z.object({
  items: z.array(ReadingEntrySchema),
  pagination: z.object({
    nextCursor: z.string().datetime().nullable(),
    hasMore: z.boolean(),
  }),
});

export const ReadingEntryResponseSchema = z.object({
  entry: ReadingEntrySchema,
});

export const CreateReadingEntryPayloadSchema = z.object({
  entryType: ReadingEntryTypeSchema,
  body: z.string().trim().min(1).max(2000),
  commentary: z.string().trim().max(1000).optional().nullable(),
  readingTargetId: z.string().uuid().optional().nullable(),
  pageNumber: z.number().int().positive().optional().nullable(),
  chapterReference: z.string().trim().max(80).optional().nullable(),
});
