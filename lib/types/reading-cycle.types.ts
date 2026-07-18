import { z } from "zod";

import {
  CreateReadingCyclePayloadSchema,
  NullableReadingCycleResponseSchema,
  ReadingCycleResponseSchema,
  ReadingCycleSchema,
  ReadingCyclesResponseSchema,
  ReadingCycleStatusSchema,
  UpdateReadingCyclePayloadSchema,
} from "@/lib/contracts/reading-cycle.contract";

export type ReadingCycleStatus = z.infer<typeof ReadingCycleStatusSchema>;
export type ReadingCycle = z.infer<typeof ReadingCycleSchema>;
export type ReadingCyclesResponse = z.infer<typeof ReadingCyclesResponseSchema>;
export type ReadingCycleResponse = z.infer<typeof ReadingCycleResponseSchema>;
export type NullableReadingCycleResponse = z.infer<
  typeof NullableReadingCycleResponseSchema
>;
export type CreateReadingCyclePayload = z.infer<
  typeof CreateReadingCyclePayloadSchema
>;
export type UpdateReadingCyclePayload = z.infer<
  typeof UpdateReadingCyclePayloadSchema
>;
