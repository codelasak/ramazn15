import AppShell from "../shell/AppShell";
import Image from "next/image";

type Developer = {
  name: string;
  info: string;
  image: string;
};

const DEVELOPERS: Developer[] = [
  {
    name: "Muhammed Musab ALASIRT",
    info: "Frontend ve uygulama deneyimi geliştirme",
    image: "/developers/musab.jpg",
  },
  {
    name: "Ahmet Faruk Bahat",
    info: "Backend servisleri ve API geliştirme",
    image: "/developers/ahmet-faruk.jpg",
  },
  {
    name: "Mehmed Ali Cevahir",
    info: "Veri yapısı ve sistem entegrasyonları",
    image: "/developers/ali-cevahir.jpg",
  },
  {
    name: "Musa Bouzantsi",
    info: "Test, kalite ve süreç takibi",
    image: "/developers/musa.jpg",
  },
  {
    name: "Ali İsmail Eftekin",
    info: "Ürün planlama ve kullanıcı odaklı iyileştirmeler",
    image: "/developers/ali-ismail.jpg",
  },
  {
    name: "Ahmet Talha Kuşak",
    info: "Full-stack geliştirme ve teknik destek",
    image: "/developers/ahmet-talha.jpg",
  },
];

export default function DevelopersPage() {
  return (
    <AppShell>
      <div className="relative min-h-dvh">
        <header className="relative overflow-hidden rounded-b-[2.5rem] bg-linear-to-b from-emerald-50 to-teal-50/60 dark:from-transparent dark:to-transparent pb-8 pt-12 shadow-sm px-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-teal-300/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              <span className="material-icons-round text-emerald-600 text-3xl">groups</span>
              Geliştirici Ekibi
            </h1>
            <p className="text-sm text-gray-500 dark:text-emerald-100/80 mt-2 font-medium">
              Uygulamayı geliştiren ekip üyeleri
            </p>
          </div>
        </header>

        <main className="px-6 pb-8 pt-5 space-y-4">
          {DEVELOPERS.map((developer) => {
            return (
              <article
                key={developer.name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-emerald-100">
                  <Image
                    src={developer.image}
                    alt={developer.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-900">{developer.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-700 mt-1">{developer.info}</p>
                </div>
              </article>
            );
          })}
        </main>
      </div>
    </AppShell>
  );
}
