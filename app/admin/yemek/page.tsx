import { db } from "../../lib/db";
import { mealMenus } from "../../lib/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export default async function AdminYemekPage() {
  const menus = await db.select().from(mealMenus).orderBy(desc(mealMenus.date)).limit(10);

  async function createMenu(formData: FormData) {
    "use server";
    const date = formData.get("date") as string;
    const mealType = formData.get("mealType") as "kahvalti" | "ogle" | "aksam";
    const items = formData.get("items") as string;

    await db.insert(mealMenus).values({
      date,
      mealType,
      items,
    });

    revalidatePath("/admin/yemek");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Yemek Menüsü Yönetimi</h1>
          <p className="text-slate-500 mt-1">Okul ve pansiyon yemek menülerini ekleyin veya güncelleyin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Yeni Menü Ekle</h2>
            <form action={createMenu} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
                <input required type="date" name="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Öğün</label>
                <select required name="mealType" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="ogle">Öğle Yemeği</option>
                  <option value="kahvalti">Kahvaltı (Pansiyon)</option>
                  <option value="aksam">Akşam Yemeği (Pansiyon)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yemekler</label>
                <textarea required name="items" rows={4} placeholder="Her satıra bir yemek (örn: Domates Çorbası\nEt Sote...)" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
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
              <h2 className="font-bold text-slate-800">Son Eklenen Menüler</h2>
            </div>
            {menus.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <span className="material-icons-round text-4xl mb-2 opacity-50">restaurant_menu</span>
                <p>Henüz yemek menüsü eklenmemiş.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {menus.map((m) => (
                  <li key={m.id} className="p-4 hover:bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          m.mealType === 'ogle' ? 'bg-orange-100 text-orange-700' : 
                          m.mealType === 'kahvalti' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {m.mealType === 'ogle' ? 'Öğle' : m.mealType === 'kahvalti' ? 'Kahvaltı' : 'Akşam'}
                        </span>
                        <span className="text-sm font-medium text-slate-500">{m.date}</span>
                      </div>
                      <button className="text-red-500 hover:text-red-700 p-1"><span className="material-icons-round text-sm">delete</span></button>
                    </div>
                    <div className="text-sm text-slate-800 whitespace-pre-line">
                      {m.items}
                    </div>
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
