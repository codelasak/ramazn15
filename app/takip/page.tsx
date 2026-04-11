import AppShell from "../shell/AppShell";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";
import { db } from "../lib/db";
import { mockExamResults } from "../lib/schema";
import { desc, eq } from "drizzle-orm";
import TakipClient from "./TakipClient";

export default async function TakipPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris");
  }

  // DB migration henüz uygulanmamışsa sayfayı patlatmak yerine boş listeyle devam et.
  let results: typeof mockExamResults.$inferSelect[] = [];
  try {
    results = await db
      .select()
      .from(mockExamResults)
      .where(eq(mockExamResults.userId, session.user.id))
      .orderBy(desc(mockExamResults.examDate));
  } catch (error) {
    console.error("Failed to load mock exam results", error);
  }

  return (
    <AppShell>
      <div className="relative min-h-dvh bg-slate-50 dark:bg-transparent text-gray-800 dark:text-gray-900">
        <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-indigo-50 to-blue-50/50 dark:from-black/40 dark:to-black/10 dark:border-b dark:border-white/5 pb-8 pt-12 shadow-sm px-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              <span className="material-icons-round text-indigo-500 text-3xl">trending_up</span>
              Deneme Takibi
            </h1>
            <p className="text-sm text-gray-500 dark:text-indigo-100/80 mt-2 font-medium">Sınav sonuçların ve net gelişim analizin</p>
          </div>
        </header>
        <main className="px-6 py-6 pb-24 space-y-6">
          <TakipClient results={results} />
        </main>
      </div>
    </AppShell>
  );
}
