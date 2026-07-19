import { z } from "zod";

import {
  CreateReadingCyclePayloadSchema,
  NullableReadingCycleResponseSchema,
  ReadingProgressResponseSchema,
  ReadingProgressSchema,
  ReadingProgressMemberSchema,
  ReadingProgressStatusSchema,
  ReadingProgressSummarySchema,
  ReadingCycleResponseSchema,
  ReadingCycleSchema,
  ReadingCyclesResponseSchema,
  ReadingCycleStatusSchema,
  UpdateReadingProgressPayloadSchema,
  UpdateReadingCyclePayloadSchema,
} from "@/lib/contracts/reading-cycle.contract";

export type ReadingCycleStatus = z.infer<typeof ReadingCycleStatusSchema>;
export type ReadingCycle = z.infer<typeof ReadingCycleSchema>;
export type ReadingCyclesResponse = z.infer<typeof ReadingCyclesResponseSchema>;
export type ReadingCycleResponse = z.infer<typeof ReadingCycleResponseSchema>;
export type NullableReadingCycleResponse = z.infer<
  typeof NullableReadingCycleResponseSchema
>;
export type ReadingProgressStatus = z.infer<
  typeof ReadingProgressStatusSchema
>;
export type ReadingProgress = z.infer<typeof ReadingProgressSchema>;
export type ReadingProgressMember = z.infer<
  typeof ReadingProgressMemberSchema
>;
export type ReadingProgressSummary = z.infer<
  typeof ReadingProgressSummarySchema
>;
export type ReadingProgressResponse = z.infer<
  typeof ReadingProgressResponseSchema
>;
export type UpdateReadingProgressPayload = z.infer<
  typeof UpdateReadingProgressPayloadSchema
>;
export type CreateReadingCyclePayload = z.infer<
  typeof CreateReadingCyclePayloadSchema
>;
export type UpdateReadingCyclePayload = z.infer<
  typeof UpdateReadingCyclePayloadSchema
>;
