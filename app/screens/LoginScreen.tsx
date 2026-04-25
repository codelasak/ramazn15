"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";
  const devLoginEmail = process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL;
  const devLoginPassword = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD;
  const canUseDevLogin = isDev && !!devLoginEmail && !!devLoginPassword;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("E-posta veya şifre hatalı.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDevLogin() {
    if (!canUseDevLogin || !devLoginEmail || !devLoginPassword) return;

    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: devLoginEmail,
        password: devLoginPassword,
        redirect: false,
      });

      if (res?.error) {
        setError("Dev hızlı giriş başarısız oldu. Ortam değişkenlerini kontrol edin.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary-light/15 rounded-full blur-2xl" />

      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23065f46'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center shadow-xl shadow-primary/30 relative">
            <span className="material-icons-round text-white text-4xl">school</span>
            <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-md -z-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            15 Temmuz AİHL
          </h1>
          <p className="text-gray-500 dark:text-gray-700 mt-1.5 text-sm font-medium">
            Geleceğe Adım At
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-7 shadow-xl shadow-black/5 border border-white/60 text-gray-800 dark:text-gray-900">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-900 mb-1">Giriş Yap</h2>
            <p className="text-sm text-gray-500 dark:text-gray-700 mb-6">Öğrenci hesabınla giriş yap</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  E-posta
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 dark:text-gray-600 text-xl">mail</span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@ogrenci.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Şifre
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 dark:text-gray-600 text-xl">lock</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-500 transition-colors"
                  >
                    <span className="material-icons-round text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 border border-red-100">
                  <span className="material-icons-round text-lg">error</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <span className="material-icons-round text-lg">login</span>
                    Giriş Yap
                  </>
                )}
              </button>

              {canUseDevLogin && (
                <button
                  type="button"
                  onClick={handleDevLogin}
                  disabled={loading}
                  className="w-full border border-emerald-200 bg-emerald-50 text-emerald-800 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round text-lg">bolt</span>
                  Dev Hızlı Giriş
                </button>
              )}
            </form>
          </div>

          {/* Register link */}
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-700">
            Hesabın yok mu?{" "}
            <Link
              href="/kayit"
              className="text-primary font-semibold hover:text-primary-dark transition-colors"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
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
