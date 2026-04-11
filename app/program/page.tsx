import AppShell from "../shell/AppShell";

export default function ProgramPage() {
  return (
    <AppShell>
      <div className="relative min-h-dvh">
        <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-orange-50 to-amber-50/50 dark:from-transparent dark:to-transparent pb-8 pt-12 shadow-sm px-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              <span className="material-icons-round text-orange-500 text-3xl">calendar_month</span>
              Ders Programı
            </h1>
            <p className="text-sm text-gray-500 dark:text-orange-100/80 mt-2 font-medium">Haftalık ders programın ve etkinlikler</p>
          </div>
        </header>
        <main className="px-6 pb-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center text-gray-800 dark:text-gray-900">
            <span className="material-icons-round text-gray-300 text-5xl mb-4 block">construction</span>
            <h2 className="text-lg font-bold text-gray-700 mb-2">Yakında Geliyor</h2>
            <p className="text-sm text-gray-500 dark:text-gray-700">
              Ders programı admin panelden yüklendikten sonra burada görüntülenecek.
            </p>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
