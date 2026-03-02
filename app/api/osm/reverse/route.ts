import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat/lon gerekli" }, { status: 400 });
  }

  const upstream = new URL("https://nominatim.openstreetmap.org/reverse");
  upstream.searchParams.set("format", "jsonv2");
  upstream.searchParams.set("lat", String(lat));
  upstream.searchParams.set("lon", String(lon));
  upstream.searchParams.set("addressdetails", "1");
  upstream.searchParams.set("accept-language", "tr");

  try {
    const res = await fetch(upstream.toString(), {
      cache: "no-store",
      headers: {
        "User-Agent": "ramazan15/0.1 (Next.js)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
