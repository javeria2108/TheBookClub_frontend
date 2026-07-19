import { z } from "zod";

import { BookSchema } from "@/lib/contracts/book.contract";

export const BookVoteRoundStatusSchema = z.enum([
  "DRAFT",
  "OPEN",
  "CLOSED",
  "CANCELLED",
]);

export const BookNominationSchema = z.object({
  id: z.string().uuid(),
  book: BookSchema,
  reason: z.string().nullable(),
  nominatedBy: z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  voteCount: z.number().int().nonnegative(),
  isCurrentUserVote: z.boolean(),
  isWinner: z.boolean(),
  canRemove: z.boolean(),
  createdAt: z.string().datetime(),
});

export const BookVoteRoundSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: BookVoteRoundStatusSchema,
  opensAt: z.string().datetime().nullable(),
  closesAt: z.string().datetime().nullable(),
  totalEligibleMembers: z.number().int().nonnegative(),
  totalVotes: z.number().int().nonnegative(),
  currentUserVoteNominationId: z.string().uuid().nullable(),
  canNominate: z.boolean(),
  canVote: z.boolean(),
  canManage: z.boolean(),
  nominations: z.array(BookNominationSchema),
  winner: BookNominationSchema.nullable(),
  tiedLeaderIds: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BookVoteRoundsResponseSchema = z.object({
  voteRounds: z.array(BookVoteRoundSchema),
});

export const BookVoteRoundResponseSchema = z.object({
  voteRound: BookVoteRoundSchema,
});

export const CreateBookVoteRoundPayloadSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(800).optional().nullable(),
  opensAt: z.string().datetime().optional().nullable(),
  closesAt: z.string().datetime().optional().nullable(),
});

export const CreateBookNominationPayloadSchema = z
  .object({
    bookId: z.string().uuid().optional(),
    googleBooksId: z.string().min(1).optional(),
    reason: z.string().trim().max(1000).optional().nullable(),
  })
  .refine((value) => Boolean(value.bookId) !== Boolean(value.googleBooksId));

export const BookVotePayloadSchema = z.object({
  nominationId: z.string().uuid(),
});
