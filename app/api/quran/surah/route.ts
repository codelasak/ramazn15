import { NextResponse } from "next/server";

type ApiAyah = {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
};

type ApiEdition = {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
};

type ApiSurahEdition = {
  number: number;
  name: string;
  ayahs: ApiAyah[];
  edition: ApiEdition;
};

function mapAyahs(ayahs: ApiAyah[] | undefined) {
  return (Array.isArray(ayahs) ? ayahs : []).map((a) => ({
    number: a.number,
    numberInSurah: a.numberInSurah,
    text: a.text,
    audio: a.audio,
  }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const number = Number(url.searchParams.get("number"));

  if (!Number.isFinite(number) || number < 1 || number > 114) {
    return NextResponse.json({ error: "number 1..114 olmalı" }, { status: 400 });
  }

  const upstream = `https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,tr.diyanet,ar.alafasy`;

  try {
    const res = await fetch(upstream, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const json = (await res.json()) as { data?: unknown };
    const data = Array.isArray(json.data) ? (json.data as ApiSurahEdition[]) : [];

    const arabic = data.find((d) => d.edition?.identifier === "quran-uthmani") ?? data[0];
    const turkish = data.find((d) => d.edition?.identifier === "tr.diyanet") ?? data[1];
    const audio = data.find((d) => d.edition?.identifier === "ar.alafasy") ?? data[2];

    if (!arabic || !turkish || !audio) {
      return NextResponse.json({ error: "Eksik sure verisi" }, { status: 502 });
    }

    return NextResponse.json(
      {
        surahNumber: arabic.number,
        surahName: arabic.name,
        arabic: { edition: arabic.edition, ayahs: mapAyahs(arabic.ayahs) },
        turkish: { edition: turkish.edition, ayahs: mapAyahs(turkish.ayahs) },
        audio: { edition: audio.edition, ayahs: mapAyahs(audio.ayahs) },
      },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
