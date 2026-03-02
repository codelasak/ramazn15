import { NextResponse } from "next/server";

const BASE = "https://ezanvakti.imsakiyem.com/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const districtId = Number(url.searchParams.get("districtId"));
  const period = url.searchParams.get("period") ?? "daily";

  if (!Number.isFinite(districtId) || districtId <= 0) {
    return NextResponse.json({ error: "districtId gerekli" }, { status: 400 });
  }

  if (!/^(daily|weekly|monthly|yearly)$/.test(period)) {
    return NextResponse.json({ error: "Geçersiz period" }, { status: 400 });
  }

  const upstream = `${BASE}/prayer-times/${districtId}/${period}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    // Upstream wraps in { data: [...] }, each item has nested .times object
    const arr = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [json];
    const today = arr[0];
    const times = today?.times ?? today;
    return NextResponse.json(times, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
