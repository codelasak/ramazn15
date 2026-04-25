"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiJson, ApiError } from "./api-client";
import {
  clearSession,
  getStoredUser,
  persistSession,
  type AuthUser,
} from "./auth-storage";

/**
 * Pano15 mobil + web client auth context.
 *
 * NextAuth React provider'in karsiligi. JWT tokenlari Capacitor Preferences
 * (native) veya localStorage (web) icinde saklanir.
 */

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    className?: string | null;
    department?: AuthUser["department"];
    isBoarder?: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiJson<{ user: AuthUser }>("/api/v1/auth/me", {
        method: "GET",
      });
      setUser(data.user);
      setStatus("authenticated");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await clearSession();
        setUser(null);
        setStatus("unauthenticated");
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getStoredUser();
      if (cancelled) return;
      if (stored) {
        setUser(stored);
        setStatus("authenticated");
        // Arkada user'i tazele.
        refreshUser().catch(() => {});
      } else {
        setStatus("unauthenticated");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const data = await apiJson<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }, { auth: false });
      await persistSession(data);
      setUser(data.user);
      setStatus("authenticated");
    },
    []
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      className?: string | null;
      department?: AuthUser["department"];
      isBoarder?: boolean;
    }) => {
      const data = await apiJson<AuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }, { auth: false });
      await persistSession(data);
      setUser(data.user);
      setStatus("authenticated");
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiJson("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // best-effort
    }
    await clearSession();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, refreshUser }),
    [status, user, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth bir AuthProvider icinde kullanilmali.");
  }
  return ctx;
}
