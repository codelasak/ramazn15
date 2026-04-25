import { NextResponse } from "next/server";

// Official Diyanet vakitler API – returns a monthly array of prayer times
const DIYANET_BASE = "https://ezanvakti.emushaf.net/vakitler";

/** Zero-pad a number to 2 digits */
function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Return today's date as "DD.MM.YYYY" in Istanbul time (UTC+3) */
function todayDDMMYYYY(): string {
  const now = new Date();
  // Offset to UTC+3
  const istanbul = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const d = istanbul.getUTCDate();
  const m = istanbul.getUTCMonth() + 1;
  const y = istanbul.getUTCFullYear();
  return `${pad(d)}.${pad(m)}.${y}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const districtId = Number(url.searchParams.get("districtId"));

  if (!Number.isFinite(districtId) || districtId <= 0) {
    return NextResponse.json({ error: "districtId gerekli" }, { status: 400 });
  }

  const upstream = `${DIYANET_BASE}/${districtId}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const arr = await res.json() as Record<string, string>[];

    if (!Array.isArray(arr) || arr.length === 0) {
      return NextResponse.json({ error: "Veri alınamadı" }, { status: 502 });
    }

    // Find the entry whose MiladiTarihKisa matches today (DD.MM.YYYY)
    const todayStr = todayDDMMYYYY();
    const todayEntry = arr.find((item) => item.MiladiTarihKisa === todayStr) ?? arr[0];

    // Normalise field names to what the frontend expects (lowercase)
    const times = {
      imsak:  todayEntry.Imsak,
      gunes:  todayEntry.Gunes,
      ogle:   todayEntry.Ogle,
      ikindi: todayEntry.Ikindi,
      aksam:  todayEntry.Aksam,
      yatsi:  todayEntry.Yatsi,
    };

    return NextResponse.json(times, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
