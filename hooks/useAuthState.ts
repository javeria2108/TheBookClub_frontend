"use client";

import { useEffect, useState } from "react";
import type { AuthState } from "@lib/types";

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const rawUser = localStorage.getItem("authUser");

    if (!token || !rawUser) {
      return;
    }

    try {
      const parsed = JSON.parse(rawUser) as { name?: string };
      setState({
        isAuthenticated: true,
        user: { name: parsed.name?.trim() || "Reader" },
      });
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      setState({ isAuthenticated: false });
    }
  }, []);

  return state;
}
