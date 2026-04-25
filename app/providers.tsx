"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";
import { AuthProvider } from "./lib/auth-context";
import { initCapacitor } from "./lib/capacitor-init";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void initCapacitor();
  }, []);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <AuthProvider>{children}</AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
