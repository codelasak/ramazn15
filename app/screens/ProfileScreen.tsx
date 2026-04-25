"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "../lib/auth-context";
import { apiJson, ApiError } from "../lib/api-client";
import { isNativePlatform } from "../lib/platform";

const DELETE_CONFIRM_PHRASE = "SİL";

const DEPARTMENT_LABELS: Record<string, string> = {
  teknoloji_fen: "Teknoloji ve Fen Bilimleri",
  fen_sosyal: "Fen Bilimleri ve Sosyal Bilimler",
  hazirlik: "Hazırlık",
};

export default function ProfileScreen() {
  const { user, logout, deleteAccount, refreshUser } = useAuth();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [goalSaved, setGoalSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { theme, setTheme } = useTheme();

  if (!user) return null;
  const dbUser = user;

  const initial = user.name?.[0]?.toUpperCase() ?? "Ö";
  const deptLabel = user.department ? DEPARTMENT_LABELS[user.department] ?? user.department : "Belirtilmedi";

  const handleGoalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const targetUniversity = (formData.get("targetUniversity") as string | null)?.trim() ?? "";
    const targetNetRaw = (formData.get("targetNet") as string | null) ?? "";
    startTransition(async () => {
      try {
        await apiJson("/api/v1/auth/me", {
          method: "PATCH",
          body: JSON.stringify({
            targetUniversity: targetUniversity || null,
            targetNet: targetNetRaw === "" ? null : targetNetRaw,
          }),
        });
        await refreshUser();
        setGoalSaved(true);
        setTimeout(() => setGoalSaved(false), 3000);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const isBoarder = formData.get("isBoarder") === "true";
    if (!name) return;
    startTransition(async () => {
      try {
        await apiJson("/api/v1/auth/me", {
          method: "PATCH",
          body: JSON.stringify({ name, isBoarder }),
        });
        await refreshUser();
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("profile update error:", err.message);
        } else {
          console.error(err);
        }
      }
    });
  };

  const handleLogout = async () => {
    await logout();
    if (!isNativePlatform()) {
      try {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
      } catch {
        // ignore
      }
    }
    router.push("/giris");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== DELETE_CONFIRM_PHRASE) {
      setDeleteError(`Onaylamak için "${DELETE_CONFIRM_PHRASE}" yazın.`);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      if (!isNativePlatform()) {
        try {
          const { signOut } = await import("next-auth/react");
          await signOut({ redirect: false });
        } catch {
          // ignore
        }
      }
      router.push("/giris");
    } catch (err) {
      setDeleting(false);
      setDeleteError(
        err instanceof ApiError
          ? `Hesap silinemedi: ${err.message}`
          : "Hesap silinemedi. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <div className="relative min-h-dvh">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-linear-to-br from-primary to-primary-dark dark:from-black/40 dark:to-black/10 dark:border-b dark:border-white/5 rounded-b-[2.5rem] shadow-sm" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-mint-soft/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        <header className="pt-14 pb-8 px-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
            {initial}
          </div>
          <h1 className="text-xl font-bold text-white mt-4">{dbUser.name}</h1>
          <p className="text-white/70 text-sm mt-0.5">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {dbUser.className ?? "—"}
            </span>
            <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {dbUser.isBoarder ? "🏠 Yurtlu" : "🚌 Evci"}
            </span>
          </div>
        </header>

        <main className="px-6 pb-8 -mt-2 space-y-6">
          {/* Info Cards */}
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 divide-y divide-gray-50 text-gray-800 dark:text-gray-900">
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center">
                <span className="material-icons-round text-primary text-xl">school</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-700 font-medium">Sınıf</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-900">{user.className ?? "—"}</p>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-indigo-500 text-xl">science</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-700 font-medium">Alan</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-900">{deptLabel}</p>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-amber-600 text-xl">
                  {user.isBoarder ? "apartment" : "home"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-700 font-medium">Yatılılık Durumu</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-900">
                  {user.isBoarder ? "Yurtlu (Pansiyon)" : "Evci (Gündüzcü)"}
                </p>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 dark:text-gray-900">
                <span className="material-icons-round text-gray-500 dark:text-gray-700 text-xl">badge</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-700 font-medium">Rol</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-900">
                  {user.role === "admin" ? "Yönetici" : "Öğrenci"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Edit Section */}
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 p-5 text-gray-800 dark:text-gray-900">
            <h3 className="font-bold text-gray-800 dark:text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary text-xl">edit</span>
              Profil Düzenle
            </h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-700 mb-1">Ad Soyad</label>
                <input 
                  name="name"
                  type="text" 
                  defaultValue={dbUser.name ?? ""}
                  placeholder="Adınız Soyadınız" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 dark:text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-700 mb-2">Yatılılık Durumu</label>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    dbUser.isBoarder ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <input 
                      type="radio" 
                      name="isBoarder" 
                      value="true" 
                      defaultChecked={dbUser.isBoarder}
                      className="sr-only"
                      onChange={(e) => {
                        const labels = e.target.closest('.flex')?.querySelectorAll('label');
                        labels?.forEach((l, i) => {
                          if (i === 0) {
                            l.className = 'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all bg-primary/10 border-primary/20 text-primary';
                          } else {
                            l.className = 'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all bg-gray-50 border-gray-200 text-gray-500';
                          }
                        });
                      }}
                    />
                    <span className="material-icons-round text-sm">apartment</span>
                    <span className="text-sm font-semibold">Yurtlu</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    !dbUser.isBoarder ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <input 
                      type="radio" 
                      name="isBoarder" 
                      value="false" 
                      defaultChecked={!dbUser.isBoarder}
                      className="sr-only"
                      onChange={(e) => {
                        const labels = e.target.closest('.flex')?.querySelectorAll('label');
                        labels?.forEach((l, i) => {
                          if (i === 1) {
                            l.className = 'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all bg-primary/10 border-primary/20 text-primary';
                          } else {
                            l.className = 'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all bg-gray-50 border-gray-200 text-gray-500';
                          }
                        });
                      }}
                    />
                    <span className="material-icons-round text-sm">home</span>
                    <span className="text-sm font-semibold">Evci</span>
                  </label>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? "Kaydediliyor..." : profileSaved ? "Profil Güncellendi! ✅" : "Profili Güncelle"}
              </button>
            </form>
          </div>

          {/* Goal Setting Section */}
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 p-5 text-gray-800 dark:text-gray-900">
            <h3 className="font-bold text-gray-800 dark:text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary text-xl">flag</span>
              Hedef Belirleme
            </h3>
            
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-700 mb-1">Hedef Üniversite / Bölüm</label>
                <input 
                  name="targetUniversity"
                  type="text" 
                  defaultValue={dbUser.targetUniversity ?? ""}
                  placeholder="Örn: Boğaziçi Bilgisayar Mühendisliği" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 dark:text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-700 mb-1">Hedef YKS Neti / Puanı</label>
                <input 
                  name="targetNet"
                  type="number" 
                  step="0.01"
                  max="560"
                  min="0"
                  defaultValue={dbUser.targetNet ?? ""}
                  placeholder="Örn: 95.5" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 dark:text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-200"
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

          {/* Theme Settings Section */}
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 p-5 text-gray-800 dark:text-gray-900">
            <h3 className="font-bold text-gray-800 dark:text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary text-xl">palette</span>
              Görünüm Ayarları
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`py-2 px-3 rounded-xl text-sm font-bold flex flex-col items-center gap-2 transition-all border ${theme === 'light' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 text-gray-500 dark:text-gray-700 border-transparent hover:bg-gray-100'}`}
              >
                <span className="material-icons-round">light_mode</span>
                Açık (Kırmızı)
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`py-2 px-3 rounded-xl text-sm font-bold flex flex-col items-center gap-2 transition-all border ${theme === 'dark' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 text-gray-500 dark:text-gray-700 border-transparent hover:bg-gray-100'}`}
              >
                <span className="material-icons-round">dark_mode</span>
                Koyu (Yeşil)
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`py-2 px-3 rounded-xl text-sm font-bold flex flex-col items-center gap-2 transition-all border ${theme === 'system' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 text-gray-500 dark:text-gray-700 border-transparent hover:bg-gray-100'}`}
              >
                <span className="material-icons-round">settings_brightness</span>
                Sistem
              </button>
            </div>
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

            <button
              onClick={() => router.push("/developers")}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">groups</span>
              Geliştirici Ekibi
            </button>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3.5 rounded-xl font-semibold text-sm border border-red-100 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">logout</span>
              Çıkış Yap
            </button>

            {/* Delete Account — Apple Guideline 5.1.1(v) */}
            <button
              onClick={() => {
                setShowDeleteDialog(true);
                setDeleteConfirmText("");
                setDeleteError(null);
              }}
              className="w-full bg-white hover:bg-red-50 text-red-700 py-3 rounded-xl font-semibold text-sm border border-red-200 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">delete_forever</span>
              Hesabımı Sil
            </button>
          </div>

          {showDeleteDialog && (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                    <span className="material-icons-round text-red-600 text-2xl">delete_forever</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Hesabımı Sil</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Bu işlem <strong>geri alınamaz</strong>. Hesabınız ve bağlı tüm verileriniz
                  kalıcı olarak silinecek:
                </p>
                <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5 mb-4">
                  <li>Profil bilgileri (ad, sınıf, alan, hedefler)</li>
                  <li>Deneme sınavı sonuçları ve net analizleri</li>
                  <li>Yatılılık ve konum tercihleri</li>
                </ul>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Onaylamak için <span className="font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{DELETE_CONFIRM_PHRASE}</span> yazın
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={DELETE_CONFIRM_PHRASE}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
                {deleteError && (
                  <p className="mt-2 text-xs text-red-600 flex items-start gap-1.5">
                    <span className="material-icons-round text-sm">error</span>
                    {deleteError}
                  </p>
                )}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors disabled:opacity-60"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText.trim() !== DELETE_CONFIRM_PHRASE}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Siliniyor…
                      </>
                    ) : (
                      "Hesabı Sil"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* App info */}
          <div className="text-center pb-8 space-y-1">
            <p className="text-xs text-gray-400 dark:text-gray-600">15 Temmuz AİHL v1.0</p>
            <p className="text-xs text-gray-300">Bahçelievler 15 Temmuz Şehitleri AİHL © 2026</p>
          </div>
        </main>
      </div>
    </div>
  );
}
