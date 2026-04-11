"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrayerTimes } from "../shared/usePrayerTimes";
import { useSurah, useSurahList } from "../shared/useQuran";
import { msToCountdown, setDateToHm } from "../shared/time";

function formatTurkishDate(d: Date): string {
  const months = [
    "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
    "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
  ];
  const days = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
}

const PRAYER_KEYS = [
  { key: "imsak", label: "İmsak" },
  { key: "gunes", label: "Güneş" },
  { key: "ogle", label: "Öğle" },
  { key: "ikindi", label: "İkindi" },
  { key: "aksam", label: "Akşam" },
  { key: "yatsi", label: "Yatsı" },
] as const;

export default function WorshipScreen() {
  const { districtId, times, loading, error } = usePrayerTimes();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const dateStr = useMemo(() => formatTurkishDate(now), [now]);

  /* Determine which prayer time is next */
  const nextPrayer = useMemo(() => {
    if (!times) return null;
    for (const p of PRAYER_KEYS) {
      const t = times[p.key];
      if (typeof t !== "string") continue;
      const d = setDateToHm(now, t);
      if (d && d.getTime() > now.getTime()) return { ...p, time: t, countdown: msToCountdown(d.getTime() - now.getTime()) };
    }
    return null;
  }, [now, times]);

  /* Quran state */
  const { surahs } = useSurahList();
  const [surahNumber, setSurahNumber] = useState<number | null>(1);
  const { data: surahData, loading: surahLoading, error: surahError } = useSurah(surahNumber);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const mergedAyahs = useMemo(() => {
    if (!surahData) return [];
    const a = surahData.arabic.ayahs;
    const tr = surahData.turkish.ayahs;
    const au = surahData.audio.ayahs;
    const len = Math.min(a.length, tr.length, au.length);
    return Array.from({ length: len }, (_, i) => ({
      key: `${surahData.surahNumber}-${i}`,
      numberInSurah: a[i].numberInSurah,
      arabic: a[i].text,
      turkish: tr[i].text,
      audio: au[i].audio,
    }));
  }, [surahData]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (!currentAudio) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      return;
    }
    audioRef.current.src = currentAudio;
    void audioRef.current.play();
  }, [currentAudio]);

  return (
    <div className="relative min-h-dvh">
      {/* Header */}
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-emerald-50 to-teal-50/50 dark:from-transparent dark:to-transparent pb-8 pt-12 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-teal-100/40 rounded-full blur-2xl" />

        <div className="relative px-6 z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 dark:text-white tracking-tight">
                İbadet
              </h1>
              <p className="text-gray-600 dark:text-emerald-50/70 mt-1 text-sm">{dateStr}</p>
            </div>
            <Link href="/profil" className="p-2 bg-white/60 dark:bg-white/10 rounded-full backdrop-blur-sm shadow-sm text-gray-800 dark:text-white">
              <span className="material-icons-round text-primary-dark dark:text-white text-2xl">notifications</span>
            </Link>
          </div>

          {/* Next prayer card */}
          {nextPrayer && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden text-gray-800 dark:text-gray-900">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
              <div className="z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-icons-round text-primary text-xl">mosque</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-700 uppercase tracking-wide">Sonraki Namaz</span>
                </div>
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-900 tracking-tight">
                  {nextPrayer.label}
                  <span className="text-2xl text-primary ml-3">{nextPrayer.time}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-700 mt-1 font-medium">
                  Kalan: <span className="text-primary font-bold">{nextPrayer.countdown}</span>
                </p>
              </div>
            </div>
          )}

          {/* Prayer time pills */}
          {times && (
            <div className="mt-6 flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
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
                    className={`flex flex-col items-center min-w-[4.5rem] p-3 rounded-2xl transition-transform ${
                      isNext
                        ? "bg-primary text-white shadow-md transform scale-105 border border-primary-dark/10"
                        : "bg-white/60 border border-white/50"
                    } ${isPast ? "opacity-60" : ""}`}
                  >
                    <span className={`text-xs mb-1 ${isNext ? "opacity-90" : "text-gray-500 dark:text-gray-700"}`}>
                      {p.label}
                    </span>
                    <span className={`text-lg font-bold ${isNext ? "" : "text-gray-800 dark:text-gray-900"}`}>
                      {typeof val === "string" ? val : "—"}
                    </span>
                    {isPast && (
                      <span className="material-icons-round text-sm mt-1 text-primary-light">check_circle</span>
                    )}
                    {isNext && (
                      <span className="material-icons-round text-sm mt-1">notifications_none</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="text-center text-red-500 text-sm mt-4">{error}</p>}

          {!districtId && (
            <div className="mt-6 bg-white rounded-2xl p-5 text-center text-gray-800 dark:text-gray-900">
              <span className="material-icons-round text-primary-light text-4xl mb-2 block">location_off</span>
              <p className="text-gray-500 dark:text-gray-700 mb-3">Namaz vakitleri için konumunuzu seçin.</p>
              <Link href="/profil" className="inline-flex items-center gap-2 bg-primary text-white py-2.5 px-5 rounded-xl font-semibold text-sm">
                <span className="material-icons-round text-lg">settings</span>
                Konum Ayarları
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Quran Section */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-gray-800 dark:text-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-900 flex items-center gap-2">
              <span className="material-icons-round text-primary">menu_book</span>
              Kur&apos;an-ı Kerim
            </h2>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-700" htmlFor="surah">Sure</label>
            <select
              id="surah"
              value={surahNumber ?? ""}
              onChange={(e) => setSurahNumber(Number(e.target.value) || null)}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-800 dark:text-gray-900"
            >
              {surahs.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} ({s.englishName})
                </option>
              ))}
            </select>
          </div>

          {surahLoading && <p className="text-gray-500 dark:text-gray-700 text-sm">Yükleniyor…</p>}
          {surahError && <p className="text-red-500 text-sm">Hata: {surahError}</p>}

          <audio ref={audioRef} className="mt-2 w-full rounded-lg" controls />

          {surahData && (
            <div className="mt-4 max-h-[50dvh] space-y-3 overflow-auto pr-1 no-scrollbar">
              {mergedAyahs.map((a) => (
                <div key={a.key} className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors text-gray-800 dark:text-gray-900">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {a.numberInSurah}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-primary font-semibold flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg"
                      onClick={() => setCurrentAudio(a.audio ?? null)}
                      disabled={!a.audio}
                    >
                      <span className="material-icons-round text-sm">play_arrow</span>
                      Dinle
                    </button>
                  </div>
                  <div className="text-right text-lg leading-8 text-gray-900 mb-2">{a.arabic}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-700 leading-relaxed">{a.turkish}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
