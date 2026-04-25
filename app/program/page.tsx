"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../shell/AppShell";
import { useAuth } from "../lib/auth-context";
import { apiJson, ApiError } from "../lib/api-client";

interface ScheduleRow {
  id: string;
  dayOfWeek: number;
  period: number;
  subject: string;
  teacherName: string | null;
  room: string | null;
}

interface ScheduleResponse {
  className: string | null;
  schedules: ScheduleRow[];
}

const DAYS = [
  { id: 1, name: "Pazartesi", short: "Pzt" },
  { id: 2, name: "Salı", short: "Sal" },
  { id: 3, name: "Çarşamba", short: "Çar" },
  { id: 4, name: "Perşembe", short: "Per" },
  { id: 5, name: "Cuma", short: "Cum" },
];

export default function ProgramPage() {
  const { status, user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const todayDow = (new Date().getDay() || 7);
  const [activeDay, setActiveDay] = useState<number>(todayDow >= 1 && todayDow <= 5 ? todayDow : 1);

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
        const res = await apiJson<ScheduleResponse>("/api/v1/schedule");
        if (!cancelled) setData(res);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/giris");
          return;
        }
        setLoadError("Program yüklenemedi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, router]);

  if (status !== "authenticated" || (!data && !loadError)) {
    return (
      <AppShell>
        <div className="min-h-dvh flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const className = data?.className ?? user?.className ?? null;
  const dayRows = (data?.schedules ?? []).filter((r) => r.dayOfWeek === activeDay);

  return (
    <AppShell>
      <div className="relative min-h-dvh">
        <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-orange-50 to-amber-50/50 dark:from-transparent dark:to-transparent pb-6 pt-12 shadow-sm px-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              <span className="material-icons-round text-orange-500 text-3xl">calendar_month</span>
              Ders Programı
            </h1>
            <p className="text-sm text-gray-500 dark:text-orange-100/80 mt-2 font-medium">
              {className ? `Sınıf: ${className}` : "Sınıf bilginiz tanımlı değil"}
            </p>
          </div>

          {/* Day tabs */}
          <div className="relative z-10 mt-5 flex gap-2 overflow-x-auto no-scrollbar">
            {DAYS.map((d) => {
              const active = d.id === activeDay;
              const isToday = d.id === todayDow;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDay(d.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                      : "bg-white/70 text-gray-600 hover:bg-white"
                  }`}
                >
                  <span className="block">{d.short}</span>
                  {isToday && (
                    <span className={`block text-[9px] mt-0.5 ${active ? "opacity-90" : "text-orange-500"}`}>
                      Bugün
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        <main className="px-6 py-6 pb-8">
          {loadError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
              <span className="material-icons-round text-red-400 text-3xl mb-2 block">error_outline</span>
              <p className="text-sm text-red-600 mb-3">{loadError}</p>
              <button
                onClick={() => location.reload()}
                className="text-xs font-semibold text-red-700 bg-red-100 px-4 py-2 rounded-lg"
              >
                Yeniden Dene
              </button>
            </div>
          )}

          {!loadError && dayRows.length === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center text-gray-800 dark:text-gray-900">
              <span className="material-icons-round text-gray-300 text-5xl mb-4 block">event_busy</span>
              <h2 className="text-lg font-bold text-gray-700 mb-2">
                {DAYS.find((d) => d.id === activeDay)?.name} için ders yok
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-700">
                {className
                  ? `${className} sınıfı için bu gün ders programı tanımlanmamış.`
                  : "Profil sayfasından sınıfınızı seçtikten sonra programınız burada görünecek."}
              </p>
            </div>
          )}

          {dayRows.length > 0 && (
            <ul className="space-y-3">
              {dayRows.map((r) => (
                <li
                  key={r.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 text-gray-800 dark:text-gray-900"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-medium text-orange-600">DERS</span>
                    <span className="text-base font-bold text-orange-700">{r.period}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{r.subject}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      {r.teacherName && (
                        <span className="flex items-center gap-1 truncate">
                          <span className="material-icons-round text-[12px]">person</span>
                          {r.teacherName}
                        </span>
                      )}
                      {r.room && (
                        <span className="flex items-center gap-1 shrink-0">
                          <span className="material-icons-round text-[12px]">room</span>
                          {r.room}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </AppShell>
  );
}
