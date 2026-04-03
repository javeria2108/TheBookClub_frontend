import { z } from "zod";
import {
  AuthResponseSchema,
  AuthUserSchema,
  LoginRequestPayloadSchema,
  SignupRequestPayloadSchema,
  UserRoleSchema,
} from "@/lib/contracts/auth.contract";

export type UserRole = z.infer<typeof UserRoleSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type LoginRequestPayload = z.infer<typeof LoginRequestPayloadSchema>;
export type SignupRequestPayload = z.infer<typeof SignupRequestPayloadSchema>;
