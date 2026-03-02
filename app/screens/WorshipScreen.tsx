"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadStoredLocation } from "../shared/userPrefs";
import { usePrayerTimes } from "../shared/usePrayerTimes";
import { useSurah, useSurahList } from "../shared/useQuran";
import { msToCountdown, setDateToHm } from "../shared/time";

/* Approximate Ramadan day */
function getRamadanDay(now: Date): number {
  const start = new Date(2026, 1, 17);
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, Math.min(30, diff + 1));
}

function formatTurkishDate(d: Date): string {
  const months = [
    "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
    "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const loc = loadStoredLocation();
    setLocationLabel(loc?.districtName ?? null);
  }, [districtId]);

  const ramadanDay = useMemo(() => getRamadanDay(now), [now]);
  const dateStr = useMemo(() => formatTurkishDate(now), [now]);

  const iftarCountdown = useMemo(() => {
    const aksam = typeof times?.aksam === "string" ? times.aksam : null;
    if (!aksam) return null;
    const d = setDateToHm(now, aksam);
    if (!d) return null;
    let target = d;
    if (target.getTime() <= now.getTime()) {
      target = new Date(target);
      target.setDate(target.getDate() + 1);
    }
    const ms = target.getTime() - now.getTime();
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return { h, m, full: msToCountdown(ms) };
  }, [now, times]);

  /* Determine which prayer time is next */
  const nextPrayer = useMemo(() => {
    if (!times) return null;
    for (const p of PRAYER_KEYS) {
      const t = times[p.key];
      if (typeof t !== "string") continue;
      const d = setDateToHm(now, t);
      if (d && d.getTime() > now.getTime()) return p.key;
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
      {/* Curved header */}
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-mint-soft to-accent/50 pb-8 pt-12 shadow-soft">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/50 rounded-full blur-2xl" />

        <div className="relative px-6 z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
                Hayırlı Ramazanlar,
                <br />
                <span className="text-primary-dark">{locationLabel ?? "Kullanıcı"}</span>
              </h1>
              <p className="text-gray-500 mt-1 text-lg">{ramadanDay} Ramazan 1447 • {dateStr}</p>
            </div>
            <Link href="/profil" className="p-2 bg-white/50 rounded-full backdrop-blur-sm shadow-sm">
              <span className="material-icons-round text-primary-dark text-3xl">notifications</span>
            </Link>
          </div>

          {/* Iftar countdown card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-accent/40 flex items-center justify-between relative overflow-hidden">
            {/* Decorative lantern */}
            <div className="absolute right-6 -top-2 z-20 flex flex-col items-center">
              <div className="h-8 w-0.5 bg-gradient-to-b from-gray-300 to-gray-400" />
              <div className="relative group">
                <div className="absolute inset-0 bg-primary-light blur-[15px] opacity-40 rounded-full scale-150 animate-pulse" />
                <span
                  className="material-symbols-outlined text-[3.5rem] text-primary drop-shadow-lg transform hover:rotate-6 transition-transform duration-700 ease-in-out cursor-default"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
                >
                  light
                </span>
              </div>
            </div>

            <div className="z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons-round text-primary text-xl">nightlight</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">İftar Vaktine</span>
              </div>
              <div className="text-5xl font-bold text-gray-800 tracking-tight">
                {iftarCountdown ? (
                  <>
                    {String(iftarCountdown.h).padStart(2, "0")}
                    <span className="text-2xl text-gray-400 align-top ml-1">sa</span>
                    {" : "}
                    {String(iftarCountdown.m).padStart(2, "0")}
                    <span className="text-2xl text-gray-400 align-top ml-1">dk</span>
                  </>
                ) : loading ? (
                  <span className="text-gray-300">··:··</span>
                ) : (
                  "—"
                )}
              </div>
              {times?.aksam && (
                <p className="text-sm text-primary-dark mt-2 font-medium bg-mint-soft/60 inline-block px-3 py-1 rounded-full">
                  Akşam Ezanı: {String(times.aksam)}
                </p>
              )}
            </div>
          </div>

          {/* Prayer time pills */}
          {times && (
            <div className="mt-6 flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
              {PRAYER_KEYS.map((p) => {
                const val = times[p.key];
                const isNext = p.key === nextPrayer;
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
                    <span className={`text-xs mb-1 ${isNext ? "opacity-90" : "text-gray-500"}`}>
                      {p.label}
                    </span>
                    <span className={`text-lg font-bold ${isNext ? "" : "text-gray-800"}`}>
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
            <div className="mt-6 bg-white rounded-2xl p-5 text-center">
              <span className="material-icons-round text-primary-light text-4xl mb-2 block">location_off</span>
              <p className="text-gray-500 mb-3">Namaz vakitleri için konumunuzu seçin.</p>
              <Link href="/profil" className="inline-flex items-center gap-2 bg-primary text-white py-2.5 px-5 rounded-xl font-semibold text-sm">
                <span className="material-icons-round text-lg">settings</span>
                Konum Ayarları
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="px-6 py-6 space-y-8">
        {/* Daily Health Gauge */}
        <section className="bg-white rounded-3xl p-6 shadow-soft border border-accent/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-light to-primary/60" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="material-icons-round text-primary">health_and_safety</span>
              Günlük Sağlık Durumu
            </h2>
            <Link href="/takip" className="text-sm text-primary-dark font-medium bg-mint-soft/60 px-3 py-1.5 rounded-lg">
              Detaylar
            </Link>
          </div>

          {/* Gauge */}
          <div className="relative w-full max-w-[280px] h-[140px] mx-auto mt-4 mb-2">
            <div className="absolute w-full h-full rounded-t-full border-[24px] border-gray-100 border-b-0 box-border" />
            <div className="absolute w-full h-full rounded-t-full border-[24px] border-primary border-b-0 box-border origin-bottom transition-all duration-1000 ease-out gauge-fill" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[10px] text-center">
              <div className="text-4xl font-bold text-gray-800 mb-1">85<span className="text-lg text-gray-400">%</span></div>
              <div className="text-sm font-medium text-primary-dark bg-mint-soft/50 px-3 py-1 rounded-full whitespace-nowrap">
                Gayet İyi
              </div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm max-w-xs mx-auto mt-4">
            Şeker ve tansiyon değerleriniz bugün dengeli görünüyor.
          </p>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/takip" className="bg-mint-soft/40 p-5 rounded-2xl shadow-sm border border-accent flex flex-col items-start text-left active:scale-95 transition-transform">
            <div className="bg-white p-3 rounded-xl mb-3 shadow-sm text-primary">
              <span className="material-icons-round text-2xl">water_drop</span>
            </div>
            <span className="text-lg font-semibold text-gray-800">Şeker Ölçümü</span>
            <span className="text-sm text-gray-500 mt-1">Son: 110 mg/dl</span>
          </Link>
          <button className="bg-mint-soft/20 p-5 rounded-2xl shadow-sm border border-mint-soft flex flex-col items-start text-left active:scale-95 transition-transform">
            <div className="bg-white p-3 rounded-xl mb-3 shadow-sm text-primary-dark">
              <span className="material-icons-round text-2xl">medication</span>
            </div>
            <span className="text-lg font-semibold text-gray-800">İlaç Takibi</span>
            <span className="text-sm text-gray-500 mt-1">Sıradaki: İftar</span>
          </button>
        </section>

        {/* Quran Section */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="material-icons-round text-primary">menu_book</span>
              Kur&apos;an-ı Kerim
            </h2>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-600" htmlFor="surah">Sure</label>
            <select
              id="surah"
              value={surahNumber ?? ""}
              onChange={(e) => setSurahNumber(Number(e.target.value) || null)}
              className="flex-1 rounded-xl border border-mint-soft bg-mint-soft/20 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {surahs.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} ({s.englishName})
                </option>
              ))}
            </select>
          </div>

          {surahLoading && <p className="text-gray-500 text-sm">Yükleniyor…</p>}
          {surahError && <p className="text-red-500 text-sm">Hata: {surahError}</p>}

          <audio ref={audioRef} className="mt-2 w-full rounded-lg" controls />

          {surahData && (
            <div className="mt-4 max-h-[50dvh] space-y-3 overflow-auto pr-1 no-scrollbar">
              {mergedAyahs.map((a) => (
                <div key={a.key} className="rounded-xl border border-mint-soft p-4 hover:bg-mint-soft/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {a.numberInSurah}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-primary font-semibold flex items-center gap-1 bg-mint-soft px-2 py-1 rounded-lg"
                      onClick={() => setCurrentAudio(a.audio ?? null)}
                      disabled={!a.audio}
                    >
                      <span className="material-icons-round text-sm">play_arrow</span>
                      Dinle
                    </button>
                  </div>
                  <div className="text-right text-lg leading-8 text-gray-900 mb-2">{a.arabic}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{a.turkish}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Iftar menu preview */}
        <Link href="/beslenme" className="bg-accent/20 rounded-2xl p-5 border border-accent/40 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
              <span className="material-icons-round text-3xl">restaurant_menu</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">İftar Menüsü</h3>
              <p className="text-sm text-gray-600">Çorba, Izgara Köfte...</p>
            </div>
          </div>
          <span className="material-icons-round text-gray-400 text-2xl group-hover:translate-x-1 transition-transform">chevron_right</span>
        </Link>
      </main>
    </div>
  );
}
