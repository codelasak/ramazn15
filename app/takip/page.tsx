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
      <div className="relative min-h-dvh bg-slate-50">
        <header className="px-6 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-icons-round text-primary">trending_up</span>
            Deneme Takibi
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sınav sonuçların ve net gelişim analizin</p>
        </header>
        <main className="px-6 pb-8">
          <TakipClient results={results} />
        </main>
      </div>
    </AppShell>
  );
}
