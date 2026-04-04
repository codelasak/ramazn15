"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DEPARTMENT_LABELS: Record<string, string> = {
  teknoloji_fen: "Teknoloji ve Fen Bilimleri",
  fen_sosyal: "Fen Bilimleri ve Sosyal Bilimler",
  hazirlik: "Hazırlık",
};

export default function ProfileScreen() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  if (status === "loading") {
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

        <main className="px-6 pb-8 -mt-2">
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

          {/* Admin Panel Link */}
          {user.role === "admin" && (
            <button
              onClick={() => router.push("/admin")}
              className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">admin_panel_settings</span>
              Admin Paneli
            </button>
          )}

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/giris" })}
            className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-600 py-3.5 rounded-xl font-semibold text-sm border border-red-100 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-lg">logout</span>
            Çıkış Yap
          </button>

          {/* App info */}
          <div className="text-center mt-8 space-y-1">
            <p className="text-xs text-gray-400">15 Temmuz AİHL v1.0</p>
            <p className="text-xs text-gray-300">Bahçelievler 15 Temmuz Şehitleri AİHL © 2026</p>
          </div>
        </main>
      </div>
    </div>
  );
}
