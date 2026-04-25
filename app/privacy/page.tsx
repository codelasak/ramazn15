import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Pano15",
  description:
    "Pano15 (15 Temmuz AİHL) mobil ve web uygulamasının gizlilik politikası. Hangi kişisel verileri topladığımız, nasıl kullandığımız ve güvenlik önlemlerimiz.",
};

const LAST_UPDATED = "26 Nisan 2026";
const CONTACT_EMAIL = "eshagh@fennaver.com";

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 px-6 py-12">
      <div className="mx-auto max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-black/5 border border-white/60 text-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Gizlilik Politikası
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Son güncelleme: {LAST_UPDATED}
        </p>

        <section className="space-y-6 text-sm leading-relaxed text-gray-700">
          <p>
            Pano15 (&ldquo;Uygulama&rdquo;), Bahçelievler 15 Temmuz Şehitleri
            Anadolu İmam Hatip Lisesi öğrencilerine yönelik bir mobil ve web
            uygulamasıdır. Bu gizlilik politikası, Uygulama&apos;yı kullanırken
            tarafımızdan toplanan kişisel verileri, bu verilerin nasıl
            işlendiğini ve haklarınızı açıklar.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            1. Topladığımız Veriler
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Hesap bilgileri:</strong> e-posta adresi, şifre (sunucuda
              hash&apos;lenmiş şekilde saklanır; düz metin tutulmaz).
            </li>
            <li>
              <strong>Profil bilgileri:</strong> ad-soyad, sınıf, bölüm
              (teknoloji-fen / fen-sosyal / hazırlık), pansiyon durumu, hedef
              üniversite ve hedef net (opsiyonel; profil ekranından
              güncellenir).
            </li>
            <li>
              <strong>Kullanıcı içeriği:</strong> deneme sınavı sonuçları, ders
              takip notları ve benzeri kullanıcı tarafından oluşturulan veriler.
            </li>
            <li>
              <strong>Oturum bilgileri:</strong> JWT erişim ve yenileme
              tokenları cihaz üzerinde (iOS Capacitor Preferences / Android
              SharedPreferences / web localStorage) saklanır.
            </li>
            <li>
              <strong>Konum (opsiyonel):</strong> Namaz vakitleri için
              seçtiğiniz il/ilçe bilgisi cihaz üzerinde saklanır; konum
              koordinatlarınıza erişmiyoruz.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            2. Verileri Nasıl Kullanıyoruz
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hesap oluşturma, kimlik doğrulama ve giriş yapma.</li>
            <li>Kişiselleştirilmiş ders takibi, deneme analizi ve gösterge tablosu.</li>
            <li>Seçtiğiniz konuma göre namaz vakitlerinin gösterilmesi.</li>
            <li>
              Hata ayıklama, performans ve güvenlik amaçlı sınırlı sunucu
              günlükleri (log).
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            3. Üçüncü Taraf Servisler
          </h2>
          <p>
            Uygulama; Diyanet ezan vakitleri (ezanvakti.emushaf.net) ve Kuran
            içerik servisi (api.alquran.cloud) gibi üçüncü taraf API&apos;lerden
            okunabilir veri çeker. Bu servislere kişisel veriniz gönderilmez;
            sadece konum ID&apos;si veya sure numarası gibi kullanıcı seçimleri
            iletilir.
          </p>
          <p>
            Reklam, analytics veya üçüncü taraf takip yazılımı{" "}
            <strong>kullanmıyoruz</strong>.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            4. Veri Saklama ve Güvenlik
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Şifreler bcrypt ile hash&apos;lenip saklanır; düz metin parolaya
              hiçbir zaman erişilmez.
            </li>
            <li>Tüm sunucu trafiği HTTPS/TLS ile şifrelenir.</li>
            <li>
              Veriler, hesabınız aktif olduğu sürece veya yasal yükümlülüklerimiz
              gerektirdiği süre kadar saklanır.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            5. Haklarınız
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kişisel verilerinize erişme.</li>
            <li>Hatalı veya eksik bilgileri düzeltme.</li>
            <li>Hesabınızın ve verilerinizin silinmesini talep etme.</li>
            <li>İletişim bilgileri için aşağıdaki bölüme bakınız.</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            6. Çocukların Gizliliği
          </h2>
          <p>
            Uygulama lise öğrencilerine yöneliktir. 13 yaşın altındaki
            kullanıcılardan bilerek kişisel veri toplamayız.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            7. Politika Değişiklikleri
          </h2>
          <p>
            Bu politika zaman zaman güncellenebilir. Önemli değişiklikler
            uygulamada veya bu sayfada duyurulur.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            8. İletişim
          </h2>
          <p>
            Gizlilik politikası, hesap silme talepleri veya kişisel verilerinize
            ilişkin sorularınız için{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary font-semibold hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            adresine yazabilirsiniz.
          </p>
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
