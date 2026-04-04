import AppShell from "../shell/AppShell";

export default function ProgramPage() {
  return (
    <AppShell>
      <div className="relative min-h-dvh">
        <header className="px-6 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-icons-round text-primary">calendar_month</span>
            Ders Programı
          </h1>
          <p className="text-sm text-gray-500 mt-1">Haftalık ders programın ve etkinlikler</p>
        </header>
        <main className="px-6 pb-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <span className="material-icons-round text-gray-300 text-5xl mb-4 block">construction</span>
            <h2 className="text-lg font-bold text-gray-700 mb-2">Yakında Geliyor</h2>
            <p className="text-sm text-gray-500">
              Ders programı admin panelden yüklendikten sonra burada görüntülenecek.
            </p>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
