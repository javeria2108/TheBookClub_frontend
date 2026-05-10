"use client";

import { useEffect, useState } from "react";
import type { AuthState } from "@/lib/types";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, getStoredToken, logoutUser } from "@/lib/auth";

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isReady: false,
  });

  useEffect(() => {
    // Initialize state based on stored token.
    const init = async () => {
      const token = getStoredToken();
      const rawUser = localStorage.getItem(AUTH_USER_KEY);

      if (!token || !rawUser) {
        // If token is missing or expired, ensure server cookie is cleared.
        try {
          await logoutUser();
        } catch {
          // ignore network errors here; we'll still clear local state
        }

        setState({ isAuthenticated: false, isReady: true });
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
        try {
          await logoutUser();
        } catch {
          /* noop */
        }
        setState({ isAuthenticated: false, isReady: true });
      }
    };

    void init();

    // Periodically check token expiry in case app stays open for long periods.
    const interval = setInterval(() => {
      const t = getStoredToken();
      if (!t) {
        // token expired or removed — log out and update state
        void (async () => {
          try {
            await logoutUser();
          } catch {
            /* ignore */
          }
          setState({ isAuthenticated: false, isReady: true });
        })();
      }
    }, 60 * 1000); // check every minute

    // Sync auth state across tabs/windows
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === AUTH_TOKEN_KEY || ev.key === AUTH_USER_KEY) {
        const tk = getStoredToken();
        const raw = localStorage.getItem(AUTH_USER_KEY);
        if (!tk || !raw) {
          setState({ isAuthenticated: false, isReady: true });
          return;
        }

        try {
          const parsed = JSON.parse(raw) as { name?: string; username?: string };
          setState({ isAuthenticated: true, isReady: true, user: { name: parsed.name?.trim() || parsed.username?.trim() || "Reader" } });
        } catch {
          setState({ isAuthenticated: false, isReady: true });
        }
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return state;
}
