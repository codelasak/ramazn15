import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { asc } from "drizzle-orm";
import { toggleAdminRole, updateStudent, deleteStudent } from "./actions";

const DEPARTMENT_LABELS: Record<string, string> = {
  teknoloji_fen: "Teknoloji & Fen",
  fen_sosyal: "Fen & Sosyal",
  hazirlik: "Hazırlık",
};

export default async function AdminOgrencilerPage() {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      className: users.className,
      department: users.department,
      isBoarder: users.isBoarder,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.name));

  const studentCount = allUsers.filter(u => u.role === "student").length;
  const adminCount = allUsers.filter(u => u.role === "admin").length;
  const boarderCount = allUsers.filter(u => u.isBoarder).length;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Öğrenci Yönetimi</h1>
        <p className="text-slate-500 mt-1">Tüm kullanıcıları görüntüleyin, rollerini düzenleyin ve bilgilerini güncelleyin.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Toplam Kullanıcı</p>
          <p className="text-2xl font-bold text-slate-800">{allUsers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Öğrenci</p>
          <p className="text-2xl font-bold text-blue-600">{studentCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Admin</p>
          <p className="text-2xl font-bold text-purple-600">{adminCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Yurtlu</p>
          <p className="text-2xl font-bold text-emerald-600">{boarderCount}</p>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Tüm Kullanıcılar</h2>
          <span className="text-sm text-slate-500">{allUsers.length} kişi</span>
        </div>

        {allUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <span className="material-icons-round text-4xl mb-2 opacity-50">groups</span>
            <p>Henüz kayıtlı kullanıcı yok.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {allUsers.map((user) => (
              <li key={user.id} className="p-4 hover:bg-slate-50">
                <details className="[&[open]>summary_.edit-icon]:rotate-180">
                  <summary className="flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                        user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-primary to-primary-dark'
                      }`}>
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                          {user.role === "admin" && (
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">Admin</span>
                          )}
                          {user.isBoarder && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Yurtlu</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="truncate">{user.email}</span>
                          {user.className && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-primary">{user.className}</span>
                            </>
                          )}
                          {user.department && (
                            <>
                              <span>•</span>
                              <span>{DEPARTMENT_LABELS[user.department] || user.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      {/* Toggle Admin */}
                      <form action={async () => {
                        "use server";
                        await toggleAdminRole(user.id, user.role);
                      }}>
                        <button
                          type="submit"
                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                            user.role === 'admin'
                              ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                              : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title={user.role === 'admin' ? 'Admin rolünü kaldır' : 'Admin yap'}
                        >
                          <span className="material-icons-round text-sm">admin_panel_settings</span>
                        </button>
                      </form>
                      <span className="edit-icon text-slate-400 hover:text-primary p-1 transition-transform" title="Düzenle">
                        <span className="material-icons-round text-sm">edit</span>
                      </span>
                      <form action={async () => {
                        "use server";
                        await deleteStudent(user.id);
                      }}>
                        <button type="submit" className="text-red-400 hover:text-red-600 p-1" title="Sil">
                          <span className="material-icons-round text-sm">delete</span>
                        </button>
                      </form>
                    </div>
                  </summary>
                  {/* Edit Form */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <form action={updateStudent} className="space-y-3">
                      <input type="hidden" name="id" value={user.id} />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">İsim</label>
                          <input type="text" name="name" defaultValue={user.name} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">E-posta</label>
                          <input type="email" value={user.email} disabled className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Sınıf</label>
                          <input type="text" name="className" defaultValue={user.className ?? ""} placeholder="Örn: 10-A" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Bölüm</label>
                          <select name="department" defaultValue={user.department ?? ""} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                            <option value="">Seçilmedi</option>
                            <option value="teknoloji_fen">Teknoloji & Fen</option>
                            <option value="fen_sosyal">Fen & Sosyal</option>
                            <option value="hazirlik">Hazırlık</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                          <input type="checkbox" name="isBoarder" id={`boarder-${user.id}`} defaultChecked={user.isBoarder} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                          <label htmlFor={`boarder-${user.id}`} className="text-xs font-medium text-slate-600">Yurtlu</label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          Kayıt: {user.createdAt.toLocaleDateString('tr-TR')}
                        </span>
                        <button type="submit" className="bg-primary hover:bg-primary-dark text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1">
                          <span className="material-icons-round text-sm">save</span>
                          Güncelle
                        </button>
                      </div>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
