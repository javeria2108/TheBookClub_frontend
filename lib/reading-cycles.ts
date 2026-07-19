import { getJson, patchJson, postJson, putJson } from "@/lib/api";
import {
  CreateReadingCyclePayloadSchema,
  NullableReadingCycleResponseSchema,
  ReadingProgressResponseSchema,
  ReadingCycleResponseSchema,
  ReadingCyclesResponseSchema,
  UpdateReadingProgressPayloadSchema,
  UpdateReadingCyclePayloadSchema,
} from "@/lib/contracts/reading-cycle.contract";
import type {
  CreateReadingCyclePayload,
  ReadingProgressResponse,
  ReadingCycle,
  ReadingCyclesResponse,
  UpdateReadingProgressPayload,
  UpdateReadingCyclePayload,
} from "@/lib/types";

export async function getReadingCycles(
  clubId: string,
): Promise<ReadingCyclesResponse> {
  const data = await getJson<ReadingCyclesResponse>(
    `/clubs/${clubId}/reading-cycles`,
  );

  return ReadingCyclesResponseSchema.parse(data);
}

export async function getCurrentReadingCycle(
  clubId: string,
): Promise<ReadingCycle | null> {
  const data = await getJson<{ readingCycle: ReadingCycle | null }>(
    `/clubs/${clubId}/reading-cycles/current`,
  );

  return NullableReadingCycleResponseSchema.parse(data).readingCycle;
}

export async function createReadingCycle(
  clubId: string,
  input: CreateReadingCyclePayload,
): Promise<ReadingCycle> {
  const payload = CreateReadingCyclePayloadSchema.parse(input);
  const data = await postJson<
    { readingCycle: ReadingCycle },
    CreateReadingCyclePayload
  >(`/clubs/${clubId}/reading-cycles`, payload);

  return ReadingCycleResponseSchema.parse(data).readingCycle;
}

export async function updateReadingCycle(
  clubId: string,
  cycleId: string,
  input: UpdateReadingCyclePayload,
): Promise<ReadingCycle> {
  const payload = UpdateReadingCyclePayloadSchema.parse(input);
  const data = await patchJson<
    { readingCycle: ReadingCycle },
    UpdateReadingCyclePayload
  >(`/clubs/${clubId}/reading-cycles/${cycleId}`, payload);

  return ReadingCycleResponseSchema.parse(data).readingCycle;
}

export async function startReadingCycle(
  clubId: string,
  cycleId: string,
): Promise<ReadingCycle> {
  const data = await postJson<
    { readingCycle: ReadingCycle },
    Record<string, never>
  >(`/clubs/${clubId}/reading-cycles/${cycleId}/start`, {});

  return ReadingCycleResponseSchema.parse(data).readingCycle;
}

export async function completeReadingCycle(
  clubId: string,
  cycleId: string,
): Promise<ReadingCycle> {
  const data = await postJson<
    { readingCycle: ReadingCycle },
    Record<string, never>
  >(`/clubs/${clubId}/reading-cycles/${cycleId}/complete`, {});

  return ReadingCycleResponseSchema.parse(data).readingCycle;
}

export async function cancelReadingCycle(
  clubId: string,
  cycleId: string,
): Promise<ReadingCycle> {
  const data = await postJson<
    { readingCycle: ReadingCycle },
    Record<string, never>
  >(`/clubs/${clubId}/reading-cycles/${cycleId}/cancel`, {});

  return ReadingCycleResponseSchema.parse(data).readingCycle;
}

export async function getReadingProgress(
  clubId: string,
  cycleId: string,
): Promise<ReadingProgressResponse> {
  const data = await getJson<ReadingProgressResponse>(
    `/clubs/${clubId}/reading-cycles/${cycleId}/progress`,
  );

  return ReadingProgressResponseSchema.parse(data);
}

export async function updateMyReadingProgress(
  clubId: string,
  cycleId: string,
  input: UpdateReadingProgressPayload,
): Promise<ReadingProgressResponse> {
  const payload = UpdateReadingProgressPayloadSchema.parse(input);
  const data = await putJson<
    ReadingProgressResponse,
    UpdateReadingProgressPayload
  >(`/clubs/${clubId}/reading-cycles/${cycleId}/progress/me`, payload);

  return ReadingProgressResponseSchema.parse(data);
}
