import { NextResponse } from "next/server";

export async function GET() {
  const upstream = "https://api.alquran.cloud/v1/surah";

  try {
    const res = await fetch(upstream, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const json = (await res.json()) as { data?: unknown };
    const surahs = Array.isArray(json.data) ? json.data : [];
    return NextResponse.json({ surahs }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
