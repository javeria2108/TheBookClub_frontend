import { z } from "zod";

import {
  BookNominationSchema,
  BookVotePayloadSchema,
  BookVoteRoundSchema,
  BookVoteRoundsResponseSchema,
  BookVoteRoundStatusSchema,
  CreateBookNominationPayloadSchema,
  CreateBookVoteRoundPayloadSchema,
} from "@/lib/contracts/book-vote.contract";

export type BookVoteRoundStatus = z.infer<typeof BookVoteRoundStatusSchema>;
export type BookNomination = z.infer<typeof BookNominationSchema>;
export type BookVoteRound = z.infer<typeof BookVoteRoundSchema>;
export type BookVoteRoundsResponse = z.infer<
  typeof BookVoteRoundsResponseSchema
>;
export type CreateBookVoteRoundPayload = z.infer<
  typeof CreateBookVoteRoundPayloadSchema
>;
export type CreateBookNominationPayload = z.infer<
  typeof CreateBookNominationPayloadSchema
>;
export type BookVotePayload = z.infer<typeof BookVotePayloadSchema>;
