"use client";

import { useState } from "react";
import { addMockExamResult } from "./actions";

export default function TakipClient({ results }: { results: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTotalNet = (r: any) => Number(r.totalNet ?? r.netScore ?? 0);
  const getExamType = (r: any) => r.examType ?? "Deneme";
  const formatExamDate = (value: any) => {
    if (!value) return "-";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("tr-TR");
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await addMockExamResult(formData);
    setIsSubmitting(false);
    setIsModalOpen(false);
  }

  // Find max net for the graph scaling
  const maxNet = results.length > 0 ? Math.max(...results.map((r) => getTotalNet(r)), 120) : 120; // Default 120 for TYT

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-gray-800 dark:text-gray-900">
        <div>
          <h2 className="text-gray-500 dark:text-gray-700 text-sm font-medium">Toplam Kayıtlı Deneme</h2>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-900">{results.length}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-2"
        >
          <span className="material-icons-round text-sm">add</span>
          Sonuç Ekle
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 text-gray-800 dark:text-gray-900">
          <h3 className="font-bold text-gray-800 dark:text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-icons-round text-indigo-500">bar_chart</span>
            Net Gelişimi
          </h3>
          <div className="flex items-end gap-3 h-48 pt-4 overflow-x-auto no-scrollbar pb-2">
            {results.slice().reverse().map((r, i) => {
              const totalNet = getTotalNet(r);
              const heightPct = Math.max(10, (totalNet / maxNet) * 100);
              return (
                <div key={r.id} className="flex flex-col items-center flex-shrink-0 group">
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {totalNet.toFixed(2)}
                  </div>
                  <div 
                    className="w-12 bg-gradient-to-t from-primary to-primary/40 rounded-t-md transition-all relative group-hover:from-indigo-500 group-hover:to-indigo-300"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 rotate-45 origin-left whitespace-nowrap overflow-visible">
                    {r.examName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3 pb-8">
        {results.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-800 dark:text-gray-900">
            <span className="material-icons-round text-gray-300 text-4xl mb-3 block">edit_note</span>
            <p className="text-gray-500 dark:text-gray-700 text-sm">Henüz bir deneme sonucu girmediniz.</p>
          </div>
        ) : (
          results.map((r) => {
            const calcNet = (c: number, w: number) => c - (w / 4);
            const turkishNet = calcNet(r.turkishCorrect, r.turkishWrong);
            const mathNet = calcNet(r.mathCorrect, r.mathWrong);
            const socialNet = calcNet(r.socialCorrect, r.socialWrong);
            const scienceNet = calcNet(r.scienceCorrect, r.scienceWrong);

            const subjects = [
              { label: "Türkçe", correct: r.turkishCorrect, wrong: r.turkishWrong, net: turkishNet, color: "text-blue-600", bg: "bg-blue-50", barColor: "bg-blue-500" },
              { label: "Matematik", correct: r.mathCorrect, wrong: r.mathWrong, net: mathNet, color: "text-emerald-600", bg: "bg-emerald-50", barColor: "bg-emerald-500" },
              { label: "Sosyal", correct: r.socialCorrect, wrong: r.socialWrong, net: socialNet, color: "text-amber-600", bg: "bg-amber-50", barColor: "bg-amber-500" },
              { label: "Fen", correct: r.scienceCorrect, wrong: r.scienceWrong, net: scienceNet, color: "text-purple-600", bg: "bg-purple-50", barColor: "bg-purple-500" },
            ];

            return (
              <details key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-900">{r.examName}</p>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="bg-gray-100 text-gray-500 dark:text-gray-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                        {getExamType(r)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-600">{formatExamDate(r.examDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-700 mb-0.5">Toplam Net</p>
                      <p className="text-xl font-bold text-primary">{getTotalNet(r).toFixed(2)}</p>
                    </div>
                    <span className="material-icons-round text-gray-400 text-lg transition-transform group-open:rotate-180">expand_more</span>
                  </div>
                </summary>
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    {subjects.map((s) => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold ${s.color} uppercase tracking-wide`}>{s.label}</span>
                          <span className={`text-lg font-bold ${s.color}`}>{s.net.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                            {s.correct}D
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
                            {s.wrong}Y
                          </span>
                        </div>
                        {/* Net bar */}
                        <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div className={`h-full ${s.barColor} rounded-full transition-all`} style={{ width: `${Math.max(0, Math.min(100, (s.net / 40) * 100))}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200 text-gray-800 dark:text-gray-900">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-900">Deneme Sonucu Ekle</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <span className="material-icons-round text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 no-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Sınav Tipi</label>
                    <select name="examType" required className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-gray-800 dark:text-gray-900">
                      <option value="TYT">TYT</option>
                      <option value="AYT">AYT</option>
                      <option value="LGS">LGS</option>
                      <option value="Diger">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tarih</label>
                    <input type="date" name="examDate" required className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-gray-800 dark:text-gray-900" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sınav Adı / Kurum</label>
                  <input type="text" name="examName" placeholder="Örn: 3D Türkiye Geneli TYT" required className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-gray-800 dark:text-gray-900" />
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wide border-b border-indigo-100 pb-1">Ders Bazlı Netler</p>
                  
                  <div className="grid grid-cols-12 gap-2 mb-3 items-center">
                    <span className="col-span-4 text-xs font-semibold text-gray-500 dark:text-gray-700">Türkçe</span>
                    <input type="number" name="turkishCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                    <input type="number" name="turkishWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2 mb-3 items-center">
                    <span className="col-span-4 text-xs font-semibold text-gray-500 dark:text-gray-700">Matematik</span>
                    <input type="number" name="mathCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                    <input type="number" name="mathWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                  </div>

                  <div className="grid grid-cols-12 gap-2 mb-3 items-center">
                    <span className="col-span-4 text-xs font-semibold text-gray-500 dark:text-gray-700">Sosyal</span>
                    <input type="number" name="socialCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                    <input type="number" name="socialWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                  </div>

                  <div className="grid grid-cols-12 gap-2 mb-3 items-center">
                    <span className="col-span-4 text-xs font-semibold text-gray-500 dark:text-gray-700">Fen</span>
                    <input type="number" name="scienceCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                    <input type="number" name="scienceWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                  </div>

                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
