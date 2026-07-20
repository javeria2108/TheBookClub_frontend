import { z } from "zod";

import { ReadingCycleSchema } from "@/lib/contracts/reading-cycle.contract";

export const PROFILE_GENRE_OPTIONS = [
  "Classics",
  "Contemporary Fiction",
  "Fantasy",
  "Historical Fiction",
  "Islamic Studies",
  "Literary Fiction",
  "Memoir",
  "Mystery",
  "Nonfiction",
  "Personal Growth",
  "Philosophy",
  "Poetry",
  "Romance",
  "Science Fiction",
] as const;

export const JoinedClubSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  genre: z.string().nullable(),
  coverImage: z.string().url().nullable(),
  memberCount: z.number().int().nonnegative(),
  memberRole: z.enum(["MEMBER", "MODERATOR", "OWNER"]),
  currentReadingCycle: ReadingCycleSchema.nullable().optional(),
  joinedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().nullable(),
  favoriteGenres: z.array(z.string()),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  joinedClubs: z.array(JoinedClubSummarySchema),
});

export const UserProfileResponseSchema = z.object({
  profile: UserProfileSchema,
});

export const UpdateUserProfilePayloadSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens",
      )
      .optional(),
    bio: z
      .string()
      .trim()
      .max(500, "Bio must be 500 characters or fewer")
      .nullable()
      .optional(),
    favoriteGenres: z
      .array(z.string().trim().min(1).max(40))
      .max(8, "Choose up to 8 favorite genres")
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field must be provided",
  });
