"use client";

import { useEffect, useState } from "react";
import type { AuthState } from "@/lib/types";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, getStoredToken } from "@/lib/auth";

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isReady: false,
  });

  useEffect(() => {
    const token = getStoredToken();
    const rawUser = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !rawUser) {
      setState({
        isAuthenticated: false,
        isReady: true,
      });
      return;
    }

    try {
      const parsed = JSON.parse(rawUser) as { name?: string; username?: string };
      setState({
        isAuthenticated: true,
        isReady: true,
        user: { name: parsed.name?.trim() || parsed.username?.trim() || "Reader" },
      });
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setState({
        isAuthenticated: false,
        isReady: true,
      });
    }
  }, []);

  return state;
}
