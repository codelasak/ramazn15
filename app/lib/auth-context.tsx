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
import { dbg } from "./debug-log";

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
  deleteAccount: () => Promise<void>;
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
    dbg("[auth-ctx]", "refreshUser begin");
    try {
      const data = await apiJson<{ user: AuthUser }>("/api/v1/auth/me", {
        method: "GET",
      });
      dbg("[auth-ctx]", "refreshUser ok", data.user.email);
      setUser(data.user);
      setStatus("authenticated");
    } catch (err) {
      dbg("[auth-ctx]", "refreshUser fail", err instanceof Error ? err.message : String(err));
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
      try {
        dbg("[auth-ctx]", "init: getStoredUser (3s timeout)");
        // Storage cagrilari herhangi bir nedenle takilirsa 3sn icinde
        // unauthenticated state'e dus, kullaniciyi giris ekranina at.
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 3000)
        );
        const stored = await Promise.race([getStoredUser(), timeoutPromise]);
        if (cancelled) return;
        if (stored) {
          dbg("[auth-ctx]", "init: stored user found", stored.email);
          setUser(stored);
          setStatus("authenticated");
          refreshUser().catch(() => {});
        } else {
          dbg("[auth-ctx]", "init: no stored user -> unauthenticated");
          setStatus("unauthenticated");
        }
      } catch (err) {
        if (!cancelled) {
          dbg("[auth-ctx]", "init failed", err instanceof Error ? err.message : String(err));
          setStatus("unauthenticated");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      dbg("[auth-ctx]", "login.apiJson begin");
      const data = await apiJson<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }, { auth: false });
      dbg("[auth-ctx]", "login.apiJson done, persistSession begin");
      await persistSession(data);
      dbg("[auth-ctx]", "persistSession done, setUser/setStatus");
      setUser(data.user);
      setStatus("authenticated");
      dbg("[auth-ctx]", "login complete");
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
      dbg("[auth-ctx]", "register.apiJson begin", input.email);
      const data = await apiJson<AuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }, { auth: false });
      dbg("[auth-ctx]", "register.apiJson done, persistSession begin");
      await persistSession(data);
      dbg("[auth-ctx]", "persistSession done, setUser/setStatus");
      setUser(data.user);
      setStatus("authenticated");
      dbg("[auth-ctx]", "register complete");
    },
    []
  );

  const deleteAccount = useCallback(async () => {
    dbg("[auth-ctx]", "deleteAccount.apiJson begin");
    await apiJson("/api/v1/auth/me", { method: "DELETE" });
    dbg("[auth-ctx]", "deleteAccount.apiJson done, clearSession");
    await clearSession();
    setUser(null);
    setStatus("unauthenticated");
    dbg("[auth-ctx]", "deleteAccount complete");
  }, []);

  const logout = useCallback(async () => {
    dbg("[auth-ctx]", "logout.apiJson begin");
    try {
      await apiJson("/api/v1/auth/logout", { method: "POST" });
      dbg("[auth-ctx]", "logout.apiJson done");
    } catch (err) {
      // best-effort
      dbg("[auth-ctx]", "logout.apiJson failed (best-effort)", err instanceof Error ? err.message : String(err));
    }
    dbg("[auth-ctx]", "clearSession begin");
    await clearSession();
    dbg("[auth-ctx]", "clearSession done, setUser(null)");
    setUser(null);
    setStatus("unauthenticated");
    dbg("[auth-ctx]", "logout complete");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, deleteAccount, refreshUser }),
    [status, user, login, register, logout, deleteAccount, refreshUser]
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
