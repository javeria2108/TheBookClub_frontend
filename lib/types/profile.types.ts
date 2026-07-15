import { z } from "zod";

import {
  JoinedClubSummarySchema,
  UpdateUserProfilePayloadSchema,
  UserProfileResponseSchema,
  UserProfileSchema,
} from "@/lib/contracts/profile.contract";

export type JoinedClubSummary = z.infer<typeof JoinedClubSummarySchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
export type UpdateUserProfilePayload = z.infer<
  typeof UpdateUserProfilePayloadSchema
>;
