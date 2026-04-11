import Link from "next/link";
import { db } from "../lib/db";
import { users, announcements, exams } from "../lib/schema";
import { eq, count, gte } from "drizzle-orm";

export default async function AdminDashboardPage() {
  // Fetch real stats from the database
  const [totalStudents] = await db.select({ count: count() }).from(users).where(eq(users.role, "student"));
  const [activeAnnouncements] = await db.select({ count: count() }).from(announcements);
  const [boarderStudents] = await db.select({ count: count() }).from(users).where(eq(users.isBoarder, true));
  const [upcomingExams] = await db.select({ count: count() }).from(exams).where(gte(exams.examDate, new Date()));

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Yönetim Paneli Özet</h1>
        <p className="text-slate-500 mt-1">Sistem durumuna genel bakış ve hızlı istatistikler.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Toplam Öğrenci" value={String(totalStudents.count)} icon="groups" color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Aktif Duyurular" value={String(activeAnnouncements.count)} icon="campaign" color="text-amber-600" bg="bg-amber-50" href="/admin/duyurular" />
        <StatCard title="Yurtlu Öğrenci" value={String(boarderStudents.count)} icon="apartment" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Yaklaşan Sınav" value={String(upcomingExams.count)} icon="event_note" color="text-purple-600" bg="bg-purple-50" href="/admin/sinavlar" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-icons-round text-primary">bolt</span>
            Hızlı İşlemler
          </h2>
          <div className="space-y-3">
            <ActionRow title="Yeni Duyuru Ekle" desc="Tüm okula veya spesifik sınıflara" icon="add_alert" href="/admin/duyurular" />
            <ActionRow title="Yemek Menüsü Güncelle" desc="Aylık yemek listesini düzenle" icon="restaurant" href="/admin/yemek" />
            <ActionRow title="Sınav Ekle" desc="Ortak veya sınıf bazlı sınav takvimi" icon="note_add" href="/admin/sinavlar" />
            <ActionRow title="Pansiyon Etütleri" desc="Etüt programını düzenle" icon="menu_book" href="/admin/etut" />
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-icons-round text-slate-400">info</span>
            Sistem Bilgisi
          </h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Veritabanı</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Neon Postgres
              </span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Kimlik Doğrulama</span>
              <span className="font-medium text-slate-800">NextAuth.js</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Çerçeve</span>
              <span className="font-medium text-slate-800">Next.js 15 (App Router)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg, href }: { title: string; value: string; icon: string; color: string; bg: string; href?: string }) {
  const content = (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 ${href ? 'hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <span className="material-icons-round">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      {href && (
        <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors">edit</span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function ActionRow({ title, desc, icon, href }: { title: string; desc: string; icon: string; href: string }) {
  return (
    <Link href={href} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors mt-0.5">
        <span className="material-icons-round text-[20px]">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
    </Link>
  );
}
