import { postJson } from "@/lib/api";

const AUTH_TOKEN_KEY = "bookclub_auth_token";
const AUTH_USER_KEY = "bookclub_auth_user";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
};

type AuthResponse = {
  user: AuthUser;
  token: string;
};

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await postJson<AuthResponse, { email: string; password: string }>(
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
  const data = await postJson<AuthResponse, { name: string; email: string; password: string }>(
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