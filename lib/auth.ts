import { postJson } from "@/lib/api";
import {
  AuthResponse,
  LoginRequestPayload,
  SignupRequestPayload,
} from "@/lib/types";

const AUTH_TOKEN_KEY = "bookclub_auth_token";
const AUTH_USER_KEY = "bookclub_auth_user";

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await postJson<AuthResponse, LoginRequestPayload>(
    "/auth/login",
    { email, password }
  );

  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

  return data;
}

export async function signupUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await postJson<AuthResponse, SignupRequestPayload>(
    "/auth/register",
    { name, email, password }
  );

  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

  return data;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}