import { NextResponse } from "next/server";

// Official Diyanet mirror API for districts
const DIYANET_DISTRICTS_URL = "https://ezanvakti.emushaf.net/ilceler";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stateId = Number(url.searchParams.get("stateId"));

  if (!Number.isFinite(stateId) || stateId <= 0) {
    return NextResponse.json({ error: "stateId gerekli" }, { status: 400 });
  }

  const upstream = `${DIYANET_DISTRICTS_URL}/${stateId}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    const raw = Array.isArray(json) ? json : [];
    
    // The Diyanet API returns an array of objects like { IlceID: "9541", IlceAdi: "İSTANBUL", ... }
    const districts = raw.map((d: any) => ({ Id: Number(d.IlceID), Name: d.IlceAdi }));
    return NextResponse.json({ districts }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
