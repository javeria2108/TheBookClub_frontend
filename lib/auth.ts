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

function getJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as { exp?: number };
  } catch {
    return null;
  }
}

function isJwtExpired(token: string): boolean {
  const payload = getJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

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
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return null;
  }

  if (isJwtExpired(token)) {
    clearAuthStorage();
    return null;
  }

  return token;
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