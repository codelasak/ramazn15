import { NextResponse } from "next/server";

const BASE = "https://ezanvakti.imsakiyem.com/api";

type UpstreamDistrict = { _id: string; name: string; [k: string]: unknown };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stateId = Number(url.searchParams.get("stateId"));
  const query = url.searchParams.get("query");

  if (!Number.isFinite(stateId) || stateId <= 0) {
    return NextResponse.json({ error: "stateId gerekli" }, { status: 400 });
  }

  const upstream = query
    ? `${BASE}/locations/search/districts?q=${encodeURIComponent(query)}&stateId=${stateId}`
    : `${BASE}/locations/districts?stateId=${stateId}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    // Upstream wraps results in { data: [...] } with _id / name fields
    const raw: UpstreamDistrict[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const districts = raw.map((d) => ({ Id: Number(d._id), Name: d.name }));
    return NextResponse.json({ districts }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
