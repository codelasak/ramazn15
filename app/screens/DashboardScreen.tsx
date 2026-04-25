"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePrayerTimes } from "../shared/usePrayerTimes";
import { msToCountdown, setDateToHm } from "../shared/time";

const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function formatTurkishDate(d: Date): string {
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${DAY_NAMES[d.getDay()]}`;
}

function getGreeting(hour: number): string {
  if (hour < 6) return "İyi Geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi Günler";
  return "İyi Akşamlar";
}

const PRAYER_KEYS = [
  { key: "imsak", label: "İmsak", icon: "dark_mode" },
  { key: "gunes", label: "Güneş", icon: "wb_sunny" },
  { key: "ogle", label: "Öğle", icon: "light_mode" },
  { key: "ikindi", label: "İkindi", icon: "wb_twilight" },
  { key: "aksam", label: "Akşam", icon: "nights_stay" },
  { key: "yatsi", label: "Yatsı", icon: "bedtime" },
] as const;

interface DashboardScreenProps {
  meals: any[];
  announcements: any[];
  upcomingExam?: {
    title: string;
    examDate: string;
    examType: string;
  } | null;
  studySessions?: any[];
  schedules?: any[];
}

export default function DashboardScreen({ meals, announcements, upcomingExam, studySessions, schedules }: DashboardScreenProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { times, loading: prayerLoading, districtId } = usePrayerTimes();

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status, router]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const user = session?.user;
  const dateStr = useMemo(() => formatTurkishDate(now), [now]);
  const greeting = useMemo(() => getGreeting(now.getHours()), [now]);

  /* Next prayer time */
  const nextPrayer = useMemo(() => {
    if (!times) return null;
    for (const p of PRAYER_KEYS) {
      const t = times[p.key];
      if (typeof t !== "string") continue;
      const d = setDateToHm(now, t);
      if (d && d.getTime() > now.getTime()) {
        return {
          ...p,
          time: t,
          countdown: msToCountdown(d.getTime() - now.getTime()),
        };
      }
    }
    return null;
  }, [now, times]);

  /* Dynamic exam countdown from upcomingExam prop */
  const examCountdown = useMemo(() => {
    if (!upcomingExam) return null;
    const examDate = new Date(upcomingExam.examDate);
    const diff = examDate.getTime() - now.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return {
      label: upcomingExam.title,
      days,
      hours,
      type: upcomingExam.examType
    };
  }, [now, upcomingExam]);

  if (status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-gray-50/50 dark:hidden pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute top-60 left-0 w-48 h-48 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-700 font-medium mb-1 flex items-center gap-1.5">
              <span className="material-icons-round text-base text-primary">calendar_today</span>
              {dateStr}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {greeting},
              <br />
              <span className="text-primary">{user.name?.split(" ")[0]}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                {user.className ?? "—"}
              </span>
              {user.isBoarder && (
                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-icons-round text-xs">apartment</span>
                  Yurtlu
                </span>
              )}
            </div>
          </div>
          <Link
            href="/profil"
            className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 relative group transition-transform active:scale-95 text-gray-800 dark:text-gray-900"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-lg font-bold">
              {user.name?.[0]?.toUpperCase() ?? "Ö"}
            </div>
          </Link>
        </header>

        <div className="flex-1 px-6 space-y-5">
          {/* Exam Countdown Card (12th graders) */}
          {examCountdown && (
            <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-xl text-gray-800 dark:text-gray-900" />
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-lg text-gray-800 dark:text-gray-900" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons-round text-xl opacity-80">timer</span>
                  <span className="text-sm font-semibold opacity-90 uppercase tracking-wide">{examCountdown.label}</span>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-bold tabular-nums">{examCountdown.days}</span>
                    <span className="text-lg opacity-70 mb-1">gün</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold tabular-nums">{examCountdown.hours}</span>
                    <span className="text-sm opacity-70 mb-1">saat</span>
                  </div>
                </div>
                <p className="text-sm opacity-70 mt-2">Her günü değerlendir! 💪</p>
              </div>
            </section>
          )}

          {/* Next Prayer Card */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden text-gray-800 dark:text-gray-900">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-primary text-xl">mosque</span>
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Sonraki Namaz</span>
              </div>
              <Link href="/ibadet" className="text-xs text-primary font-semibold hover:underline">
                Tümü →
              </Link>
            </div>
            {nextPrayer ? (
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{nextPrayer.label}</p>
                  <p className="text-lg font-semibold text-primary">{nextPrayer.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-700 mb-1">Kalan</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-900 tabular-nums">{nextPrayer.countdown}</p>
                </div>
              </div>
            ) : !districtId ? (
              <div className="flex flex-col items-start gap-2 py-1">
                <p className="text-gray-500 dark:text-gray-700 text-sm">Namaz vakitleri için konum seçin.</p>
                <Link href="/profil" className="text-xs text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20">
                  Konum Belirle
                </Link>
              </div>
            ) : prayerLoading ? (
              <p className="text-gray-400 dark:text-gray-600 text-sm">Yükleniyor...</p>
            ) : times ? (
              <p className="text-gray-400 dark:text-gray-600 text-sm">Bugünün vakitleri bitti</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-600 text-sm">Namaz vakitleri yüklenmedi</p>
            )}

            {/* Prayer time pills */}
            {times && (
              <div className="mt-4 flex justify-between gap-1.5 overflow-x-auto no-scrollbar pt-3 border-t border-gray-50">
                {PRAYER_KEYS.map((p) => {
                  const val = times[p.key];
                  const isNext = p.key === nextPrayer?.key;
                  const isPast = !isNext && (() => {
                    if (typeof val !== "string") return false;
                    const d = setDateToHm(now, val);
                    return d ? d.getTime() <= now.getTime() : false;
                  })();
                  return (
                    <div
                      key={p.key}
                      className={`flex flex-col items-center min-w-[3.5rem] py-2 px-1 rounded-xl transition-all ${isNext
                          ? "bg-primary text-white shadow-sm"
                          : isPast
                            ? "opacity-40"
                            : ""
                        }`}
                    >
                      <span className={`text-[10px] mb-0.5 ${isNext ? "opacity-80" : "text-gray-500 dark:text-gray-700"}`}>{p.label}</span>
                      <span className={`text-sm font-bold ${isNext ? "" : "text-gray-800 dark:text-gray-900"}`}>
                        {typeof val === "string" ? val : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Today's Schedule Preview */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-gray-800 dark:text-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" />
                Bugünkü Dersler
              </h2>
              <Link href="/program" className="text-xs text-primary font-semibold hover:underline">
                Program →
              </Link>
            </div>
            <div className="space-y-2.5">
              {schedules && schedules.length > 0 ? (
                schedules.map((schedule: any) => {
                  return (
                    <div key={schedule.id} className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 border-transparent">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500">
                        <span className="font-bold text-sm">{schedule.period}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{schedule.subject}</p>
                        <p className="text-xs text-gray-500">
                          {schedule.period}. Ders
                          {schedule.teacherName && ` • ${schedule.teacherName}`}
                          {schedule.room && ` • ${schedule.room}`}
=========
                    <div key={schedule.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isNow ? 'bg-primary/5 border-primary/10' : 'bg-gray-50 border-transparent'}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isNow ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 dark:text-gray-700'}`}>
                        <span className="font-bold text-sm">{schedule.period}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-900">{schedule.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-700">
                          {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                          {schedule.teacher && ` • ${schedule.teacher}`}
>>>>>>>>> Temporary merge branch 2
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100 text-gray-800 dark:text-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-700">Bugün için planlanmış ders bulunamadı.</p>
                </div>
              )}
            </div>
          </section>

          {/* Today's Study Sessions (Boarders only) */}
          {user.isBoarder && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-gray-800 dark:text-gray-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-900 flex items-center gap-2">
                  <span className="material-icons-round text-amber-500 text-xl">menu_book</span>
                  Bugünkü Etütler
                </h2>
              </div>
              <div className="space-y-2.5">
                {studySessions && studySessions.length > 0 ? (
                  studySessions.map((session, index) => (
                    <div key={session.id} className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-gray-800 dark:text-gray-900">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-900">{session.subject ?? "Bireysel Çalışma"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-700">
                          {session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}
                          {session.location && ` • ${session.location}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-center text-gray-800 dark:text-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-700 w-full">Bugün için planlanmış etüt yok.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Cafeteria Menu Card */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-gray-800 dark:text-gray-900">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-900 flex items-center gap-2">
                <span className="material-icons-round text-orange-500 text-xl">restaurant</span>
                Yemekhane
              </h2>
              <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">
                {user.isBoarder ? "3 Öğün" : "Öğle"}
              </span>
            </div>
            {meals.length > 0 ? (
              <div className="space-y-3">
                {meals.filter(m => user.isBoarder ? true : m.mealType === 'ogle').map((m) => (
                  <div key={m.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-icons-round text-orange-500 text-base">schedule</span>
                      <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
                        {m.mealType === 'ogle' ? 'Öğle Yemeği' : m.mealType === 'kahvalti' ? 'Kahvaltı' : 'Akşam Yemeği'} ({m.date})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {m.items.split('\n').map((item: string, i: number) => (
                        <p key={i} className="text-sm text-gray-700 font-medium">👉 {item.trim()}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center text-gray-800 dark:text-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-700">Henüz yemek menüsü eklenmedi.</p>
              </div>
            )}
          </section>

          {/* Announcements Preview */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-gray-800 dark:text-gray-900">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-900 flex items-center gap-2">
                <span className="material-icons-round text-blue-500 text-xl">campaign</span>
                Duyurular
              </h2>
              <Link href="/duyurular" className="text-xs text-primary font-semibold hover:underline">
                Tümü →
              </Link>
            </div>
            <div className="space-y-3">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-gray-800 dark:text-gray-900">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {ann.targetAudience}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-600">
                        {new Date(ann.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-900">{ann.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-700 mt-0.5 line-clamp-2">{ann.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center text-gray-800 dark:text-gray-900">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-700">Henüz duyuru eklenmedi</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="grid grid-cols-4 gap-3 pb-10">
            <Link href="/ibadet" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-active:scale-95 transition-transform group-hover:border-primary/30 group-hover:shadow-md text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-primary text-2xl">mosque</span>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-700 text-center">Namaz</span>
            </Link>
            <Link href="/ibadet" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-active:scale-95 transition-transform group-hover:border-primary/30 group-hover:shadow-md text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-primary text-2xl">menu_book</span>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-700 text-center">Kur'an</span>
            </Link>
            <Link href="/takip" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-active:scale-95 transition-transform group-hover:border-primary/30 group-hover:shadow-md text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-indigo-500 text-2xl">quiz</span>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-700 text-center">Denemeler</span>
            </Link>
            <button onClick={() => signOut()} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-active:scale-95 transition-transform group-hover:border-red-200 group-hover:shadow-md text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-gray-400 dark:text-gray-600 text-2xl">logout</span>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-700 text-center">Çıkış</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
