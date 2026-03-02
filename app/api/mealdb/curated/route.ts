import { NextResponse } from "next/server";

const IFTAR_IDS = ["52874", "52795", "52802", "52818"]; // curated
const SAHUR_IDS = ["52844", "52812", "52785", "52819"]; // curated

async function lookupMeal(id: string) {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`MealDB HTTP ${res.status}`);
  const json = (await res.json()) as { meals: any[] | null };
  const meal = json.meals?.[0];
  return meal ?? null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const list = url.searchParams.get("list");

  const ids = list === "sahur" ? SAHUR_IDS : list === "iftar" ? IFTAR_IDS : null;
  if (!ids) {
    return NextResponse.json({ error: "list=iftar|sahur gerekli" }, { status: 400 });
  }

  try {
    const meals = (await Promise.all(ids.map((id) => lookupMeal(id)))).filter(Boolean);
    return NextResponse.json({ meals }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream hata" },
      { status: 502 }
    );
  }
}
