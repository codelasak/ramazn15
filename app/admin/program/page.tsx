import { db } from "@/app/lib/db";
import { classSchedules } from "@/app/lib/schema";
import { asc } from "drizzle-orm";
import { addSchedule, deleteSchedule, updateSchedule } from "./actions";

const DAYS = [
  { id: 1, name: "Pazartesi" },
  { id: 2, name: "Salı" },
  { id: 3, name: "Çarşamba" },
  { id: 4, name: "Perşembe" },
  { id: 5, name: "Cuma" },
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const CLASSES = ["9-A", "9-B", "9-C", "10-A", "10-B", "10-C", "11-A", "11-B", "11-C", "12-A", "12-B", "12-C", "Hazırlık-A", "Hazırlık-B"];

export default async function AdminProgramPage() {
  const schedules = await db
    .select()
    .from(classSchedules)
    .orderBy(asc(classSchedules.className), asc(classSchedules.dayOfWeek), asc(classSchedules.period));

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ders Programı Yönetimi</h1>
          <p className="text-slate-500 mt-1">Sınıf bazlı haftalık ders programlarını ekleyin veya düzenleyin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary">add</span>
              Yeni Ders Ekle
            </h2>
            <form action={addSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sınıf</label>
                <select name="className" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {CLASSES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gün</label>
                  <select name="dayOfWeek" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {DAYS.map(day => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ders Saati</label>
                  <select name="period" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {PERIODS.map(p => (
                      <option key={p} value={p}>{p}. Ders</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ders Adı</label>
                <input type="text" name="subject" required placeholder="Örn: Matematik" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Öğretmen</label>
                  <input type="text" name="teacherName" placeholder="Opsiyonel" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Derslik</label>
                  <input type="text" name="room" placeholder="Opsiyonel" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2">
                <span className="material-icons-round text-sm">save</span>
                Kaydet
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Kayıtlı Dersler</h2>
              <span className="text-sm text-slate-500">{schedules.length} ders</span>
            </div>
            {schedules.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <span className="material-icons-round text-4xl mb-2 opacity-50">calendar_today</span>
                <p>Henüz ders programı eklenmemiş.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {schedules.map((s) => (
                  <li key={s.id} className="p-4 hover:bg-slate-50">
                    <details className="[&[open]>summary_.edit-icon]:rotate-180">
                      <summary className="flex justify-between items-start cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                              {s.className}
                            </span>
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                              {DAYS.find(d => d.id === s.dayOfWeek)?.name}
                            </span>
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                              {s.period}. Ders
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800">{s.subject}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                            {s.teacherName && (
                              <span className="flex items-center gap-1">
                                <span className="material-icons-round text-[12px]">person</span>
                                {s.teacherName}
                              </span>
                            )}
                            {s.room && (
                              <span className="flex items-center gap-1">
                                <span className="material-icons-round text-[12px]">room</span>
                                {s.room}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <span className="edit-icon text-slate-400 hover:text-primary p-1 transition-transform" title="Düzenle">
                            <span className="material-icons-round text-sm">edit</span>
                          </span>
                          <form action={async () => {
                            "use server";
                            await deleteSchedule(s.id);
                          }}>
                            <button type="submit" className="text-red-400 hover:text-red-600 p-1" title="Sil">
                              <span className="material-icons-round text-sm">delete</span>
                            </button>
                          </form>
                        </div>
                      </summary>
                      {/* Edit Form */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <form action={updateSchedule} className="space-y-3">
                          <input type="hidden" name="id" value={s.id} />
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Sınıf</label>
                              <select name="className" defaultValue={s.className} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                                {CLASSES.map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Gün</label>
                              <select name="dayOfWeek" defaultValue={s.dayOfWeek} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                                {DAYS.map(day => (
                                  <option key={day.id} value={day.id}>{day.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Ders Saati</label>
                              <select name="period" defaultValue={s.period} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                                {PERIODS.map(p => (
                                  <option key={p} value={p}>{p}. Ders</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Ders Adı</label>
                            <input type="text" name="subject" defaultValue={s.subject} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Öğretmen</label>
                              <input type="text" name="teacherName" defaultValue={s.teacherName || ""} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Derslik</label>
                              <input type="text" name="room" defaultValue={s.room || ""} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
