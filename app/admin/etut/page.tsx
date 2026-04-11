import { db } from "@/app/lib/db";
import { studySessions } from "@/app/lib/schema";
import { asc } from "drizzle-orm";
import { addStudySession, deleteStudySession, updateStudySession } from "./actions";

const DAYS = [
  { id: 1, name: "Pazartesi" },
  { id: 2, name: "Salı" },
  { id: 3, name: "Çarşamba" },
  { id: 4, name: "Perşembe" },
  { id: 5, name: "Cuma" },
  { id: 6, name: "Cumartesi" },
  { id: 7, name: "Pazar" },
];

export default async function AdminEtutPage() {
  const sessions = await db
    .select()
    .from(studySessions)
    .orderBy(asc(studySessions.dayOfWeek), asc(studySessions.startTime));

  return (
<<<<<<< HEAD
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-900 mb-6">Pansiyon Etüt Yönetimi</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 text-gray-800 dark:text-gray-900">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-900 mb-4">Yeni Etüt Ekle</h2>
        <form action={addStudySession} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-700 mb-1">Gün</label>
            <select name="dayOfWeek" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-900" required>
              {DAYS.map(day => (
                <option key={day.id} value={day.id}>{day.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-700 mb-1">Başlangıç Saati</label>
            <input type="time" name="startTime" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-900" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-700 mb-1">Bitiş Saati</label>
            <input type="time" name="endTime" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-900" required />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-700 mb-1">Konu (Opsiyonel)</label>
            <input type="text" name="subject" placeholder="Örn: Bireysel Çalışma" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-900" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-700 mb-1">Konum (Opsiyonel)</label>
            <input type="text" name="location" placeholder="Örn: Etüt 1" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-900" />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl">
              Ekle
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-gray-800 dark:text-gray-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 dark:text-gray-700 text-sm">
              <th className="p-4 font-semibold">Gün</th>
              <th className="p-4 font-semibold">Saat</th>
              <th className="p-4 font-semibold">Konu / Konum</th>
              <th className="p-4 font-semibold text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 text-gray-800 dark:text-gray-900">
                <td className="p-4 font-medium text-gray-800 dark:text-gray-900">
                  {DAYS.find(d => d.id === s.dayOfWeek)?.name}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-700">
                  {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-700">
                  {s.subject ?? "-"} <br/>
                  <span className="text-xs text-gray-400 dark:text-gray-600">{s.location ?? "-"}</span>
                </td>
                <td className="p-4 text-center">
                  <form action={deleteStudySession.bind(null, s.id)}>
                    <button type="submit" className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto hover:bg-red-100">
                      <span className="material-icons-round text-sm">delete</span>
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-700">
                  Henüz bir etüt programı eklenmedi.
                </td>
              </tr>
=======
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pansiyon Etüt Yönetimi</h1>
          <p className="text-slate-500 mt-1">Etüt programını düzenleyin, silin veya yeni etüt ekleyin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary">add</span>
              Yeni Etüt Ekle
            </h2>
            <form action={addStudySession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gün</label>
                <select name="dayOfWeek" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" required>
                  {DAYS.map(day => (
                    <option key={day.id} value={day.id}>{day.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç</label>
                  <input type="time" name="startTime" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş</label>
                  <input type="time" name="endTime" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Konu (Opsiyonel)</label>
                <input type="text" name="subject" placeholder="Örn: Bireysel Çalışma" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Konum (Opsiyonel)</label>
                <input type="text" name="location" placeholder="Örn: Etüt 1" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2">
                <span className="material-icons-round text-sm">save</span>
                Ekle
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Etüt Programı</h2>
              <span className="text-sm text-slate-500">{sessions.length} etüt</span>
            </div>
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <span className="material-icons-round text-4xl mb-2 opacity-50">menu_book</span>
                <p>Henüz bir etüt programı eklenmedi.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {sessions.map((s) => (
                  <li key={s.id} className="p-4 hover:bg-slate-50">
                    <details className="[&[open]>summary_.edit-icon]:rotate-180">
                      <summary className="flex justify-between items-start cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                              {DAYS.find(d => d.id === s.dayOfWeek)?.name}
                            </span>
                            <span className="text-sm text-slate-500">
                              {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800">{s.subject ?? "Bireysel Çalışma"}</p>
                          {s.location && <p className="text-xs text-slate-400">{s.location}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <span className="edit-icon text-slate-400 hover:text-primary p-1 transition-transform" title="Düzenle">
                            <span className="material-icons-round text-sm">edit</span>
                          </span>
                          <form action={deleteStudySession.bind(null, s.id)}>
                            <button type="submit" className="text-red-400 hover:text-red-600 p-1" title="Sil">
                              <span className="material-icons-round text-sm">delete</span>
                            </button>
                          </form>
                        </div>
                      </summary>
                      {/* Edit Form */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <form action={updateStudySession} className="space-y-3">
                          <input type="hidden" name="id" value={s.id} />
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Gün</label>
                              <select name="dayOfWeek" defaultValue={s.dayOfWeek} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                                {DAYS.map(day => (
                                  <option key={day.id} value={day.id}>{day.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Başlangıç</label>
                              <input type="time" name="startTime" defaultValue={s.startTime.slice(0, 5)} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Bitiş</label>
                              <input type="time" name="endTime" defaultValue={s.endTime.slice(0, 5)} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Konu</label>
                              <input type="text" name="subject" defaultValue={s.subject || ""} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Konum</label>
                              <input type="text" name="location" defaultValue={s.location || ""} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                          </div>
                          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors flex justify-center items-center gap-1">
                            <span className="material-icons-round text-sm">save</span>
                            Güncelle
                          </button>
                        </form>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
>>>>>>> 68ee85c2f27c7eb27fd60080d7691aac015e2c5c
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
