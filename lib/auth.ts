import { postJson } from "@/lib/api";
import {
  AuthResponseSchema,
  LoginRequestPayloadSchema,
  SignupRequestPayloadSchema,
} from "@/lib/contracts/auth.contract";
import {
  AuthResponse,
  LoginRequestPayload,
  SignupRequestPayload,
} from "@/lib/types";

export const AUTH_TOKEN_KEY = "bookclub_auth_token";
export const AUTH_USER_KEY = "bookclub_auth_user";

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const payload: LoginRequestPayload = LoginRequestPayloadSchema.parse({
    email,
    password,
  });

  const data = await postJson<AuthResponse, LoginRequestPayload>(
    "/auth/login",
    payload
  );

  const parsed = AuthResponseSchema.parse(data);

  localStorage.setItem(AUTH_TOKEN_KEY, parsed.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(parsed.user));

  return parsed;
}

export async function signupUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const payload: SignupRequestPayload = SignupRequestPayloadSchema.parse({
    name,
    email,
    password,
  });

  const data = await postJson<AuthResponse, SignupRequestPayload>(
    "/auth/register",
    payload
  );

  const parsed = AuthResponseSchema.parse(data);

  localStorage.setItem(AUTH_TOKEN_KEY, parsed.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(parsed.user));

  return parsed;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function logoutUser(): Promise<void> {
  try {
    await postJson<{ message: string }, Record<string, never>>("/auth/logout", {});
  } finally {
    clearAuthStorage();
  }
}