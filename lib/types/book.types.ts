import { z } from "zod";

import {
  BookDiscoveryResultSchema,
  BookResponseSchema,
  BookSchema,
  ImportBookPayloadSchema,
  SearchBooksResponseSchema,
} from "@/lib/contracts/book.contract";

export type Book = z.infer<typeof BookSchema>;
export type BookDiscoveryResult = z.infer<typeof BookDiscoveryResultSchema>;
export type SearchBooksResponse = z.infer<typeof SearchBooksResponseSchema>;
export type BookResponse = z.infer<typeof BookResponseSchema>;
export type ImportBookPayload = z.infer<typeof ImportBookPayloadSchema>;
