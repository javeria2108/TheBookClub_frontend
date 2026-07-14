"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import type { AuthState } from "@/lib/types";

type AuthStateData = Omit<AuthState, "logout">;

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthStateData>({
    isAuthenticated: false,
    isReady: false,
  });

  const logout = useCallback(async () => {
    await logoutUser();
    setState({
      isAuthenticated: false,
      isReady: true,
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        setState({
          isAuthenticated: true,
          isReady: true,
          user: {
            name: user.username.trim() || "Reader",
          },
        });
      } catch {
        if (!isMounted) return;

        setState({
          isAuthenticated: false,
          isReady: true,
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
