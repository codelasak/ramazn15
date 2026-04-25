"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../shell/AppShell";
import TakipClient from "./TakipClient";
import { useAuth } from "../lib/auth-context";
import { apiJson, ApiError } from "../lib/api-client";

interface MockExamRow {
  id: string;
  examName: string;
  examType: string;
  examDate: string;
  totalNet: string | number;
  turkishCorrect: number;
  turkishWrong: number;
  mathCorrect: number;
  mathWrong: number;
  socialCorrect: number;
  socialWrong: number;
  scienceCorrect: number;
  scienceWrong: number;
  createdAt: string;
}

export default function TakipPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<MockExamRow[] | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/giris");
    }
  }, [status, router]);

  const reload = useCallback(async () => {
    try {
      const data = await apiJson<{ results: MockExamRow[] }>("/api/v1/mock-exams");
      setResults(data.results);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/giris");
        return;
      }
      setResults([]);
    }
  }, [router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiJson<{ results: MockExamRow[] }>("/api/v1/mock-exams");
        if (!cancelled) setResults(data.results);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/giris");
          return;
        }
        setResults([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, router]);

  if (status !== "authenticated" || results === null) {
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
      <div className="relative min-h-dvh bg-slate-50 dark:bg-transparent text-gray-800 dark:text-gray-900">
        <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-indigo-50 to-blue-50/50 dark:from-black/40 dark:to-black/10 dark:border-b dark:border-white/5 pb-8 pt-12 shadow-sm px-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              <span className="material-icons-round text-indigo-500 text-3xl">trending_up</span>
              Deneme Takibi
            </h1>
            <p className="text-sm text-gray-500 dark:text-indigo-100/80 mt-2 font-medium">Sınav sonuçların ve net gelişim analizin</p>
          </div>
        </header>
        <main className="px-6 py-6 pb-24 space-y-6">
          <TakipClient results={results} onReload={reload} />
        </main>
      </div>
    </AppShell>
  );
}
