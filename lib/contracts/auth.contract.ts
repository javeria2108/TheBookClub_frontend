import { z } from "zod";

export const UserRoleSchema = z.enum(["USER", "ADMIN"]);

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(1),
  role: UserRoleSchema,
});

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
  token: z.string().min(1),
});

export const LoginRequestPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const SignupRequestPayloadSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});
