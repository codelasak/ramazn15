import { db } from "@/app/lib/db";
import { announcements } from "@/app/lib/schema";
import { desc } from "drizzle-orm";
import { addAnnouncement, deleteAnnouncement, updateAnnouncement } from "./actions";

const CATEGORY_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  genel: { label: "Genel", bg: "bg-blue-100", text: "text-blue-700" },
  pansiyon: { label: "Pansiyon", bg: "bg-emerald-100", text: "text-emerald-700" },
  evciler: { label: "Evciler", bg: "bg-cyan-100", text: "text-cyan-700" },
  sinav: { label: "Sınav", bg: "bg-purple-100", text: "text-purple-700" },
  etkinlik: { label: "Etkinlik", bg: "bg-amber-100", text: "text-amber-700" },
};

export default async function AdminDuyurularPage() {
  const allAnnouncements = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt))
    .limit(20);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Duyuru Yönetimi</h1>
          <p className="text-slate-500 mt-1">Okul duyurularını ekleyin, düzenleyin veya silin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary">add_alert</span>
              Yeni Duyuru Ekle
            </h2>
            <form action={addAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                <input required type="text" name="title" placeholder="Duyuru başlığı..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select required name="category" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="genel">Genel</option>
                  <option value="pansiyon">Pansiyon</option>
                  <option value="evciler">Evciler</option>
                  <option value="sinav">Sınav</option>
                  <option value="etkinlik">Etkinlik</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">İçerik</label>
                <textarea required name="content" rows={5} placeholder="Duyuru içeriğini yazın..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" name="isPinned" id="isPinned" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <label htmlFor="isPinned" className="text-sm font-medium text-slate-700">Sabitle (Pinned)</label>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2">
                <span className="material-icons-round text-sm">send</span>
                Duyuru Yayınla
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Tüm Duyurular</h2>
              <span className="text-sm text-slate-500">{allAnnouncements.length} duyuru</span>
            </div>
            {allAnnouncements.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <span className="material-icons-round text-4xl mb-2 opacity-50">campaign</span>
                <p>Henüz duyuru eklenmemiş.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {allAnnouncements.map((a) => {
                  const cat = CATEGORY_LABELS[a.category] || CATEGORY_LABELS.genel;
                  return (
                    <li key={a.id} className="p-4 hover:bg-slate-50">
                      <details className="[&[open]>summary_.edit-icon]:rotate-180">
                        <summary className="flex justify-between items-start cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${cat.bg} ${cat.text}`}>
                                {cat.label}
                              </span>
                              {a.isPinned && (
                                <span className="text-amber-500" title="Sabitlenmiş">
                                  <span className="material-icons-round text-sm">push_pin</span>
                                </span>
                              )}
                              <span className="text-xs text-slate-400">
                                {a.createdAt.toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 mb-1">{a.title}</h3>
                            <p className="text-sm text-slate-600 line-clamp-2">{a.content}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            <span className="edit-icon text-slate-400 hover:text-primary p-1 transition-transform" title="Düzenle">
                              <span className="material-icons-round text-sm">edit</span>
                            </span>
                            <form action={async () => {
                              "use server";
                              await deleteAnnouncement(a.id);
                            }}>
                              <button type="submit" className="text-red-400 hover:text-red-600 p-1" title="Sil">
                                <span className="material-icons-round text-sm">delete</span>
                              </button>
                            </form>
                          </div>
                        </summary>
                        {/* Edit Form */}
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <form action={updateAnnouncement} className="space-y-3">
                            <input type="hidden" name="id" value={a.id} />
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Başlık</label>
                              <input type="text" name="title" defaultValue={a.title} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Kategori</label>
                                <select name="category" defaultValue={a.category} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                                  <option value="genel">Genel</option>
                                  <option value="pansiyon">Pansiyon</option>
                                  <option value="evciler">Evciler</option>
                                  <option value="sinav">Sınav</option>
                                  <option value="etkinlik">Etkinlik</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2 pt-5">
                                <input type="checkbox" name="isPinned" id={`isPinned-${a.id}`} defaultChecked={a.isPinned} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                                <label htmlFor={`isPinned-${a.id}`} className="text-xs font-medium text-slate-600">Sabitle</label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">İçerik</label>
                              <textarea name="content" rows={4} defaultValue={a.content} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors flex justify-center items-center gap-1">
                              <span className="material-icons-round text-sm">save</span>
                              Güncelle
                            </button>
                          </form>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
