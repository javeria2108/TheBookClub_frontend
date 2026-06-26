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
  hasPendingJoinRequest: z.boolean().optional(),
  pendingJoinRequestId: z.string().uuid().nullable().optional(),
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
  coverImage: z.string().url("Cover image is required"),
});

export const CreateClubFormSchema = CreateClubPayloadSchema.omit({
  coverImage: true,
});

export const UpdateClubPayloadSchema = z
  .object({
    name: z.string().trim().min(1, "Club name is required").max(100).optional(),
    description: z.string().trim().max(500).optional().nullable(),
    isPublic: z.boolean().optional(),
    genre: z.string().trim().max(80).optional().nullable(),
    coverImage: z.string().url("Cover image must be a valid URL").optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided to update",
  });

export const ClubSettingsFormSchema = z.object({
  name: z.string().trim().min(1, "Club name is required").max(100),
  description: z.string().trim().max(500).optional(),
  isPublic: z.boolean(),
  genre: z.string().trim().max(80).optional(),
});

export const UploadClubCoverResponseSchema = z.object({
  url: z.string().url(),
});

export const JoinClubResponseSchema = z.object({
  clubId: z.string().uuid().optional(),
  memberCount: z.number().int().nonnegative().optional(),
  message: z.string().optional(),
}).refine(
  (value) => value.memberCount !== undefined || value.message !== undefined,
  {
    message: "Join club response must include either memberCount or message",
  },
);

export const ClubMemberSummarySchema = z.object({
  userId: z.string().uuid(),
  username: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["MEMBER", "MODERATOR", "OWNER"]),
  joinedAt: z.string(),
});

export const GetClubMembersResponseSchema = z.object({
  members: z.array(ClubMemberSummarySchema),
});

export const OperationMessageSchema = z.object({
  message: z.string(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  clubId: z.string().uuid(),
  userId: z.string().uuid(),
  username: z.string().min(1),
  content: z.string(),
  createdAt: z.string(),
});

export const GetChatMessagesResponseSchema = z.object({
  messages: z.array(ChatMessageSchema),
});

export const CreateClubResponseSchema = z.object({
  club: ClubSchema,
});

export const GetClubByIdResponseSchema = z.object({
  club: ClubSchema,
});
