"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { ApiError } from "../lib/api-client";
import { isNativePlatform } from "../lib/platform";

const CLASS_OPTIONS = [
  "9A", "9B", "9C", "9D",
  "10A", "10B", "10C", "10D",
  "11A", "11B", "11C", "11D",
  "12A", "12B", "12C", "12D",
];

const DEPARTMENT_OPTIONS = [
  { value: "teknoloji_fen", label: "Teknoloji ve Fen Bilimleri" },
  { value: "fen_sosyal", label: "Fen Bilimleri ve Sosyal Bilimler" },
  { value: "hazirlik", label: "Hazırlık" },
];

type Department = "teknoloji_fen" | "fen_sosyal" | "hazirlik";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [className, setClassName] = useState("");
  const [department, setDepartment] = useState("");
  const [isBoarder, setIsBoarder] = useState<boolean | null>(null);

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!className || !department || isBoarder === null) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      // 1) JWT register (yeni sistem - hem web hem mobil).
      await register({
        name,
        email,
        password,
        className,
        department: department as Department,
        isBoarder: isBoarder === true,
      });

      // 2) Web'de mevcut useSession kullanan sayfalar icin NextAuth
      //    oturumunu da ac. Native'de gereksiz.
      if (!isNativePlatform()) {
        try {
          const { signIn } = await import("next-auth/react");
          await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
        } catch {
          // sessizce gec; JWT registration basarili.
        }
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl translate-y-1/3 translate-x-1/4" />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23065f46'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center shadow-xl shadow-primary/30">
            <span className="material-icons-round text-white text-3xl">school</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Kayıt Ol</h1>
          <p className="text-gray-500 dark:text-gray-700 mt-1 text-sm">15 Temmuz AİHL Öğrenci Hesabı</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step === 1 ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-primary/10 text-primary"
          }`}>1</div>
          <div className="w-12 h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full bg-primary transition-all duration-500 ${step === 2 ? "w-full" : "w-0"}`} />
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step === 2 ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-gray-100 text-gray-400 dark:text-gray-600"
          }`}>2</div>
        </div>

        <div className="w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-7 shadow-xl shadow-black/5 border border-white/60 text-gray-800 dark:text-gray-900">
            {step === 1 ? (
              <>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-900 mb-1">Hesap Bilgileri</h2>
                <p className="text-sm text-gray-500 dark:text-gray-700 mb-5">Temel bilgilerini gir</p>

                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">Ad Soyad</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 dark:text-gray-600 text-xl">person</span>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 dark:text-gray-600 text-xl">mail</span>
                      <input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@ogrenci.com"
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-pass" className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 dark:text-gray-600 text-xl">lock</span>
                      <input
                        id="reg-pass"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="En az 6 karakter"
                        required
                        minLength={6}
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-500"
                      >
                        <span className="material-icons-round text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-confirm" className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre Tekrar</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 dark:text-gray-600 text-xl">lock</span>
                      <input
                        id="reg-confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifrenizi tekrar girin"
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 border border-red-100">
                      <span className="material-icons-round text-lg">error</span>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-linear-to-r from-primary to-primary-dark text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Devam Et
                    <span className="material-icons-round text-lg">arrow_forward</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <button
                    onClick={() => { setStep(1); setError(""); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-800 dark:text-gray-900"
                  >
                    <span className="material-icons-round text-gray-500 dark:text-gray-700 text-xl">arrow_back</span>
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-900">Okul Bilgileri</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-700">Sınıf ve alan bilgilerini seç</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Class */}
                  <div>
                    <label htmlFor="class" className="block text-sm font-semibold text-gray-700 mb-1.5">Sınıf</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 dark:text-gray-600 text-xl">class</span>
                      <select
                        id="class"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm appearance-none"
                      >
                        <option value="">Sınıfınızı seçin</option>
                        {CLASS_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label htmlFor="dept" className="block text-sm font-semibold text-gray-700 mb-1.5">Alan</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 dark:text-gray-600 text-xl">science</span>
                      <select
                        id="dept"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm appearance-none"
                      >
                        <option value="">Alanınızı seçin</option>
                        {DEPARTMENT_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Boarder status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Yatılılık Durumu</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsBoarder(true)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          isBoarder === true
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <span className={`material-icons-round text-3xl ${isBoarder === true ? "text-primary" : "text-gray-400 dark:text-gray-600"}`}>apartment</span>
                        <span className={`text-sm font-semibold ${isBoarder === true ? "text-primary" : "text-gray-500 dark:text-gray-700"}`}>Yurtlu</span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-600">Pansiyonda kalıyorum</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsBoarder(false)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          isBoarder === false
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <span className={`material-icons-round text-3xl ${isBoarder === false ? "text-primary" : "text-gray-400 dark:text-gray-600"}`}>home</span>
                        <span className={`text-sm font-semibold ${isBoarder === false ? "text-primary" : "text-gray-500 dark:text-gray-700"}`}>Evci</span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-600">Evden geliyorum</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 border border-red-100">
                      <span className="material-icons-round text-lg">error</span>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-primary to-primary-dark text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Kayıt yapılıyor...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round text-lg">check_circle</span>
                        Kayıt Ol
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Login link */}
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-700">
            Zaten bir hesabın var mı?{" "}
            <Link href="/giris" className="text-primary font-semibold hover:text-primary-dark transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>

      <div className="relative z-10 pb-6 px-6 text-center">
        <div className="mx-auto max-w-sm rounded-2xl border border-emerald-100/80 bg-white/60 backdrop-blur p-3.5 text-gray-600">
          <p className="text-[11px] font-semibold tracking-wide text-emerald-700">Geliştirici Ekibi</p>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
            Ahmet Faruk Bahat, Ahmet Talha Kuşak, Ali İsmail Eftekin, Mehmed Ali Cevahir, Musa Bouzantsi
          </p>
          <Link
            href="/developers"
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <span className="material-icons-round text-sm">groups</span>
            Tüm geliştiricileri görüntüle
          </Link>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">Bahçelievler 15 Temmuz Şehitleri AİHL © 2026</p>
      </div>
    </div>
  );
}
