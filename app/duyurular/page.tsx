import AppShell from "../shell/AppShell";

export default function DuyurularPage() {
  return (
    <AppShell>
      <div className="relative min-h-dvh">
        <header className="px-6 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-icons-round text-blue-500">campaign</span>
            Duyurular
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-700 mt-1">Okul duyuruları ve haberler</p>
        </header>
        <main className="px-6 pb-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center text-gray-800 dark:text-gray-900">
            <span className="material-icons-round text-gray-300 text-5xl mb-4 block">notifications</span>
            <h2 className="text-lg font-bold text-gray-700 mb-2">Henüz Duyuru Yok</h2>
            <p className="text-sm text-gray-500 dark:text-gray-700">
              Admin panelden duyurular eklendikçe burada listelenecek.
            </p>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
