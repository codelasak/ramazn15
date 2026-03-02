"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadStoredLocation, type StoredLocation } from "../shared/userPrefs";
import { msToCountdown, setDateToHm } from "../shared/time";
import { useCuratedMeals } from "../shared/useMealDb";
import { usePrayerTimes } from "../shared/usePrayerTimes";

/* Approximate Ramadan day from the current date (Ramadan 1447 ≈ starts Feb 17 2026) */
function getRamadanDay(now: Date): number {
  const start = new Date(2026, 1, 17); // Feb 17
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

function LanternSvg() {
  return (
    <div className="absolute top-0 right-6 z-20 pointer-events-none origin-top animate-swing">
      <div className="relative flex flex-col items-center">
        <div className="w-0.5 h-16 bg-gradient-to-b from-gray-400 to-primary-dark" />
        <svg className="w-20 h-32 drop-shadow-xl" viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="5" r="5" fill="none" stroke="#2F4F4F" strokeWidth="2" />
          <path d="M30,30 Q50,5 70,30 L75,35 L25,35 Z" fill="#74A57F" stroke="#2F4F4F" strokeWidth="1" />
          <path d="M25,35 L20,90 L30,120 L70,120 L80,90 L75,35 Z" fill="rgba(255,255,240,0.9)" stroke="#2F4F4F" strokeWidth="1.5" />
          <path d="M30,50 L70,50 M25,70 L75,70 M22,90 L78,90" fill="none" stroke="#74A57F" strokeWidth="0.5" />
          <path d="M50,35 L50,120" fill="none" stroke="#74A57F" strokeWidth="0.5" />
          <rect className="animate-glow-pulse" x="30" y="45" width="40" height="60" rx="2" fill="#C1E1C1" opacity="0.8" />
          <path d="M30,120 L35,135 L65,135 L70,120 Z" fill="#4C8C64" stroke="#2F4F4F" strokeWidth="1" />
          <line x1="50" y1="135" x2="50" y2="150" stroke="#2F4F4F" strokeWidth="1" />
          <circle cx="50" cy="153" r="3" fill="#74A57F" />
        </svg>
        <div className="absolute top-24 w-32 h-32 bg-primary-light/40 rounded-full blur-3xl -z-10 animate-glow-pulse" />
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const { districtId, times, loading, error } = usePrayerTimes();
  const iftar = useCuratedMeals("iftar");

  const [now, setNow] = useState(() => new Date());
  const [location, setLocation] = useState<StoredLocation | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setLocation(loadStoredLocation());
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
    return msToCountdown(target.getTime() - now.getTime());
  }, [now, times]);

  const locationName = location?.districtName
    ? `${location.districtName}${location.stateName ? " / " + location.stateName : ""}`
    : null;

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-islamic-pattern pointer-events-none z-0" />
      <div className="absolute top-0 left-0 right-0 h-[500px] lantern-glow z-0 pointer-events-none" />

      {/* Floating lantern */}
      <LanternSvg />

      {/* Content */}
      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <header className="px-6 pt-12 pb-6 flex justify-between items-start">
          <div>
            <p className="text-primary-light text-sm font-semibold mb-1 flex items-center gap-1">
              <span className="material-icons-round text-base">calendar_today</span>
              {dateStr} • {ramadanDay} Ramazan 1447
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Hayırlı Ramazanlar,
              <br />
              <span className="text-primary font-bold">
                {location?.districtName ? location.districtName : "Kullanıcı"}
              </span>
            </h1>
          </div>
          <Link
            href="/profil"
            className="bg-white p-2.5 rounded-xl shadow-sm border border-mint-soft relative group transition-transform active:scale-95"
          >
            <span className="material-icons-round text-primary text-2xl">notifications</span>
          </Link>
        </header>

        <div className="flex-1 px-6 space-y-6">
          {/* Prayer countdown card */}
          {!districtId ? (
            <section className="bg-white rounded-2xl p-6 relative overflow-hidden card-shadow border border-mint-soft">
              <div className="text-center py-4">
                <span className="material-icons-round text-primary-light text-4xl mb-3 block">location_off</span>
                <h2 className="font-bold text-gray-900 mb-2">Konum Gerekli</h2>
                <p className="text-sm text-gray-500 mb-4">Namaz vakitleri için konumunuzu seçin.</p>
                <Link
                  href="/profil"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-xl font-semibold text-sm transition-colors"
                >
                  <span className="material-icons-round text-lg">settings</span>
                  Konum Ayarları
                </Link>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-2xl p-6 relative overflow-hidden card-shadow border border-mint-soft">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary-light/20 rounded-full blur-2xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-mint-soft/30 rounded-full blur-2xl" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2 bg-mint-soft/50 px-3 py-1.5 rounded-full w-fit border border-mint-soft/20">
                  <span className="material-icons-round text-primary text-sm">nights_stay</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">İftar Vakti</span>
                </div>
                {locationName && (
                  <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                    <span className="material-icons-round text-primary-light text-base">location_on</span>
                    {location?.districtName}
                  </span>
                )}
              </div>

              <div className="text-center py-6 relative z-10">
                <div className="text-6xl font-bold text-primary tabular-nums tracking-tight mb-2">
                  {iftarCountdown ?? (loading ? "··:··:··" : "—")}
                </div>
                <p className="text-gray-500 font-medium">Kalan Süre</p>
              </div>

              {error && (
                <p className="text-center text-red-500 text-sm mb-2">{error}</p>
              )}

              {times && (
                <div className="mt-4 flex justify-between items-center text-sm border-t border-gray-100 pt-4 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs mb-0.5">İkindi</span>
                    <span className="font-bold text-gray-700">{String(times.ikindi ?? "—")}</span>
                  </div>
                  <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
                  <div className="flex flex-col items-center">
                    <span className="text-primary font-bold text-xs mb-0.5">Akşam (İftar)</span>
                    <span className="font-bold text-primary text-xl">{String(times.aksam ?? "—")}</span>
                  </div>
                  <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
                  <div className="flex flex-col items-end">
                    <span className="text-gray-400 text-xs mb-0.5">Yatsı</span>
                    <span className="font-bold text-gray-700">{String(times.yatsi ?? "—")}</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Medicine reminder */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-lg text-red-500 shadow-sm border border-red-50">
              <span className="material-icons-round text-xl">medication</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">İlaç Hatırlatıcısı</h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">İftardan 15 dk sonra ilacınızı almayı unutmayın</p>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm">
              Alındı
            </button>
          </div>

          {/* Daily health status */}
          <section>
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" />
                Günlük Sağlık Durumu
              </h2>
              <Link href="/takip" className="text-primary hover:text-primary-dark text-sm font-semibold hover:underline">
                Detaylar
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 card-shadow border border-mint-soft hover:border-primary-light transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-green-50 p-2 rounded-lg text-green-600">
                    <span className="material-icons-round text-xl">water_drop</span>
                  </div>
                  <span className="bg-primary-light/20 text-primary-dark text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Normal</span>
                </div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Kan Şekeri</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-bold text-gray-900">110</span>
                  <span className="text-xs text-gray-400 mb-1.5 font-medium">mg/dL</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 card-shadow border border-mint-soft hover:border-primary-light transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-rose-50 p-2 rounded-lg text-rose-500">
                    <span className="material-icons-round text-xl">favorite</span>
                  </div>
                  <span className="bg-primary-light/20 text-primary-dark text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">İyi</span>
                </div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Tansiyon</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-bold text-gray-900">120/80</span>
                  <span className="text-xs text-gray-400 mb-1.5 font-medium">mmHg</span>
                </div>
              </div>
            </div>
          </section>

          {/* Iftar food suggestion */}
          <section className="pb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              İftar Önerisi
            </h2>
            <div className="bg-white rounded-2xl overflow-hidden card-shadow border border-mint-soft">
              {/* Hero image area */}
              <div className="h-36 w-full relative bg-gradient-to-br from-primary/20 to-mint-soft">
                {iftar.meals[0]?.strMealThumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={iftar.meals[0].strMealThumb}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-5">
                  <div className="text-white w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl mb-1">Hafif Başlangıç</h3>
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md">ÖNERİLEN</span>
                    </div>
                    <p className="text-sm opacity-90 font-medium">Midenizi yormadan orucunuzu açın</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Food steps */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-3">
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                      <span className="text-3xl">🫒</span>
                    </div>
                    <span className="text-xs font-bold text-center text-gray-700 w-20 leading-tight">1 Hurma & Su</span>
                  </div>
                  <span className="material-icons-round text-primary-light/50">arrow_forward</span>
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center">
                      <span className="text-3xl">🥣</span>
                    </div>
                    <span className="text-xs font-bold text-center text-gray-700 w-20 leading-tight">Mercimek Çorbası</span>
                  </div>
                  <span className="material-icons-round text-primary-light/50">arrow_forward</span>
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center">
                      <span className="text-3xl">🥗</span>
                    </div>
                    <span className="text-xs font-bold text-center text-gray-700 w-20 leading-tight">Mevsim Salatası</span>
                  </div>
                </div>

                <Link
                  href="/beslenme"
                  className="w-full mt-3 bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span className="material-icons-round text-xl">restaurant_menu</span>
                  Tam Menüyü Görüntüle
                </Link>
              </div>
            </div>
          </section>

          {/* Quick action buttons */}
          <section className="grid grid-cols-4 gap-3 pb-4">
            <Link href="/takip" className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-mint-soft group-active:scale-95 transition-transform group-hover:border-primary-light group-hover:shadow-md">
                <span className="material-icons-round text-primary text-3xl">monitor_weight</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
                Ölçüm<br />Gir
              </span>
            </Link>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-mint-soft group-active:scale-95 transition-transform group-hover:border-primary-light group-hover:shadow-md">
                <span className="material-icons-round text-green-500 text-3xl">local_drink</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
                Su<br />Takibi
              </span>
            </button>
            <Link href="/ibadet" className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-mint-soft group-active:scale-95 transition-transform group-hover:border-primary-light group-hover:shadow-md">
                <span className="material-icons-round text-primary text-3xl">mosque</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
                Namaz<br />Vakitleri
              </span>
            </Link>
            <Link href="/ibadet" className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-mint-soft group-active:scale-95 transition-transform group-hover:border-primary-light group-hover:shadow-md">
                <span className="material-icons-round text-primary-light text-3xl">menu_book</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
                Kuran<br />Dinle
              </span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
