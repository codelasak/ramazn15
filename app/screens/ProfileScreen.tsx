"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateGoals } from "../profil/actions";

const DEPARTMENT_LABELS: Record<string, string> = {
  teknoloji_fen: "Teknoloji ve Fen Bilimleri",
  fen_sosyal: "Fen Bilimleri ve Sosyal Bilimler",
  hazirlik: "Hazırlık",
};

export default function ProfileScreen({ dbUser }: { dbUser: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isPending, startTransition] = useTransition();
  const [goalSaved, setGoalSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  if (status === "loading" || !dbUser) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const user = session?.user;
  if (!user) return null;

  const initial = user.name?.[0]?.toUpperCase() ?? "Ö";
  const deptLabel = user.department ? DEPARTMENT_LABELS[user.department] ?? user.department : "Belirtilmedi";

  const handleGoalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateGoals(formData);
        setGoalSaved(true);
        setTimeout(() => setGoalSaved(false), 3000);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="relative min-h-dvh">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-br from-primary to-primary-dark rounded-b-[2.5rem]" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />

      <div className="relative z-10">
        <header className="pt-14 pb-8 px-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
            {initial}
          </div>
          <h1 className="text-xl font-bold text-white mt-4">{user.name}</h1>
          <p className="text-white/70 text-sm mt-0.5">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              {user.className ?? "—"}
            </span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              {user.isBoarder ? "🏠 Yurtlu" : "🚌 Evci"}
            </span>
          </div>
        </header>

        <main className="px-6 pb-8 -mt-2 space-y-6">
          {/* Info Cards */}
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 divide-y divide-gray-50">
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-icons-round text-primary text-xl">school</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Sınıf</p>
                <p className="text-sm font-bold text-gray-800">{user.className ?? "—"}</p>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                <span className="material-icons-round text-indigo-500 text-xl">science</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Alan</p>
                <p className="text-sm font-bold text-gray-800">{deptLabel}</p>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <span className="material-icons-round text-amber-600 text-xl">
                  {user.isBoarder ? "apartment" : "home"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Yatılılık Durumu</p>
                <p className="text-sm font-bold text-gray-800">
                  {user.isBoarder ? "Yurtlu (Pansiyon)" : "Evci (Gündüzcü)"}
                </p>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="material-icons-round text-gray-500 text-xl">badge</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Rol</p>
                <p className="text-sm font-bold text-gray-800">
                  {user.role === "admin" ? "Yönetici" : "Öğrenci"}
                </p>
              </div>
            </div>
          </div>

          {/* Goal Setting Section */}
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary text-xl">flag</span>
              Hedef Belirleme
            </h3>
            
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hedef Üniversite / Bölüm</label>
                <input 
                  name="targetUniversity"
                  type="text" 
                  defaultValue={dbUser.targetUniversity ?? ""}
                  placeholder="Örn: Boğaziçi Bilgisayar Mühendisliği" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hedef YKS Neti / Puanı</label>
                <input 
                  name="targetNet"
                  type="number" 
                  step="0.01"
                  defaultValue={dbUser.targetNet ?? ""}
                  placeholder="Örn: 95.5" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-200"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? "Kaydediliyor..." : goalSaved ? "Hedefler Kaydedildi! 🎉" : "Hedefleri Güncelle"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {/* Admin Panel Link */}
            {user.role === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-icons-round text-lg">admin_panel_settings</span>
                Admin Paneli
              </button>
            )}

            {/* Sign Out */}
            <button
              onClick={() => signOut({ callbackUrl: "/giris" })}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3.5 rounded-xl font-semibold text-sm border border-red-100 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">logout</span>
              Çıkış Yap
            </button>
          </div>

          {/* App info */}
          <div className="text-center pb-8 space-y-1">
            <p className="text-xs text-gray-400">15 Temmuz AİHL v1.0</p>
            <p className="text-xs text-gray-300">Bahçelievler 15 Temmuz Şehitleri AİHL © 2026</p>
          </div>
        </main>
      </div>
    </div>
  );
}
