import { db } from "@/app/lib/db";
import { exams } from "@/app/lib/schema";
import { desc } from "drizzle-orm";
import { addExam, deleteExam } from "./actions";

export default async function AdminSinavlarPage() {
  const upcomingExams = await db
    .select()
    .from(exams)
    .orderBy(desc(exams.examDate));

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sınav Takvimi & Geri Sayımlar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Öğrencilerin dashboard'unda görünecek yaklaşan sınavları buradan ayarlayabilirsiniz.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Alanı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-icons-round text-primary">add_task</span>
            Yeni Sınav Ekle
          </h2>
          <form action={addExam} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Başlık</label>
              <input type="text" name="title" required placeholder="Örn: 1. Dönem 1. Matematik Yazılısı" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sınav Tipi</label>
                <select name="examType" required className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="yazili">Yazılı</option>
                  <option value="deneme">Deneme Sınavı</option>
                  <option value="yks">YKS</option>
                  <option value="lgs">LGS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tarih</label>
                <input type="date" name="examDate" required className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ders (Opsiyonel)</label>
                <input type="text" name="subject" placeholder="Örn: Matematik" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hedef Sınıf</label>
                <select name="className" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="">Tüm Sınıflar (Genel)</option>
                  <option value="9">9 Sınıflar</option>
                  <option value="10">10 Sınıflar</option>
                  <option value="11">11 Sınıflar</option>
                  <option value="12">12 Sınıflar</option>
                  <option value="Hazırlık">Hazırlık</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors cursor-pointer">
                Sınavı Kaydet
              </button>
            </div>
          </form>
        </div>

        {/* Liste Alanı */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-icons-round text-primary">event_note</span>
            Aktif Sınavlar
          </h2>

          {upcomingExams.length === 0 ? (
             <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-400">
               Sistemde kayıtlı bir sınav bulunmuyor.
             </div>
          ) : (
            upcomingExams.map((exam) => (
              <div key={exam.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{exam.title}</h3>
                  <div className="flex gap-2 items-center mt-1 text-xs text-gray-500">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium uppercase tracking-wider">
                      {exam.examType}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-icons-round text-[14px]">calendar_today</span>
                      {exam.examDate.toLocaleDateString('tr-TR')}
                    </span>
                    {exam.className && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-icons-round text-[14px]">school</span>
                          {exam.className}. Sınıf
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <form action={async () => {
                  "use server";
                  await deleteExam(exam.id);
                }}>
                  <button type="submit" className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Sil">
                    <span className="material-icons-round text-sm block">delete</span>
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
