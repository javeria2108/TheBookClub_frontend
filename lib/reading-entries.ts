import {
  CreateReadingEntryPayloadSchema,
  ReadingEntryPageSchema,
  ReadingEntryResponseSchema,
} from "@/lib/contracts/reading-entry.contract";
import { deleteJson, getJson, postJson } from "@/lib/api";
import type {
  CreateReadingEntryPayload,
  ReadingEntry,
  ReadingEntryPage,
  ReadingEntryType,
} from "@/lib/types";

export type ReadingEntryFilter = "ALL" | ReadingEntryType | "MINE";

export async function getReadingEntries(
  clubId: string,
  cycleId: string,
  filter: ReadingEntryFilter,
): Promise<ReadingEntryPage> {
  const params = new URLSearchParams();
  if (filter === "REFLECTION" || filter === "QUOTE") params.set("type", filter);
  if (filter === "MINE") params.set("author", "me");

  const query = params.toString();
  const data = await getJson<ReadingEntryPage>(
    `/clubs/${clubId}/reading-cycles/${cycleId}/entries${query ? `?${query}` : ""}`,
  );
  return ReadingEntryPageSchema.parse(data);
}

export async function createReadingEntry(
  clubId: string,
  cycleId: string,
  input: CreateReadingEntryPayload,
): Promise<ReadingEntry> {
  const payload = CreateReadingEntryPayloadSchema.parse(input);
  const data = await postJson<{ entry: ReadingEntry }, CreateReadingEntryPayload>(
    `/clubs/${clubId}/reading-cycles/${cycleId}/entries`,
    payload,
  );
  return ReadingEntryResponseSchema.parse(data).entry;
}

export async function deleteReadingEntry(
  clubId: string,
  entryId: string,
): Promise<void> {
  await deleteJson<{ message: string }>(`/clubs/${clubId}/reading-entries/${entryId}`);
}
