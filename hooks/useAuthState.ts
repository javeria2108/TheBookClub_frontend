"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import type { AuthState } from "@/lib/types";

type AuthStateData = Omit<AuthState, "logout">;

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthStateData>({
    status: "loading",
    isAuthenticated: false,
    isReady: false,
  });

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setState({
        status: "unauthenticated",
        isAuthenticated: false,
        isReady: true,
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        setState({
          status: "authenticated",
          isAuthenticated: true,
          isReady: true,
          user: {
            name: user.username.trim() || "Reader",
          },
        });
      } catch (error) {
        if (!isMounted) return;

        const isAuthFailure =
          error instanceof ApiError && error.statusCode === 401;

        setState({
          status: "unauthenticated",
          isAuthenticated: false,
          isReady: true,
          error: isAuthFailure
            ? undefined
            : "Unable to restore your session. Please try again.",
        });
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  return {
    ...state,
    logout,
  };
}
