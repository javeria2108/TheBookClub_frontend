"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import type { AuthState } from "@/lib/types";

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isReady: false,
  });

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
  }, []);

  return state;
}
