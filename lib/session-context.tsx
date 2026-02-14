"use client";

import {
  clearSessionError,
  fetchSession,
  login,
  logout,
} from "@/lib/session/session-slice";
import type { LoginPayload, SessionData } from "@/lib/session/types";
import { useAppDispatch, useAppSelector } from "@/lib/store-hooks";
import { createContext, useContext, useEffect, useMemo } from "react";

type SessionContextValue = {
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  session: SessionData | null;
  error: string | null;
  isAuthenticated: boolean;
  refresh: () => Promise<SessionData>;
  login: (payload: LoginPayload) => Promise<SessionData>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const sessionState = useAppSelector((state) => state.session);

  useEffect(() => {
    if (sessionState.status === "idle") {
      void dispatch(fetchSession());
    }
  }, [dispatch, sessionState.status]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status: sessionState.status,
      session: sessionState.data,
      error: sessionState.error,
      isAuthenticated: sessionState.status === "authenticated",
      refresh: async () => dispatch(fetchSession()).unwrap(),
      login: async (payload) => dispatch(login(payload)).unwrap(),
      logout: async () => {
        await dispatch(logout()).unwrap();
      },
      clearError: () => {
        dispatch(clearSessionError());
      },
    }),
    [dispatch, sessionState.data, sessionState.error, sessionState.status]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
