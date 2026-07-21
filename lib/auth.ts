import { getJson, postJson } from "@/lib/api";
import {
  AuthResponseSchema,
  LoginRequestPayloadSchema,
  SignupRequestPayloadSchema,
  SocketTokenResponseSchema,
} from "@/lib/contracts/auth.contract";
import {
  AuthResponse,
  AuthUser,
  LoginRequestPayload,
  SignupRequestPayload,
  SocketTokenResponse,
} from "@/lib/types";

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const payload: LoginRequestPayload = LoginRequestPayloadSchema.parse({
    email,
    password,
  });

  const data = await postJson<AuthResponse, LoginRequestPayload>(
    "/auth/login",
    payload,
  );

  return AuthResponseSchema.parse(data);
}

export async function signupUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const payload: SignupRequestPayload = SignupRequestPayloadSchema.parse({
    name,
    email,
    password,
  });

  const data = await postJson<AuthResponse, SignupRequestPayload>(
    "/auth/register",
    payload,
  );

  return AuthResponseSchema.parse(data);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const data = await getJson<AuthResponse>("/auth/me");
  return AuthResponseSchema.parse(data).user;
}

export async function getSocketToken(): Promise<string> {
  const data = await getJson<SocketTokenResponse>("/auth/socket-token");
  return SocketTokenResponseSchema.parse(data).token;
}

export async function logoutUser(): Promise<void> {
  await postJson<{ message: string }, Record<string, never>>(
    "/auth/logout",
    {},
  );
}
