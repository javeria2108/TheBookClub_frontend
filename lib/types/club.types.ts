import { z } from "zod";
import {
  ClubSchema,
  GetClubsParamsSchema,
  GetClubsResponseSchema,
  PaginationSchema,
} from "@/lib/contracts/club.contract";

export type Club = z.infer<typeof ClubSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type GetClubsResponse = z.infer<typeof GetClubsResponseSchema>;
export type GetClubsParams = z.infer<typeof GetClubsParamsSchema>;
