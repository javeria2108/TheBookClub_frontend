import { z } from "zod";

import {
  CreateReadingEntryPayloadSchema,
  ReadingEntryPageSchema,
  ReadingEntrySchema,
  ReadingEntryTypeSchema,
} from "@/lib/contracts/reading-entry.contract";

export type ReadingEntryType = z.infer<typeof ReadingEntryTypeSchema>;
export type ReadingEntry = z.infer<typeof ReadingEntrySchema>;
export type ReadingEntryPage = z.infer<typeof ReadingEntryPageSchema>;
export type CreateReadingEntryPayload = z.infer<
  typeof CreateReadingEntryPayloadSchema
>;
