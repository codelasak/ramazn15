"use client";

import { useEffect, useMemo, useState } from "react";
import { useCuratedMeals } from "../shared/useMealDb";
import { usePrayerTimes } from "../shared/usePrayerTimes";
import { msToCountdown, setDateToHm } from "../shared/time";

/* Approximate Ramadan day */
function getRamadanDay(now: Date): number {
  const start = new Date(2026, 1, 17);
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, Math.min(30, diff + 1));
}

export default function NutritionScreen() {
  const iftar = useCuratedMeals("iftar");
  const sahur = useCuratedMeals("sahur");
  const { times } = usePrayerTimes();
  const [now, setNow] = useState(() => new Date());
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [sahurDone, setSahurDone] = useState(true);
  const [medicineTaken, setMedicineTaken] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ramadanDay = useMemo(() => getRamadanDay(now), [now]);

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

  const totalGlasses = 8;

  return (
    <div className="relative min-h-dvh">
      {/* Header */}
      <header className="relative px-6 pt-12 pb-6 bg-gradient-to-b from-mint-soft/50 to-transparent">
        <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
          <svg className="w-32 h-32 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-medium text-primary-dark mb-1 tracking-wide">RAMAZAN {ramadanDay}. GÜN</h2>
            <h1 className="text-2xl font-bold text-gray-900">Beslenme Rehberi</h1>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm text-primary">
            <span className="material-icons-round">notifications</span>
          </button>
        </div>

        {/* Iftar countdown mini card */}
        <div className="bg-gradient-to-br from-white to-mint-soft rounded-2xl p-5 shadow-sm border border-primary-light/30 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-light/30 rounded-full blur-xl" />
          <div>
            <p className="text-sm text-gray-500 font-medium">İftar&apos;a Kalan Süre</p>
            <div className="text-3xl font-bold text-primary mt-1">
              {iftarCountdown ?? "··:··:··"}
            </div>
            {times?.aksam && (
              <p className="text-xs text-primary-dark mt-1 flex items-center gap-1">
                <span className="material-icons-round text-sm">wb_twilight</span>
                Akşam Ezanı {String(times.aksam)}
              </p>
            )}
          </div>
          <div className="relative z-10">
            <div className="absolute inset-0 bg-primary-light rounded-full blur-lg opacity-30" />
            <svg className="w-12 h-12 text-primary relative z-10 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2C12.55,2 13,2.45 13,3V4C14.66,4.5 16,6.05 16,8V16C16,18.21 14.21,20 12,20C9.79,20 8,18.21 8,16V8C8,6.05 9.34,4.5 11,4V3C11,2.45 11.45,2 12,2M12,18C13.1,18 14,17.1 14,16V8C14,6.9 13.1,6 12,6C10.9,6 10,6.9 10,8V16C10,17.1 10.9,18 12,18M11,9H13V12H11V9M11,13H13V15H11V13Z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-8 pb-8">
        {/* Sahur Section */}
        <section className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-light/40 rounded-full blur" />
              <span className="relative z-10 bg-mint-soft text-primary-dark p-2 rounded-lg block">
                <span className="material-icons-round text-xl">bedtime</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Sahur Menüsü</h3>
            <div className="ml-auto flex items-center gap-2">
              {sahurDone ? (
                <>
                  <svg className="w-5 h-5 text-primary-light animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2L14.5,9H22L16,13.5L18.5,21L12,16.5L5.5,21L8,13.5L2,9H9.5L12,2Z" />
                  </svg>
                  <span className="text-sm text-gray-400 font-medium">Tamamlandı</span>
                </>
              ) : (
                <span className="text-sm text-primary font-medium bg-mint-soft px-2 py-0.5 rounded-md border border-primary-light/30">Sırada</span>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-1 top-6 bottom-6 w-1 bg-gradient-to-b from-primary-light to-mint-soft rounded-full" />

            {/* Sahur meal cards */}
            {sahur.loading ? (
              <div className="ml-4 bg-white rounded-2xl p-4 shadow-sm border border-mint-soft">
                <p className="text-gray-500">Yükleniyor…</p>
              </div>
            ) : sahur.error ? (
              <div className="ml-4 bg-white rounded-2xl p-4 shadow-sm border border-mint-soft">
                <p className="text-red-500">Hata: {sahur.error}</p>
              </div>
            ) : (
              sahur.meals.slice(0, 2).map((m) => (
                <div key={m.idMeal} className="bg-white rounded-2xl p-4 shadow-sm border border-mint-soft mb-4 hover:shadow-md transition-shadow duration-300 ml-4">
                  <div className="flex gap-4">
                    {m.strMealThumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.strMealThumb} alt="" className="w-24 h-24 rounded-xl object-cover bg-gray-100" loading="lazy" />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-mint-soft flex items-center justify-center">
                        <span className="material-icons-round text-primary-light text-3xl">restaurant</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-1">{m.strMeal}</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        {[m.strArea, m.strCategory].filter(Boolean).join(" • ") || "Uzun süreli tokluk ve dengeli kan şekeri."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-mint-soft text-primary-dark text-xs font-semibold border border-primary-light/30">
                          <span className="material-icons-round text-xs">spa</span> Sağlıklı
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-100">
                          <span className="material-icons-round text-xs">water_drop</span> Su Zengini
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Medicine reminder for sahur */}
            <div className="bg-mint-soft/60 rounded-xl p-4 flex items-start gap-3 border border-primary-light/30 ml-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary-light/20 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div className="bg-primary text-white p-2 rounded-full shrink-0 shadow-lg shadow-primary-light/50 group-hover:scale-110 transition-transform">
                <span className="material-icons-round">medication</span>
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-800">Tansiyon İlacı</h5>
                <p className="text-sm text-gray-600 mt-1">Yemekten hemen önce 1 bardak su ile için.</p>
              </div>
              <button
                onClick={() => setSahurDone(true)}
                className="self-center p-2 text-primary hover:bg-mint-soft rounded-full transition-colors"
              >
                <span className="material-icons-round">check_circle</span>
              </button>
            </div>
          </div>
        </section>

        {/* Water Tracking */}
        <section className="bg-gradient-to-br from-mint-soft/40 to-accent/30 rounded-2xl p-5 border border-primary-light/30 text-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/20 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-8 -mb-8 blur-xl" />

          <h3 className="text-primary-dark font-bold mb-3 flex items-center justify-center gap-2 relative z-10">
            <span className="material-icons-round text-primary">water_drop</span> Su Takibi
          </h3>

          <div className="flex justify-center gap-3 relative z-10 py-2">
            {Array.from({ length: totalGlasses }).map((_, i) => (
              <button
                key={i}
                onClick={() => setWaterGlasses(i + 1)}
                className={`w-8 h-10 rounded-b-lg rounded-t-sm shadow-md ring-2 ring-white transition-all ${
                  i < waterGlasses
                    ? "bg-primary-light shadow-primary-light/50"
                    : "bg-white/60 border border-primary-light/30 backdrop-blur-sm"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-primary-dark mt-3 font-medium relative z-10 bg-white/40 inline-block px-3 py-1 rounded-full backdrop-blur-sm border border-primary-light/20">
            Hedef: 2.5 Litre (İftar ile Sahur arası)
          </p>
        </section>

        {/* Iftar Section */}
        <section className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-100 rounded-full blur opacity-40" />
              <span className="relative z-10 bg-amber-50 text-amber-500 p-2 rounded-lg block">
                <span className="material-icons-round text-xl">wb_sunny</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">İftar Menüsü</h3>
            <div className="ml-auto flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-light drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2C12.55,2 13,2.45 13,3V4C14.66,4.5 16,6.05 16,8V16C16,18.21 14.21,20 12,20C9.79,20 8,18.21 8,16V8C8,6.05 9.34,4.5 11,4V3C11,2.45 11.45,2 12,2M11,8V16H13V8H11Z" />
              </svg>
              <span className="text-sm text-primary font-medium bg-mint-soft px-2 py-0.5 rounded-md border border-primary-light/30">Sırada</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-1 top-6 bottom-6 w-1 bg-gradient-to-b from-primary to-mint-soft rounded-full opacity-60" />

            {/* Iftar meal cards */}
            {iftar.loading ? (
              <div className="ml-4 bg-white rounded-2xl p-4 shadow-sm border border-mint-soft">
                <p className="text-gray-500">Yükleniyor…</p>
              </div>
            ) : iftar.error ? (
              <div className="ml-4 bg-white rounded-2xl p-4 shadow-sm border border-mint-soft">
                <p className="text-red-500">Hata: {iftar.error}</p>
              </div>
            ) : (
              iftar.meals.slice(0, 2).map((m, idx) => (
                <div key={m.idMeal} className="bg-white rounded-2xl p-4 shadow-sm border border-mint-soft mb-3 hover:shadow-md transition-shadow duration-300 ml-4 group">
                  <div className="flex gap-4">
                    <div className="relative">
                      {m.strMealThumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.strMealThumb}
                          alt=""
                          className="w-24 h-24 rounded-xl object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-mint-soft flex items-center justify-center">
                          <span className="material-icons-round text-primary-light text-3xl">restaurant</span>
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-xl ring-1 ring-black/5 pointer-events-none" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-1">{m.strMeal}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {[m.strArea, m.strCategory].filter(Boolean).join(" • ") || "Hafif ve dengeli bir lezzet."}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${
                        idx === 0
                          ? "bg-lime-50 text-lime-700 border-lime-100"
                          : "bg-orange-50 text-orange-600 border-orange-100"
                      }`}>
                        <span className="material-icons-round text-xs">{idx === 0 ? "favorite" : "bloodtype"}</span>
                        {idx === 0 ? "Sindirim Dostu" : "Diyabet Dostu"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Insulin reminder for iftar */}
            <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3 border border-red-100 ml-4 relative overflow-hidden">
              <div className="absolute -left-4 -top-4 w-16 h-16 bg-red-100/50 rounded-full blur-xl" />
              <div className="bg-red-500 text-white p-2 rounded-full shrink-0 shadow-lg shadow-red-200/50 relative z-10">
                <span className="material-icons-round">vaccines</span>
              </div>
              <div className="flex-1 relative z-10">
                <h5 className="font-bold text-gray-800">İnsülin</h5>
                <p className="text-sm text-gray-600 mt-1">Yemekten 15 dakika önce uygulayın.</p>
              </div>
              <button
                onClick={() => setMedicineTaken(true)}
                className={`self-center px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all transform active:scale-95 relative z-10 ${
                  medicineTaken
                    ? "bg-gray-200 text-gray-500 shadow-none"
                    : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-primary-light/50"
                }`}
                disabled={medicineTaken}
              >
                {medicineTaken ? "Alındı ✓" : "Alındı"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
