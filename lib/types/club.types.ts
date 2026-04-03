import { z } from "zod";
import {
  ClubSchema,
  GetClubsParamsSchema,
  GetClubsResponseSchema,
  PaginationSchema,
  CreateClubPayloadSchema,
  CreateClubResponseSchema,
} from "@/lib/contracts/club.contract";

export type Club = z.infer<typeof ClubSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type GetClubsResponse = z.infer<typeof GetClubsResponseSchema>;
export type GetClubsParams = z.infer<typeof GetClubsParamsSchema>;
export type CreateClubPayload = z.infer<typeof CreateClubPayloadSchema>;
export type CreateClubResponse = z.infer<typeof CreateClubResponseSchema>;
