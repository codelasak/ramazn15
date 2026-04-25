import { NextResponse } from "next/server";

// Official Diyanet mirror API for states
const DIYANET_STATES_URL = "https://ezanvakti.emushaf.net/sehirler/2";

export async function GET(req: Request) {
  try {
    const res = await fetch(DIYANET_STATES_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    const raw = Array.isArray(json) ? json : [];
    
    // The Diyanet API returns an array of objects like { SehirID: "539", SehirAdi: "İSTANBUL", ... }
    const states = raw.map((s: any) => ({ Id: Number(s.SehirID), Name: s.SehirAdi }));
    return NextResponse.json({ states }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
