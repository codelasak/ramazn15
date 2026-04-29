import AppShell from "../shell/AppShell";
import Image from "next/image";
import type { ContributorData } from "../api/contributors/route";

type Developer = {
  name: string;
  image: string;
  github?: string;
};

const DEVELOPERS: Developer[] = [
  {
    name: "Ahmet Faruk Bahat",
    image: "/developers/ahmet-faruk.jpg",
    github: "ahmetfaruk686",
  },
  {
    name: "Ahmet Talha Kuşak",
    image: "/developers/ahmet-talha.jpg",
  },
  {
    name: "Ali İsmail Eftekin",
    image: "/developers/ali-ismail.jpg",
    github: "alismo001",
  },
  {
    name: "Mehmed Ali Cevahir",
    image: "/developers/ali-cevahir.jpg",
    github: "MEHMEDALICEV61",
  },
  {
    name: "Musa Bouzantsi",
    image: "/developers/musa.jpg",
    github: "MosesTR",
  },
  {
    name: "Selim Ulutaş",
    image: "/developers/selim.jpg",
    github: "Jselim1",
  },
];

async function getContributors(): Promise<ContributorData[]> {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ramazan15-app",
    };

    const res = await fetch(
      "https://api.github.com/repos/codelasak/ramazn15/contributors?per_page=50",
      { headers, next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];
    const contributors = await res.json();

    const statsRes = await fetch(
      "https://api.github.com/repos/codelasak/ramazn15/stats/contributors",
      { headers, next: { revalidate: 3600 } }
    );

    let statsMap: Record<string, { additions: number; deletions: number }> = {};
    if (statsRes.ok) {
      const stats = await statsRes.json();
      if (Array.isArray(stats)) {
        for (const s of stats) {
          const additions = s.weeks.reduce(
            (sum: number, w: { a: number }) => sum + w.a,
            0
          );
          const deletions = s.weeks.reduce(
            (sum: number, w: { d: number }) => sum + w.d,
            0
          );
          statsMap[s.author.login] = { additions, deletions };
        }
      }
    }

    return contributors.map(
      (c: { login: string; contributions: number; avatar_url: string }) => {
        const stat = statsMap[c.login] || { additions: 0, deletions: 0 };
        return {
          login: c.login,
          name: c.login,
          avatar: c.avatar_url,
          commits: c.contributions,
          additions: stat.additions,
          deletions: stat.deletions,
          score: Math.round(
            c.contributions * 10 + stat.additions + stat.deletions * 0.5
          ),
        };
      }
    );
  } catch {
    return [];
  }
}

function getRankStyle(rank: number) {
  if (rank === 0)
    return {
      border: "border-yellow-300 dark:border-yellow-500",
      ring: "ring-yellow-200 dark:ring-yellow-500/30",
      badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
      icon: "🥇",
    };
  if (rank === 1)
    return {
      border: "border-gray-300 dark:border-gray-500",
      ring: "ring-gray-200 dark:ring-gray-500/30",
      badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
      icon: "🥈",
    };
  if (rank === 2)
    return {
      border: "border-amber-300 dark:border-amber-600",
      ring: "ring-amber-200 dark:ring-amber-600/30",
      badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      icon: "🥉",
    };
  return {
    border: "border-gray-100 dark:border-gray-700",
    ring: "ring-emerald-100 dark:ring-emerald-500/20",
    badge: "",
    icon: "",
  };
}

export default async function DevelopersPage() {
  const contributors = await getContributors();

  // Map GitHub stats to developers
  const statsMap = new Map<string, ContributorData>();
  for (const c of contributors) {
    statsMap.set(c.login, c);
  }

  // Only show developers with at least one commit; sort by score desc
  const sorted = DEVELOPERS
    .filter((d) => (d.github ? (statsMap.get(d.github)?.commits ?? 0) > 0 : false))
    .sort((a, b) => {
      const sa = statsMap.get(a.github!)?.score ?? 0;
      const sb = statsMap.get(b.github!)?.score ?? 0;
      return sb - sa;
    });

  return (
    <AppShell>
      <div className="relative min-h-dvh bg-gray-50 dark:bg-gray-950">
        <header className="relative overflow-hidden rounded-b-[2.5rem] bg-linear-to-b from-emerald-50 to-teal-50/60 dark:from-transparent dark:to-transparent pb-8 pt-12 shadow-sm px-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-teal-300/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              <span className="material-icons-round text-emerald-600 text-3xl">
                groups
              </span>
              Geliştirici Ekibi
            </h1>
            <p className="text-sm text-gray-500 dark:text-emerald-100/80 mt-2 font-medium">
              Projeye yapılan katkılar &middot; GitHub üzerinden
            </p>
          </div>
        </header>

        <main className="px-4 pb-8 pt-5 space-y-3">
          {sorted.map((developer, index) => {
            const stats = statsMap.get(developer.github!)!;
            const style = getRankStyle(index);
            const maxScore = Math.max(
              ...sorted.map((d) => statsMap.get(d.github!)?.score ?? 0),
              1
            );

            return (
              <article
                key={developer.name}
                className={`bg-white dark:bg-gray-900 rounded-2xl border ${style.border} shadow-sm p-4 transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ${style.ring}`}
                  >
                    <Image
                      src={developer.image}
                      alt={developer.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {style.icon && (
                        <span className="text-lg">{style.icon}</span>
                      )}
                      <h2 className="text-sm font-bold text-gray-800 dark:text-white truncate">
                        {developer.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        <span className="material-icons-round text-[14px]">
                          commit
                        </span>
                        {stats.commits}
                      </span>
                      {stats.additions > 0 && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          +{stats.additions.toLocaleString("tr-TR")}
                        </span>
                      )}
                      {stats.deletions > 0 && (
                        <span className="text-xs font-medium text-red-500 dark:text-red-400">
                          -{stats.deletions.toLocaleString("tr-TR")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.score}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                      puan
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (stats.score / maxScore) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}

          <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
            <p>
              Puanlama: commit &times; 10 + eklenen satır + silinen satır
              &times; 0.5
            </p>
            <p className="mt-1">Veriler GitHub API&apos;den saatlik güncellenir</p>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
