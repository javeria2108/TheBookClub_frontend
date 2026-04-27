"use client";

import { useEffect, useState } from "react";
import type { AuthState } from "@/lib/types";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/auth";

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const rawUser = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !rawUser) {
      return;
    }

    try {
      const parsed = JSON.parse(rawUser) as { name?: string; username?: string };
      setState({
        isAuthenticated: true,
        user: { name: parsed.name?.trim() || parsed.username?.trim() || "Reader" },
      });
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setState({ isAuthenticated: false });
    }
  }, []);

  return state;
}
