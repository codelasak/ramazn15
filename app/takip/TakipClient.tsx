"use client";

import { useState, useEffect } from "react";
import { apiJson, ApiError } from "../lib/api-client";

type ExamRow = {
  id: string;
  examName: string;
  examType: string;
  examDate: string | Date;
  totalNet: string | number;
  netScore?: string | number;
  turkishCorrect: number;
  turkishWrong: number;
  mathCorrect: number;
  mathWrong: number;
  socialCorrect: number;
  socialWrong: number;
  scienceCorrect: number;
  scienceWrong: number;
  createdAt: string | Date;
};

interface TakipClientProps {
  results: ExamRow[];
  onReload?: () => Promise<void> | void;
}

export default function TakipClient({ results, onReload }: TakipClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState("TYT");
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTotalNet = (r: any) => Number(r.totalNet ?? r.netScore ?? 0);
  const getExamType = (r: any) => r.examType ?? "Deneme";
  
  const formatExamDate = (value: any) => {
    if (!value) return "-";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    
    // Always fallback to UTC calculations to prevent any layout SSR hydration errors
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}.${month}.${year}`;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }

    try {
      await apiJson("/api/v1/mock-exams", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setIsModalOpen(false);
      if (onReload) await onReload();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Sinav eklenirken bir hata olustu.");
      } else {
        setErrorMessage("Sinav eklenirken bir hata olustu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await apiJson(`/api/v1/mock-exams/${id}`, { method: "DELETE" });
      if (onReload) await onReload();
    } catch {
      // sessizce gec; UI guncellemesi reload'la
    }
    setDeleteConfirmId(null);
  }

  // Force explicit JavaScript chronological sort to bypass any Database sorting quirks
  const sortedResults = [...results].sort((a, b) => {
    const timeA = new Date(a.examDate).getTime();
    const timeB = new Date(b.examDate).getTime();
    if (timeA === timeB) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return timeA - timeB;
  });

  // Find max net for the graph scaling
  const maxNet = sortedResults.length > 0 ? Math.max(...sortedResults.map((r) => getTotalNet(r)), 120) : 120; // Default 120 for TYT

  const getLimitText = (branch: string) => {
    if (selectedExamType === "LGS") {
      switch(branch) {
        case 't': return '(20)';
        case 'm': return '(20)';
        case 'f': return '(20)';
        case 'ink': return '(10)';
        case 'din': return '(10)';
        case 'ing': return '(10)';
      }
    } else if (selectedExamType.startsWith("AYT")) {
      return '(40)';
    } else if (selectedExamType === "TYT") {
      switch(branch) {
        case 't': return '(40)';
        case 'm': return '(40)';
        case 's': return '(20)';
        case 'f': return '(20)';
      }
    }
    return '';
  };

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
          <div className="flex h-80">
            {/* Y-axis */}
            <div className="flex flex-col justify-between items-end pr-3 pb-[4.5rem] pt-6 text-xs text-gray-400 border-r border-gray-100 min-w-10 shrink-0">
              <span>{Math.round(maxNet)}</span>
              <span>{Math.round(maxNet * 0.75)}</span>
              <span>{Math.round(maxNet * 0.5)}</span>
              <span>{Math.round(maxNet * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex gap-5 overflow-x-auto no-scrollbar pl-4 items-end pb-[4.5rem] relative pt-6 group/chart">
              {/* Background horizontal lines to match Y-axis */}
              <div className="absolute inset-0 pl-4 pb-[4.5rem] pt-6 flex flex-col justify-between pointer-events-none z-0">
                <div className="border-t border-gray-50 w-full"></div>
                <div className="border-t border-gray-50 w-full"></div>
                <div className="border-t border-gray-50 w-full"></div>
                <div className="border-t border-gray-50 w-full"></div>
                <div className="border-t border-gray-100 w-full"></div>
              </div>

              {sortedResults.map((r, i) => {
                const totalNet = getTotalNet(r);
                const heightPct = Math.max(2, (totalNet / maxNet) * 100);
                return (
                  <div key={r.id} className="relative flex flex-col items-center flex-shrink-0 group w-12 h-full justify-end z-10">
                    {/* Hover tooltip for score */}
                    <div className="absolute -top-7 text-xs font-bold text-indigo-600 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-indigo-100 px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none origin-bottom scale-95 group-hover:scale-100 duration-200">
                      {totalNet.toFixed(1)}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-10 bg-gradient-to-t from-primary/80 to-primary/30 rounded-t-lg transition-all duration-300 relative group-hover:from-indigo-500 group-hover:to-indigo-300 shadow-[0_2px_10px_-3px_rgba(99,102,241,0.1)] group-hover:shadow-[0_2px_15px_-3px_rgba(99,102,241,0.3)]"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    {/* Labels below chart */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-32 flex flex-col items-center text-center">
                      <div className="text-[10.5px] font-medium text-gray-500 -rotate-45 origin-center whitespace-nowrap mb-4 h-8 flex items-center group-hover:text-primary transition-colors flex-shrink-0">
                        {r.examName.length > 20 ? r.examName.substring(0, 18) + "..." : r.examName}
                      </div>
                      <div className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 mt-auto">
                        {formatExamDate(r.examDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 pb-8">
        {sortedResults.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-800 dark:text-gray-900">
            <span className="material-icons-round text-gray-300 text-4xl mb-3 block">edit_note</span>
            <p className="text-gray-500 dark:text-gray-700 text-sm">Henüz bir deneme sonucu girmediniz.</p>
          </div>
        ) : (
          sortedResults.slice().reverse().map((r) => (
            <div 
              key={r.id} 
              onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col text-gray-800 dark:text-gray-900 cursor-pointer transition-all hover:border-indigo-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-900">{r.examName}</p>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="bg-gray-100 text-gray-500 dark:text-gray-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                      {getExamType(r)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-600">{formatExamDate(r.examDate)}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end justify-between h-full gap-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-700 mb-0.5 leading-none mt-1">Toplam Net</p>
                    <p className="text-xl font-bold text-primary leading-none">{getTotalNet(r).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(r.id); setExpandedId(null); }}
                    className="text-gray-300 hover:text-red-500 bg-gray-50/50 hover:bg-red-50 w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                    title="Sil"
                  >
                    <span className="material-icons-round text-sm">delete_outline</span>
                  </button>
                </div>
              </div>

              {/* Delete Confirmation Banner */}
              {deleteConfirmId === r.id && (
                <div className="mt-4 p-3 bg-red-50/80 border border-red-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <span className="text-[13px] font-semibold text-red-600 flex items-center gap-1.5">
                    <span className="material-icons-round text-[16px]">warning_amber</span>
                    Kaydı silmek istediğinize emin misiniz?
                  </span>
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                      className="px-3 py-1.5 bg-white text-gray-500 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      onClick={(e) => handleDelete(r.id, e)}
                      className="px-3 py-1.5 bg-red-500 text-white border border-red-600 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
                    >
                      Evet, Sil
                    </button>
                  </div>
                </div>
              )}
              
              {/* Expandable Body */}
              {expandedId === r.id && deleteConfirmId !== r.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-3 text-xs md:grid md:grid-cols-2">
                    {(r.turkishCorrect > 0 || r.turkishWrong > 0) && (
                      <div className={`flex flex-col bg-gray-50 px-3 py-2 rounded-lg gap-1 border border-gray-100 ${r.examType === "AYT-EA" ? 'order-2' : 'order-1'}`}>
                        <span className="font-semibold text-gray-500">Türkçe {r.examType === "LGS" ? "(20)" : "(40)"}</span>
                        <div className="flex gap-2 font-bold text-[13px]">
                          <span className="text-emerald-600">{r.turkishCorrect} D</span>
                          <span className="text-red-500">{r.turkishWrong} Y</span>
                        </div>
                      </div>
                    )}
                    {(r.mathCorrect > 0 || r.mathWrong > 0) && (
                      <div className={`flex flex-col bg-gray-50 px-3 py-2 rounded-lg gap-1 border border-gray-100 ${r.examType === "AYT-EA" ? 'order-1' : 'order-2'}`}>
                        <span className="font-semibold text-gray-500">Matematik {r.examType === "LGS" ? "(20)" : "(40)"}</span>
                        <div className="flex gap-2 font-bold text-[13px]">
                          <span className="text-emerald-600">{r.mathCorrect} D</span>
                          <span className="text-red-500">{r.mathWrong} Y</span>
                        </div>
                      </div>
                    )}
                    {(r.socialCorrect > 0 || r.socialWrong > 0) && (
                      <div className="flex flex-col bg-gray-50 px-3 py-2 rounded-lg gap-1 border border-gray-100 order-3">
                        <span className="font-semibold text-gray-500">{r.examType === "LGS" ? "İnk/Din/İng" : "Sosyal"} {r.examType === "TYT" ? "(20)" : (r.examType === "LGS" ? "(30)" : "(40)")}</span>
                        <div className="flex gap-2 font-bold text-[13px]">
                          <span className="text-emerald-600">{r.socialCorrect} D</span>
                          <span className="text-red-500">{r.socialWrong} Y</span>
                        </div>
                      </div>
                    )}
                    {(r.scienceCorrect > 0 || r.scienceWrong > 0) && (
                      <div className="flex flex-col bg-gray-50 px-3 py-2 rounded-lg gap-1 border border-gray-100 order-4">
                        <span className="font-semibold text-gray-500">Fen {r.examType === "TYT" || r.examType === "LGS" ? "(20)" : "(40)"}</span>
                        <div className="flex gap-2 font-bold text-[13px]">
                          <span className="text-emerald-600">{r.scienceCorrect} D</span>
                          <span className="text-red-500">{r.scienceWrong} Y</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-0 bg-slate-900/40 backdrop-blur-sm px-2">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200 text-gray-800 dark:text-gray-900 mx-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-900">Deneme Sonucu Ekle</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <span className="material-icons-round text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 md:p-6">
              <div className="space-y-4 max-h-[65vh] overflow-y-auto px-1 no-scrollbar">
                
                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-600 text-[13px] font-medium rounded-xl border border-red-100 flex items-start gap-2">
                    <span className="material-icons-round text-base">error_outline</span>
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Sınav Tipi</label>
                    <select 
                      name="examType" 
                      required 
                      value={selectedExamType}
                      onChange={(e) => setSelectedExamType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-gray-800 dark:text-gray-900"
                    >
                      <option value="TYT">TYT</option>
                      <option value="AYT-SAY">AYT (SAY)</option>
                      <option value="AYT-EA">AYT (EA)</option>
                      <option value="AYT-SÖZ">AYT (SÖZ)</option>
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

                <div className="pt-2 flex flex-col">
                  <p className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wide border-b border-indigo-100 pb-1">Ders Bazlı Netler</p>
                  
                  {selectedExamType !== "AYT-SAY" && (
                    <div className={`grid grid-cols-12 gap-2 mb-3 items-center ${selectedExamType === "AYT-EA" ? 'order-2' : 'order-1'}`}>
                      <span className="col-span-4 text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-700 break-words leading-tight">
                        Türkçe {getLimitText('t')}
                      </span>
                      <input type="number" name="turkishCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                      <input type="number" name="turkishWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                    </div>
                  )}
                  
                  {selectedExamType !== "AYT-SÖZ" && (
                    <div className={`grid grid-cols-12 gap-2 mb-3 items-center ${selectedExamType === "AYT-EA" ? 'order-1' : 'order-2'}`}>
                      <span className="col-span-4 text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-700 break-words leading-tight">
                        Matematik {getLimitText('m')}
                      </span>
                      <input type="number" name="mathCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                      <input type="number" name="mathWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                    </div>
                  )}

                  {(selectedExamType === "TYT" || selectedExamType === "AYT-SÖZ" || selectedExamType === "Diger") && (
                    <div className="grid grid-cols-12 gap-2 mb-3 items-center order-3">
                      <span className="col-span-4 text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-700 break-words leading-tight">
                        Sosyal {getLimitText('s')}
                      </span>
                      <input type="number" name="socialCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                      <input type="number" name="socialWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                    </div>
                  )}

                  {(selectedExamType === "TYT" || selectedExamType === "AYT-SAY" || selectedExamType === "LGS" || selectedExamType === "Diger") && (
                    <div className="grid grid-cols-12 gap-2 mb-3 items-center order-4">
                      <span className="col-span-4 text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-700 break-words leading-tight">
                        Fen {getLimitText('f')}
                      </span>
                      <input type="number" name="scienceCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                      <input type="number" name="scienceWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                    </div>
                  )}

                  {selectedExamType === "LGS" && (
                    <div className="order-5 flex flex-col">
                      <div className="grid grid-cols-12 gap-2 mb-3 items-center">
                        <span className="col-span-4 text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-700 break-words leading-tight">
                          İnkılap {getLimitText('ink')}
                        </span>
                        <input type="number" name="inkilapCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                        <input type="number" name="inkilapWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                      </div>
                      <div className="grid grid-cols-12 gap-2 mb-3 items-center">
                        <span className="col-span-4 text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-700 break-words leading-tight">
                          Din Kült. {getLimitText('din')}
                        </span>
                        <input type="number" name="dinCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                        <input type="number" name="dinWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                      </div>
                      <div className="grid grid-cols-12 gap-2 mb-3 items-center">
                        <span className="col-span-4 text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-700 break-words leading-tight">
                          İngilizce {getLimitText('ing')}
                        </span>
                        <input type="number" name="ingilizceCorrect" placeholder="D" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-800 dark:text-gray-900" />
                        <input type="number" name="ingilizceWrong" placeholder="Y" min="0" className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-800 dark:text-gray-900" />
                      </div>
                    </div>
                  )}

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
