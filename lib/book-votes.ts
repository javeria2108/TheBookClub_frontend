import {
  BookVotePayloadSchema,
  BookVoteRoundResponseSchema,
  BookVoteRoundsResponseSchema,
  CreateBookNominationPayloadSchema,
  CreateBookVoteRoundPayloadSchema,
} from "@/lib/contracts/book-vote.contract";
import { deleteJson, getJson, postJson, putJson } from "@/lib/api";
import type {
  BookVotePayload,
  BookVoteRound,
  BookVoteRoundsResponse,
  CreateBookNominationPayload,
  CreateBookVoteRoundPayload,
} from "@/lib/types";

export async function getBookVoteRounds(
  clubId: string,
): Promise<BookVoteRound[]> {
  const data = await getJson<BookVoteRoundsResponse>(
    `/clubs/${clubId}/book-vote-rounds`,
  );
  return BookVoteRoundsResponseSchema.parse(data).voteRounds;
}

export async function createBookVoteRound(
  clubId: string,
  input: CreateBookVoteRoundPayload,
): Promise<BookVoteRound> {
  const payload = CreateBookVoteRoundPayloadSchema.parse(input);
  const data = await postJson<{ voteRound: BookVoteRound }, CreateBookVoteRoundPayload>(
    `/clubs/${clubId}/book-vote-rounds`,
    payload,
  );
  return BookVoteRoundResponseSchema.parse(data).voteRound;
}

export async function openBookVoteRound(
  clubId: string,
  roundId: string,
): Promise<BookVoteRound> {
  const data = await postJson<{ voteRound: BookVoteRound }, Record<string, never>>(
    `/clubs/${clubId}/book-vote-rounds/${roundId}/open`,
    {},
  );
  return BookVoteRoundResponseSchema.parse(data).voteRound;
}

export async function closeBookVoteRound(
  clubId: string,
  roundId: string,
): Promise<BookVoteRound> {
  const data = await postJson<{ voteRound: BookVoteRound }, Record<string, never>>(
    `/clubs/${clubId}/book-vote-rounds/${roundId}/close`,
    {},
  );
  return BookVoteRoundResponseSchema.parse(data).voteRound;
}

export async function cancelBookVoteRound(
  clubId: string,
  roundId: string,
): Promise<BookVoteRound> {
  const data = await postJson<{ voteRound: BookVoteRound }, Record<string, never>>(
    `/clubs/${clubId}/book-vote-rounds/${roundId}/cancel`,
    {},
  );
  return BookVoteRoundResponseSchema.parse(data).voteRound;
}

export async function nominateBook(
  clubId: string,
  roundId: string,
  input: CreateBookNominationPayload,
): Promise<BookVoteRound> {
  const payload = CreateBookNominationPayloadSchema.parse(input);
  const data = await postJson<{ voteRound: BookVoteRound }, CreateBookNominationPayload>(
    `/clubs/${clubId}/book-vote-rounds/${roundId}/nominations`,
    payload,
  );
  return BookVoteRoundResponseSchema.parse(data).voteRound;
}

export async function removeBookNomination(
  clubId: string,
  roundId: string,
  nominationId: string,
): Promise<BookVoteRound> {
  const data = await deleteJson<{ voteRound: BookVoteRound }>(
    `/clubs/${clubId}/book-vote-rounds/${roundId}/nominations/${nominationId}`,
  );
  return BookVoteRoundResponseSchema.parse(data).voteRound;
}

export async function voteForBook(
  clubId: string,
  roundId: string,
  input: BookVotePayload,
): Promise<BookVoteRound> {
  const payload = BookVotePayloadSchema.parse(input);
  const data = await putJson<{ voteRound: BookVoteRound }, BookVotePayload>(
    `/clubs/${clubId}/book-vote-rounds/${roundId}/vote`,
    payload,
  );
  return BookVoteRoundResponseSchema.parse(data).voteRound;
}

export async function resolveBookVoteWinner(
  clubId: string,
  roundId: string,
  input: BookVotePayload,
): Promise<BookVoteRound> {
  const payload = BookVotePayloadSchema.parse(input);
  const data = await postJson<{ voteRound: BookVoteRound }, BookVotePayload>(
    `/clubs/${clubId}/book-vote-rounds/${roundId}/winner`,
    payload,
  );
  return BookVoteRoundResponseSchema.parse(data).voteRound;
}
