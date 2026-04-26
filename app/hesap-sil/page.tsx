import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hesap Silme — Pano15",
  description:
    "Pano15 uygulamasında hesabınızı ve tüm kişisel verilerinizi nasıl silebileceğinizi öğrenin.",
};

const CONTACT_EMAIL = "eshagh@fennaver.com";

export default function HesapSilPage() {
  return (
    <main className="min-h-dvh bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 px-6 py-12">
      <div className="mx-auto max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-black/5 border border-white/60 text-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Hesap Silme
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Pano15 — Bahçelievler 15 Temmuz Şehitleri Anadolu İmam Hatip Lisesi
        </p>

        <section className="space-y-6 text-sm leading-relaxed text-gray-700">
          <p>
            Bu sayfada Pano15 hesabınızı ve uygulamada saklanan tüm kişisel
            verilerinizi nasıl silebileceğiniz açıklanmaktadır. Hesap silme
            işlemi <strong>geri alınamaz</strong>.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span className="material-icons-round text-xl">info</span>
              Yöntem 1: Uygulama içinden silme (önerilen)
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Pano15 uygulamasını açın ve hesabınızla giriş yapın.</li>
              <li>
                Alt menüden <strong>Profil</strong> sekmesine dokunun.
              </li>
              <li>
                Sayfanın en altına kaydırın ve{" "}
                <strong>&quot;Hesabımı Sil&quot;</strong> butonuna dokunun.
              </li>
              <li>
                Açılan onay penceresinde küçük harfle{" "}
                <strong className="font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                  SİL
                </strong>{" "}
                yazın ve <strong>&quot;Hesabı Sil&quot;</strong> butonuna
                dokunun.
              </li>
              <li>
                Hesabınız ve tüm kişisel verileriniz anında ve kalıcı olarak
                silinir; oturumunuz otomatik kapanır.
              </li>
            </ol>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <span className="material-icons-round text-xl">mail</span>
              Yöntem 2: E-posta ile talep
            </h2>
            <p className="mb-3">
              Uygulamaya erişiminiz yoksa veya hesabınızla giriş
              yapamıyorsanız, hesap silme talebinizi e-posta ile iletebilirsiniz:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Hesap%20Silme%20Talebi%20-%20Pano15`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              <span className="material-icons-round text-lg">mail</span>
              {CONTACT_EMAIL}
            </a>
            <p className="mt-3 text-xs text-gray-500">
              Talebiniz alındıktan sonra <strong>7 iş günü içinde</strong>{" "}
              hesabınız manuel olarak silinir; size onay e-postası gönderilir.
            </p>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            Hangi veriler silinir?
          </h2>
          <p>
            Hesabınızı sildiğinizde aşağıdaki tüm veriler{" "}
            <strong>kalıcı olarak</strong> sunucularımızdan kaldırılır:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Profil bilgileri (ad, e-posta, sınıf, alan, yatılılık durumu)</li>
            <li>Hedef üniversite ve hedef YKS net bilgisi</li>
            <li>Tüm deneme sınavı sonuçlarınız ve net analizleriniz</li>
            <li>Profil fotoğrafı (varsa)</li>
            <li>Konum tercihi (namaz vakti için seçtiğiniz ilçe)</li>
            <li>Kullanıcı kimliği (UUID) ve oturum tokenleri</li>
            <li>Şifre özeti (bcrypt hash)</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            Hangi veriler kısa süreliğine saklanabilir?
          </h2>
          <p>
            Hesap silme işleminden sonra aşağıdaki veriler{" "}
            <strong>en fazla 30 gün</strong> süreyle teknik amaçlarla
            (yedekleme rotasyonu, log dosyaları) saklanabilir; bu süre sonunda
            otomatik olarak silinir:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>
              Sunucu erişim logları (IP adresi, tarih/saat — kişisel kimlikle
              eşleştirilemez)
            </li>
            <li>Veri tabanı yedekleri (rotasyon süresi: 30 gün)</li>
          </ul>
          <p className="text-xs text-gray-500">
            Bu loglar yasal gerekliliklerden (Türkiye Cumhuriyeti 5651 sayılı
            Kanun) dolayı saklanır ve hiçbir koşulda üçüncü taraflarla
            paylaşılmaz.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            Verinin bir kısmını silmek mümkün mü?
          </h2>
          <p>
            Şu anda hesabı silmeden seçici veri silme imkânı sunmuyoruz.
            Yalnızca hedef üniversite/net gibi alanları{" "}
            <Link href="/profil" className="text-primary font-semibold hover:underline">
              Profil sayfasından
            </Link>{" "}
            güncelleyebilir veya boş bırakabilirsiniz.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            İlgili sayfalar
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <Link
                href="/privacy"
                className="text-primary font-semibold hover:underline"
              >
                Gizlilik Politikası
              </Link>
            </li>
            <li>
              <Link
                href="/destek"
                className="text-primary font-semibold hover:underline"
              >
                Genel Destek
              </Link>
            </li>
          </ul>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="text-sm text-primary font-semibold hover:underline"
          >
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
