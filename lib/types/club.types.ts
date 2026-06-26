import { z } from "zod";
import {
  ClubSchema,
  GetClubsParamsSchema,
  GetClubsResponseSchema,
  PaginationSchema,
  CreateClubPayloadSchema,
  UpdateClubPayloadSchema,
  UploadClubCoverResponseSchema,
  CreateClubResponseSchema,
  GetClubByIdResponseSchema,
  JoinClubResponseSchema,
  ClubMemberSummarySchema,
  GetClubMembersResponseSchema,
  OperationMessageSchema,
  ChatMessageSchema,
  GetChatMessagesResponseSchema,
} from "@/lib/contracts/club.contract";

export type Club = z.infer<typeof ClubSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type GetClubsResponse = z.infer<typeof GetClubsResponseSchema>;
export type GetClubsParams = z.infer<typeof GetClubsParamsSchema>;
export type CreateClubPayload = z.infer<typeof CreateClubPayloadSchema>;
export type UpdateClubPayload = z.infer<typeof UpdateClubPayloadSchema>;
export type UploadClubCoverResponse = z.infer<typeof UploadClubCoverResponseSchema>;
export type CreateClubResponse = z.infer<typeof CreateClubResponseSchema>;
export type GetClubByIdResponse = z.infer<typeof GetClubByIdResponseSchema>;
export type JoinClubResponse = z.infer<typeof JoinClubResponseSchema>;
export type ClubMemberSummary = z.infer<typeof ClubMemberSummarySchema>;
export type GetClubMembersResponse = z.infer<typeof GetClubMembersResponseSchema>;
export type OperationMessage = z.infer<typeof OperationMessageSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type GetChatMessagesResponse = z.infer<typeof GetChatMessagesResponseSchema>;
