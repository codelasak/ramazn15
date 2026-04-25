"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "./shell/AppShell";
import DashboardScreen from "./screens/DashboardScreen";
import { useAuth } from "./lib/auth-context";
import { apiJson, ApiError } from "./lib/api-client";
import type { DashboardData } from "./lib/dashboard-types";

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/giris");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const payload = await apiJson<DashboardData>("/api/v1/dashboard");
        if (!cancelled) setData(payload);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/giris");
          return;
        }
        setLoadError("Veriler yüklenemedi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && !data && !loadError)) {
    return (
      <AppShell>
        <div className="min-h-dvh flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <div className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6">
          <span className="material-icons-round text-4xl text-red-400">error_outline</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{loadError}</p>
          <button
            onClick={() => location.reload()}
            className="text-xs font-semibold text-primary bg-primary/10 px-4 py-2 rounded-lg"
          >
            Yeniden Dene
          </button>
        </div>
      </AppShell>
    );
  }

  if (!data) return null;

  return (
    <AppShell>
      <DashboardScreen
        meals={data.meals}
        announcements={data.announcements}
        upcomingExam={data.upcomingExam}
        studySessions={data.studySessions}
        schedules={data.schedules}
      />
    </AppShell>
  );
}
