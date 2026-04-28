import { z } from "zod";

export const ClubSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  genre: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  memberCount: z.number().int().nonnegative().optional(),
  isMember: z.boolean().optional(),
  memberRole: z.enum(["MEMBER", "MODERATOR", "OWNER"]).nullable().optional(),
  createdAt: z.string(),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const GetClubsResponseSchema = z.object({
  clubs: z.array(ClubSchema),
  pagination: PaginationSchema,
});

export const GetClubsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const CreateClubPayloadSchema = z.object({
  name: z.string().trim().min(1, "Club name is required").max(100),
  description: z.string().trim().max(500).optional(),
  isPublic: z.boolean().optional().default(true),
  genre: z.string().trim().max(80).optional(),
  coverImage: z.string().url().optional(),
});

export const JoinClubResponseSchema = z.object({
  clubId: z.string().uuid(),
  memberCount: z.number().int().nonnegative(),
});

export const CreateClubResponseSchema = z.object({
  club: ClubSchema,
});

export const GetClubByIdResponseSchema = z.object({
  club: ClubSchema,
});
