import { NextResponse } from "next/server";

const BASE = "https://ezanvakti.imsakiyem.com/api";
const TURKEY_COUNTRY_ID = 2;

type UpstreamState = { _id: string; name: string; [k: string]: unknown };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query");

  const upstream = query
    ? `${BASE}/locations/search/states?q=${encodeURIComponent(query)}`
    : `${BASE}/locations/states?countryId=${TURKEY_COUNTRY_ID}`;

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
    const raw: UpstreamState[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const states = raw.map((s) => ({ Id: Number(s._id), Name: s.name }));
    return NextResponse.json({ states }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
