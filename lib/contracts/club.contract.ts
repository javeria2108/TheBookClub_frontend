import { z } from "zod";

export const ClubSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  isPublic: z.boolean(),
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
