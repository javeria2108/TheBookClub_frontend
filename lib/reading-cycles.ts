import { deleteJson, getJson, patchJson, postJson, putJson } from "@/lib/api";
import {
  CreateReadingCyclePayloadSchema,
  CreateReadingTargetPayloadSchema,
  NullableReadingCycleResponseSchema,
  ReadingProgressResponseSchema,
  ReadingTargetResponseSchema,
  ReadingTargetsResponseSchema,
  ReadingCycleResponseSchema,
  ReadingCyclesResponseSchema,
  ReorderReadingTargetsPayloadSchema,
  UpdateReadingProgressPayloadSchema,
  UpdateReadingTargetPayloadSchema,
  UpdateReadingCyclePayloadSchema,
} from "@/lib/contracts/reading-cycle.contract";
import type {
  CreateReadingCyclePayload,
  CreateReadingTargetPayload,
  ReadingTarget,
  ReadingTargetsResponse,
  ReadingProgressResponse,
  ReadingCycle,
  ReadingCyclesResponse,
  ReorderReadingTargetsPayload,
  UpdateReadingProgressPayload,
  UpdateReadingTargetPayload,
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

export async function getReadingTargets(
  clubId: string,
  cycleId: string,
): Promise<ReadingTargetsResponse> {
  const data = await getJson<ReadingTargetsResponse>(
    `/clubs/${clubId}/reading-cycles/${cycleId}/targets`,
  );

  return ReadingTargetsResponseSchema.parse(data);
}

export async function createReadingTarget(
  clubId: string,
  cycleId: string,
  input: CreateReadingTargetPayload,
): Promise<ReadingTarget> {
  const payload = CreateReadingTargetPayloadSchema.parse(input);
  const data = await postJson<
    { target: ReadingTarget },
    CreateReadingTargetPayload
  >(`/clubs/${clubId}/reading-cycles/${cycleId}/targets`, payload);

  return ReadingTargetResponseSchema.parse(data).target;
}

export async function updateReadingTarget(
  clubId: string,
  cycleId: string,
  targetId: string,
  input: UpdateReadingTargetPayload,
): Promise<ReadingTarget> {
  const payload = UpdateReadingTargetPayloadSchema.parse(input);
  const data = await patchJson<
    { target: ReadingTarget },
    UpdateReadingTargetPayload
  >(`/clubs/${clubId}/reading-cycles/${cycleId}/targets/${targetId}`, payload);

  return ReadingTargetResponseSchema.parse(data).target;
}

export async function deleteReadingTarget(
  clubId: string,
  cycleId: string,
  targetId: string,
): Promise<ReadingTargetsResponse> {
  const data = await deleteJson<ReadingTargetsResponse>(
    `/clubs/${clubId}/reading-cycles/${cycleId}/targets/${targetId}`,
  );

  return ReadingTargetsResponseSchema.parse(data);
}

export async function reorderReadingTargets(
  clubId: string,
  cycleId: string,
  input: ReorderReadingTargetsPayload,
): Promise<ReadingTargetsResponse> {
  const payload = ReorderReadingTargetsPayloadSchema.parse(input);
  const data = await putJson<
    ReadingTargetsResponse,
    ReorderReadingTargetsPayload
  >(`/clubs/${clubId}/reading-cycles/${cycleId}/targets/order`, payload);

  return ReadingTargetsResponseSchema.parse(data);
}
