"use client";

import { useMemo, useState } from "react";

/* Approximate Ramadan day */
function getRamadanDay(): number {
  const now = new Date();
  const start = new Date(2026, 1, 17);
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, Math.min(30, diff + 1));
}

/* Mock 3-day data */
const MOCK_SUGAR = [
  { day: "Pzt", value: 110 },
  { day: "Sal", value: 128 },
  { day: "Bugün", value: 115 },
];

const MOCK_PRESSURE = [
  { day: "Pzt", value: "118/76" },
  { day: "Sal", value: "122/82" },
  { day: "Bugün", value: "120/80" },
];

export default function HealthScreen() {
  const ramadanDay = useMemo(() => getRamadanDay(), []);
  const [activeTab, setActiveTab] = useState<"sugar" | "pressure">("sugar");

  const maxSugar = Math.max(...MOCK_SUGAR.map((s) => s.value));

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-[-20px] w-32 h-32 opacity-15 text-primary rotate-12">
          <svg className="w-full h-full drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C11.45 2 11 2.45 11 3V4C7.69 4 5 6.69 5 10V17H7L8 20H16L17 17H19V10C19 6.69 16.31 4 13 4V3C13 2.45 12.55 2 12 2M12 22C11.45 22 11 21.55 11 21H13C13 21.55 12.55 22 12 22Z" />
          </svg>
        </div>
        <div className="absolute top-[20%] right-[-30px] w-48 h-48 opacity-[0.08] text-primary-light -rotate-12">
          <svg className="w-full h-full drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C11.45 2 11 2.45 11 3V4C7.69 4 5 6.69 5 10V17H7L8 20H16L17 17H19V10C19 6.69 16.31 4 13 4V3C13 2.45 12.55 2 12 2M12 22C11.45 22 11 21.55 11 21H13C13 21.55 12.55 22 12 22Z" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-dot-pattern" />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <header className="pt-8 pb-4 px-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-primary-dark mb-1">
              <span className="material-icons-round text-sm text-primary drop-shadow-lg">wb_twilight</span>
              <span className="text-sm font-medium tracking-wide">Ramazan {ramadanDay}. Gün</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Sağlık Takibi
              <br />
              <span className="text-primary">& Analiz</span>
            </h1>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-gray-800 dark:text-gray-900">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white text-lg font-bold">
              A
            </div>
          </button>
        </header>

        {/* Fasting status card */}
        <section className="px-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-primary/5 border-l-4 border-primary relative overflow-hidden text-gray-800 dark:text-gray-900">
            <div className="absolute top-4 right-4 w-10 h-10 opacity-30 text-primary animate-float">
              <svg className="w-full h-full drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2C10.9,2 10,2.9 10,4H14C14,2.9 13.1,2 12,2M16.5,7V17H18V10C18,8.34 16.66,7 15,7H16.5M7.5,7H9C7.34,7 6,8.34 6,10V17H7.5V7M12,5C14.76,5 17,7.24 17,10V18C17,18.55 16.55,19 16,19H8C7.45,19 7,18.55 7,18V10C7,7.24 9.24,5 12,5M12,20C12.55,20 13,20.45 13,21H11C11,20.45 11.45,20 12,20Z" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-mint-soft/50 text-primary-dark">
                  <span className="material-icons-round">check_circle</span>
                </span>
                <h2 className="text-lg font-bold text-gray-900">Oruç Durumu: Güvenli</h2>
              </div>
              <p className="text-gray-500 dark:text-gray-700 mb-4 leading-relaxed pr-8">
                Bugünkü değerleriniz gayet iyi görünüyor. İlaçlarınızı sahurda almayı unutmayın.
              </p>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-700">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-light" style={{ boxShadow: "0 0 5px rgba(143,203,155,0.8)" }} />
                  <span>Şeker: Normal</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: "0 0 5px rgba(76,140,100,0.6)" }} />
                  <span>Tansiyon: Normal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Measurement entry */}
        <section className="px-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-4 flex items-center gap-2">
            Ölçüm Girişi
            <svg className="w-4 h-4 text-primary/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-.55 0-1 .45-1 1v1c-1.65 0-3 1.35-3 3v5H6v2h2v3h8v-3h2v-2h-2V7c0-1.65-1.35-3-3-3V3c0-.55-.45-1-1-1zM9 19h6v2H9v-2zm3-12c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
            </svg>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden text-gray-800 dark:text-gray-900">
              <div className="absolute -right-4 -top-4 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C11.45 2 11 2.45 11 3V4C7.69 4 5 6.69 5 10V17H7L8 20H16L17 17H19V10C19 6.69 16.31 4 13 4V3C13 2.45 12.55 2 12 2M12 22C11.45 22 11 21.55 11 21H13C13 21.55 12.55 22 12 22Z" />
                </svg>
              </div>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative z-10 text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-red-400 text-3xl">bloodtype</span>
              </div>
              <span className="text-gray-900 font-bold text-lg relative z-10">Kan Şekeri</span>
              <span className="text-primary-dark/70 text-xs mt-1 relative z-10 font-medium">Ölçüm Ekle +</span>
            </button>
            <button className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden text-gray-800 dark:text-gray-900">
              <div className="absolute -right-4 -top-4 w-12 h-12 text-primary-light/10 group-hover:text-primary-light/20 transition-colors">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C11.45 2 11 2.45 11 3V4C7.69 4 5 6.69 5 10V17H7L8 20H16L17 17H19V10C19 6.69 16.31 4 13 4V3C13 2.45 12.55 2 12 2M12 22C11.45 22 11 21.55 11 21H13C13 21.55 12.55 22 12 22Z" />
                </svg>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative z-10 text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-blue-400 text-3xl">favorite</span>
              </div>
              <span className="text-gray-900 font-bold text-lg relative z-10">Tansiyon</span>
              <span className="text-primary-dark/70 text-xs mt-1 relative z-10 font-medium">Ölçüm Ekle +</span>
            </button>
          </div>
        </section>

        {/* 3-day chart */}
        <section className="px-6 mb-6">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-900">Son 3 Günün Özeti</h3>
            <button className="text-primary font-medium text-sm hover:underline flex items-center gap-1">
              Detaylar
            </button>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative text-gray-800 dark:text-gray-900">
            {/* Decorative lantern */}
            <div className="absolute bottom-4 right-4 w-16 h-16 opacity-[0.05] text-primary rotate-12 pointer-events-none">
              <svg className="w-full h-full drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2C10.9,2 10,2.9 10,4H14C14,2.9 13.1,2 12,2M16.5,7V17H18V10C18,8.34 16.66,7 15,7H16.5M7.5,7H9C7.34,7 6,8.34 6,10V17H7.5V7M12,5C14.76,5 17,7.24 17,10V18C17,18.55 16.55,19 16,19H8C7.45,19 7,18.55 7,18V10C7,7.24 9.24,5 12,5M12,20C12.55,20 13,20.45 13,21H11C11,20.45 11.45,20 12,20Z" />
              </svg>
            </div>

            {/* Tab selector */}
            <div className="flex gap-2 mb-6 bg-bg-light p-1 rounded-lg relative z-10">
              <button
                onClick={() => setActiveTab("sugar")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                  activeTab === "sugar"
                    ? "bg-white shadow-sm text-primary ring-1 ring-black/5"
                    : "text-gray-500 dark:text-gray-700 hover:text-gray-900"
                }`}
              >
                Şeker
              </button>
              <button
                onClick={() => setActiveTab("pressure")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === "pressure"
                    ? "bg-white shadow-sm text-primary ring-1 ring-black/5"
                    : "text-gray-500 dark:text-gray-700 hover:text-gray-900"
                }`}
              >
                Tansiyon
              </button>
            </div>

            {activeTab === "sugar" ? (
              <div className="flex items-end justify-between h-32 gap-4 px-2 relative z-10">
                {MOCK_SUGAR.map((item, idx) => {
                  const heightPct = Math.round((item.value / (maxSugar * 1.3)) * 100);
                  const isToday = idx === MOCK_SUGAR.length - 1;
                  return (
                    <div key={item.day} className="flex flex-col items-center gap-2 w-1/3 group">
                      <div className={`relative w-full bg-gray-50 rounded-t-lg h-full flex items-end overflow-hidden ${isToday ? "ring-2 ring-primary/20" : ""}`}>
                        <div
                          className={`w-full rounded-t-lg relative group-hover:opacity-80 transition-colors ${
                            isToday
                              ? "bg-primary shadow-[0_0_15px_rgba(76,140,100,0.4)]"
                              : idx === 0
                                ? "bg-mint-soft"
                                : "bg-primary-light"
                          }`}
                          style={{ height: `${heightPct}%` }}
                        >
                          <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold ${isToday ? "text-primary" : "text-gray-500 dark:text-gray-700"}`}>
                            {item.value}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : "text-gray-500 dark:text-gray-700"}`}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 relative z-10">
                {MOCK_PRESSURE.map((item, idx) => {
                  const isToday = idx === MOCK_PRESSURE.length - 1;
                  return (
                    <div key={item.day} className={`flex items-center justify-between p-3 rounded-xl ${isToday ? "bg-primary/5 border border-primary/20" : "bg-gray-50"}`}>
                      <span className={`text-sm font-medium ${isToday ? "text-primary font-bold" : "text-gray-500 dark:text-gray-700"}`}>
                        {item.day}
                      </span>
                      <span className={`text-lg font-bold ${isToday ? "text-primary" : "text-gray-800 dark:text-gray-900"}`}>
                        {item.value}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-600">mmHg</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Iftar tip */}
        <section className="px-6 mb-8">
          <div className="bg-mint-soft/30 rounded-xl p-4 flex gap-4 items-center border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-4 w-6 h-6 text-primary/40 animate-float">
              <svg className="w-full h-full drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2C10.9,2 10,2.9 10,4H14C14,2.9 13.1,2 12,2M14,12C14,13.1 13.1,14 12,14C10.9,14 10,13.1 10,12C10,10.9 10.9,10 12,10C13.1,10 14,10.9 14,12M16.5,7V17H18V10C18,8.34 16.66,7 15,7H16.5M7.5,7H9C7.34,7 6,8.34 6,10V17H7.5V7M12,5C14.76,5 17,7.24 17,10V18C17,18.55 16.55,19 16,19H8C7.45,19 7,18.55 7,18V10C7,7.24 9.24,5 12,5M12,20C12.55,20 13,20.45 13,21H11C11,20.45 11.45,20 12,20Z" />
              </svg>
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary flex-shrink-0 shadow-sm border border-primary/10 relative z-10 text-gray-800 dark:text-gray-900">
              <span className="material-icons-round">local_dining</span>
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-1">
                İftar Tavsiyesi
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-700 leading-snug">
                Kan şekerini dengelemek için iftara hurma ve ılık su ile başlayın.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Emergency FAB */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          aria-label="Acil Arama"
          className="w-14 h-14 bg-red-50 text-red-500 rounded-full shadow-lg shadow-red-100 flex items-center justify-center border-2 border-white hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-icons-round text-2xl">emergency</span>
        </button>
      </div>
    </div>
  );
}
