"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../shell/AppShell";
import ProfileScreen from "../screens/ProfileScreen";
import { useAuth } from "../lib/auth-context";

export default function ProfilPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/giris");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <AppShell>
        <div className="min-h-dvh flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ProfileScreen />
    </AppShell>
  );
}
