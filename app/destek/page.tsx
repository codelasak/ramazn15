import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Destek — Pano15",
  description:
    "Pano15 uygulamasıyla ilgili destek, hata bildirimi ve geri bildirim için iletişim bilgileri.",
};

const CONTACT_EMAIL = "eshagh@fennaver.com";

export default function DestekPage() {
  return (
    <main className="min-h-dvh bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 px-6 py-12">
      <div className="mx-auto max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-black/5 border border-white/60 text-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Destek
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Pano15 — Bahçelievler 15 Temmuz Şehitleri AİHL
        </p>

        <section className="space-y-6 text-sm leading-relaxed text-gray-700">
          <p>
            Uygulamayla ilgili bir sorun yaşıyorsanız, geri bildirimde
            bulunmak veya hesabınızla ilgili bir talep iletmek istiyorsanız
            aşağıdaki kanallardan bize ulaşabilirsiniz.
          </p>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-emerald-900 mb-3">
              E-posta ile iletişim
            </h2>
            <p className="mb-3">
              Tüm destek talepleri ve geri bildirimler için:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              <span className="material-icons-round text-lg">mail</span>
              {CONTACT_EMAIL}
            </a>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            Sıkça Sorulan Sorular
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Şifremi unuttum, ne yapmalıyım?
              </h3>
              <p>
                Şu an için &ldquo;şifremi unuttum&rdquo; akışı geliştirilmektedir.
                Lütfen yukarıdaki e-posta adresine yazın; hesabınızın şifresi
                manuel olarak sıfırlanacaktır.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Hesabımı nasıl silebilirim?
              </h3>
              <p>
                Hesap silme talebinizi {CONTACT_EMAIL} adresine iletmeniz
                yeterlidir. Talep alındıktan sonra 7 iş günü içerisinde
                hesabınız ve tüm kişisel verileriniz sistemden kaldırılır.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Uygulamada bir hata buldum, nasıl bildirebilirim?
              </h3>
              <p>
                E-posta ile bize ulaşın; kullandığınız cihazı (örn. iPhone 15
                Pro), iOS/Android sürümünü ve karşılaştığınız hatayı kısaca
                anlatan bir ekran görüntüsü ekleyin.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Yeni bir özellik önerim var
              </h3>
              <p>
                Geri bildirimleriniz uygulamayı geliştirmemiz için çok değerli.
                Önerinizi kısaca açıklayan bir e-posta gönderebilirsiniz.
              </p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 pt-4">
            İlgili Bağlantılar
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
                href="/developers"
                className="text-primary font-semibold hover:underline"
              >
                Geliştirici Ekibi
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
