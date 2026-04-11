import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/giris");
  }

  if (session.user.role !== "admin") {
    redirect("/"); // Not an admin
  }

  return (
    <div className="min-h-dvh flex bg-slate-50 text-gray-800 dark:text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-icons-round text-sm">admin_panel_settings</span>
            </div>
            <span className="font-bold">AİHL Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto section-nav">
          <NavLink href="/admin" icon="dashboard">Dashboard</NavLink>
          <NavLink href="/admin/ogrenciler" icon="groups">Öğrenciler</NavLink>
          <NavLink href="/admin/duyurular" icon="campaign">Duyurular</NavLink>
          <NavLink href="/admin/yemek" icon="restaurant">Yemek Menüsü</NavLink>
          <NavLink href="/admin/program" icon="calendar_today">Ders Programı</NavLink>
          <NavLink href="/admin/sinavlar" icon="event_note">Sınav Takvimi</NavLink>
          <NavLink href="/admin/etut" icon="menu_book">Pansiyon Etütleri</NavLink>
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 p-3 text-sm text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <span className="material-icons-round">arrow_back</span>
            Uygulamaya Dön
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 max-h-dvh overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between text-gray-800 dark:text-gray-900">
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-primary">admin_panel_settings</span>
            <span className="font-bold text-slate-800">AİHL Admin</span>
          </div>
          <Link href="/" className="text-primary text-sm font-semibold">Uygulamaya Dön</Link>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex items-center justify-between px-2 pb-safe pt-1 z-50 text-gray-800 dark:text-gray-900">
        <MobileNavLink href="/admin" icon="dashboard" label="Özet" />
        <MobileNavLink href="/admin/duyurular" icon="campaign" label="Duyuru" />
        <MobileNavLink href="/admin/yemek" icon="restaurant" label="Yemek" />
        <MobileNavLink href="/admin/program" icon="calendar_month" label="Ders" />
      </nav>
    </div>
  );
}

// Subcomponents for clearer navigation
function NavLink({ href, icon, children }: { href: string; icon: string; children: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 text-sm text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/10 active:bg-white/5">
      <span className="material-icons-round text-[20px]">{icon}</span>
      {children}
    </Link>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center p-2 text-slate-500 flex-1">
      <span className="material-icons-round text-xl">{icon}</span>
      <span className="text-[10px] mt-0.5 font-medium">{label}</span>
    </Link>
  );
}
