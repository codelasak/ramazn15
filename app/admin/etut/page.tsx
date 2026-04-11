import { db } from "@/app/lib/db";
import { studySessions } from "@/app/lib/schema";
import { asc, desc } from "drizzle-orm";
import { addStudySession, deleteStudySession } from "./actions";

export default async function AdminEtutPage() {
  const sessions = await db
    .select()
    .from(studySessions)
    .orderBy(asc(studySessions.dayOfWeek), asc(studySessions.startTime));

  const DAYS = [
    { id: 1, name: "Pazartesi" },
    { id: 2, name: "Salı" },
    { id: 3, name: "Çarşamba" },
    { id: 4, name: "Perşembe" },
    { id: 5, name: "Cuma" },
    { id: 6, name: "Cumartesi" },
    { id: 7, name: "Pazar" },
  ];

  return (
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
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
