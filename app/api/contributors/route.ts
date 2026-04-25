import { NextResponse } from "next/server";

const GITHUB_REPO = "codelasak/ramazn15";

// Map GitHub usernames to developer display names
const GITHUB_TO_DEVELOPER: Record<string, string> = {
  ahmetfaruk686: "Ahmet Faruk Bahat",
  alismo001: "Ali İsmail Eftekin",
  MEHMEDALICEV61: "Mehmed Ali Cevahir",
  MosesTR: "Musa Bouzantsi",
  codelasak: "Eshagh Shahnavazi",
};

export type ContributorData = {
  login: string;
  name: string;
  avatar: string;
  commits: number;
  additions: number;
  deletions: number;
  score: number;
};

export async function GET() {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ramazan15-app",
    };

    // Fetch contributors (commit counts)
    const contribRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=50`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!contribRes.ok) {
      throw new Error(`GitHub API error: ${contribRes.status}`);
    }

    const contributors = await contribRes.json();

    // Fetch detailed stats (additions/deletions per contributor)
    const statsRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/stats/contributors`,
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

    const result: ContributorData[] = contributors
      .filter(
        (c: { login: string }) => c.login in GITHUB_TO_DEVELOPER
      )
      .map((c: { login: string; contributions: number; avatar_url: string }) => {
        const stat = statsMap[c.login] || { additions: 0, deletions: 0 };
        // Score: commits * 10 + additions * 1 + deletions * 0.5
        const score = Math.round(
          c.contributions * 10 + stat.additions * 1 + stat.deletions * 0.5
        );

        return {
          login: c.login,
          name: GITHUB_TO_DEVELOPER[c.login],
          avatar: c.avatar_url,
          commits: c.contributions,
          additions: stat.additions,
          deletions: stat.deletions,
          score,
        };
      })
      .sort((a: ContributorData, b: ContributorData) => b.score - a.score);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Contributors API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}
